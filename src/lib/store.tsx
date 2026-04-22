import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getStoreInfo } from './api';
import type { StoreInfo } from './types';

interface StoreContextValue {
  store: StoreInfo | null;
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue>({ store: null, loading: true });

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function setMeta(selector: string, attr: 'content', value: string) {
  const el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (el) el.setAttribute(attr, value);
}

function applyStoreSeo(info: StoreInfo) {
  const title = info.title || document.title;
  const rawDescription = info.description || info.subtitle || '';
  const description = stripHtml(rawDescription).slice(0, 300) || title;
  const image = info.logo;

  document.title = title;
  setMeta('meta[name="description"]', 'content', description);
  setMeta('meta[property="og:title"]', 'content', title);
  setMeta('meta[property="og:description"]', 'content', description);
  setMeta('meta[name="twitter:title"]', 'content', title);
  setMeta('meta[name="twitter:description"]', 'content', description);
  if (image) {
    setMeta('meta[property="og:image"]', 'content', image);
    setMeta('meta[name="twitter:image"]', 'content', image);
  }
}


export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreInfo()
      .then((info) => {
        setStore(info);
        applyStoreSeo(info);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <StoreContext.Provider value={{ store, loading }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
