import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import ProductCard from './ProductCard';
import { getRelatedProducts } from '../../lib/api';
import type { Product } from '../../lib/types';

interface RelatedProductsProps {
  currentProductId: number;
  categoryId?: number;
  limit?: number;
}

export default function RelatedProducts({
  currentProductId,
  categoryId,
  limit = 4,
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading || products.length === 0) return null;

  return (
    <section className="mt-16 pt-16 relative">
      <div className="divider-gradient absolute top-0 left-0 right-0" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-ark-600/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-ark-500" />
          </div>
          <h2 className="text-2xl font-bold text-heading">
            Vous pourriez aussi aimer
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
