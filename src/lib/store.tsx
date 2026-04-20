import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getStoreInfo } from './api';
import type { StoreInfo } from './types';

interface StoreContextValue {
  store: StoreInfo | null;
  loading: boolean;
}

const StoreContext = createContext<StoreContextValue>({ store: null, loading: true });

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStoreInfo()
      .then(setStore)
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
