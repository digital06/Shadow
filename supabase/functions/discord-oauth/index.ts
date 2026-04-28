const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ExchangeRequest {
  code?: string;
  redirect_uri?: string;
  client_id?: string;
}

interface DiscordTokenResponse {
  access_token?: string;
  token_type?: string;
  error?: string;
  error_description?: string;
}

interface DiscordUser {
  id: string;
  username: string;
  global_name?: string | null;
  discriminator?: string;
  avatar?: string | null;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const clientSecret = Deno.env.get("DISCORD_CLIENT_SECRET");
    if (!clientSecret) {
      return jsonResponse(
        { error: "Discord integration is not configured on the server (missing DISCORD_CLIENT_SECRET)." },
        500,
      );
    }

    const body = (await req.json().catch(() => ({}))) as ExchangeRequest;
    const code = body.code?.trim();
    const redirectUri = body.redirect_uri?.trim();
    const clientId = body.client_id?.trim();

    if (!code || !redirectUri || !clientId) {
      return jsonResponse({ error: "Missing code, redirect_uri or client_id." }, 400);
    }

    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const tokenJson = (await tokenRes.json().catch(() => ({}))) as DiscordTokenResponse;

    if (!tokenRes.ok || !tokenJson.access_token) {
      return jsonResponse(
        {
          error: tokenJson.error_description || tokenJson.error || "Discord token exchange failed.",
        },
        400,
      );
    }

    const userRes = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenJson.access_token}` },
    });

    if (!userRes.ok) {
      return jsonResponse({ error: "Failed to load Discord user profile." }, 400);
    }

    const user = (await userRes.json()) as DiscordUser;

    return jsonResponse({
      id: user.id,
      username: user.username,
      global_name: user.global_name ?? null,
      avatar: user.avatar ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected error.";
    return jsonResponse({ error: msg }, 500);
  }
});
