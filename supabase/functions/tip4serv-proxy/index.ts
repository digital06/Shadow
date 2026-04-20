import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const TIP4SERV_BASE = "https://api.tip4serv.com/v1";

function errorResponse(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractErrorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (obj.error && typeof obj.error === "object") {
      const err = obj.error as Record<string, unknown>;
      if (err.message) return String(err.message);
    }
    if (obj.error && typeof obj.error === "string") return obj.error;
    if (obj.message && typeof obj.message === "string") return obj.message;
  }
  return `Tip4Serv API error: ${status}`;
}

async function fetchTip4Serv(path: string, apiKey: string) {
  const res = await fetch(`${TIP4SERV_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status));
  }
  return data;
}

async function postTip4Serv(path: string, apiKey: string, body: unknown) {
  const res = await fetch(`${TIP4SERV_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status));
  }
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("TIP4SERV_API_KEY");
    if (!apiKey) {
      return errorResponse(500, "TIP4SERV_API_KEY not configured");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const page = url.searchParams.get("page") || "1";
    const limit = url.searchParams.get("limit") || "50";

    let data;

    switch (action) {
      case "products": {
        const category = url.searchParams.get("category");
        let path = `/store/products?page=${page}&max_page=${limit}&details=true&only_enabled=true`;
        if (category) path += `&category=${category}`;
        data = await fetchTip4Serv(path, apiKey);
        break;
      }

      case "categories": {
        const parent = url.searchParams.get("parent");
        let path = `/store/categories?page=${page}&max_page=${limit}`;
        if (parent) path += `&parent=${parent}`;
        data = await fetchTip4Serv(path, apiKey);
        break;
      }

      case "product": {
        const slug = url.searchParams.get("slug");
        const id = url.searchParams.get("id");
        if (!slug && !id) {
          return errorResponse(400, "Product slug or id is required");
        }
        const identifier = slug || id;
        const path = `/store/product/${identifier}?details=true`;
        data = await fetchTip4Serv(path, apiKey);
        break;
      }

      case "store": {
        data = await fetchTip4Serv("/store/whoami", apiKey);
        break;
      }

      case "checkout-identifiers": {
        const storeId = url.searchParams.get("store");
        const products = url.searchParams.get("products");
        if (!storeId || !products) {
          return errorResponse(400, "store and products parameters are required");
        }
        const path = `/store/checkout/identifiers?store=${storeId}&products=${products}`;
        data = await fetchTip4Serv(path, apiKey);
        break;
      }

      case "checkout": {
        const storeId = url.searchParams.get("store");
        if (!storeId) {
          return errorResponse(400, "store parameter is required");
        }
        if (req.method !== "POST") {
          return errorResponse(405, "POST method required for checkout");
        }
        const body = await req.json();
        const path = `/store/checkout?store=${storeId}`;
        data = await postTip4Serv(path, apiKey, body);
        break;
      }

      case "servers": {
        data = await fetchTip4Serv(`/store/servers?page=${page}&max_page=${limit}`, apiKey);
        break;
      }

      case "server-players": {
        const serverId = url.searchParams.get("server");
        if (!serverId) {
          return errorResponse(400, "server parameter is required");
        }
        const cmdsData = await fetchTip4Serv(`/store/server/${serverId}/commands`, apiKey) as Array<{
          eos_id?: string;
          username?: string;
          player?: string;
          steam_id?: string | number;
        }>;
        const seen = new Set<string>();
        const players: Array<{ eos_id: string; username: string; steam_id?: string }> = [];
        if (Array.isArray(cmdsData)) {
          for (const entry of cmdsData) {
            const eos = entry.eos_id || "";
            const name = entry.username || entry.player || "";
            const key = `${eos}|${name}`;
            if (key === "|" || seen.has(key)) continue;
            seen.add(key);
            players.push({
              eos_id: eos,
              username: name,
              ...(entry.steam_id ? { steam_id: String(entry.steam_id) } : {}),
            });
          }
        }
        data = { players };
        break;
      }

      case "validate-coupon": {
        const code = url.searchParams.get("code");
        if (!code) {
          return errorResponse(400, "code parameter is required");
        }
        let found = false;
        let currentPage = 1;
        while (!found) {
          const result = await fetchTip4Serv(
            `/store/discount/coupons?page=${currentPage}&limit=50`,
            apiKey
          );
          const coupons = result.coupons || [];
          const match = coupons.find(
            (c: { code: string }) => c.code.toUpperCase() === code.toUpperCase()
          );
          if (match) {
            const now = Date.now();
            if (match.expiration && match.expiration < now) {
              data = { valid: false, message: "Ce code promo a expiré" };
            } else if (match.limit && match.used >= match.limit) {
              data = { valid: false, message: "Ce code promo a atteint sa limite d'utilisation" };
            } else {
              data = {
                valid: true,
                type: "coupon",
                discount_type: match.type === "percentage" ? "percentage" : "fixed",
                discount_value: match.value,
                code: match.code,
                minimum: match.minimum || 0,
                maximum: match.maximum || null,
              };
            }
            found = true;
            break;
          }
          if (coupons.length < 50) break;
          currentPage++;
        }
        if (!found) {
          data = { valid: false, message: "Code promo invalide ou expiré" };
        }
        break;
      }

      case "validate-giftcard": {
        const code = url.searchParams.get("code");
        if (!code) {
          return errorResponse(400, "code parameter is required");
        }
        let found = false;
        let currentPage = 1;
        while (!found) {
          const result = await fetchTip4Serv(
            `/store/discount/giftcards?page=${currentPage}&limit=50`,
            apiKey
          );
          const giftcards = result.giftcards || [];
          const match = giftcards.find(
            (g: { code: string }) => g.code.toUpperCase() === code.toUpperCase()
          );
          if (match) {
            const now = Date.now();
            if (match.expiration && match.expiration < now) {
              data = { valid: false, message: "Cette carte cadeau a expiré" };
            } else if ((match.remaining_credit || 0) <= 0) {
              data = { valid: false, message: "Cette carte cadeau n'a plus de solde" };
            } else {
              data = {
                valid: true,
                type: "giftcard",
                balance: match.remaining_credit,
                currency: match.currency,
                code: match.code,
              };
            }
            found = true;
            break;
          }
          if (giftcards.length < 50) break;
          currentPage++;
        }
        if (!found) {
          data = { valid: false, message: "Carte cadeau invalide" };
        }
        break;
      }

      default:
        return errorResponse(400, "Invalid action parameter");
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(500, message);
  }
});
