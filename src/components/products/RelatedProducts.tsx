import { useEffect, useState, useRef, useCallback } from 'react';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { getRelatedProducts } from '../../lib/api';
import type { Product } from '../../lib/types';
import { useT } from '../../lib/i18n';

interface RelatedProductsProps {
  currentProductId: number;
  categoryId?: number;
  limit?: number;
}

export default function RelatedProducts({
  currentProductId,
  categoryId,
  limit = 12,
}: RelatedProductsProps) {
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const related = await getRelatedProducts(currentProductId, categoryId, limit);
        setProducts(related);
      } catch (error) {
        console.error('Error loading related products:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentProductId, categoryId, limit]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState, products.length]);

  function scrollBy(direction: 1 | -1) {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(280, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: direction * amount, behavior: 'smooth' });
  }

  if (loading || products.length === 0) return null;

  const showArrows = canScrollLeft || canScrollRight;

  return (
    <section className="mt-16 pt-16 relative">
      <div className="divider-gradient absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-ark-600/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-ark-500" />
            </div>
            <h2 className="text-2xl font-bold text-heading">
              {t('crosssell.title')}
            </h2>
          </div>
          {showArrows && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                disabled={!canScrollLeft}
                aria-label="Précédent"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-volcanic-900/70 border border-volcanic-800/70 text-volcanic-300 hover:bg-volcanic-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                disabled={!canScrollRight}
                aria-label="Suivant"
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-volcanic-900/70 border border-volcanic-800/70 text-volcanic-300 hover:bg-volcanic-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-thin -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 pb-2 snap-x"
        >
          {products.map((product, idx) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[260px] sm:w-[280px] lg:w-[calc((100%-4.5rem)/4)] snap-start"
            >
              <ProductCard product={product} index={idx} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
