import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotenv() {
  const envPath = resolve('.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotenv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
if (!SUPABASE_URL) {
  console.warn('[inject-meta] VITE_SUPABASE_URL not set, skipping');
  process.exit(0);
}

const indexPath = resolve('dist/index.html');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeEntities(str) {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(str) {
  return String(str).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function setAttr(html, regex, attr, value) {
  return html.replace(regex, (match) => {
    const escaped = escapeHtml(value);
    if (match.includes(`${attr}=`)) {
      return match.replace(new RegExp(`${attr}="[^"]*"`), `${attr}="${escaped}"`);
    }
    return match.replace('/>', `${attr}="${escaped}" />`);
  });
}

try {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/tip4serv-proxy?action=store`);
  if (!res.ok) {
    console.warn(`[inject-meta] store fetch failed: ${res.status}`);
    process.exit(0);
  }
  const store = await res.json();

  const title = decodeEntities(store.title || 'Boutique');
  const rawDesc = decodeEntities(store.description || store.subtitle || '');
  const description = stripHtml(rawDesc).slice(0, 300) || title;
  const image = store.logo || '/ASA_Logo.png';

  let html = readFileSync(indexPath, 'utf8');

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = setAttr(html, /<meta name="description"[^>]*\/>/, 'content', description);
  html = setAttr(html, /<meta property="og:title"[^>]*\/>/, 'content', title);
  html = setAttr(html, /<meta property="og:description"[^>]*\/>/, 'content', description);
  html = setAttr(html, /<meta property="og:image"[^>]*\/>/, 'content', image);
  html = setAttr(html, /<meta name="twitter:title"[^>]*\/>/, 'content', title);
  html = setAttr(html, /<meta name="twitter:description"[^>]*\/>/, 'content', description);
  html = setAttr(html, /<meta name="twitter:image"[^>]*\/>/, 'content', image);
  html = html.replace(
    /<link rel="icon"[^>]*\/>/,
    `<link rel="icon" type="image/png" href="${escapeHtml(image)}" />`
  );

  writeFileSync(indexPath, html);
  console.log(`[inject-meta] injected meta for "${title}"`);
} catch (err) {
  console.warn('[inject-meta] error:', err?.message || err);
  process.exit(0);
}
