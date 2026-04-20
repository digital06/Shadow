import { Link } from 'react-router-dom';
import { CheckCircle, Server, ShoppingBag, Clock, Shield } from 'lucide-react';

export default function CheckoutSuccessPage() {
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
            Paiement confirmé !
          </h1>
          <p className="text-lg text-volcanic-300 max-w-md mx-auto">
            Merci pour votre achat. Votre commande a été validée avec succès.
          </p>
        </div>

        <div className="bg-volcanic-900/60 border border-volcanic-800/60 rounded-2xl p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-ark-600/15 border border-ark-600/30 flex items-center justify-center flex-shrink-0">
              <Server className="w-6 h-6 text-ark-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-heading mb-1">
                Livraison en cours
              </h2>
              <p className="text-volcanic-300 text-sm leading-relaxed">
                Vos articles sont en cours de livraison sur le serveur sur lequel vous êtes connecté.
                Ils apparaîtront automatiquement dans votre inventaire.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">Délai de livraison</p>
                <p className="text-xs text-volcanic-400">
                  Quelques instants après connexion au serveur
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-volcanic-800/40 rounded-xl p-4">
              <Shield className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-heading">Transaction sécurisée</p>
                <p className="text-xs text-volcanic-400">
                  Votre paiement a été traité en toute sécurité
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-volcanic-900/40 border border-volcanic-800/40 rounded-2xl p-5 mb-8">
          <h3 className="text-sm font-semibold text-heading mb-3">Comment recevoir vos articles ?</h3>
          <ol className="space-y-3">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-ark-600/20 text-ark-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <p className="text-sm text-volcanic-300">
                Connectez-vous au serveur de jeu sur lequel vous jouez habituellement.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-ark-600/20 text-ark-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <p className="text-sm text-volcanic-300">
                Vos articles seront automatiquement livrés dans votre inventaire en jeu.
              </p>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-ark-600/20 text-ark-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <p className="text-sm text-volcanic-300">
                Si vous ne recevez pas vos articles sous quelques minutes, reconnectez-vous au serveur.
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
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
