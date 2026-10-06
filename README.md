# dataviz — déplacé

> **Ce dépôt ne contient plus de code.** Les paquets `@sentropic/dataviz-*`
> (`dataviz-core`, `-svelte`, `-react`, `-vue`, `-angular`) vivent désormais dans le
> [design system Sentropic](https://github.com/rhanka/sent-tech-design-system), qui
> est la source de référence : code, documentation, site
> (<https://design-system.sent-tech.ca>) et publication npm.

## Ce qui reste ici

- **La redirection du site** `dataviz.sent-tech.ca` : `site/redirect.html`, publié par
  `.github/workflows/pages.yml` comme racine **et** comme page 404, pour que toute
  adresse — racine, liens profonds historiques, anciennes démos `/demos/*` — mène au
  design system.
- La licence.

## Retrouver l'ancien code

Le dernier état contenant les paquets, les applications et la documentation est le
commit [`d10fc62`](https://github.com/rhanka/dataviz/tree/d10fc62f71ecd60f3a15193f240d2c03102816c6) :

```sh
git checkout d10fc62f71ecd60f3a15193f240d2c03102816c6
```

Le code avait été copié dans le design system, avec une empreinte par fichier dans
`docs/graph-dataviz-m1-provenance.json` ; mesuré le 26 septembre 2026, aucun fichier
fonctionnel n'avait évolué ici depuis cette copie (673 fichiers sur 678 inchangés, les
5 autres étant les manifestes et un README modifiés par l'arrêt de la publication).

## Ne pas réintroduire de publication

Ce dépôt ne publie plus sur npm. Un tag `v<version>` ici publierait une version que le
design system doit publier : ne réintroduisez ni workflow de publication ni trusted
publisher npm dans ce dépôt.
