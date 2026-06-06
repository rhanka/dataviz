<script setup lang="ts">
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
} from '@sentropic/dataviz-vue';
import { model, data, crossfilter } from './data';

const store = createDashboardStore({ model, data, crossfilter });
const legendLabels = { byCountry: 'Pays', byProduct: 'Produit' };
const drillHierarchy = ['country', 'city'];
</script>

<template>
  <main class="page">
    <header class="page__head">
      <div>
        <h1>dataviz — démo cross-filter (Vue)</h1>
        <p>
          Tout est piloté par l'état partagé <code>@sentropic/dataviz-core</code> ; la présentation
          vient à 100 % du design system Sent Tech.
        </p>
      </div>
      <ExportMenu :store="store" />
    </header>

    <section class="bar">
      <DashboardFilterBar :store="store" />
      <SelectionLegend :store="store" :labels="legendLabels" />
    </section>

    <section class="controls">
      <ValueSlicer :store="store" dimension="country" orientation="horizontal" />
      <TopNFilter :store="store" dimension="product" measure="sales" :default-n="2" label="Top N produits" />
    </section>

    <section class="charts">
      <article class="card">
        <h2>Ventes par pays</h2>
        <p class="hint">Clique une barre pour filtrer les autres vues.</p>
        <CrossfilteredBarChart :store="store" view-id="byCountry" dimension="country" measure="sales" label="Ventes par pays" />
      </article>
      <article class="card">
        <h2>Ventes par produit</h2>
        <p class="hint">Lié à la sélection « Pays » (et inversement).</p>
        <CrossfilteredBarChart :store="store" view-id="byProduct" dimension="product" measure="sales" label="Ventes par produit" tone="category2" />
      </article>
    </section>

    <section class="card">
      <h2>Small multiples — ventes par produit, par pays</h2>
      <SmallMultiples :store="store" view-id="facets" facet-by="country" dimension="product" measure="sales" label="Ventes" :columns="3" />
    </section>

    <section class="card">
      <h2>Drill — pays → ville</h2>
      <DrillBreadcrumb :store="store" view-id="drill" :hierarchy="drillHierarchy" />
      <DrillBarChart :store="store" view-id="drill" :hierarchy="drillHierarchy" measure="sales" label="Ventes (drill)" tone="category3" />
    </section>

    <section class="card">
      <h2>Enregistrements (cross-filtrés)</h2>
      <RecordsTable :store="store" :page-size="8" />
    </section>
  </main>
</template>
