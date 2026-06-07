# Revue adversariale — `@sentropic/dataviz-core`

> Reviewer : Opus 4.8 (adversarial, lecture seule). Date : 2026-06-06.
> Périmètre : `packages/dataviz-core/src/{model,store,crossfilter,aggregate,serialize,index}.ts` + tests, contre `ARCHITECTURE.md`.
> Méthode : lecture intégrale + **probes runtime sur le `dist/` buildé** (chaque finding est prouvé, pas supposé). Baseline : `vitest run src` = **113 tests verts**.

## Statut de remédiation

Statut final : les invariants bloquants relevés ci-dessous sont corrigés dans le cœur avant publication `v0.4.3`.

- Rows gelées et copiées à l'ingestion, puis résultats `applyFilters` / `applyCrossfilter` retournés comme copies gelées.
- Bornes `range` non finies rejetées par `isFilterSpec`, `setFilter`, `restore` et la sérialisation.
- Contrat store aligné avec `clear` et `applyCrossfilter` comme méthodes du store.
- Type public `FilterInput` absent de l'API publique actuelle.
- Dimensions inconnues rejetées par `setFilter`, `drillDown` et `restore`.
- Tests ajoutés pour gel profond, non-aliasing, non-finite ranges, dimensions inconnues, notifications no-op et cycles crossfilter.
- État complet bookmarkable via `serializeState` / `deserializeState` et restaurable atomiquement via `store.restore`.
- `avg` / `min` / `max` sur entrée vide ou non numérique retournent `NaN`, avec tests dédiés.

