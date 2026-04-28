import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TIP4SERV_BASE = "https://api.tip4serv.com/v1";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ");
}

interface StoreInfo {
  title?: string;
  subtitle?: string;
  description?: string;
  logo?: string;
  domain?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TIP4SERV_API_KEY");
    if (!apiKey) {
      return new Response("Server error", { status: 500 });
    }

    const reqUrl = new URL(req.url);
    const siteUrl =
      reqUrl.searchParams.get("site") ||
      `${reqUrl.protocol}//${reqUrl.host}`;
    const path = reqUrl.searchParams.get("path") || "/";

    const res = await fetch(`${TIP4SERV_BASE}/store/whoami`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return new Response("Store not found", { status: 404 });
    }

    const store: StoreInfo = await res.json();

    const title = escapeHtml(decodeHtmlEntities(store.title || "Boutique"));
    const rawDescription = decodeHtmlEntities(
      store.description || store.subtitle || ""
    );
    const description = escapeHtml(
      stripHtml(rawDescription).slice(0, 300) ||
        decodeHtmlEntities(store.title || "Boutique en ligne")
    );
    const image = store.logo ? escapeHtml(store.logo) : "";
    const fullUrl = escapeHtml(`${siteUrl}${path}`);

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${fullUrl}" />
  <meta property="og:site_name" content="${title}" />
  ${image ? `<meta property="og:image" content="${image}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  ${image ? `<meta name="twitter:image" content="${image}" />` : ""}
  ${image ? `<link rel="icon" type="image/png" href="${image}" />` : ""}
  <meta http-equiv="refresh" content="0;url=${fullUrl}" />
</head>
<body>
  <p>Redirection vers <a href="${fullUrl}">${title}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(message, { status: 500 });
  }
});
