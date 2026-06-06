<script lang="ts">
  import {
    createDashboardStore,
    DashboardFilterBar,
    SelectionLegend,
    CrossfilteredBarChart,
    SmallMultiples,
    DrillBarChart,
    DrillBreadcrumb,
    RecordsTable,
    TopNFilter,
    ValueSlicer,
    ExportMenu,
  } from '@sentropic/dataviz-svelte';
  import { model, data, crossfilter } from './data.js';

  const store = createDashboardStore({ model, data, crossfilter });

  const legendLabels = { byCountry: 'Pays', byProduct: 'Produit' };
</script>

<main class="page">
  <header class="page__head">
    <div>
      <h1>dataviz — démo cross-filter</h1>
      <p>
        Tout est piloté par l'état partagé <code>@sentropic/dataviz-core</code> ; la présentation
        vient à 100 % du design system Sent Tech.
      </p>
    </div>
    <ExportMenu {store} />
  </header>

  <section class="bar">
    <DashboardFilterBar {store} />
    <SelectionLegend {store} labels={legendLabels} />
  </section>

  <section class="controls">
    <ValueSlicer {store} dimension="country" orientation="horizontal" />
    <TopNFilter {store} dimension="product" measure="sales" defaultN={2} label="Top N produits" />
  </section>

  <section class="charts">
    <article class="card">
      <h2>Ventes par pays</h2>
      <p class="hint">Clique une barre pour filtrer les autres vues.</p>
      <CrossfilteredBarChart {store} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" />
    </article>
    <article class="card">
      <h2>Ventes par produit</h2>
      <p class="hint">Lié à la sélection « Pays » (et inversement).</p>
      <CrossfilteredBarChart {store} viewId="byProduct" dimension="product" measure="sales" label="Ventes par produit" tone="category2" />
    </article>
  </section>

  <section class="card">
    <h2>Small multiples — ventes par produit, par pays</h2>
    <SmallMultiples {store} viewId="facets" facetBy="country" dimension="product" measure="sales" label="Ventes" columns={3} />
  </section>

  <section class="card">
    <h2>Drill — pays → ville</h2>
    <DrillBreadcrumb {store} viewId="drill" hierarchy={['country', 'city']} />
    <DrillBarChart {store} viewId="drill" hierarchy={['country', 'city']} measure="sales" label="Ventes (drill)" tone="category3" />
  </section>

  <section class="card">
    <h2>Enregistrements (cross-filtrés)</h2>
    <RecordsTable {store} pageSize={8} />
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    background: var(--st-semantic-surface-base, #fff);
    color: var(--st-semantic-text-primary, #0f172a);
    font-family: system-ui, sans-serif;
  }
  .page {
    margin: 0 auto;
    max-width: 1100px;
    padding: var(--st-spacing-6, 1.5rem);
    display: flex;
    flex-direction: column;
    gap: var(--st-spacing-6, 1.5rem);
  }
  .page__head {
    align-items: flex-start;
    display: flex;
    gap: var(--st-spacing-4, 1rem);
    justify-content: space-between;
  }
  h1 {
    margin: 0 0 0.25rem;
    font-size: 1.5rem;
  }
  h2 {
    margin: 0 0 var(--st-spacing-3, 0.75rem);
    font-size: 1.0625rem;
  }
  .hint,
  p {
    color: var(--st-semantic-text-secondary, #475569);
    font-size: 0.875rem;
    margin: 0 0 var(--st-spacing-3, 0.75rem);
  }
  .bar,
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-spacing-4, 1rem);
    align-items: flex-end;
  }
  .charts {
    display: grid;
    gap: var(--st-spacing-4, 1rem);
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
  .card {
    background: var(--st-semantic-surface-raised, #fff);
    border: 1px solid var(--st-semantic-border-subtle, #e2e8f0);
    border-radius: var(--st-radius-lg, 0.5rem);
    padding: var(--st-spacing-4, 1rem);
  }
</style>
