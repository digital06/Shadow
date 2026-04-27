import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from 'react';
import { useStore } from './store';

declare global {
  interface Window {
    Tip4Serv?: {
      OAuth?: {
        Connect: (opts: { return_url: string; store_id?: number }) => Promise<void>;
        Save: (opts?: { token?: string }) => void;
        Token: () => string;
        Disconnect: () => void;
      };
    };
  }
}

const SCRIPT_ID = 'tip4serv-js-sdk';
const SCRIPT_URL = 'https://js.tip4serv.com/tip4serv.min.js?v=1.0.16';
const CALLBACK_QUERY_PARAM = 'tip4serv_access_token';

export interface Tip4ServUser {
  id: number;
  username?: string;
  email?: string;
  language?: string;
  timezone?: string;
  registration_date?: number;
  profile_picture?: string;
}

export interface Tip4ServPayment {
  id: number;
  status: string;
  cart: string;
  sub_id: number;
  date: number;
  amount: number;
  currency: string;
  username: string;
  identifier: string;
  gateway: string;
  details_page: string;
}

export interface Tip4ServSubscription {
  id: number;
  name: string;
  status: string;
  price: number;
  onetime: boolean;
  username: string;
  start_date: number;
  next_payment: number;
  expire_date: number;
  unsubscribed: boolean;
  duration_periodicity: string;
  period_num: number;
  currency: string;
  details_page: string;
}

const API_BASE = 'https://api.tip4serv.com/v1';

async function authFetch<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data?.error?.message || data?.message || data?.error || `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchUserPayments(
  token: string,
  page = 1,
  maxPage = 50
): Promise<{ payments: Tip4ServPayment[]; payment_count: number }> {
  return authFetch(token, `/user/payments?page=${page}&max_page=${maxPage}`);
}

export async function fetchUserSubscriptions(
  token: string,
  page = 1,
  maxPage = 50,
  onlyRecurring = false
): Promise<{ subscriptions: Tip4ServSubscription[]; subscription_count: number }> {
  const params = new URLSearchParams({
    page: String(page),
    max_page: String(maxPage),
    only_recurring_subscription: String(onlyRecurring),
  });
  return authFetch(token, `/user/subscriptions?${params}`);
}

export async function unsubscribeUserSubscription(
  token: string,
  subscriptionId: number
): Promise<{ status: number; message: string }> {
  return authFetch(token, '/user/subscriptions/unsubscribe', {
    method: 'PATCH',
    body: JSON.stringify({ subscription_id: subscriptionId }),
  });
}

interface Tip4ServAuthValue {
  token: string | null;
  user: Tip4ServUser | null;
  ready: boolean;
  loading: boolean;
  connect: () => void;
  logout: () => void;
}

const AuthContext = createContext<Tip4ServAuthValue>({
  token: null,
  user: null,
  ready: false,
  loading: false,
  connect: () => {},
  logout: () => {},
});

async function fetchUser(token: string): Promise<Tip4ServUser | null> {
  try {
    const res = await fetch('https://api.tip4serv.com/v1/user/whoami', {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return (data?.user ?? data) as Tip4ServUser;
  } catch {
    return null;
  }
}

function loadSdk(storeId: number | string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.Tip4Serv?.OAuth) return resolve();
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Tip4Serv SDK')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_URL;
    script.async = true;
    script.setAttribute('data-store-id', String(storeId));
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Failed to load Tip4Serv SDK')), { once: true });
    document.head.appendChild(script);
  });
}

function readToken(): string | null {
  try {
    const t = window.Tip4Serv?.OAuth?.Token?.();
    return typeof t === 'string' && t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

function stripCallbackParams() {
  const url = new URL(window.location.href);
  let changed = false;
  ['tip4serv_access_token', 'error', 'state', 'code'].forEach((p) => {
    if (url.searchParams.has(p)) {
      url.searchParams.delete(p);
      changed = true;
    }
  });
  if (changed) {
    window.history.replaceState({}, document.title, url.pathname + (url.search ? url.search : '') + url.hash);
  }
}

export function Tip4ServAuthProvider({ children }: { children: ReactNode }) {
  const { store } = useStore();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<Tip4ServUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const handledRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }
    let cancelled = false;
    fetchUser(token).then((u) => {
      if (!cancelled) setUser(u);
    });
    return () => { cancelled = true; };
  }, [token]);

  useEffect(() => {
    if (!store?.id) return;
    let cancelled = false;
    setLoading(true);
    loadSdk(store.id)
      .then(() => {
        if (cancelled) return;
        setReady(true);

        if (handledRef.current) return;
        handledRef.current = true;

        const params = new URLSearchParams(window.location.search);

        if (params.has('error')) {
          stripCallbackParams();
          return;
        }

        if (params.has(CALLBACK_QUERY_PARAM)) {
          try {
            window.Tip4Serv?.OAuth?.Save?.();
          } catch {
            // invalid/expired token returned
          }
          stripCallbackParams();
        }

        const stored = readToken();
        if (stored) setToken(stored);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [store?.id]);

  const connect = useCallback(async () => {
    if (!window.Tip4Serv?.OAuth?.Connect) return;
    const returnUrl = `${window.location.origin}${window.location.pathname}`;
    try {
      await window.Tip4Serv.OAuth.Connect({ return_url: returnUrl });
    } catch {
      // user-facing error already surfaced by SDK redirect; nothing to do
    }
  }, []);

  const logout = useCallback(() => {
    try {
      window.Tip4Serv?.OAuth?.Disconnect?.();
    } catch {
      // ignore
    }
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, ready, loading, connect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useTip4ServAuth() {
  return useContext(AuthContext);
}
