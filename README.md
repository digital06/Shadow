# Thème Shadow pour Tip4Serv

Thème boutique moderne, premium et responsive conçu pour les serveurs de jeux utilisant Tip4Serv.  
Il permet de créer une boutique en ligne complète pour vendre des ranks, kits, packs, objets in-game ou services liés à un serveur de jeu, avec une expérience utilisateur soignée et immersive.

## Description

Ce projet propose une interface boutique avancée pensée pour les communautés gaming souhaitant disposer d’une vitrine professionnelle, rapide et agréable à utiliser.

Le thème inclut un design moderne avec mode clair/sombre, prise en charge multilingue, animations fluides, micro-interactions, hero visuel plein écran, sections de mise en avant, produits récents, catégories avec icônes et fiches produits détaillées.

Les fiches produits peuvent intégrer des champs personnalisés comme le nom du joueur, l’UUID, le serveur concerné ou toute autre information nécessaire à la livraison du produit.

Le tunnel d’achat est complet avec panier latéral, cross-sell, validation de commande, page de succès et page d’annulation.  
Côté client, le thème propose également un espace compte avec historique des commandes, wishlist, liaison Discord via OAuth et bandeau promotionnel avec compte à rebours.

## Fonctionnalités principales

- Boutique en ligne moderne pour serveurs de jeux
- Compatible avec les produits Tip4Serv : ranks, kits, packs, objets in-game
- Interface responsive et optimisée mobile
- Mode clair / sombre
- Support multilingue
- Hero visuel plein écran
- Sections produits mis en avant et dernières nouveautés
- Catégories avec icônes
- Fiches produits détaillées
- Champs personnalisés par produit :
  - Nom de joueur
  - UUID
  - Serveur
  - Informations complémentaires
- Panier latéral dynamique
- Suggestions cross-sell dans le panier
- Tunnel de checkout complet
- Pages de succès et d’annulation de paiement
- Espace compte client
- Historique des commandes
- Liaison Discord via OAuth
- Bandeau promotionnel avec compte à rebours
- Animations fluides et micro-interactions
- SEO optimisé avec balises meta dynamiques
- Aperçus de liens compatibles Discord, Twitter/X, Facebook et Google

## Stack technique

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router 7
- Tailwind CSS 3
- Lucide React
- Contexts React pour la gestion globale de l’état :
  - `ThemeProvider`
  - `LanguageProvider`
  - `CartProvider`
  - `StoreProvider`
  - `ToastProvider`
  - `Tip4ServAuthProvider`

### Backend / Data

Le projet utilise Bolt Database avec PostgreSQL pour stocker et gérer certaines données avancées :

- Wishlist
- Statistiques produits
- Serveurs RCON
- Sécurité via RLS stricte

### Edge Functions

Le thème s’appuie sur plusieurs Edge Functions Deno :

- `tip4serv-proxy`  
  Proxy sécurisé vers l’API Tip4Serv pour récupérer les informations boutique, le catalogue et gérer le checkout.

- `og-store`  
  Génération SSR des balises Open Graph de la boutique pour les bots.

- `og-product`  
  Génération SSR des balises Open Graph des produits pour les bots.

- `discord-oauth`  
  Callback OAuth pour la liaison Discord.

- `rcon-players`  
  Récupération de la liste des joueurs en ligne via RCON.

## Intégrations

- Tip4Serv
  - Catalogue
  - Paiement
  - Gestion boutique

- Discord OAuth
  - Connexion et liaison du compte Discord

- Stripe
  - Paiements via Tip4Serv

## SEO et aperçu des liens

Le thème intègre une gestion avancée des meta tags :

- Injection des meta tags au build via plugin Vite
- Rafraîchissement côté client
- Génération SSR des meta Open Graph via Edge Functions
- Redirection des bots vers des fonctions dédiées pour obtenir des aperçus toujours à jour
- Compatibilité avec :
  - Discord
  - Twitter/X
  - Facebook
  - Google
  - Bots d’indexation

Les redirections peuvent être gérées via :

- `.htaccess` pour Apache
- `_redirects` au format Netlify-style

Cela permet d’avoir des aperçus de liens dynamiques sans devoir rebuild le frontend à chaque modification de produit ou de boutique.

## Déploiement

Le projet est prévu pour être déployé facilement sur une infrastructure moderne compatible avec les applications SPA.

Le frontend est généré avec Vite, tandis que les données dynamiques passent par les Edge Functions et l’API Tip4Serv.

### Commandes principales

```bash
npm install
npm run dev
npm run build
npm run preview