Le cœur est globalement propre, bien documenté, SSR-safe (aucun accès `window`/`document`/`process`/`localStorage` à l'import — grep + import Node nu confirmés), pur, `sideEffects:false`, et l'agrégation gère correctement NaN/Infinity/booléens/strings numériques. Mais il y a **deux trous qui se propageront aux 3 adaptateurs** : (1) l'immutabilité est superficielle — les **rows ne sont pas gelées**, donc la donnée source est corruptible via n'importe quel résultat de requête ; (2) le **round-trip n'est PAS garanti** pour des bornes de `range` non-finies (NaN/Infinity) — un état que le store accepte de détenir disparaît silencieusement à la sérialisation. Plus une **divergence de contrat** entre `ARCHITECTURE.md` et l'API réelle du store.

## Constats

| Fichier | Constat | Sévérité | Correction |
|---|---|---|---|
| `store.ts` (l.114-115, 54-55) | **Immutabilité superficielle : les rows ne sont pas gelées.** `data = Object.freeze([...config.data])` gèle l'array mais PAS les objets row. Prouvé : `store.data[0].country = 'HACKED'` réussit (`Object.isFrozen(store.data[0]) === false`). La JSDoc promet « callers can't mutate it later » — faux. | **Critique** | Geler en profondeur à l'ingestion : `Object.freeze` chaque row (et idéalement copie défensive), ou documenter explicitement le contrat « read-only par convention » et l'assumer partout. |
| `store.ts` (l.214-221) + `crossfilter.ts` (l.76-91) | **`applyFilters`/`applyCrossfilter` renvoient les MÊMES références de rows que `store.data`** (shallow). Prouvé : `out[0] === store.data[0] === true`, et muter `out[0]` corrompt `store.data[0]`. Tout chart adaptateur qui touche un row de résultat (tri in-place, ajout de champ calculé) corrompt la source partagée des 3 vues. | **Critique** | Soit geler les rows (corrige aussi la ligne au-dessus), soit cloner les rows retournés, soit documenter fermement « ne jamais muter un row retourné ». Geler en profondeur est le plus sûr. |
| `serialize.ts` (l.30-37, 41-49) + `store.ts` `isFilterSpec` | **Round-trip NON garanti pour bornes `range` non-finies.** `isFilterSpec` accepte `min:NaN` (car `typeof NaN === 'number'`) → le store détient l'état. Mais `JSON.stringify(NaN)` = `null`, et au `deserialize` `min:null` échoue `isFilterSpec` → **toute la spec est jetée**. Prouvé : `{age:{kind:'range',min:NaN,max:10}}` → round-trip = `{}`. Pire en multi-filtre : `{country:include, age:{range,max:NaN}}` → seul `country` survit, le slicer `age` **disparaît sans erreur**. Idem `Infinity`. La doc affirme « round-trip of a valid state is guaranteed ». | **Critique** | Resserrer `isFilterSpec` (et idéalement `setFilter`) avec `Number.isFinite` pour les bornes de range, OU normaliser NaN/Infinity → borne absente à la sérialisation. Le store ne doit jamais détenir un état non-sérialisable. |
| `ARCHITECTURE.md` (l.54-55) vs `store.ts` (l.49-70) | **Divergence de contrat.** Le contrat annonce le store avec `clear` et `applyCrossfilter` comme méthodes ; l'interface réelle a `clearFilter`/`clearSelection` (pas `clear`) et `applyCrossfilter` est une **fonction libre**, pas une méthode du store. Les 3 adaptateurs qui « reflètent » le contrat coderont la mauvaise surface. | **Élevé** | Aligner : soit ajouter `clear`/wrapper `applyCrossfilter` au store, soit corriger `ARCHITECTURE.md`. Figer la surface AVANT d'écrire les adaptateurs (parité stricte exigée par le contrat). |
| `store.ts` (l.40-41) + `index.ts` (l.37) | **Type `FilterInput` mort et trompeur.** Exporté et documenté comme acceptant une fonction `(value,row)=>boolean`, mais `setFilter(dimensionId, spec: FilterSpec)` n'accepte qu'une spec. Prouvé : passer une fonction au runtime la stocke comme spec corrompue `{kind:'range'}` (chute dans la branche `range` de `freezeSpec`), que `serialize`/`specToPredicate` mal-traiteront ensuite. Faux signal d'API pour les adaptateurs. | **Élevé** | Supprimer `FilterInput` de l'export public, OU l'implémenter réellement (avec un type de filtre `predicate` non-sérialisable clairement marqué hors-bookmark). |
| `store.ts` (l.144-147) | **`setFilter` ne valide pas que la dimension existe.** Prouvé : `setFilter('ghostDim', …)` est accepté et conservé. Asymétrie avec `deserialize` (qui, lui, jette les dimensions inconnues). Un filtre fantôme survit en mémoire mais s'évapore au rechargement → bug de persistance silencieux. | **Moyen** | Valider contre `findDimension(model, id)` (warn ou no-op), pour une sémantique cohérente set/serialize/deserialize. |
| `aggregate.ts` (l.56-83) | **`avg([])`/`min([])`/`max([])` = `0`, valeur collisionnante et discutable.** `0` pour un avg/min/max vide est indiscernable d'une vraie mesure de 0 ; un groupe vide rapportera « min = 0 » alors que la vraie réponse est « aucune donnée ». Documenté, mais le choix est sémantiquement fragile pour la BI (axes, échelles, tooltips). `sum([])=0` et `count([])=0` sont, eux, corrects. | **Moyen** | Envisager `null`/`undefined` (ou `NaN`) pour avg/min/max vides afin que les vues distinguent « 0 mesuré » de « rien ». A minima, exposer le `count` du groupe pour lever l'ambiguïté. |
| `store.ts` (l.144-167) | **Notifications redondantes : pas de dédup par égalité de valeur.** Prouvé : deux `setFilter` identiques consécutifs → **2 notifications** (la doc parle de no-op seulement pour clear-absent). Idem un `toggleSelection` re-faisant exactement le même set. React/Svelte/Vue re-rendront inutilement. Pas un bug de correction, mais un coût perf qui se multiplie ×3 frameworks ×N vues. | **Moyen** | Comparer la spec/selection sortante à l'entrante (égalité structurelle peu coûteuse) avant `commit`, et ne notifier que si réellement changé. |
| `serialize.ts` (l.51-62) | **Bookmark = filtres uniquement ; les sélections (brush) ne sont jamais sérialisées.** Choix documenté (« ephemeral »), mais le contrat parle de « persiste l'état inter-vues » ; aucun helper cœur ne sérialise un état COMPLET (filtres + sélections). Si un adaptateur veut bookmarker une sélection cross-filter, il devra réimplémenter — risque de ×3 divergences. | **Faible** | Fournir `serializeState`/`deserializeState` optionnels couvrant filtres + sélections, ou acter explicitement que les sélections sont volontairement non-persistées. |
| `store.ts` `specToPredicate` (l.196-206) | **`range` coerce les booléens** : `Number(true)=1`, `Number(false)=0` → un filtre `range[0,1]` matche `true` ET `false`. Sur une dimension continue c'est inattendu. Pas de garde « la dimension est-elle continue ». Mineur car les données BI mélangent rarement bool et range. | **Faible** | Optionnel : restreindre `range` aux cellules numériques pures (rejeter boolean), ou documenter la coercition. |
| tests (tous) | **Couverture solide sur le happy-path et plusieurs edge cases (NaN agg, self-exclusion, scope, robustesse deserialize, pollution proto), mais trous sur les findings ci-dessus :** aucun test ne (a) vérifie le gel PROFOND des rows, (b) prouve le round-trip d'une borne NaN/Infinity, (c) teste `setFilter` sur dimension inconnue, (d) compte les notifications redondantes, (e) teste un cycle A↔B crossfilter (terminaison), (f) vérifie que les résultats de requête ne sont pas des alias mutables. | **Moyen** | Ajouter ces 6 cas. Le cœur doit être « 100 % testé » (exigence ARCHITECTURE) — actuellement c'est ~happy-path-plus. |

## Verdict

**Le cœur n'est pas ENCORE assez solide pour bâtir les 3 adaptateurs + vagues de viz dessus — mais il en est proche.** L'architecture (pur, agnostique, sérialisable, observable, SSR-safe, tree-shakeable) est juste et l'agrégation est robuste. Cependant les **3 findings Critiques touchent les invariants fondateurs** que les adaptateurs supposeront acquis :

1. l'immutabilité annoncée est superficielle (rows mutables = donnée partagée corruptible par n'importe quelle vue) ;
2. le round-trip annoncé « garanti » ne l'est pas (états non-finis perdus silencieusement) ;
3. ces deux-là sont exactement la classe de bugs (immutabilité, NaN, round-trip) déjà attrapée sur les lots précédents.

