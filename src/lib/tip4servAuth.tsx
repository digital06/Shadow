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

interface Tip4ServAuthValue {
  token: string | null;
  ready: boolean;
  loading: boolean;
  connect: () => void;
  logout: () => void;
}

const AuthContext = createContext<Tip4ServAuthValue>({
  token: null,
  ready: false,
  loading: false,
  connect: () => {},
  logout: () => {},
});

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
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const handledRef = useRef(false);

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
  }, []);

  return (
    <AuthContext.Provider value={{ token, ready, loading, connect, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useTip4ServAuth() {
  return useContext(AuthContext);
}
