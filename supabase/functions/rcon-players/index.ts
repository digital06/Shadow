import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorResponse(status: number, message: string, detail?: string) {
  return jsonResponse({ error: message, detail }, status);
}

const SERVERDATA_AUTH = 3;
const SERVERDATA_EXECCOMMAND = 2;

function buildPacket(id: number, type: number, body: string): Uint8Array {
  const bodyBytes = new TextEncoder().encode(body);
  const size = 4 + 4 + bodyBytes.length + 2;
  const buffer = new Uint8Array(4 + size);
  const view = new DataView(buffer.buffer);
  view.setInt32(0, size, true);
  view.setInt32(4, id, true);
  view.setInt32(8, type, true);
  buffer.set(bodyBytes, 12);
  buffer[12 + bodyBytes.length] = 0;
  buffer[13 + bodyBytes.length] = 0;
  return buffer;
}

function parsePacket(
  data: Uint8Array
): { id: number; type: number; body: string } | null {
  if (data.length < 14) return null;
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const id = view.getInt32(4, true);
  const type = view.getInt32(8, true);
  const bodyEnd = data.indexOf(0, 12);
  const body = new TextDecoder().decode(
    data.slice(12, bodyEnd === -1 ? data.length - 2 : bodyEnd)
  );
  return { id, type, body };
}

async function readExact(conn: Deno.TcpConn, length: number): Promise<Uint8Array> {
  const buffer = new Uint8Array(length);
  let offset = 0;
  while (offset < length) {
    const n = await conn.read(buffer.subarray(offset));
    if (n === null) throw new Error("Connection closed unexpectedly");
    offset += n;
  }
  return buffer;
}

async function readPacket(
  conn: Deno.TcpConn
): Promise<{ id: number; type: number; body: string }> {
  const sizeBuffer = await readExact(conn, 4);
  const size = new DataView(sizeBuffer.buffer).getInt32(0, true);
  if (size < 10 || size > 65536) throw new Error(`Invalid packet size: ${size}`);

  const bodyBuffer = await readExact(conn, size);
  const fullPacket = new Uint8Array(4 + size);
  fullPacket.set(sizeBuffer, 0);
  fullPacket.set(bodyBuffer, 4);

  const parsed = parsePacket(fullPacket);
  if (!parsed) throw new Error("Failed to parse packet");
  return parsed;
}

function withTimeout<T>(promise: Promise<T>, ms: number, msg: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(msg)), ms);
    promise.then(
      (v) => { clearTimeout(timer); resolve(v); },
      (e) => { clearTimeout(timer); reject(e); },
    );
  });
}

async function rconExec(
  host: string,
  port: number,
  password: string,
  command: string
): Promise<string> {
  let conn: Deno.TcpConn | null = null;

  try {
    conn = await withTimeout(
      Deno.connect({ hostname: host, port, transport: "tcp" }),
      10000,
      `TCP connect timed out after 10s to ${host}:${port}`
    );
  } catch (e) {
    throw new Error(
      `TCP connect failed to ${host}:${port}: ${e instanceof Error ? e.message : String(e)}`
    );
  }

  try {
    conn.setNoDelay(true);

    const authPacket = buildPacket(1, SERVERDATA_AUTH, password);
    await conn.write(authPacket);

    const firstResponse = await withTimeout(readPacket(conn), 10000, "Auth response timed out");

    let authOk = false;
    if (firstResponse.id === 1) {
      authOk = true;
    } else if (firstResponse.id === -1) {
      throw new Error("RCON authentication failed (bad password)");
    } else {
      const secondResponse = await withTimeout(readPacket(conn), 10000, "Auth response timed out");
      if (secondResponse.id === -1) {
        throw new Error("RCON authentication failed (bad password)");
      }
      authOk = secondResponse.id === 1 || firstResponse.id !== -1;
    }

    if (!authOk) throw new Error("RCON authentication failed");

    const cmdPacket = buildPacket(2, SERVERDATA_EXECCOMMAND, command);
    await conn.write(cmdPacket);

    let responseBody = "";

    while (true) {
      try {
        const pkt = await withTimeout(readPacket(conn), 5000, "__DONE__");
        if (pkt.id === 2) {
          responseBody += pkt.body;
        }
      } catch (e) {
        if (e instanceof Error && e.message === "__DONE__") break;
        throw e;
      }
    }

    return responseBody;
  } finally {
    try { conn.close(); } catch { /* ignore */ }
  }
}

