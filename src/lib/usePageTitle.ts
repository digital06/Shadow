import { useEffect } from 'react';
import { useStore } from './store';

export function usePageTitle(pageTitle?: string | null) {
  const { store } = useStore();
  const storeName = store?.title || '';

  useEffect(() => {
    if (!storeName) return;
    document.title = pageTitle ? `${pageTitle} | ${storeName}` : storeName;
  }, [pageTitle, storeName]);
}