Ajoutés à la **divergence de contrat** (`clear`/`applyCrossfilter`) et au **type mort `FilterInput`**, on risque de figer une mauvaise surface API dans les 3 adaptateurs. **À corriger AVANT d'écrire les adaptateurs.** Aucune réécriture nécessaire : ce sont des durcissements ciblés (geler en profondeur, `Number.isFinite` sur les bornes, aligner le contrat, supprimer/implémenter `FilterInput`).

## Top-6 (par ordre de priorité)

1. **Geler les rows en profondeur** (`store.ts`) — l'immutabilité promise est fausse ; data source corruptible via tout résultat de requête.
2. **Garantir réellement le round-trip** (`serialize.ts`/`isFilterSpec`) — `Number.isFinite` sur les bornes de range ; un état détenu doit toujours survivre serialize→deserialize.
3. **Aligner le contrat store** (`ARCHITECTURE.md` ↔ `store.ts`) — `clear`/`applyCrossfilter` ; figer la surface avant les 3 adaptateurs.
4. **Supprimer ou implémenter `FilterInput`** (`store.ts`/`index.ts`) — API publique trompeuse, stocke une spec corrompue au runtime.
5. **Valider la dimension dans `setFilter`** (`store.ts`) — supprimer l'asymétrie set/serialize/deserialize (filtre fantôme perdu au reload).
6. **Combler les trous de tests** — gel profond, round-trip NaN/Inf, dimension inconnue, notifications redondantes, cycle crossfilter, non-aliasing des résultats.
