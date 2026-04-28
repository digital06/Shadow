import { useEffect } from 'react';
import { useStore } from './store';

const FALLBACK_STORE_NAME = 'Boutique ARK France Ascended';

export function usePageTitle(pageTitle?: string | null) {
  const { store } = useStore();
  const storeName = store?.title || FALLBACK_STORE_NAME;

  useEffect(() => {
    document.title = pageTitle ? `${pageTitle} | ${storeName}` : storeName;
  }, [pageTitle, storeName]);
}