interface RconPlayer {
  index: number;
  name: string;
  eos_id: string;
}

function parseListPlayers(response: string): RconPlayer[] {
  if (response.includes("No Players")) return [];

  const players: RconPlayer[] = [];
  const lines = response.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const match = trimmed.match(/^(\d+)\.\s+(.+?),\s*([A-Fa-f0-9]{32})/);
    if (match) {
      players.push({
        index: parseInt(match[1], 10),
        name: match[2].trim(),
        eos_id: match[3],
      });
    }
  }

  return players;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "servers") {
      const { data, error } = await supabase
        .from("rcon_servers")
        .select("id, map_name, sort_order")
        .eq("enabled", true)
        .order("sort_order", { ascending: true });

      if (error) return errorResponse(500, error.message);

      return jsonResponse({
        servers: (data || []).map((s: { id: string; map_name: string }) => ({
          id: s.id,
          name: s.map_name,
        })),
      });
    }

    if (action === "players") {
      const serverId = url.searchParams.get("server");
      if (!serverId) return errorResponse(400, "server parameter is required");

      const { data: server, error } = await supabase
        .from("rcon_servers")
        .select("host, rcon_port, rcon_password")
        .eq("id", serverId)
        .eq("enabled", true)
        .maybeSingle();

      if (error) return errorResponse(500, error.message);
      if (!server) return errorResponse(404, "Server not found");

      const debug = url.searchParams.get("debug") === "1";

      try {
        const response = await rconExec(
          server.host,
          server.rcon_port,
          server.rcon_password,
          "ListPlayers"
        );

        if (debug) {
          const hex = Array.from(new TextEncoder().encode(response))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(" ");
          return jsonResponse({ raw: response, hex, length: response.length });
        }

        const players = parseListPlayers(response);
        return jsonResponse({ players });
      } catch (rconErr) {
        const rconMsg =
          rconErr instanceof Error ? rconErr.message : String(rconErr);
        return errorResponse(502, "RCON connection failed", rconMsg);
      }
    }

    if (action === "test") {
      const serverId = url.searchParams.get("server");
      if (!serverId) return errorResponse(400, "server parameter is required");

      const { data: server, error: sErr } = await supabase
        .from("rcon_servers")
        .select("host, rcon_port, rcon_password")
        .eq("id", serverId)
        .eq("enabled", true)
        .maybeSingle();

      if (sErr) return errorResponse(500, sErr.message);
      if (!server) return errorResponse(404, "Server not found");

      const steps: string[] = [];
      let conn: Deno.TcpConn | null = null;
      try {
        steps.push(`Connecting to ${server.host}:${server.rcon_port}...`);
        conn = await withTimeout(
          Deno.connect({ hostname: server.host, port: server.rcon_port, transport: "tcp" }),
          10000,
          "TCP connect timed out after 10s"
        );
        steps.push("TCP connected OK");

        const authPkt = buildPacket(1, SERVERDATA_AUTH, server.rcon_password);
        await conn.write(authPkt);
        steps.push("Auth packet sent");

        const resp = await withTimeout(readPacket(conn), 10000, "Auth read timed out after 10s");
        steps.push(`Auth response: id=${resp.id}, type=${resp.type}`);

        if (resp.id === -1) {
          steps.push("AUTH FAILED: bad password");
        } else {
          steps.push("Auth appears OK");
        }
      } catch (e) {
        steps.push(`ERROR: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        try { conn?.close(); } catch { /* ignore */ }
      }

      return jsonResponse({ steps });
    }

    return errorResponse(400, "Invalid action. Use 'servers', 'players', or 'test'");
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(500, message);
  }
});
