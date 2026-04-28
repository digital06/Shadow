import { Link } from 'react-router-dom';
import { Circle as XCircle, ShoppingCart, RefreshCw, Circle as HelpCircle, ShieldCheck } from 'lucide-react';
import { useT } from '../lib/i18n';
import { usePageTitle } from '../lib/usePageTitle';

export default function CheckoutCanceledPage() {
  const t = useT();
  usePageTitle(t('checkout_canceled.title'));
  return (
    <div className="pt-32 pb-16 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="absolute inset-0 w-24 h-24 rounded-full bg-red-500/10 animate-pulse" style={{ animationDuration: '3s' }} />
            <div className="relative w-24 h-24 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center">
              <XCircle className="w-12 h-12 text-red-400" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-heading mb-3">
            {t('checkout_canceled.title')}
          </h1>
          <p className="text-lg text-volcanic-300 max-w-md mx-auto">
            {t('checkout_canceled.subtitle')}
          </p>
        </div>

        <div className="bg-volcanic-900/60 border border-volcanic-800/60 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading mb-1">
                {t('checkout_canceled.no_charge.title')}
              </h2>
              <p className="text-volcanic-300 text-sm leading-relaxed">
                {t('checkout_canceled.no_charge.body')}
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <RefreshCw className="w-5 h-5 text-ark-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">{t('checkout_canceled.retry.title')}</p>
                <p className="text-xs text-volcanic-400">
                  {t('checkout_canceled.retry.body')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <HelpCircle className="w-5 h-5 text-volcanic-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">{t('checkout_canceled.help.title')}</p>
                <p className="text-xs text-volcanic-400">
                  {t('checkout_canceled.help.body')}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-volcanic-900/40 border border-volcanic-800/40 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-heading mb-3">{t('checkout_canceled.reasons.title')}</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-volcanic-500 flex-shrink-0 mt-2" />
              <p className="text-sm text-volcanic-300">
                {t('checkout_canceled.reasons.manual')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-volcanic-500 flex-shrink-0 mt-2" />
              <p className="text-sm text-volcanic-300">
                {t('checkout_canceled.reasons.declined')}
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-volcanic-500 flex-shrink-0 mt-2" />
              <p className="text-sm text-volcanic-300">
                {t('checkout_canceled.reasons.expired')}
              </p>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/checkout"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ark-600 hover:bg-ark-500 text-white font-semibold rounded-xl transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {t('checkout_canceled.return_to_cart')}
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-volcanic-800 hover:bg-volcanic-700 text-volcanic-200 font-semibold rounded-xl transition-colors border border-volcanic-700"
          >
            {t('checkout_canceled.continue_shopping')}
          </Link>
        </div>
      </div>
    </div>
  );
}
