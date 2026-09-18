# Contribuer

Merci de l'intérêt que vous portez au Pigeon Exigeant. Le projet est petit et volontairement opinionated ; les contributions les plus utiles sont les corrections de bugs, les améliorations d'accessibilité et de responsive, et les traductions.

## Avant de commencer

1. Lisez `CLAUDE.md` : il décrit le ton, les règles de design et les pièges connus. Elles s'appliquent aux humains aussi.
2. Lancez le projet en local (voir le README) avec la base Docker, jamais contre une base de production.

## Règles

- TypeScript strict, pas de `any` ; `npx tsc --noEmit`, `npx eslint .` et `npx next build` doivent passer.
- Interface en français, vouvoiement, ton de la maison. Pas de vocabulaire de moteur de réservation.
- Un composant shadcn se modifie dans `components/ui`, pas en surchargeant ses classes partout.
- Toute nouvelle variable d'environnement se documente dans `.env.example` et dans le README.
- Une migration Drizzle par changement de schéma (`npm run db:generate`), commitée avec le code.
- Vérifiez vos écrans en desktop et à 390 px de large.

## Proposer une modification

Ouvrez une issue pour en discuter si le changement est structurant, puis une pull request courte et décrite. Les captures d'écran avant/après sont bienvenues pour tout changement visuel.
