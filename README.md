# Tip4Serv Store Theme

![Aperçu du thème Shadow](https://raw.githubusercontent.com/digital06/Shadow/main/Screenshot_2.jpg)

Demo link : https://hytale-tip4serv-jd41.bolt.host/


A modern, premium, and responsive store theme designed for game servers using Tip4Serv.  
It allows you to create a complete online store for selling ranks, kits, packs, in-game items, or server-related services with a polished and immersive user experience.

## Description

This project provides an advanced store interface built for gaming communities that want a professional, fast, and user-friendly storefront.

The theme includes a modern design with light/dark mode, multilingual support, smooth animations, micro-interactions, a fullscreen visual hero section, featured products, latest products, icon-based categories, and detailed product pages.

Product pages can include custom fields such as player name, UUID, target server, or any other information required for product delivery.

The purchase flow is complete, with a dynamic side cart drawer, cross-sell suggestions, checkout validation, success page, and cancellation page.

On the customer side, the theme also provides an account area with order history, wishlist, Discord OAuth account linking, and a promotional banner with a discount countdown.

## Main Features

- Modern online store for game servers
- Compatible with Tip4Serv products:
  - Ranks
  - Kits
  - Packs
  - In-game items
  - Server services
- Responsive and mobile-friendly interface
- Light and dark mode
- Multilingual support
- Fullscreen visual hero section
- Featured and latest product sections
- Icon-based categories
- Detailed product pages
- Custom product fields:
  - Player name
  - UUID
  - Server
  - Additional information
- Dynamic side cart drawer
- Cross-sell suggestions in the cart
- Complete checkout flow
- Payment success and cancellation pages
- Customer account area
- Order history
- Wishlist
- Discord OAuth account linking
- Promotional banner with countdown timer
- Smooth animations and micro-interactions
- SEO-optimized dynamic meta tags
- Link previews compatible with Discord, Twitter/X, Facebook, and Google

## Technical Stack

### Frontend

- React 19
- TypeScript
- Vite 7
- React Router 7
- Tailwind CSS 3
- Lucide React
- React Contexts for global state management:
  - `ThemeProvider`
  - `LanguageProvider`
  - `CartProvider`
  - `StoreProvider`
  - `ToastProvider`
  - `Tip4ServAuthProvider`

### Backend / Data

The project uses Bolt Database with PostgreSQL to manage advanced store data:

- Wishlist
- Product statistics
- RCON servers
- Strict Row Level Security policies

### Edge Functions

The theme relies on several Deno Edge Functions:

- `tip4serv-proxy`  
  Secure proxy to the Tip4Serv API for store information, catalog data, and checkout handling.

- `og-store`  
  Server-side generation of Open Graph metadata for the store.

- `og-product`  
  Server-side generation of Open Graph metadata for product pages.

- `discord-oauth`  
  Discord OAuth callback for account linking.

- `rcon-players`  
  Retrieves the list of online players through RCON.

## Integrations

- Tip4Serv
  - Catalog
  - Payments
  - Store management

- Discord OAuth
  - Discord login and account linking

- Stripe
  - Payments handled through Tip4Serv

## SEO and Link Previews

The theme includes advanced meta tag management:

- Meta tags injected at build time through a Vite plugin
- Client-side meta tag refresh
- Server-side Open Graph metadata generation through Edge Functions
- Bot redirection to dedicated functions for always up-to-date link previews
- Compatible with:
  - Discord
  - Twitter/X
  - Facebook
  - Google
  - Search engine bots

Bot redirections can be handled through:

- `.htaccess` for Apache
- `_redirects` in Netlify-style format

This makes it possible to generate dynamic link previews without rebuilding the frontend every time a product or store setting changes.

## Configuration Guide

### Using `.env` — Recommended

1. Open the `.env` file at the root of the project.
2. Add your Tip4Serv API key:

```env
TIP4SERV_API_KEY=your_tip4serv_api_key_here

## Deployment

The project is designed to be deployed easily on modern hosting environments compatible with SPA applications.

The frontend is built with Vite, while dynamic data is handled through Edge Functions and the Tip4Serv API.

### Main Commands

```bash
npm install
npm run dev
npm run build
npm run preview
