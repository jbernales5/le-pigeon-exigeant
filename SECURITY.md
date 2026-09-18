# Sécurité

## Signaler une vulnérabilité

Écrivez à **jonathan@bernales.dev** avec une description du problème, les étapes pour le reproduire et, si possible, l'impact estimé. Nous accusons réception sous 72 heures et vous tenons informé jusqu'à la correction. Merci de ne pas ouvrir d'issue publique avant qu'un correctif soit disponible.

## Ce que le projet fait déjà

- Authentification par BetterAuth : mots de passe hachés (scrypt), sessions en base, cookies `HttpOnly`, révocation de toutes les sessions lors d'une réinitialisation de mot de passe, contrôle d'origine des requêtes (`trustedOrigins`).
- Réinitialisation de mot de passe par lien à usage unique valable une heure ; la réponse ne révèle pas si l'adresse est membre.
- Inscription sur code d'invitation ; les demandes d'accès passent par un formulaire avec champ piège anti-robots et sont limitées à une par adresse et par 30 jours.
- Toutes les routes membres sont protégées côté serveur (`getSession()` dans les pages et actions), le proxy ne fait qu'une redirection optimiste.
- Les pages privées portent `noindex` ; seules l'accueil, la connexion et l'inscription sont indexables.
- Les images téléversées ou récupérées sont revalidées et ré-encodées côté serveur (sharp) avant stockage.
- Aucune clé n'est exposée au navigateur : les appels OpenAI, Resend, Nominatim et Blob se font uniquement dans des Route Handlers et Server Actions.

## Ce que vous devez faire pour votre instance

- Ne jamais versionner `.env`. Le dépôt ignore `.env*` sauf `.env.example`. Sur Vercel, déclarez les variables dans le projet plutôt que d'envoyer un fichier : `.vercelignore` exclut explicitement les fichiers d'environnement.
- Générez un `BETTER_AUTH_SECRET` propre à chaque environnement (`openssl rand -base64 32`) et faites-le tourner si vous soupçonnez une fuite : cela invalide toutes les sessions.
- Utilisez l'URL *pooled* Neon avec `sslmode=verify-full`.
- Définissez un `INVITE_CODE` : sans lui, l'inscription est ouverte.
- Limitez la clé OpenAI en budget mensuel, et la clé Resend au domaine d'envoi.
- Le token `BLOB_READ_WRITE_TOKEN` donne un accès en écriture au store : un seul store par projet, et ne le partagez pas entre environnements.
