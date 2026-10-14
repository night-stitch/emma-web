# La Clé Provençale — site web

Site vitrine et outil de gestion de **La Clé Provençale**, conciergerie de prestige à Gordes (Luberon).

## Pages

| Page | Rôle |
|---|---|
| `/` | Accueil : expertises, maisons mises en avant (★ dans l'admin), valeurs, fondatrice |
| `/forfaits` | Forfaits par type de propriété |
| `/experience` | Maisons présentées (gérées dans l'admin) |
| `/contact` | Formulaire de contact (enregistré dans Firestore › `messages`) |
| `/mentions-legales`, `/confidentialite` | Pages légales |
| `/admin/*` | Administration (connexion Firebase Auth obligatoire) |

## Technique

- **Next.js 16** (export statique `out/`) + **Tailwind CSS 4**
- **Firebase** : Firestore (données), Storage (photos des maisons), Authentication (admin), Hosting
- Admins autorisés : liste dans `app/lib/adminAuth.ts`, `firestore.rules` et `storage.rules` (à garder identiques)
- Infos de contact centralisées dans `app/lib/site.ts`

## Commandes

```bash
npm install          # installer les dépendances
npm run dev          # serveur local → http://localhost:3000
npm run build        # générer le site dans out/
firebase deploy --project lacleprovencale-c1c69   # mettre en ligne (site + règles)
```

## Images

Les images de `public/` sont optimisées (≈ 3,7 Mo au total). Les originaux haute résolution sont dans
`_images-originales/` (non versionné). Pour remplacer une image : garder le même nom, max ~2000 px, JPEG qualité ~75.
