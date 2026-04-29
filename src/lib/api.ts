import type {
  ProductsResponse,
  CategoriesResponse,
  StoreInfo,
  CheckoutBody,
  CheckoutResponse,
  Product,
} from './types';
import { decodeProductData, decodeHtmlEntities } from './utils';

const API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tip4serv-proxy`;

const headers = {
  'Content-Type': 'application/json',
};

async function fetchApi<T>(params: Record<string, string>): Promise<T> {
  const searchParams = new URLSearchParams(params);
  const res = await fetch(`${API_URL}?${searchParams}`, { headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function getProducts(
  page = 1,
  category?: number
): Promise<ProductsResponse> {
  const params: Record<string, string> = {
    action: 'products',
    page: String(page),
    limit: '50',
  };
  if (category !== undefined) params.category = String(category);
  const response = await fetchApi<ProductsResponse>(params);
  response.products = response.products.map(decodeProductData);
  return response;
}

export async function getAllProducts(category?: number): Promise<Product[]> {
  const PAGE_SIZE = 50;
  const first = await getProducts(1, category);
  const all = [...first.products];
  const totalPages = Math.ceil(first.product_count / PAGE_SIZE);
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) => getProducts(i + 2, category))
    );
    rest.forEach((r) => all.push(...r.products));
  }
  return all;
}

export async function getCategories(): Promise<CategoriesResponse> {
  const response = await fetchApi<CategoriesResponse>({
    action: 'categories',
    limit: '50',
  });
  response.categories = response.categories.map(cat => ({
    ...cat,
    name: decodeHtmlEntities(cat.name),
    description: cat.description ? decodeHtmlEntities(cat.description) : cat.description,
  }));
  return response;
}

export async function getProductBySlug(slug: string): Promise<Product> {
  const product = await fetchApi<Product>({ action: 'product', slug });
  return decodeProductData(product);
}

export async function getProductById(id: string): Promise<Product> {
  const product = await fetchApi<Product>({ action: 'product', id });
  return decodeProductData(product);
}

export async function getRelatedProducts(
  currentProductId: number,
  categoryId?: number,
  limit = 4
): Promise<Product[]> {
  try {
    const products = await getAllProducts(categoryId);
    return products
      .filter((p) => p.id !== currentProductId)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export async function getStoreInfo(): Promise<StoreInfo> {
  const store = await fetchApi<StoreInfo>({ action: 'store' });
  if (store.title) store.title = decodeHtmlEntities(store.title);
  if (store.subtitle) store.subtitle = decodeHtmlEntities(store.subtitle);
  if (store.description) store.description = decodeHtmlEntities(store.description);
  if (store.menu_links) {
    store.menu_links = store.menu_links
      .map((m) => ({
        title: decodeHtmlEntities(m.title || '').trim(),
        link: (m.link || '').trim(),
      }))
      .filter((m) => m.title && m.link);
  }
  return store;
}

export function getCheckoutUrl(storeDomain: string, productSlug: string): string {
  return `https://${storeDomain}.tip4serv.com/product/${productSlug}`;
}

export async function getCheckoutIdentifiers(
  storeId: number,
  productIds: number[]
): Promise<string[]> {
  const params: Record<string, string> = {
    action: 'checkout-identifiers',
    store: String(storeId),
    products: JSON.stringify(productIds),
  };
  return fetchApi<string[]>(params);
}

export interface GameServer {
  id: number;
  name: string;
  game_name: string;
  connected: boolean;
}

export interface ServerPlayer {
  eos_id: string;
  username: string;
  steam_id?: string;
}

export async function getServers(): Promise<{ servers: GameServer[]; server_count: number }> {
  return fetchApi({ action: 'servers', limit: '50' });
}

export async function getServerPlayers(serverId: number): Promise<{ players: ServerPlayer[] }> {
  return fetchApi({ action: 'server-players', server: String(serverId) });
}

export interface RconServer {
  id: string;
  name: string;
}

export interface RconPlayer {
  index: number;
  name: string;
  eos_id: string;
}

const RCON_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rcon-players`;

const rconHeaders = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
};

export async function getRconServers(): Promise<{ servers: RconServer[] }> {
  const res = await fetch(`${RCON_URL}?action=servers`, { headers: rconHeaders });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

export async function getRconPlayers(serverId: string): Promise<{ players: RconPlayer[] }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(
      `${RCON_URL}?action=players&server=${encodeURIComponent(serverId)}`,
      { headers: rconHeaders, signal: controller.signal }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const detail = err.detail ? ` (${err.detail})` : '';
      throw new Error((err.error || `API error: ${res.status}`) + detail);
    }
    return res.json();
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new Error('Le serveur met trop de temps a repondre. Reessayez.');
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export async function createCheckout(
  storeId: number,
  body: CheckoutBody
): Promise<CheckoutResponse> {
  const searchParams = new URLSearchParams({
    action: 'checkout',
    store: String(storeId),
  });
  const res = await fetch(`${API_URL}?${searchParams}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `API error: ${res.status}`);
  }
  return res.json();
}

