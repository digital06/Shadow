import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Sparkles, Loader2 } from 'lucide-react';
import { getAllProducts, getProductBySlug } from '../../lib/api';
import { fallbackProducts } from '../../data/fallback';
import { useCart, type CartItem } from '../../lib/cart';
import { useToast } from '../../lib/toast';
import type { Product } from '../../lib/types';
import { getCustomFieldDefaults } from '../../lib/utils';

interface Props {
  cartItems: CartItem[];
  onClose: () => void;
}

export default function CrossSellSection({ cartItems, onClose }: Props) {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, hasSubscription } = useCart();
  const { addToast } = useToast();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const products = await getAllProducts();
        if (!cancelled) setAllProducts(products.length > 0 ? products : fallbackProducts);
      } catch {
        if (!cancelled) setAllProducts(fallbackProducts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const suggestions = useMemo(() => {
    if (allProducts.length === 0) return [];

    const cartProductIds = new Set(cartItems.map((i) => i.product.id));
    const cartCategoryIds = new Set(
      cartItems.map((i) => i.product.category?.id).filter(Boolean)
    );

    const available = allProducts.filter(
      (p) => p.status && !cartProductIds.has(p.id)
    );

    const sameCat = available.filter(
      (p) => p.category && cartCategoryIds.has(p.category.id)
    );
    const otherCat = available.filter(
      (p) => !p.category || !cartCategoryIds.has(p.category.id)
    );

    const featuredFirst = (list: Product[]) =>
      [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    return [...featuredFirst(sameCat), ...featuredFirst(otherCat)].slice(0, 6);
  }, [allProducts, cartItems]);

  const [addingIds, setAddingIds] = useState<Set<number>>(new Set());

  async function handleQuickAdd(product: Product) {
    if (addingIds.has(product.id)) return;
    setAddingIds((prev) => new Set(prev).add(product.id));
    try {
      const fullProduct = await getProductBySlug(product.slug);
      const defaults = fullProduct.custom_fields?.length
        ? getCustomFieldDefaults(fullProduct.custom_fields)
        : {};
      const result = addItem(fullProduct, defaults, fullProduct.server_options?.[0]?.id);
      if (!result.ok) {
        addToast('Un abonnement est deja dans le panier. Videz le panier pour ajouter ce produit.', 'error');
        return;
      }
      addToast(`${fullProduct.name} ajouté au panier`, 'success');
    } catch {
      const defaults = product.custom_fields?.length
        ? getCustomFieldDefaults(product.custom_fields)
        : {};
      const result = addItem(product, defaults);
      if (!result.ok) {
        addToast('Un abonnement est deja dans le panier. Videz le panier pour ajouter ce produit.', 'error');
        return;
      }
      addToast(`${product.name} ajouté au panier`, 'success');
    } finally {
      setAddingIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }
  }

  if (loading || suggestions.length === 0 || hasSubscription) return null;

  return (
    <div className="border-t border-volcanic-800/50 bg-volcanic-950/40">
      <div className="px-4 pt-4 pb-2">
        <h3 className="text-sm font-semibold text-heading flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ark-500" />
          Vous pourriez aussi aimer
        </h3>
      </div>
      <div className="flex gap-3 overflow-x-auto px-4 pb-4 scrollbar-thin">
        {suggestions.map((product) => {
          const img = product.image || product.gallery?.[0];

          return (
            <div
              key={product.id}
              className="flex-shrink-0 w-36 bg-volcanic-900/70 border border-volcanic-800/40 rounded-xl overflow-hidden group hover:border-volcanic-700/60 transition-all duration-200"
            >
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="block"
              >
                <div className="relative aspect-square overflow-hidden bg-volcanic-800">
                  {img ? (
                    <img
                      src={img}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="w-6 h-6 text-volcanic-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-volcanic-950/60 to-transparent" />
                  {product.percent_off && product.percent_off > 0 && (
                    <span className="absolute top-1.5 left-1.5 text-[10px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded">
                      -{product.percent_off}%
                    </span>
                  )}
                </div>
              </Link>

              <div className="p-2.5 space-y-2">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="block"
                >
                  <p className="text-xs font-semibold text-heading line-clamp-2 leading-tight group-hover:text-ark-400 transition-colors">
                    {product.name}
                  </p>
                </Link>

                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-ark-400">
                      {product.price.toFixed(2)}&euro;
                    </span>
                    {product.old_price && (
                      <span className="text-[10px] text-volcanic-500 line-through">
                        {product.old_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleQuickAdd(product)}
                    disabled={addingIds.has(product.id)}
                    className="w-6 h-6 flex items-center justify-center rounded-md bg-ark-600/20 text-ark-500 hover:bg-ark-600 hover:text-white disabled:opacity-50 disabled:cursor-wait transition-all duration-200"
                    title="Ajouter au panier"
                  >
                    {addingIds.has(product.id) ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
