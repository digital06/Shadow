import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';
import type { Product } from '../../lib/types';
import ProductCard from '../products/ProductCard';

interface Props {
  products: Product[];
}

export default function FeaturedProducts({ products }: Props) {
  const featured = products.filter((p) => p.featured).slice(0, 4);
  if (featured.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ark-950/5 to-transparent pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 lg:mb-16 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-500/30">
              <Star className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-heading">
                Produits en vedette
              </h2>
              <p className="text-volcanic-400 mt-1 text-lg max-w-xl">
                Les meilleurs articles selectionnes pour ameliorer votre experience de jeu
              </p>
            </div>
          </div>
          <Link
            to="/products"
            className="group inline-flex items-center gap-2 px-4 py-2 text-ark-500 hover:text-ark-400 font-medium transition-all duration-200 rounded-lg hover:bg-ark-500/5 shrink-0"
          >
            Voir tout
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.map((product, idx) => (
            <ProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}
