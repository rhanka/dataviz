<!-- Landing page: hero + section entry points + featured live dashboard. -->
<script lang="ts">
  import { SECTION_META, entriesFor } from '../registry/index';
  import type { Section } from '../registry/types';
  import { router, onLinkClick } from './router.svelte';
  import { ROW_COUNT } from '../data/dataset';
  import BiDemo from '../registry/dashboards/BiDemo.svelte';

  const sections: Section[] = ['charts', 'dashboards', 'grids'];
  const total = entriesFor('charts').length + entriesFor('dashboards').length + entriesFor('grids').length;
</script>

<div class="dv-prose">
  <section class="dv-hero">
    <span class="dv-badge">@sentropic/dataviz</span>
    <h1>Visualisation de données et tableaux de bord pour le design system Sentropic.</h1>
    <p>
      Charts, tableaux de bord cross-filtrés et grilles, bâtis nativement sur le
      design system : présentation 100 % design-system, état &amp; orchestration
      par <code>dataviz-core</code>, parité Svelte / React / Vue.
    </p>
    <div class="dv-hero__cta">
      <a class="dv-ctrl" href={router.href('/charts')} onclick={(e) => onLinkClick(e, '/charts')}>Explorer les charts →</a>
      <a class="dv-ctrl" href={router.href('/dashboards')} onclick={(e) => onLinkClick(e, '/dashboards')}>Voir le BI</a>
      <a class="dv-ctrl" href={router.href('/guides')} onclick={(e) => onLinkClick(e, '/guides')}>Prise en main</a>
    </div>
    <div class="dv-hero__stat">
      <div><b>{total}</b><span>composants documentés</span></div>
      <div><b>3</b><span>frameworks à parité</span></div>
      <div><b>{ROW_COUNT}</b><span>lignes de données de démo</span></div>
    </div>
  </section>

  <section class="dv-section">
    <h2>Sections</h2>
    <div class="dv-cards">
      {#each sections as section (section)}
        <a class="dv-card" href={router.href(SECTION_META[section].href)} onclick={(e) => onLinkClick(e, SECTION_META[section].href)}>
          <p class="dv-card__name">{SECTION_META[section].label}</p>
          <p class="dv-card__tag">{SECTION_META[section].blurb}</p>
        </a>
      {/each}
    </div>
  </section>

  <section class="dv-section">
    <h2>Tableau de bord en direct</h2>
    <p>
      Cliquez une barre : la sélection filtre les autres vues et la table. Tout
      l'état vit dans <code>dataviz-core</code>. Changez la palette / le mode
      sombre dans l'en-tête.
    </p>
    <div class="dv-demo">
      <BiDemo kind="crossfilter" />
    </div>
  </section>
</div>
