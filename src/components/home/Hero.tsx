import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { getCategories, getProducts } from '../../lib/api';
import { useStore } from '../../lib/store';
import type { Category } from '../../lib/types';

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function Hero() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [productCount, setProductCount] = useState<number | null>(null);
  const { store } = useStore();

  useEffect(() => {
    getCategories()
      .then((res) => {
        if (res.categories?.length) {
          setCategories(res.categories.filter((c) => !c.hide));
        }
      })
      .catch(() => {});
    getProducts(1)
      .then((res) => setProductCount(res.product_count))
      .catch(() => {});
  }, []);

  const title = store?.title;
  const subtitle = store?.subtitle;
  const rawDescription = store?.description ? stripHtml(store.description) : '';
  const descriptionText = rawDescription
    .replace(/Server PVP is one of the best Demo Store,?\s*come visit us\.?/gi, '')
    .trim();

  const fallbackDescription = categories.length > 0
    ? `${categories.map((cat) => cat.name).join(', ')}. Achetez en toute sécurité et recevez vos items instantanément en jeu.`
    : 'Dinos, kits, rangs VIP et bien plus encore. Achetez en toute sécurité et recevez vos items instantanément en jeu.';
  const description = descriptionText || subtitle || fallbackDescription;

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hytalehero.jpg"
          alt="Hytale"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-volcanic-950 via-volcanic-950/90 to-volcanic-950/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-volcanic-950 via-transparent to-volcanic-950/40" />
      </div>

      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-ark-500/10 rounded-full blur-[120px] animate-glow-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-ark-600/8 rounded-full blur-[100px] animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-ark-400/5 rounded-full blur-[80px] animate-float" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-2xl space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ark-600/10 border border-ark-600/20 backdrop-blur-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ark-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-ark-500" />
            </span>
            <span className="text-sm text-ark-400 font-medium">
              {subtitle || 'Livraison instantanée sur votre serveur'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-heading leading-[1.1] tracking-tight animate-slide-up">
            {title ? (
              <>
                Bienvenue sur{' '}
                <span className="text-gradient">{title}</span>
              </>
            ) : (
              <>
                Boutique PC/Console{' '}
                <span className="text-gradient">des serveurs ARK FRANCE</span>
              </>
            )}
          </h1>

          <p
            className="text-lg sm:text-xl text-volcanic-300 leading-relaxed max-w-lg animate-slide-up"
            style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
          >
            {description}
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 animate-slide-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            <Link
              to="/products"
              className="btn-primary group gap-2 px-8 py-4 text-base shadow-xl shadow-ark-600/25 hover:shadow-ark-500/35"
            >
              <ShoppingBag className="w-5 h-5" />
              Explorer la Boutique
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div
            className="flex items-center gap-8 pt-4 animate-slide-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            <StatBlock value={productCount !== null ? String(productCount) : '...'} label="Produits" />
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-volcanic-700 to-transparent" />
            <StatBlock value="24/7" label="Livraison" />
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-volcanic-700 to-transparent" />
            <StatBlock value="100%" label="Sécurisé" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-volcanic-950 to-transparent" />
    </section>
  );
}

function StatBlock({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center group cursor-default">
      <div className="text-2xl font-bold text-heading group-hover:text-ark-400 transition-colors duration-300">{value}</div>
      <div className="text-xs text-volcanic-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}
