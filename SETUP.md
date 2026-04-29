# Guide de configuration

Vous avez **deux modes** au choix :

| Mode | Avantage | Inconvénient |
|------|----------|--------------|
| **A. Direct (.env)** | Aucune base de données, 1 seule variable à changer | La clé API est visible dans le JS public du site |
| **B. Proxy Supabase** | Clé API cachée côté serveur (sécurisé) | Nécessite un projet Supabase |

---

## Mode A — Direct via `.env` (le plus simple)

1. Ouvrir le fichier `.env` à la racine du projet
2. Renseigner votre clé Tip4Serv :

```env
TIP4SERV_API_KEY=votre_cle_tip4serv_ici
```

3. Relancer le build (`npm run build`) puis redéployer le site

C'est tout. Le site appelle directement `api.tip4serv.com` depuis le navigateur. Vous n'avez **plus besoin** de Supabase pour la boutique.

### Avertissement de sécurité

Tout ce qui commence par `VITE_` est **inclus dans le bundle JavaScript public**. N'importe quel visiteur peut ouvrir l'inspecteur du navigateur et copier la clé. Si la clé fuite, l'attaquant peut consulter votre catalogue, créer des sessions de paiement, etc. Ne choisissez ce mode que si vous acceptez ce risque (par exemple si vos restrictions Tip4Serv côté serveur le rendent acceptable).

---

## Mode B — Proxy Supabase (sécurisé)

1. Laisser `TIP4SERV_API_KEY` **vide** dans `.env`
2. Configurer Supabase :

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

3. Définir le secret `TIP4SERV_API_KEY` côté serveur :

   - Tableau de bord Supabase -> `Edge Functions` -> `Secrets`, ou
   - CLI : `supabase secrets set TIP4SERV_API_KEY=... --project-ref <ref>`

4. Déployer les Edge Functions du dossier `supabase/functions/`

Le frontend appelle alors l'Edge Function `tip4serv-proxy`, qui ajoute la clé côté serveur. La clé n'est jamais exposée au navigateur.

---

## Personnalisation de marque

Le nom, le logo, la description et les liens de menu sont tirés automatiquement de votre compte Tip4Serv. Aucun changement de code nécessaire.

Pour les ajustements visuels :

- Palette : `tailwind.config.js`
- Favicon / OG image : `public/`
- Image hero : `public/background.jpg`
