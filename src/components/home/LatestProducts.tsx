import { Sparkles } from 'lucide-react';
import ProductCard from '../products/ProductCard';
import type { Product } from '../../lib/types';
import { useT } from '../../lib/i18n';

interface Props {
  products: Product[];
}

export default function LatestProducts({ products }: Props) {
  const t = useT();
  const latestProducts = products
    .sort((a, b) => b.id - a.id)
    .slice(0, 8);

  if (latestProducts.length === 0) return null;

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-12">
          <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-xl border border-emerald-500/30">
            <Sparkles className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-heading">
              {t('home.latest.title')}
            </h2>
            <p className="text-volcanic-400 mt-1">
              {t('home.latest.subtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {latestProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
