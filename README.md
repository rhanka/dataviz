# dataviz

Couche **BI / dashboard** construite **nativement sur le [design system Sent Tech](https://github.com/rhanka/sent-tech-design-system)**.

Le design system fournit les composants présentationnels contrôlés (charts, filtres, tableaux…).
`dataviz` ajoute la seule chose qu'un design system ne doit pas porter : **l'état partagé
inter-vues** — filtres partagés, brushing-and-linking, sélection propagée, cross-filter,
sync-slicers, drill, bookmarks.

> **Le DS émet/reçoit l'intention UI ; dataviz détient, synchronise et persiste l'état inter-vues.**

## Packages

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
