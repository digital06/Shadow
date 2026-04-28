import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CircleCheck as CheckCircle, Server, ShoppingBag, Clock, Shield } from 'lucide-react';
import { useT } from '../lib/i18n';
import { useCart } from '../lib/cart';
import { usePageTitle } from '../lib/usePageTitle';

export default function CheckoutSuccessPage() {
  const t = useT();
  const { clearCart } = useCart();
  usePageTitle(t('checkout_success.title'));

  useEffect(() => {
    clearCart();
  }, [clearCart]);
  return (
    <div className="pt-32 pb-16 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-emerald-500/20 animate-ping" style={{ animationDuration: '2s' }} />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-heading mb-3">
            {t('checkout_success.title')}
          </h1>
          <p className="text-lg text-volcanic-300 max-w-md mx-auto">
            {t('checkout_success.subtitle')}
          </p>
        </div>

        <div className="bg-volcanic-900/60 border border-volcanic-800/60 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-ark-600/15 border border-ark-600/30 flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-ark-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading mb-1">
                {t('checkout_success.delivery.title')}
              </h2>
              <p className="text-volcanic-300 text-sm leading-relaxed">
                {t('checkout_success.delivery.body')}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">{t('checkout_success.timing.title')}</p>
                <p className="text-xs text-volcanic-400">
                  {t('checkout_success.timing.body')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">{t('checkout_success.security.title')}</p>
                <p className="text-xs text-volcanic-400">
                  {t('checkout_success.security.body')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-volcanic-900/40 border border-volcanic-800/40 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-heading mb-3">{t('checkout_success.howto.title')}</h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-ark-600/20 text-ark-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-volcanic-300">
                {t('checkout_success.howto.step1')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-ark-600/20 text-ark-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-volcanic-300">
                {t('checkout_success.howto.step2')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-ark-600/20 text-ark-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-volcanic-300">
                {t('checkout_success.howto.step3')}
              </p>
            </li>
          </ol>
        </div>

        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ark-600 hover:bg-ark-500 text-white font-semibold rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            {t('checkout_success.back_to_shop')}
          </Link>
        </div>
      </div>
    </div>
  );
}
