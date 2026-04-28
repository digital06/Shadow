import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function decodeEntities(str: string): string {
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function stripHtml(str: string): string {
  return String(str).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function setMetaAttr(html: string, regex: RegExp, attr: string, value: string): string {
  const escaped = escapeHtml(value);
  return html.replace(regex, (match) => {
    if (new RegExp(`${attr}="[^"]*"`).test(match)) {
      return match.replace(new RegExp(`${attr}="[^"]*"`), `${attr}="${escaped}"`);
    }
    return match.replace('/>', `${attr}="${escaped}" />`);
  });
}

function injectStoreMeta(supabaseUrl: string): Plugin {
  return {
    name: 'inject-store-meta',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        if (!supabaseUrl) {
          console.warn('[inject-store-meta] VITE_SUPABASE_URL not set, skipping');
          return html;
        }
        try {
          const res = await fetch(
            `${supabaseUrl}/functions/v1/tip4serv-proxy?action=store`
          );
          if (!res.ok) {
            console.warn(`[inject-store-meta] store fetch failed: ${res.status}`);
            return html;
          }
          const store = await res.json();
          const title = decodeEntities(store.title || 'Boutique');
          const rawDesc = decodeEntities(store.description || store.subtitle || '');
          const description =
            stripHtml(rawDesc).slice(0, 300) || title;
          const image = store.logo || '/ASA_Logo.png';

          let out = html;
          out = out.replace(
            /<title>[^<]*<\/title>/,
            `<title>${escapeHtml(title)}</title>`
          );
          out = setMetaAttr(out, /<meta name="description"[^>]*\/>/, 'content', description);
          out = setMetaAttr(out, /<meta property="og:title"[^>]*\/>/, 'content', title);
          out = setMetaAttr(out, /<meta property="og:description"[^>]*\/>/, 'content', description);
          out = setMetaAttr(out, /<meta property="og:image"[^>]*\/>/, 'content', image);
          out = setMetaAttr(out, /<meta name="twitter:title"[^>]*\/>/, 'content', title);
          out = setMetaAttr(out, /<meta name="twitter:description"[^>]*\/>/, 'content', description);
          out = setMetaAttr(out, /<meta name="twitter:image"[^>]*\/>/, 'content', image);
          out = out.replace(
            /<link rel="icon"[^>]*\/>/,
            `<link rel="icon" type="image/png" href="${escapeHtml(image)}" />`
          );
          console.log(`[inject-store-meta] injected meta for "${title}"`);
          return out;
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.warn('[inject-store-meta] error:', message);
          return html;
        }
      },
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), injectStoreMeta(env.VITE_SUPABASE_URL || '')],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    define: {
      'import.meta.env.TIP4SERV_API_KEY': JSON.stringify(env.TIP4SERV_API_KEY || ''),
    },
  };
});
