
Thème boutique Tip4Serv

Description
Boutique en ligne moderne et premium pensée pour les serveurs de jeux (ranks, kits, packs, objets in-game). L'interface propose une expérience soignée avec mode clair/sombre, multilingue, animations fluides et micro-interactions, hero visuel plein écran, sections featured/latest, catégories avec icônes, fiches produits détaillées avec champs personnalisés (nom de joueur, UUID, serveur…), cart drawer latéral avec cross-sell, et tunnel de checkout complet (succès / annulation). Côté client, espace compte avec historique, wishlist, liaison Discord via OAuth, et bandeau promo avec compte à rebours sur les réductions.

Stack technique
Frontend

React 19 + TypeScript
Vite 7 (build & dev server)
React Router 7 (routing SPA)
Tailwind CSS 3 (design system, 8px spacing, ramps de couleurs, dark mode)
Lucide React (icônes)
Contexts React pour state global : ThemeProvider, LanguageProvider, CartProvider, StoreProvider, ToastProvider, Tip4ServAuthProvider
Backend / Data

Bolt Database Postgres : wishlist, stats produits, serveurs RCON (avec RLS stricte)
Bolt Database Edge Functions (Deno) :
tip4serv-proxy — proxy sécurisé vers l'API Tip4Serv (infos boutique, catalogue, checkout)
og-store / og-product — SSR des meta Open Graph pour les bots (Discord, Twitter, Facebook, Google…)
discord-oauth — callback OAuth Discord
Intégrations

Tip4Serv (catalogue, paiement, gestion boutique)
Discord OAuth (liaison compte)
Stripe (via Tip4Serv)
Déploiement / SEO

Meta tags injectés au build via plugin Vite + rafraîchis côté client
Redirections bots vers edge functions (.htaccess Apache + _redirects Netlify-style) pour aperçus de liens toujours à jour sans rebuild
