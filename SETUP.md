# Guide de configuration

## Via `.env` (le plus simple)

1. Ouvrir le fichier `.env` à la racine du projet
2. Renseigner votre clé Tip4Serv :

```env
TIP4SERV_API_KEY=votre_cle_tip4serv_ici
```

3. Relancer le build (`npm run build`) puis redéployer le site

C'est tout. Le site appelle directement `api.tip4serv.com` depuis le navigateur. Vous n'avez **plus besoin** de Supabase pour la boutique.


## Personnalisation de marque

Le nom, le logo, la description et les liens de menu sont tirés automatiquement de votre compte Tip4Serv. Aucun changement de code nécessaire.

Pour les ajustements visuels :

- Palette : `tailwind.config.js`
- Favicon / OG image : `public/`
- Image hero : `public/background.png`
