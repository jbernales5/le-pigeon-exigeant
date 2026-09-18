# Le Pigeon Exigeant — guide pour Claude

Collection privée d'hôtels et de maisons d'exception, recommandés par des membres qui y ont vraiment dormi.
Nom de code du dépôt : `bookrich` (ancien nom du produit, le dossier n'a pas été renommé). Domaine : `lepigeonexigeant.fr`.
Lire aussi `AGENTS.md` (règles Next.js 16, généré par `next dev`) et `README.md` (mise en route).

## Ce que le produit doit être

- **Élégant avant tout.** Ton éditorial, luxe discret, jamais « SaaS ». Titres en Instrument Serif, texte en Space Grotesk, boutons en capitales espacées sans arrondi (preset shadcn `b3m6rAcRW`, Base UI, couleur de base stone, primaire terracotta).
- **Humain, pas algorithmique.** L'humour maison : « pigeons exigeants », « se faire plumer », « la volière ». Auto-dérision chic, jamais lourde. Aucun vocabulaire de moteur de réservation.
- **Interface en français**, tutoiement interdit, vouvoiement chaleureux. Le prix indiqué est celui **réellement payé** par le membre.
- **Réservé aux invités.** Inscription par code (`INVITE_CODE`) ou via la demande d'accès (dialogue « Solliciter un accès », e-mails Resend).
- **Responsive de la landing jusqu'au dernier écran** (390 px minimum), navigation basse sur mobile, animations d'apparition sobres (`Reveal`, `FadeImage`, `ProgressOverlay`). Respecter `prefers-reduced-motion`.

## Stack

Next.js 16 (App Router, `proxy.ts` remplace middleware), React 19, Tailwind 4, shadcn (Base UI, icônes Hugeicons), BetterAuth (e-mail + mot de passe, adaptateur Drizzle), Drizzle ORM + PostgreSQL (Docker en local, **Neon en production**), OpenAI Responses API (extraction depuis un lien, recherche web), Photon/Nominatim (OpenStreetMap, gratuit, fournisseur par défaut), MapLibre 5 + OpenFreeMap (globe), sharp + Vercel Blob (photos), Resend + React Email (e-mails), Vercel (hébergement).

Points d'entrée : `lib/site.ts` (marque, URLs, adresses), `lib/db/schema.ts`, `lib/actions/hotels.ts`, `lib/ai/*`, `lib/search/*`, `lib/storage.ts`, `emails/*`.

## Règles de développement

1. **Lire la doc Next 16 dans `node_modules/next/dist/docs/` avant d'utiliser une API** : `params`/`searchParams` sont des Promises, `proxy.ts` et non `middleware.ts`, `template.tsx` pour les transitions.
2. **Composants shadcn = Base UI**, pas Radix. Un `Button` rendu en lien prend `nativeButton={false} render={<Link />}`. `DropdownMenuLabel` vit dans un `DropdownMenuGroup`. `SelectValue` accepte une fonction de rendu pour afficher un libellé.
3. **Fichiers `"use server"` n'exportent que des fonctions async.** Schémas et types vont dans `lib/hotel-form.ts` ou équivalent.
4. **Jamais de saisie libre quand une liste suffit** (mois/année, devise). Valider côté serveur avec zod v4 (`z.flattenError`).
5. **Photos** : toujours passer par `lib/storage.ts` (normalisation WebP via sharp, taille minimale, dédoublonnage des variantes CDN). Jeton Blob passé explicitement, jamais via OIDC.
6. **Recherche par nom** : OpenStreetMap d'abord, IA en dernier recours et derrière une confirmation (le message sur l'eau est voulu). Tout choix d'hôtel passe par `/api/resolve` (site officiel → extraction → fusion des coordonnées).
7. **Auth** : le proxy ne fait qu'une redirection optimiste vers `/login` ; la validation réelle se fait dans les pages via `getSession()`. Ne jamais rediriger sur la simple présence d'un cookie (boucle après reset de base).
8. **Pages membres = `noindex`**. Seules `/`, `/login`, `/register` sont indexables (`app/robots.ts`, `app/sitemap.ts`).
9. **Qualité avant de rendre la main** : `npx tsc --noEmit`, `npx eslint .`, `npx next build`, puis un test réel dans le navigateur (Playwright headless avec `--use-angle=swiftshader` pour le WebGL de la carte). Captures d'écran desktop et 390 px pour tout changement d'interface. Arrêter le serveur de dev ensuite si l'utilisateur l'a demandé.
10. **E-mails** : gabarits React Email dans `emails/`, toujours pré-rendus avec `render()` puis envoyés en `html`/`text`. L'option `react` du SDK Resend échoue dans le bundle Next (« Failed to render React component »). Sans `RESEND_API_KEY`, le lien de réinitialisation est écrit dans la console serveur.
11. **Origines BetterAuth** : `trustedOrigins` dans `lib/auth.ts` couvre l'apex, `www`, `*.vercel.app` et `localhost:*` en dev. Un « Invalid origin » vient d'une origine absente de cette liste ou d'un `BETTER_AUTH_URL` différent du domaine visité, jamais du secret.
12. **Ne pas commiter sans qu'on le demande.** Pas d'attribution automatique dans les messages sauf instruction.

