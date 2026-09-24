# dataviz

> **Source déplacée.** Les paquets `@sentropic/dataviz-*`
> vivent désormais dans le [design system Sentropic](https://github.com/rhanka/sent-tech-design-system),
> qui est la source de référence (code, docs, site :
> <https://design-system.sent-tech.ca>). Le site de ce dépôt redirige vers
> <https://design-system.sent-tech.ca/components> (cible provisoire, en
> attendant une section dataviz dédiée) ; la galerie historique reste
> accessible sur ses pages (voir [docs/site-inventory.md](./docs/site-inventory.md)).

Couche **BI / dashboard** construite **nativement sur le [design system Sent Tech](https://github.com/rhanka/sent-tech-design-system)**.

Le design system fournit les composants présentationnels contrôlés (charts, filtres, tableaux…).
`dataviz` ajoute la seule chose qu'un design system ne doit pas porter : **l'état partagé
inter-vues** — filtres partagés, brushing-and-linking, sélection propagée, cross-filter,
sync-slicers, drill, bookmarks.

> **Le DS émet/reçoit l'intention UI ; dataviz détient, synchronise et persiste l'état inter-vues.**

## Où vivent ces bibliothèques

Les paquets `@sentropic/dataviz-*` sont désormais maintenus et **publiés depuis le
design system** : [rhanka/sent-tech-design-system](https://github.com/rhanka/sent-tech-design-system).

Ce dépôt ne publie plus rien sur npm : ses paquets sont marqués `private` et sa CI
se limite à `build` + `check` + `test`, plus le déploiement GitHub Pages du site et
des démos. Pour installer, consommer ou faire évoluer ces bibliothèques, aller dans
le dépôt du design system.

## Packages

Conservés ici pour le site et les démos de ce dépôt (liens npm workspaces, aucune
publication) ; la version de référence est celle du design system.

| Package | Rôle |
|---|---|
| `@sentropic/dataviz-core` | moteur agnostique : store de filtres/sélection, cross-filter, modèle dimension/mesure, agrégation, bookmarks (TS pur, zéro dépendance) |
| `@sentropic/dataviz-svelte` | adaptateur Svelte 5 + composants dashboard (importe `@sentropic/design-system-svelte`) |
| `@sentropic/dataviz-react` | adaptateur React + composants dashboard (importe `@sentropic/design-system-react`) |
| `@sentropic/dataviz-vue` | adaptateur Vue 3 + composants dashboard (importe `@sentropic/design-system-vue`) |

Voir [ARCHITECTURE.md](./ARCHITECTURE.md) pour le cadrage complet.

## Développement

```bash
npm install
npm run verify   # check + test + build
```

Monorepo npm workspaces (`packages/*`, `apps/*`). Node ≥ 20.

## Licence

MIT (à confirmer).
