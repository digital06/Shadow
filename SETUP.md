# Guide de configuration (revente du site)

Ce site utilise **Supabase** comme backend et l'API **Tip4Serv** pour la boutique et les paiements. Pour vendre le site, l'acheteur doit uniquement changer **2 choses** : sa clé API Tip4Serv et (optionnellement) son projet Supabase.

---

## 1. Clé API Tip4Serv (obligatoire)

La clé API Tip4Serv est **un secret serveur** : elle ne doit JAMAIS apparaître dans un fichier du dépôt ni dans le frontend (sinon n'importe quel visiteur peut la copier).

Elle est stockée dans les **secrets des Edge Functions Supabase** sous le nom `TIP4SERV_API_KEY`.

### Pour changer la clé

**Option A — Tableau de bord Supabase (le plus simple)**

1. Ouvrir le projet Supabase : https://supabase.com/dashboard
2. Aller dans `Edge Functions` -> `Secrets`
3. Modifier la valeur de `TIP4SERV_API_KEY`
4. Sauvegarder — la prise en compte est immédiate

**Option B — CLI Supabase**

```bash
supabase secrets set TIP4SERV_API_KEY=votre_nouvelle_cle --project-ref <project-ref>
```

Aucun redéploiement du site n'est nécessaire : les Edge Functions lisent la variable d'environnement à chaque requête.

---

## 2. Projet Supabase (si l'acheteur utilise le sien)

Si l'acheteur veut son propre projet Supabase :

1. Créer un projet sur https://supabase.com
2. Récupérer `Project URL` et `anon public key` dans `Project Settings` -> `API`
3. Mettre à jour le fichier `.env` à la racine :

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

4. Appliquer les migrations présentes dans `supabase/migrations/`
5. Déployer les Edge Functions présentes dans `supabase/functions/` (`tip4serv-proxy`, `og-product`, `rcon-players`)
6. Définir le secret `TIP4SERV_API_KEY` (voir section 1)

---

## 3. Personnalisation de marque (optionnel)

Le nom, le logo, la description et les liens de menu sont lus depuis **Tip4Serv** (via `action=store`). L'acheteur peut les modifier directement dans son tableau de bord Tip4Serv sans toucher au code.

Pour les ajustements purement visuels (couleurs, polices) :

- Palette : `tailwind.config.js`
- Favicon / OG image : `public/`
- Image hero : `public/hytalehero.jpg`

---

## Résumé pour une revente

1. Fournir le code source
2. L'acheteur crée son projet Supabase (ou réutilise le mien si cédé)
3. L'acheteur configure `TIP4SERV_API_KEY` dans les secrets Edge Functions
4. L'acheteur met à jour `.env` si projet Supabase différent
5. Déploiement front (Vercel / Netlify / etc.)

Le site est prêt à fonctionner avec la boutique de l'acheteur.
