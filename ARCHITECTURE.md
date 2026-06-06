# dataviz — architecture (cadrage)

`@sentropic/dataviz-*` : couche **BI / dashboard** construite **nativement sur le design system Sent Tech** (elle l'importe pour toute la présentation) et qui ajoute la seule chose que le DS n'a pas le droit de porter : **l'état partagé inter-vues**.

> Décision fondatrice (validée 2× Codex xhigh + Opus 4.8 max, 2026-06-06) :
> **le DS émet/reçoit l'intention UI** (composants contrôlés `value`/`onChange`) ;
> **dataviz détient, synchronise et persiste l'état inter-vues**.
> L'état partagé NE va PAS dans la lib de composants — il vit ici, dans un package séparé.

## Principe : cœur agnostique + adaptateurs minces

On réplique le patron qui marche dans le DS (`tokens` → 3 frameworks) pour **ne jamais
écrire 3 stores parallèles** (dette ×3, sémantiques divergentes) :

```
@sentropic/dataviz-core      TS pur, ZÉRO dépendance framework, ZÉRO dépendance DS.
   ├─ store de filtres/sélection observable
   ├─ graphe de cross-filter / scoping (brushing-and-linking)
   ├─ modèle de données : dimension / mesure, discret / continu, hiérarchies
   ├─ moteur de filtrage / agrégation
   └─ sérialisation bookmarks / URL
        │  (testé UNE fois, exhaustivement)
        ▼
@sentropic/dataviz-svelte    adaptateur Svelte 5 (runes / $state.raw + subscribe)
@sentropic/dataviz-react     adaptateur React (useSyncExternalStore)
@sentropic/dataviz-vue       adaptateur Vue 3 (shallowRef + provide/inject)
        │  chacun importe @sentropic/design-system-<fw> pour TOUTE la présentation
        ▼
   composants dashboard : FilterBar câblée, charts cross-filtrés, field-pane,
   small-multiples, slicers synchronisés, légende de sélection…
```

## Frontière (test décisif)

- **Ça compile / agrège des données, ou ça coordonne plusieurs vues ?** → `dataviz-*`.
- **Ça affiche un état qu'on lui passe ?** → ça reste dans le **design system** (déjà livré :
  charts, `FilterPill`/`FilterBar`/`SelectionChip`, etc.).

dataviz **n'enrichit jamais** le DS en présentationnel : si un composant de rendu manque,
il est ajouté au DS (contrôlé), puis consommé ici.

## Packages

| Package | Rôle | Dépend de |
|---|---|---|
| `@sentropic/dataviz-core` | moteur d'état partagé, modèle data, cross-filter, agrégation | rien (TS pur) |
| `@sentropic/dataviz-svelte` | adaptateur + composants dashboard Svelte | `dataviz-core`, `@sentropic/design-system-svelte`, `@sentropic/design-system-themes` |
| `@sentropic/dataviz-react` | adaptateur + composants dashboard React | `dataviz-core`, `@sentropic/design-system-react`, `…-themes` |
| `@sentropic/dataviz-vue` | adaptateur + composants dashboard Vue | `dataviz-core`, `@sentropic/design-system-vue`, `…-themes` |
| `apps/docs` | dashboard de démo cross-filter (3 frameworks) + doc | tous |

## Contrats stables (le cœur expose, les adaptateurs reflètent)

- `createDashboardStore(config)` → store observable : `getState()`, `subscribe(fn)`,
  `setFilter`, `toggleSelection`, `clear`, `clearAll`, `applyCrossfilter`.
- `DataModel` : `dimensions[]`, `measures[]`, type `discrete|continuous`, hiérarchies/dossiers.
- `FilterState` sérialisable (bookmarks/URL) — round-trip garanti.
- `CrossfilterGraph` : scoping déclaratif (quelle vue filtre quelles vues).

## Exigences (revue intégrale « en tant que design system »)

Mêmes garde-fous que le DS, vérifiés en double-revue Opus + Codex :
tokens réels uniquement, contraste WCAG (`contrastTextForTone`), a11y complète
(rôles, clavier, focus, `prefers-reduced-motion`), **parité stricte des 3 frameworks**
(API canonique identique), gates fiables `vitest run --no-cache --no-file-parallelism`,
SSR/hydration sûrs, tree-shaking préservé, `dataviz-core` 100 % testé.

## Publication

npm scope `@sentropic/*` (même token granulaire que le DS). Versionnage indépendant
du DS. CI : build/check/test + publish + GitHub Pages pour la démo.
