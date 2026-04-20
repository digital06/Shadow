import { Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import type { Category } from '../../lib/types';
import { getCategoryIcon } from '../../lib/categoryIcons';
import { stripHtml } from '../../lib/utils';

interface Props {
  categories: Category[];
}

export default function CategorySection({ categories }: Props) {
  if (categories.length === 0) return null;

  return (
    <section className="py-20 lg:py-28 relative">
      <div className="absolute top-0 left-0 right-0">
        <div className="divider-gradient" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-12 lg:mb-16">
          <div className="p-3 bg-gradient-to-br from-ark-500/20 to-ark-700/20 rounded-xl border border-ark-500/30">
            <LayoutGrid className="w-6 h-6 text-ark-400" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-heading">
              Parcourir par categorie
            </h2>
            <p className="text-volcanic-400 mt-1 text-lg max-w-xl">
              Trouvez exactement ce dont vous avez besoin pour dominer sur ARK Ascended
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((cat, idx) => {
            const Icon = getCategoryIcon(cat.slug || cat.name);
            return (
              <Link
                key={cat.id}
                to={`/products?category=${cat.slug}`}
                className="group glass-card-hover card-shine animate-fade-in-up"
                style={{ animationDelay: `${idx * 80}ms`, animationFillMode: 'both' }}
              >
                {cat.image ? (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-volcanic-950 via-volcanic-950/40 to-transparent" />
                    <div className="absolute top-3 left-3 w-9 h-9 rounded-lg bg-volcanic-950/70 backdrop-blur-sm flex items-center justify-center border border-volcanic-700/30 group-hover:bg-ark-600/20 group-hover:border-ark-600/30 transition-all duration-300">
                      <Icon className="w-4.5 h-4.5 text-ark-400" />
                    </div>
                  </div>
                ) : (
                  <div className="h-24 flex items-center justify-center bg-gradient-to-br from-ark-600/10 to-ark-800/5">
                    <div className="w-14 h-14 rounded-2xl bg-ark-600/10 border border-ark-600/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-ark-600/20 group-hover:shadow-glow-sm transition-all duration-300">
                      <Icon className="w-7 h-7 text-ark-500" />
                    </div>
                  </div>
                )}
                <div className="relative p-5">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h3 className="text-lg font-semibold text-heading group-hover:text-ark-400 transition-colors duration-200">
                      {cat.name}
                    </h3>
                  </div>
                  {cat.description && (
                    <p className="text-sm text-volcanic-400 leading-relaxed mb-3 line-clamp-2">
                      {stripHtml(cat.description)}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 text-sm text-ark-500 font-medium group-hover:gap-2.5 transition-all duration-300">
                    Voir les produits
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