## Versions figées (ne pas « mettre à jour » sans raison)

- `maplibre-gl` **^5** : la 6.10 ne rend rien (vérifié sur page isolée).
- `eslint` **^9** : `eslint-config-next` 16.3 plante avec ESLint 10.
- `zod` v4, `openai` v7 (`responses.parse` + `zodTextFormat`), `better-auth` 1.7 (`@better-auth/drizzle-adapter`).

## Environnement local

```bash
npm run db:up          # Postgres Docker (bookrich-db, port 5432)
npm run dev            # http://localhost:3000 — le port 3000 est souvent pris sur cette machine : `npx next dev -p 3001`
```

- `BETTER_AUTH_URL` reste vide en local (déduit de la requête, tout port fonctionne). En production : `https://lepigeonexigeant.fr`.
- **Le `.env` local pointe désormais vers Neon.** Pour viser Docker sur une commande : `DATABASE_URL=postgresql://bookrich:bookrich@localhost:5432/bookrich npm run <script>`.
- `db:clean` et `db:reset` refusent une URL `neon.tech` sans `--force`. `db:migrate`, `db:seed`, `user:invite` s'exécutent directement sur la base configurée : vérifier `DATABASE_URL` avant.
- Scripts : `db:migrate`, `db:generate`, `db:seed` (utilisateur par défaut seulement), `db:seed:hotels` (4 adresses fictives), `db:clean`, `db:reset`, `user:invite -- <email> <prénom> [--password …]`.
- Sans `OPENAI_API_KEY` : extraction en mode métadonnées, recherche IA désactivée, OpenStreetMap disponible. Sans `RESEND_API_KEY` : demandes d'accès stockées, e-mails non envoyés (warning en console). Sans `BLOB_READ_WRITE_TOKEN` : photos dans `storage/uploads`.

## Production

- **Base : Neon**, prête, migrations appliquées avec `npm run db:migrate` (URL *pooled*, `sslmode=verify-full` pour éviter l'avertissement `pg`).
- **E-mails : Resend**, domaine `lepigeonexigeant.fr` vérifié, région Irlande. Expéditeur `noreply@lepigeonexigeant.fr`, réponses vers `bonjour@lepigeonexigeant.fr`, notifications de demande d'accès vers `ACCESS_REQUEST_NOTIFY_EMAIL`.
- **Photos : Vercel Blob** (`BLOB_READ_WRITE_TOKEN`). Un seul store doit rester connecté au projet.
- Variables Vercel : `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `NEXT_PUBLIC_SITE_URL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `BLOB_READ_WRITE_TOKEN`, `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_REPLY_TO`, `ACCESS_REQUEST_NOTIFY_EMAIL`, `INVITE_CODE`, éventuellement `GOOGLE_PLACES_API_KEY`.

## Pièges connus

- Sites qui bloquent les robots (403) : l'extraction propose la recherche par nom ou le téléversement.
- Le tag `website` OpenStreetMap pointe parfois vers le site du groupe (moins de photos) : l'onglet « Depuis un lien » avec l'URL exacte reste la meilleure source.
- Photon renvoie les noms en langue locale ; on bascule sur l'anglais quand le nom n'est pas latin.
- Le jeton `--ink` ne doit jamais changer en mode sombre (surfaces photo toujours sombres, texte du bouton blanc).
- Un `w-auto` sur `next/image` retombe sur l'attribut `width` : envelopper dans une boîte avec `aspect-[...]` et `fill`.

## À venir

Notifier les membres par e-mail quand une adresse est ajoutée, puis newsletter (Resend). Statut des demandes d'accès (`pending | invited | declined`) à exploiter dans une petite interface d'administration.
