import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader as Loader2, ShoppingCart, CircleAlert as AlertCircle, ShieldCheck, Zap, Lock, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../lib/cart';
import { useStore } from '../lib/store';
import { useToast } from '../lib/toast';
import { computeExtrasPrice } from '../lib/pricing';
import { getCheckoutIdentifiers, createCheckout } from '../lib/api';
import { isNiveauHidden, isNiveauField } from '../lib/utils';
import type { CheckoutBody, CheckoutProduct, CheckoutUser } from '../lib/types';

const IDENTIFIER_LABELS: Record<string, { label: string; placeholder: string }> = {
  email: { label: 'Email', placeholder: 'exemple@email.com' },
  minecraft_username: { label: 'Pseudo Minecraft', placeholder: 'Steve' },
  steam_id: { label: 'Steam ID', placeholder: '76561198000000000' },
  discord_id: { label: 'Discord ID', placeholder: '274785054121525250' },
  epic_id: { label: 'Epic Games ID', placeholder: 'Votre ID Epic Games' },
  eos_id: { label: 'EOS ID (Epic Online Services)', placeholder: '0123456789abcdef...' },
  fivem_citizen_id: { label: 'FiveM Citizen ID', placeholder: 'abc123' },
  ingame_username: { label: 'Pseudo en jeu', placeholder: 'Votre pseudo' },
  rust_username: { label: 'Pseudo Rust', placeholder: 'Votre pseudo Rust' },
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clearCart } = useCart();
  const { store } = useStore();
  const { addToast } = useToast();
  const [requiredIdentifiers, setRequiredIdentifiers] = useState<string[]>([]);
  const [identifierValues, setIdentifierValues] = useState<Record<string, string>>({});
  const [loadingInit, setLoadingInit] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const cartTotal = items.reduce((sum, item) => {
    const extras = computeExtrasPrice(item.product.custom_fields, item.customFieldValues);
    return sum + (item.product.price + extras) * item.quantity;
  }, 0);

  useEffect(() => {
    if (items.length === 0) return;
    async function init() {
      try {
        if (!store?.id) return;
        const productIds = items.map((item) => Number(item.product.id));
        const ids = await getCheckoutIdentifiers(store.id, productIds);
        setRequiredIdentifiers(ids);
      } catch {
        setRequiredIdentifiers([]);
      } finally {
        setLoadingInit(false);
      }
    }
    init();
  }, [items, store?.id]);

  useEffect(() => {
    if (!store) return;
    if (items.length === 0) {
      setLoadingInit(false);
    }
  }, [store, items.length]);

  const handleCheckout = useCallback(async () => {
    if (!acceptedTerms) {
      addToast('Veuillez accepter les conditions relatives au droit de rétractation.', 'warning');
      return;
    }

    if (!store?.id) {
      addToast('Impossible de contacter la boutique. Veuillez réessayer.', 'error');
      return;
    }

    for (const id of requiredIdentifiers) {
      if (!identifierValues[id]?.trim()) {
        const label = IDENTIFIER_LABELS[id]?.label || id;
        addToast(`Le champ "${label}" est requis.`, 'warning');
        return;
      }
    }

    for (const item of items) {
      const allFields = item.product.custom_fields || [];
      const rules = item.product.custom_rules || [];
      const hideNiveau = isNiveauHidden(allFields, item.customFieldValues);

      const isFieldVisible = (fid: number): boolean => {
        const field = allFields.find((f) => f.id === fid);
        if (!field) return true;
        if (hideNiveau && isNiveauField(field)) return false;
        if (!field.parent) return true;
        const parentVal = item.customFieldValues[String(field.parent.customFieldId)];
        if (parentVal === undefined) return false;
        const parentField = allFields.find((f) => f.id === field.parent!.customFieldId);
        if (!parentField?.options) return false;
        const selectedOpt = parentField.options.find(
          (o) => String(o.value) === String(parentVal)
        );
        return selectedOpt ? String(selectedOpt.id) === String(field.parent.optionId) : false;
      };

      for (const rule of rules) {
        if (rule.type !== 'number_limit') continue;
        const visibleFields = rule.fields.filter(isFieldVisible);
        if (visibleFields.length === 0) continue;
        const total = visibleFields.reduce((sum, fid) => {
          return sum + (Number(item.customFieldValues[String(fid)]) || 0);
        }, 0);
        const isExact = rule.min === rule.max;
        if (isExact && total !== rule.max) {
          addToast(
            `${item.product.name} - ${rule.name} : la somme doit etre exactement ${rule.max} (actuellement ${total}).`,
            'warning'
          );
          return;
        }
        if (!isExact && (total < rule.min || total > rule.max)) {
          addToast(
            `${item.product.name} - ${rule.name} : la somme doit etre entre ${rule.min} et ${rule.max} (actuellement ${total}).`,
            'warning'
          );
          return;
        }
      }
    }

    setError(null);
    setLoadingCheckout(true);

    try {
      const products: CheckoutProduct[] = items.map((item) => {
        const cp: CheckoutProduct = {
          product_id: Number(item.product.id),
          product_slug: item.product.slug,
          type: item.purchaseType || 'addtocart',
          quantity: item.quantity,
        };

        if (item.selectedServer !== undefined) {
          cp.server_selection = item.selectedServer;
        }

        if (Object.keys(item.customFieldValues).length > 0 && item.product.custom_fields) {
          const allFields = item.product.custom_fields;
          const hideNiv = isNiveauHidden(allFields, item.customFieldValues);

          const isVisible = (f: typeof allFields[number]): boolean => {
            if (hideNiv && isNiveauField(f)) return false;
            if (!f.parent) return true;
            const parentVal = item.customFieldValues[String(f.parent.customFieldId)];
            if (parentVal === undefined || parentVal === null) return false;
            const parentField = allFields.find((pf) => pf.id === f.parent!.customFieldId);
            if (!parentField?.options) return false;
            const selectedOpt = parentField.options.find(
              (o) => String(o.value) === String(parentVal)
            );
            return selectedOpt ? String(selectedOpt.id) === String(f.parent.optionId) : false;
          };

          const converted: Record<string, string | number> = {};
          for (const field of allFields) {
            if (!isVisible(field)) continue;
            const fieldId = String(field.id);
            let val = item.customFieldValues[fieldId];
            if (val === undefined || val === null || (typeof val === 'number' && isNaN(val)) || val === 'null') {
              if (field.type === 'number') {
                const dv = String(field.default_value ?? field.minimum ?? 0);
                val = dv.includes('-') ? (Number(dv.split('-')[0]) || 0) : (Number(dv) || 0);
              } else if (field.type === 'checkbox') {
                val = 0;
              } else if ((field.type === 'select' || field.type === 'selection') && field.options?.length) {
                val = field.options[0].value;
              } else {
                val = field.default_value ?? '';
              }
            }
            if (field.type === 'checkbox' && (val === 0 || val === '0' || val === false || val === '')) {
              continue;
            }
            if ((field.type === 'select' || field.type === 'selection') && field.options) {
              const opt = field.options.find((o) => String(o.value) === String(val));
              converted[fieldId] = opt ? Number(opt.id) : val;
            } else {
              converted[fieldId] = typeof val === 'number' && isNaN(val) ? 0 : val;
            }
          }
          if (Object.keys(converted).length > 0) {
            cp.custom_fields = converted;
          }
        }

        return cp;
      });

      const user: CheckoutUser = {};
      requiredIdentifiers.forEach((id) => {
        const val = identifierValues[id]?.trim();
        if (val) {
          (user as Record<string, string>)[id] = val;
        }
      });

      const body: CheckoutBody = { products };

      if (Object.keys(user).length > 0) {
        body.user = user;
      }

      const origin = window.location.origin;
      body.redirect_success_checkout = `${origin}/checkout/success`;
      body.redirect_canceled_checkout = `${origin}/checkout/canceled`;

      const result = await createCheckout(store.id, body);
      setIsRedirecting(true);
      clearCart();
      window.location.href = result.url;
    } catch (err) {
      const msg = err instanceof Error
        ? err.message.split('\n\nDEBUG_PAYLOAD:')[0]
        : 'Une erreur est survenue. Veuillez réessayer.';
      setError(err instanceof Error ? err.message : msg);
      addToast(msg, 'error', 5000);
      setLoadingCheckout(false);
    }
  }, [store, items, identifierValues, requiredIdentifiers, clearCart, addToast, acceptedTerms]);

  if (isRedirecting) {
    return (
      <div className="pt-32 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-ark-600/15 flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Lock className="w-10 h-10 text-ark-500" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-3">Redirection vers le paiement</h1>
          <p className="text-volcanic-400 mb-6">
            Vous allez etre redirige vers la page de paiement securisee. Veuillez patienter...
          </p>
          <div className="flex items-center justify-center gap-2 text-ark-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Redirection en cours...</span>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4 text-xs text-volcanic-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-ark-600" />
              <span>Paiement securise</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-ark-600" />
              <span>Livraison instantanee</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !loadingInit) {
    return (
      <div className="pt-32 pb-16">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-volcanic-800/60 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-volcanic-600" />
          </div>
          <h1 className="text-2xl font-bold text-heading mb-3">Votre panier est vide</h1>
          <p className="text-volcanic-400 mb-8">
            Ajoutez des articles depuis la boutique pour passer commande.
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ark-600 hover:bg-ark-500 text-white font-semibold rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Voir la boutique
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 lg:pt-28 pb-16 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-sm text-volcanic-400 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 hover:text-heading transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span>/</span>
          <span className="text-volcanic-500">Paiement</span>
        </div>

        <h1 className="text-3xl lg:text-4xl font-bold text-heading mb-10">Finaliser la commande</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-3 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-ark-500" />
                Votre panier ({items.length} article{items.length > 1 ? 's' : ''})
              </h2>
              <div className="space-y-3">
                {items.map((item) => {
                  const extras = computeExtrasPrice(item.product.custom_fields, item.customFieldValues);
                  const unitPrice = item.product.price + extras;
                  const lineTotal = unitPrice * item.quantity;
                  const img = item.product.image || item.product.gallery?.[0];

                  return (
                    <div key={item.id} className="glass-card p-4">
                      <div className="flex gap-4">
                        <Link to={`/product/${item.product.slug}`} className="shrink-0">
                          {img ? (
                            <img
                              src={img}
                              alt={item.product.name}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-volcanic-800 flex items-center justify-center">
                              <ShoppingBag className="w-8 h-8 text-volcanic-600" />
                            </div>
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
                                to={`/product/${item.product.slug}`}
                                className="text-heading font-semibold hover:text-ark-400 transition-colors line-clamp-1"
                              >
                                {item.product.name}
                              </Link>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.product.category?.name && (
                                  <p className="text-xs text-volcanic-500">
                                    {item.product.category.name}
                                  </p>
                                )}
                                {item.product.subscription && (
                                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                    item.purchaseType === 'subscribe'
                                      ? 'bg-ark-600/15 text-ark-400'
                                      : 'bg-volcanic-700/50 text-volcanic-300'
                                  }`}>
                                    {item.purchaseType === 'subscribe' ? 'Abonnement' : '1 mois'}
                                  </span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                removeItem(item.id);
                                addToast(`${item.product.name} retiré du panier`, 'info');
                              }}
                              className="shrink-0 p-1.5 text-volcanic-500 hover:text-red-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              {item.product.quantity ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-volcanic-800 text-volcanic-300 hover:text-heading hover:bg-volcanic-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm text-heading font-medium">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-volcanic-800 text-volcanic-300 hover:text-heading hover:bg-volcanic-700 transition-colors"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-volcanic-500">Qty: 1</span>
                              )}
                              <span className="text-lg font-bold text-heading">
                                {lineTotal.toFixed(2)} &euro;
                              </span>
                            </div>
                            {extras > 0 && (
                              <p className="text-xs text-volcanic-400">
                                Prix de base: {item.product.price.toFixed(2)} € + Options: {extras.toFixed(2)} €
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {loadingInit ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-ark-500 animate-spin mr-2" />
                <span className="text-volcanic-400 text-sm">Chargement des informations...</span>
              </div>
            ) : (
              requiredIdentifiers.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-ark-500" />
                    Informations de livraison
                  </h2>
                  <div className="glass-card p-6 space-y-5">
                    {requiredIdentifiers.map((id) => {
                      const meta = IDENTIFIER_LABELS[id] || { label: id, placeholder: '' };
                      return (
                        <div key={id}>
                          <label className="block text-sm font-medium text-volcanic-300 mb-2">
                            {meta.label}
                            <span className="text-red-400 ml-1">*</span>
                          </label>
                          <input
                            type={id === 'email' ? 'email' : 'text'}
                            placeholder={meta.placeholder}
                            value={identifierValues[id] || ''}
                            onChange={(e) =>
                              setIdentifierValues((prev) => ({
                                ...prev,
                                [id]: e.target.value,
                              }))
                            }
                            className="input-field"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-28 space-y-5">
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-lg font-semibold text-heading">Récapitulatif</h2>

                <div className="space-y-3 text-sm">
                  {items.map((item) => {
                    const extras = computeExtrasPrice(item.product.custom_fields, item.customFieldValues);
                    const lineTotal = (item.product.price + extras) * item.quantity;
                    return (
                      <div key={item.id} className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-volcanic-400 truncate">
                            {item.product.name}
                            {item.quantity > 1 && (
                              <span className="text-volcanic-600 ml-1">x{item.quantity}</span>
                            )}
                          </span>
                          <span className="text-heading font-medium shrink-0">
                            {lineTotal.toFixed(2)} &euro;
                          </span>
                        </div>
                        {extras > 0 && (
                          <div className="text-xs text-volcanic-500 pl-2">
                            Base: {item.product.price.toFixed(2)} € + Options: {extras.toFixed(2)} €
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-volcanic-800/50 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-volcanic-300 font-medium">Total</span>
                    <span className="text-2xl font-bold text-heading">
                      {cartTotal.toFixed(2)} &euro;
                    </span>
                  </div>
                  <p className="text-xs text-volcanic-500 mt-2">
                    Les codes promo et cartes cadeaux peuvent être appliqués sur la page de paiement.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-300">{error.split('\n\nDEBUG_PAYLOAD:')[0]}</p>
                    </div>
                    {error.includes('DEBUG_PAYLOAD:') && (
                      <pre className="text-xs text-volcanic-400 bg-volcanic-900/50 rounded p-2 overflow-x-auto max-h-40 overflow-y-auto whitespace-pre-wrap break-all">
                        {error.split('DEBUG_PAYLOAD:')[1]}
                      </pre>
                    )}
                  </div>
                )}

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 shrink-0 rounded border-volcanic-600 bg-volcanic-800 text-ark-600 focus:ring-ark-600/30 focus:ring-offset-0 cursor-pointer accent-ark-600"
                  />
                  <span className="text-xs text-volcanic-400 leading-relaxed group-hover:text-volcanic-300 transition-colors select-none">
                    Conformément à l'article L221-28 du Code de la consommation, le client renonce à son droit de rétractation dès l'accès au contenu numérique. Aucun remboursement ne sera possible après activation, sauf défaut technique avéré.
                    <span className="text-red-400 ml-0.5">*</span>
                  </span>
                </label>

                <button
                  onClick={handleCheckout}
                  disabled={loadingCheckout || loadingInit || !acceptedTerms}
                  className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg"
                >
                  {loadingCheckout ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Redirection...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Payer {cartTotal.toFixed(2)} &euro;
                    </>
                  )}
                </button>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-xs text-volcanic-500">
                    <ShieldCheck className="w-4 h-4 text-ark-600 shrink-0" />
                    <span>Paiement sécurisé et chiffré</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-volcanic-500">
                    <Zap className="w-4 h-4 text-ark-600 shrink-0" />
                    <span>Livraison automatique instantanée</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
