import { Link } from 'react-router-dom';
import { XCircle, ShoppingCart, RefreshCw, HelpCircle, ShieldCheck } from 'lucide-react';

export default function CheckoutCanceledPage() {
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
            Paiement annule
          </h1>
          <p className="text-lg text-volcanic-300 max-w-md mx-auto">
            Votre commande n'a pas ete finalisee. Aucun montant n'a ete debite.
          </p>
        </div>

        <div className="bg-volcanic-900/60 border border-volcanic-800/60 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading mb-1">
                Aucun prelevement effectue
              </h2>
              <p className="text-volcanic-300 text-sm leading-relaxed">
                Votre moyen de paiement n'a pas ete debite. Vous pouvez retenter votre achat
                a tout moment depuis votre panier.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <RefreshCw className="w-5 h-5 text-ark-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">Reessayer</p>
                <p className="text-xs text-volcanic-400">
                  Votre panier a ete conserve
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <HelpCircle className="w-5 h-5 text-volcanic-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">Besoin d'aide ?</p>
                <p className="text-xs text-volcanic-400">
                  Contactez-nous sur Discord
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-volcanic-900/40 border border-volcanic-800/40 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-heading mb-3">Raisons possibles de l'annulation</h3>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-volcanic-500 flex-shrink-0 mt-2" />
              <p className="text-sm text-volcanic-300">
                Vous avez annule le paiement manuellement depuis la page de paiement.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-volcanic-500 flex-shrink-0 mt-2" />
              <p className="text-sm text-volcanic-300">
                Votre moyen de paiement a ete refuse par votre banque.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-volcanic-500 flex-shrink-0 mt-2" />
              <p className="text-sm text-volcanic-300">
                La session de paiement a expire apres un delai d'inactivite.
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
            Retourner au panier
          </Link>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-volcanic-800 hover:bg-volcanic-700 text-volcanic-200 font-semibold rounded-xl transition-colors border border-volcanic-700"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
