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
  return str.replace(/<[^>]*>/g, "").trim();
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

    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const siteUrl = url.searchParams.get("site") || "";

    if (!slug) {
      return new Response("Missing slug", { status: 400 });
    }

    const res = await fetch(
      `${TIP4SERV_BASE}/store/product/${slug}?details=true`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      return new Response("Product not found", { status: 404 });
    }

    const product = await res.json();

    const title = escapeHtml(product.name || "Produit");
    const description = escapeHtml(
      stripHtml(product.small_description || product.description || "").slice(
        0,
        200
      )
    );
    const image =
      product.image ||
      (product.gallery && product.gallery.length > 0
        ? product.gallery[0]
        : "");
    const price = product.price ? `${product.price.toFixed(2)} €` : "";
    const productUrl = siteUrl
      ? `${siteUrl}/product/${slug}`
      : `/product/${slug}`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <title>${title} - Boutique ARK France Ascended</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}${price ? ` - ${price}` : ""}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="${escapeHtml(productUrl)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ""}
  <meta property="og:site_name" content="Boutique ARK France Ascended" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}${price ? ` - ${price}` : ""}" />
  <meta name="twitter:description" content="${description}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ""}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(productUrl)}" />
</head>
<body>
  <p>Redirection vers <a href="${escapeHtml(productUrl)}">${title}</a>...</p>
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
