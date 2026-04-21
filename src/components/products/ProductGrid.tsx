import { ShoppingBag } from 'lucide-react';
import type { Product } from '../../lib/types';
import ProductCard from './ProductCard';
import { useT } from '../../lib/i18n';

interface Props {
  products: Product[];
  loading?: boolean;
}

export default function ProductGrid({ products, loading }: Props) {
  const t = useT();
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} index={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-volcanic-800/60 flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8 text-volcanic-600" />
        </div>
        <p className="text-volcanic-400 text-lg mb-1">
          {t('products.grid.empty_title')}
        </p>
        <p className="text-volcanic-500 text-sm">
          {t('products.grid.empty_help')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} index={idx} />
      ))}
    </div>
  );
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <div
      className="glass-card animate-fade-in"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
    >
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 lg:p-5 space-y-3">
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-full skeleton rounded" />
          <div className="h-3.5 w-2/3 skeleton rounded" />
        </div>
        <div className="pt-3 border-t border-volcanic-800/50">
          <div className="h-6 w-24 skeleton rounded" />
        </div>
      </div>
    </div>
  );
}
