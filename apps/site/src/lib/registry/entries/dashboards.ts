import type { Component } from 'svelte';
import type { DemoEntry } from '../types';
import { storeCode, propCode } from './code';

type Demo = Component<{ kind?: string; controls?: boolean }>;

function bi(
  e: Omit<DemoEntry, 'section' | 'demo'> & { kind: string },
  Comp: Demo,
): DemoEntry {
  const { kind, ...rest } = e;
  return { ...rest, section: 'dashboards', demo: Comp, demoProps: { kind } };
}

export function DASHBOARD_ENTRIES(BiDemo: Demo, FullDashboard: Demo, DataExplorer: Demo): DemoEntry[] {
  return [
    // ── Explorateur de données ───────────────────────────────────────────
    {
      slug: 'data-explorer',
      section: 'dashboards',
      name: 'Explorateur de données',
      group: 'Tableaux de bord',
      tagline: 'Surface BI exploration : dimension/mesure dynamiques + cross-filter + slicers + table.',
      hasControls: false,
      useCase:
        "Un seul `createDashboardStore` alimente une surface d'exploration BI complète en libre-service.\n\nDeux `ContentSwitcher` DS permettent de choisir à la volée la **dimension** (catégorie, région, canal, segment) et la **mesure** (revenu, unités, marge) à visualiser. Le `CrossfilteredBarChart` se recompose instantanément à chaque changement.\n\nCliquer une barre applique `applyCrossfilter` dans le store : la `RecordsTable` et les slicers (`TopNFilter`, `ValueSlicer`) se recalculent en temps réel sans aucune logique custom.\n\n`DashboardFilterBar` résume les filtres actifs sous forme de chips effaçables ; `SelectionLegend` indique quelles valeurs sont sélectionnées dans la vue principale.\n\nMiroir de la vue DS « data-explorer » : presentation 100 % composants dataviz/DS, tokens CSS uniquement.",
      demo: DataExplorer,
      demoProps: {},
      code: storeCode(
        ['DashboardFilterBar', 'SelectionLegend', 'CrossfilteredBarChart', 'RecordsTable', 'TopNFilter', 'ValueSlicer'],
        {
          svelte: `<!-- Sélecteurs DS ContentSwitcher pour dimension + mesure -->
<script>
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  let dimension = $state('category');
  let measure = $state('revenue');
<\/script>

<DashboardFilterBar {store} />
<SelectionLegend {store} labels={{ main: 'Dimension active' }} />

<ContentSwitcher size="sm" label="Dimension"
  items={[
    { value: 'category', label: 'Catégorie' },
    { value: 'region',   label: 'Région' },
    { value: 'channel',  label: 'Canal' },
  ]}
  value={dimension}
  onchange={(v) => (dimension = v)}
/>
<ContentSwitcher size="sm" label="Mesure"
  items={[
    { value: 'revenue', label: 'Revenu (€)' },
    { value: 'units',   label: 'Unités' },
    { value: 'margin',  label: 'Marge (€)' },
  ]}
  value={measure}
  onchange={(v) => (measure = v)}
/>

<!-- Graphique cross-filtré piloté par le choix dimension/mesure -->
<CrossfilteredBarChart {store} viewId="main" {dimension} {measure}
  label="Résultat par dimension" />

<!-- Slicers -->
<TopNFilter {store} dimension="product" {measure} defaultN={5} label="Top N produits" />
<ValueSlicer {store} dimension="channel" />

<!-- Table cross-filtrée -->
<RecordsTable {store} pageSize={8}
  fields={[dimension, 'product', 'channel', 'region', 'revenue', 'units', 'margin']} />`,
          react: `import { useState, useMemo } from 'react';
import { ContentSwitcher } from '@sentropic/design-system-react';

export function DataExplorer() {
  const store = useMemo(() => createDashboardStore({ model, data }), []);
  const [dimension, setDimension] = useState('category');
  const [measure, setMeasure]     = useState('revenue');
  return (
    <>
      <DashboardFilterBar store={store} />
      <SelectionLegend store={store} labels={{ main: 'Dimension active' }} />
      <ContentSwitcher size="sm" label="Dimension"
        items={[
          { value: 'category', label: 'Catégorie' },
          { value: 'region',   label: 'Région' },
          { value: 'channel',  label: 'Canal' },
        ]}
        value={dimension}
        onchange={setDimension}
      />
      <ContentSwitcher size="sm" label="Mesure"
        items={[
          { value: 'revenue', label: 'Revenu (€)' },
          { value: 'units',   label: 'Unités' },
          { value: 'margin',  label: 'Marge (€)' },
        ]}
        value={measure}
        onchange={setMeasure}
      />
      <CrossfilteredBarChart store={store} viewId="main" dimension={dimension} measure={measure}
        label="Résultat par dimension" />
      <TopNFilter store={store} dimension="product" measure={measure} defaultN={5} label="Top N produits" />
      <ValueSlicer store={store} dimension="channel" />
      <RecordsTable store={store} pageSize={8}
        fields={[dimension, 'product', 'channel', 'region', 'revenue', 'units', 'margin']} />
    </>
  );
}`,
          vue: `<script setup lang="ts">
import { ref } from 'vue';
import { ContentSwitcher } from '@sentropic/design-system-vue';
const store = createDashboardStore({ model, data });
const dimension = ref('category');
const measure   = ref('revenue');
<\/script>

<template>
  <DashboardFilterBar :store="store" />
  <SelectionLegend :store="store" :labels="{ main: 'Dimension active' }" />
  <ContentSwitcher size="sm" label="Dimension"
    :items="[
      { value: 'category', label: 'Catégorie' },
      { value: 'region',   label: 'Région' },
      { value: 'channel',  label: 'Canal' },
    ]"
    :value="dimension"
    @change="(v) => (dimension = v)"
  />
  <ContentSwitcher size="sm" label="Mesure"
    :items="[
      { value: 'revenue', label: 'Revenu (€)' },
      { value: 'units',   label: 'Unités' },
      { value: 'margin',  label: 'Marge (€)' },
    ]"
    :value="measure"
    @change="(v) => (measure = v)"
  />
  <CrossfilteredBarChart :store="store" viewId="main" :dimension="dimension" :measure="measure"
    label="Résultat par dimension" />
  <TopNFilter :store="store" dimension="product" :measure="measure" :defaultN="5" label="Top N produits" />
  <ValueSlicer :store="store" dimension="channel" />
  <RecordsTable :store="store" :pageSize="8"
    :fields="[dimension, 'product', 'channel', 'region', 'revenue', 'units', 'margin']" />
</template>`,
        },
      ),
    },
    // ── Tableau de bord complet ──────────────────────────────────────────
    {
      slug: 'full-dashboard',
      section: 'dashboards',
      name: 'Tableau de bord complet',
      group: 'Tableaux de bord',
      tagline: 'Dashboard BI complet : KPI + tendance + barres + donut + table sur grille éditable.',
      hasControls: true,
      useCase:
        "Un seul `createDashboardStore` relie quatre vues — KPI, graphique en aires, barres cross-filtrées par catégorie, donut part-of-whole par canal, et table d'enregistrements — en un tableau de bord BI opérationnel.\n\n`DashboardGrid` consomme un `DashboardLayout` sérialisable (`createLayout`, `addPanel`, `movePanel`, `resizePanel`, `serializeLayout`) et expose un mode édition : déplacement, redimensionnement et callback `onLayoutChange` renvoient un layout normalisé prêt à persister.\n\nCliquer une barre ou un segment du donut applique `applyCrossfilter` dans le store, et toutes les autres vues (KPI, tendance, table) se recalculent instantanément sans aucune logique de filtrage custom.\n\nLa présentation vient à 100 % des surfaces du design system via les composants dataviz : aucun markup de chart ou de table n'est écrit à la main. La grille utilise uniquement des tokens DS (`--st-spacing-*`, `--st-semantic-*`, `--st-radius-*`).",
      demo: FullDashboard,
      demoProps: {},
      code: storeCode(
        ['DashboardFilterBar', 'DashboardGrid', 'SelectionLegend', 'KpiCardGroup', 'CrossfilteredBarChart', 'AreaChart', 'DonutChart', 'RecordsTable'],
        {
          svelte: `let layout = $state(initialLayout);
let editMode = $state(false);

<DashboardFilterBar {store} />
<SelectionLegend {store} labels={{ byCat: 'Catégorie', byChan: 'Canal' }} />

<DashboardGrid {layout} panels={dashboardPanels} editable={editMode}
  onLayoutChange={(next) => (layout = next)}>
  {#snippet children(meta)}
    {#if meta.id === 'kpis'}
      <KpiCardGroup {store} configs={kpiConfigs} />
    {:else if meta.id === 'trend'}
      <AreaChart {store} viewId="trend" category="month" measure="revenue"
        label="Tendance mensuelle du revenu" smooth={true} />
    {:else if meta.id === 'byCat'}
      <CrossfilteredBarChart {store} viewId="byCat" dimension="category"
        measure="revenue" label="Revenu par catégorie" />
    {:else if meta.id === 'byChan'}
      <DonutChart {store} viewId="byChan" category="channel" measure="revenue"
        centerLabel="Canal" label="Répartition par canal" />
    {:else if meta.id === 'table'}
      <RecordsTable {store} pageSize={8}
        fields={['region', 'category', 'product', 'channel', 'revenue', 'units', 'margin']} />
    {/if}
  {/snippet}
</DashboardGrid>`,
          react: `const [layout, setLayout] = useState(initialLayout);
const [editMode, setEditMode] = useState(false);

<>
  <DashboardFilterBar store={store} />
  <SelectionLegend store={store} labels={{ byCat: 'Catégorie', byChan: 'Canal' }} />
  <DashboardGrid layout={layout} panels={dashboardPanels} editable={editMode}
    onLayoutChange={setLayout}
    renderPanel={(meta) => {
      if (meta.id === 'kpis') return <KpiCardGroup store={store} configs={kpiConfigs} />;
      if (meta.id === 'trend') return <AreaChart store={store} viewId="trend" category="month" measure="revenue"
        label="Tendance mensuelle du revenu" smooth />;
      if (meta.id === 'byCat') return <CrossfilteredBarChart store={store} viewId="byCat" dimension="category"
        measure="revenue" label="Revenu par catégorie" />;
      if (meta.id === 'byChan') return <DonutChart store={store} viewId="byChan" category="channel" measure="revenue"
        centerLabel="Canal" label="Répartition par canal" />;
      return <RecordsTable store={store} pageSize={8}
        fields={['region', 'category', 'product', 'channel', 'revenue', 'units', 'margin']} />;
    }}
  />
</>`,
          vue: `<script setup lang="ts">
import { ref } from 'vue';
const layout = ref(initialLayout);
const editMode = ref(false);
<\/script>

<DashboardFilterBar :store="store" />
<SelectionLegend :store="store" :labels="{ byCat: 'Catégorie', byChan: 'Canal' }" />
<DashboardGrid :layout="layout" :panels="dashboardPanels" :editable="editMode"
  @layout-change="(next) => (layout = next)">
  <template #default="{ meta }">
    <KpiCardGroup v-if="meta.id === 'kpis'" :store="store" :configs="kpiConfigs" />
    <AreaChart v-else-if="meta.id === 'trend'" :store="store" viewId="trend"
      category="month" measure="revenue" label="Tendance mensuelle du revenu" :smooth="true" />
    <CrossfilteredBarChart v-else-if="meta.id === 'byCat'" :store="store" viewId="byCat"
      dimension="category" measure="revenue" label="Revenu par catégorie" />
    <DonutChart v-else-if="meta.id === 'byChan'" :store="store" viewId="byChan"
      category="channel" measure="revenue" centerLabel="Canal" label="Répartition par canal" />
    <RecordsTable v-else :store="store" :pageSize="8"
      :fields="['region', 'category', 'product', 'channel', 'revenue', 'units', 'margin']" />
  </template>
</DashboardGrid>`,
        },
      ),
    },
    // ── Cross-filter & exploration ───────────────────────────────────────
    bi({
      slug: 'crossfilter', name: 'CrossfilteredBarChart', group: 'Cross-filter & exploration', kind: 'crossfilter', hasControls: true,
      tagline: 'Deux barres liées + barre de filtres + table. Cliquez une barre.',
      useCase:
        "Le pattern fondateur du tableau de bord BI : cliquer une barre filtre toutes les autres vues et la table d'enregistrements. La barre de filtres résume les sélections actives et permet de tout effacer.\n\nTout passe par l'état partagé `dataviz-core` : aucune logique de filtrage n'est recopiée dans la présentation.",
      code: storeCode(['DashboardFilterBar', 'SelectionLegend', 'CrossfilteredBarChart', 'RecordsTable'], {
        svelte: `<DashboardFilterBar {store} />
<SelectionLegend {store} labels={{ byCat: 'Catégorie', byChannel: 'Canal' }} />
<CrossfilteredBarChart {store} viewId="byCat" dimension="category" measure="revenue" label="Revenu par catégorie" />
<CrossfilteredBarChart {store} viewId="byChannel" dimension="channel" measure="revenue" tone="category2" label="Revenu par canal" />
<RecordsTable {store} pageSize={6} />`,
        react: `<>
  <DashboardFilterBar store={store} />
  <SelectionLegend store={store} labels={{ byCat: 'Catégorie', byChannel: 'Canal' }} />
  <CrossfilteredBarChart store={store} viewId="byCat" dimension="category" measure="revenue" label="Revenu par catégorie" />
  <CrossfilteredBarChart store={store} viewId="byChannel" dimension="channel" measure="revenue" tone="category2" label="Revenu par canal" />
  <RecordsTable store={store} pageSize={6} />
</>`,
        vue: `<DashboardFilterBar :store="store" />
<SelectionLegend :store="store" :labels="{ byCat: 'Catégorie', byChannel: 'Canal' }" />
<CrossfilteredBarChart :store="store" viewId="byCat" dimension="category" measure="revenue" label="Revenu par catégorie" />
<CrossfilteredBarChart :store="store" viewId="byChannel" dimension="channel" measure="revenue" tone="category2" label="Revenu par canal" />
<RecordsTable :store="store" :pageSize="6" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'filter-bar', name: 'DashboardFilterBar', group: 'Cross-filter & exploration', kind: 'filterbar', hasControls: true,
      tagline: 'Résumé des filtres actifs + effacement global.',
      useCase:
        "Affiche sous forme de chips tous les filtres en vigueur (issus des slicers, du cross-filter, du drill) et offre un bouton « tout effacer ». C'est le tableau de bord de l'état de filtrage.",
      code: storeCode(['DashboardFilterBar', 'ValueSlicer', 'RecordsTable'], {
        svelte: `<DashboardFilterBar {store} />
<ValueSlicer {store} dimension="region" orientation="horizontal" />
<RecordsTable {store} pageSize={6} />`,
        react: `<>
  <DashboardFilterBar store={store} />
  <ValueSlicer store={store} dimension="region" orientation="horizontal" />
  <RecordsTable store={store} pageSize={6} />
</>`,
        vue: `<DashboardFilterBar :store="store" />
<ValueSlicer :store="store" dimension="region" orientation="horizontal" />
<RecordsTable :store="store" :pageSize="6" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'selection-legend', name: 'SelectionLegend', group: 'Cross-filter & exploration', kind: 'selectionlegend', hasControls: true,
      tagline: 'Légende des vues sélectionnées (chips par vue).',
      useCase:
        "Restitue, par vue cross-filtrée, les valeurs actuellement sélectionnées sous forme de chips. Aide l'utilisateur à comprendre « pourquoi je vois ces chiffres ».",
      code: storeCode(['SelectionLegend', 'CrossfilteredBarChart'], {
        svelte: `<SelectionLegend {store} labels={{ a: 'Région', b: 'Canal' }} />
<CrossfilteredBarChart {store} viewId="a" dimension="region" measure="revenue" label="Région" />
<CrossfilteredBarChart {store} viewId="b" dimension="channel" measure="revenue" tone="category3" label="Canal" />`,
        react: `<>
  <SelectionLegend store={store} labels={{ a: 'Région', b: 'Canal' }} />
  <CrossfilteredBarChart store={store} viewId="a" dimension="region" measure="revenue" label="Région" />
  <CrossfilteredBarChart store={store} viewId="b" dimension="channel" measure="revenue" tone="category3" label="Canal" />
</>`,
        vue: `<SelectionLegend :store="store" :labels="{ a: 'Région', b: 'Canal' }" />
<CrossfilteredBarChart :store="store" viewId="a" dimension="region" measure="revenue" label="Région" />
<CrossfilteredBarChart :store="store" viewId="b" dimension="channel" measure="revenue" tone="category3" label="Canal" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'small-multiples', name: 'SmallMultiples', group: 'Cross-filter & exploration', kind: 'smallmultiples', hasControls: false,
      tagline: 'Facettes : un mini-graphique par valeur de dimension.',
      useCase:
        "Décliner un même graphique en petites multiples (une facette par région), avec une échelle de valeur partagée pour des comparaisons honnêtes. Chaque facette reste cross-filtrable.",
      code: storeCode(['SmallMultiples'], {
        svelte: `<SmallMultiples {store} viewId="sm" facetBy="region" dimension="category" measure="revenue" columns={3} label="Revenu" />`,
        react: `<SmallMultiples store={store} viewId="sm" facetBy="region" dimension="category" measure="revenue" columns={3} label="Revenu" />`,
        vue: `<SmallMultiples :store="store" viewId="sm" facetBy="region" dimension="category" measure="revenue" :columns="3" label="Revenu" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'drill', name: 'DrillBarChart', group: 'Cross-filter & exploration', kind: 'drill', hasControls: true,
      tagline: 'Drill-down hiérarchique + fil d\'Ariane. Cliquez une barre.',
      useCase:
        "Forer une hiérarchie (région → pays → ville) : cliquer une barre descend d'un niveau et pose le filtre correspondant ; le fil d'Ariane permet de remonter. L'historique de drill vit dans le store.",
      code: storeCode(['DrillBreadcrumb', 'DrillBarChart'], {
        svelte: `<DrillBreadcrumb {store} viewId="drill" hierarchy={['region', 'country', 'city']} />
<DrillBarChart {store} viewId="drill" hierarchy={['region', 'country', 'city']} measure="revenue" tone="category4" label="Drill géographique" />`,
        react: `<>
  <DrillBreadcrumb store={store} viewId="drill" hierarchy={['region', 'country', 'city']} />
  <DrillBarChart store={store} viewId="drill" hierarchy={['region', 'country', 'city']} measure="revenue" tone="category4" label="Drill géographique" />
</>`,
        vue: `<DrillBreadcrumb :store="store" viewId="drill" :hierarchy="['region', 'country', 'city']" />
<DrillBarChart :store="store" viewId="drill" :hierarchy="['region', 'country', 'city']" measure="revenue" tone="category4" label="Drill géographique" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'kpi-cards', name: 'KpiCardGroup', group: 'Cross-filter & exploration', kind: 'kpi', hasControls: false,
      tagline: 'Bandeau de cartes KPI agrégées.',
      useCase:
        "Le résumé chiffré en haut d'un tableau de bord : un groupe de cartes KPI alimentées par les mesures du modèle, qui se recalculent quand les filtres changent.",
      code: storeCode(['KpiCardGroup'], {
        svelte: `<KpiCardGroup {store} configs={[
  { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
  { id: 'units', measure: 'units', label: 'Unités vendues' },
  { id: 'margin', measure: 'margin', label: 'Marge brute' },
]} />`,
        react: `<KpiCardGroup store={store} configs={[
  { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
  { id: 'units', measure: 'units', label: 'Unités vendues' },
  { id: 'margin', measure: 'margin', label: 'Marge brute' },
]} />`,
        vue: `<KpiCardGroup :store="store" :configs="[
  { id: 'revenue', measure: 'revenue', label: 'Revenu total' },
  { id: 'units', measure: 'units', label: 'Unités vendues' },
  { id: 'margin', measure: 'margin', label: 'Marge brute' },
]" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'field-pane', name: 'FieldPane', group: 'Cross-filter & exploration', kind: 'fieldpane', hasControls: false,
      tagline: 'Volet de champs (dimensions / mesures) du modèle.',
      useCase:
        "Le panneau d'authoring qui liste dimensions et mesures du modèle, organisées en dossiers, prêtes à être glissées/sélectionnées. Bâti sur le TreeView du design system.",
      code: propCode(['FieldPane'], {
        svelte: `<FieldPane {model} label="Champs du modèle" />`,
        react: `<FieldPane model={model} label="Champs du modèle" />`,
        vue: `<FieldPane :model="model" label="Champs du modèle" />`,
      }, {
        svelte: `import { model } from './data';`,
        react: `import { model } from './data';`,
        vue: `import { model } from './data';`,
      }),
    }, BiDemo),

    // ── Filtres BI ───────────────────────────────────────────────────────
    bi({
      slug: 'top-n', name: 'TopNFilter', group: 'Filtres BI', kind: 'topn', hasControls: true,
      tagline: 'Restreint une dimension à ses N meilleures valeurs.',
      useCase:
        "Garder uniquement le Top N d'une dimension selon une mesure (les 4 produits au plus fort revenu). N est ajustable et le filtre se propage à toutes les vues.",
      code: storeCode(['TopNFilter', 'CrossfilteredBarChart'], {
        svelte: `<TopNFilter {store} dimension="product" measure="revenue" defaultN={4} label="Top N produits" />
<CrossfilteredBarChart {store} viewId="topn" dimension="product" measure="revenue" selectable={false} orientation="horizontal" label="Produits" />`,
        react: `<>
  <TopNFilter store={store} dimension="product" measure="revenue" defaultN={4} label="Top N produits" />
  <CrossfilteredBarChart store={store} viewId="topn" dimension="product" measure="revenue" selectable={false} orientation="horizontal" label="Produits" />
</>`,
        vue: `<TopNFilter :store="store" dimension="product" measure="revenue" :defaultN="4" label="Top N produits" />
<CrossfilteredBarChart :store="store" viewId="topn" dimension="product" measure="revenue" :selectable="false" orientation="horizontal" label="Produits" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'value-slicer', name: 'ValueSlicer', group: 'Filtres BI', kind: 'valueslicer', hasControls: true,
      tagline: 'Filtre OU multi-valeurs (cases à cocher).',
      useCase:
        "Sélectionner plusieurs valeurs d'une dimension (filtre OU) via un groupe de cases à cocher. Le slicer le plus courant pour un tableau de bord libre-service.",
      code: storeCode(['ValueSlicer', 'RecordsTable'], {
        svelte: `<ValueSlicer {store} dimension="category" />
<RecordsTable {store} pageSize={6} fields={['category', 'product', 'revenue']} />`,
        react: `<>
  <ValueSlicer store={store} dimension="category" />
  <RecordsTable store={store} pageSize={6} fields={['category', 'product', 'revenue']} />
</>`,
        vue: `<ValueSlicer :store="store" dimension="category" />
<RecordsTable :store="store" :pageSize="6" :fields="['category', 'product', 'revenue']" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'relative-date', name: 'RelativeDateFilter', group: 'Filtres BI', kind: 'relativedate', hasControls: true,
      tagline: 'Fenêtres glissantes (7 / 30 / 90 j, 12 mois).',
      useCase:
        "Filtrer une dimension date par fenêtre relative à « maintenant » (7 derniers jours, 12 derniers mois…). Idéal pour des rapports toujours à jour sans toucher aux bornes.",
      code: storeCode(['RelativeDateFilter', 'RecordsTable'], {
        svelte: `<RelativeDateFilter {store} dimension="date" now={DEMO_NOW} label="Période" />
<RecordsTable {store} pageSize={6} fields={['month', 'category', 'revenue']} />`,
        react: `<>
  <RelativeDateFilter store={store} dimension="date" now={DEMO_NOW} label="Période" />
  <RecordsTable store={store} pageSize={6} fields={['month', 'category', 'revenue']} />
</>`,
        vue: `<RelativeDateFilter :store="store" dimension="date" :now="DEMO_NOW" label="Période" />
<RecordsTable :store="store" :pageSize="6" :fields="['month', 'category', 'revenue']" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'range-slider', name: 'RangeSliderFilter', group: 'Filtres BI', kind: 'rangeslider', hasControls: true,
      tagline: 'Curseur à 2 poignées sur une dimension continue.',
      useCase:
        "Filtrer une dimension numérique continue (prix unitaire) entre deux bornes via un vrai curseur à deux poignées du design system.",
      code: storeCode(['RangeSliderFilter', 'RecordsTable'], {
        svelte: `<RangeSliderFilter {store} dimension="price" step={1} label="Prix unitaire (€)" />
<RecordsTable {store} pageSize={6} fields={['product', 'price', 'units', 'revenue']} />`,
        react: `<>
  <RangeSliderFilter store={store} dimension="price" step={1} label="Prix unitaire (€)" />
  <RecordsTable store={store} pageSize={6} fields={['product', 'price', 'units', 'revenue']} />
</>`,
        vue: `<RangeSliderFilter :store="store" dimension="price" :step="1" label="Prix unitaire (€)" />
<RecordsTable :store="store" :pageSize="6" :fields="['product', 'price', 'units', 'revenue']" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'date-range', name: 'DateRangeFilter', group: 'Filtres BI', kind: 'daterange', hasControls: true,
      tagline: 'Sélecteur de plage de dates (DatePicker).',
      useCase:
        "Choisir une plage absolue de dates via le DatePicker du design system, traduite en filtre de range sur la dimension date.",
      code: storeCode(['DateRangeFilter', 'RecordsTable'], {
        svelte: `<DateRangeFilter {store} dimension="date" label="Plage de dates" />
<RecordsTable {store} pageSize={6} fields={['month', 'category', 'revenue']} />`,
        react: `<>
  <DateRangeFilter store={store} dimension="date" label="Plage de dates" />
  <RecordsTable store={store} pageSize={6} fields={['month', 'category', 'revenue']} />
</>`,
        vue: `<DateRangeFilter :store="store" dimension="date" label="Plage de dates" />
<RecordsTable :store="store" :pageSize="6" :fields="['month', 'category', 'revenue']" />`,
      }),
    }, BiDemo),

    // ── Authoring & objets ───────────────────────────────────────────────
    bi({
      slug: 'bookmarks', name: 'BookmarkNavigator', group: 'Authoring & objets', kind: 'bookmarks', hasControls: true,
      tagline: 'Signets d\'état + diaporama (play/pause).',
      useCase:
        "Mémoriser des configurations de filtres en signets et les rejouer, voire enchaîner en diaporama. Parfait pour des revues récurrentes (Europe, APAC…).",
      code: storeCode(['BookmarkNavigator'], {
        svelte: `<BookmarkNavigator {store} bookmarks={bookmarks} showPlaybackControls />`,
        react: `<BookmarkNavigator store={store} bookmarks={bookmarks} showPlaybackControls />`,
        vue: `<BookmarkNavigator :store="store" :bookmarks="bookmarks" showPlaybackControls />`,
      }),
    }, BiDemo),
    bi({
      slug: 'format-panel', name: 'FormatPanel', group: 'Authoring & objets', kind: 'formatpanel', hasControls: true,
      tagline: 'Volet de format : axes, légendes, marqueurs.',
      useCase:
        "Éditer la présentation d'un visuel : bornes d'axe, échelle log/inversée, titre et visibilité de légende, forme/taille/couleur de marqueur. État immuable, prêt à brancher sur un chart.",
      code: propCode(['FormatPanel'], {
        svelte: `<FormatPanel value={format} onChange={(v) => (format = v)} label="Format & axes" />`,
        react: `<FormatPanel value={format} onChange={setFormat} label="Format & axes" />`,
        vue: `<FormatPanel :value="format" :onChange="(v) => (format = v)" label="Format & axes" />`,
      }, {
        svelte: `let format = $state({ axis: { min: null, max: null, log: false, inverted: false }, legend: { title: 'Revenu', visible: true }, marker: { shape: 'circle', size: 6, color: '#4E79A7' } });`,
        react: `const [format, setFormat] = useState({ axis: { min: null, max: null, log: false, inverted: false }, legend: { title: 'Revenu', visible: true }, marker: { shape: 'circle', size: 6, color: '#4E79A7' } });`,
        vue: `const format = ref({ axis: { min: null, max: null, log: false, inverted: false }, legend: { title: 'Revenu', visible: true }, marker: { shape: 'circle', size: 6, color: '#4E79A7' } });`,
      }),
    }, BiDemo),
    bi({
      slug: 'calculation-editor', name: 'CalculationEditor', group: 'Authoring & objets', kind: 'calculation', hasControls: true,
      tagline: 'Éditeur de champ calculé avec autocomplétion.',
      useCase:
        "Créer des champs calculés via une expression sûre (`[revenue] / [units]`), avec autocomplétion des champs et variables. Étend le modèle sans toucher aux données sources.",
      code: propCode(['CalculationEditor'], {
        svelte: `<CalculationEditor {model} value={calc} onChange={(v) => (calc = v)} label="Champ calculé" />`,
        react: `<CalculationEditor model={model} value={calc} onChange={setCalc} label="Champ calculé" />`,
        vue: `<CalculationEditor :model="model" :value="calc" :onChange="(v) => (calc = v)" label="Champ calculé" />`,
      }, {
        svelte: `import { model } from './data';\n  let calc = $state({ id: 'revenuePerUnit', label: 'Revenu / unité', expression: '[revenue] / [units]' });`,
        react: `import { model } from './data';\nconst [calc, setCalc] = useState({ id: 'revenuePerUnit', label: 'Revenu / unité', expression: '[revenue] / [units]' });`,
        vue: `import { model } from './data';\nconst calc = ref({ id: 'revenuePerUnit', label: 'Revenu / unité', expression: '[revenue] / [units]' });`,
      }),
    }, BiDemo),
    bi({
      slug: 'export-menu', name: 'ExportMenu', group: 'Authoring & objets', kind: 'export', hasControls: true,
      tagline: 'Export CSV des lignes cross-filtrées.',
      useCase:
        "Exporter en CSV exactement ce que l'utilisateur voit (lignes cross-filtrées), avec choix des colonnes et du nom de fichier.",
      code: storeCode(['ExportMenu', 'RecordsTable'], {
        svelte: `<ExportMenu {store} filename="ventes.csv" label="Exporter en CSV" />
<RecordsTable {store} pageSize={6} />`,
        react: `<>
  <ExportMenu store={store} filename="ventes.csv" label="Exporter en CSV" />
  <RecordsTable store={store} pageSize={6} />
</>`,
        vue: `<ExportMenu :store="store" filename="ventes.csv" label="Exporter en CSV" />
<RecordsTable :store="store" :pageSize="6" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'web-frame', name: 'WebFrame', group: 'Authoring & objets', kind: 'webframe', hasControls: false,
      tagline: 'Iframe intégrée et sécurisée (sandbox).',
      useCase:
        "Intégrer une page web tierce (carte, rapport, vidéo) dans un tableau de bord, avec sandbox et politique de referrer maîtrisés.",
      code: propCode(['WebFrame'], {
        svelte: `<WebFrame frame={{ url: 'https://example.com/embed', title: 'Carte', sandbox: ['allow-scripts', 'allow-same-origin'], height: 320 }} />`,
        react: `<WebFrame frame={{ url: 'https://example.com/embed', title: 'Carte', sandbox: ['allow-scripts', 'allow-same-origin'], height: 320 }} />`,
        vue: `<WebFrame :frame="{ url: 'https://example.com/embed', title: 'Carte', sandbox: ['allow-scripts', 'allow-same-origin'], height: 320 }" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'data-image', name: 'DataImage', group: 'Authoring & objets', kind: 'dataimage', hasControls: false,
      tagline: 'Image pilotée par les données (template d\'URL).',
      useCase:
        "Afficher une image dont l'URL est calculée à partir d'un champ de la ligne (logo de produit, drapeau de pays), avec fallback. Pour des cartes/objets riches.",
      code: propCode(['DataImage'], {
        svelte: `<DataImage image={{ srcTemplate: '/img/{category}.png', altTemplate: 'Visuel — {category}', fallbackSrc: '/img/placeholder.png' }} row={row} />`,
        react: `<DataImage image={{ srcTemplate: '/img/{category}.png', altTemplate: 'Visuel — {category}', fallbackSrc: '/img/placeholder.png' }} row={row} />`,
        vue: `<DataImage :image="{ srcTemplate: '/img/{category}.png', altTemplate: 'Visuel — {category}', fallbackSrc: '/img/placeholder.png' }" :row="row" />`,
      }),
    }, BiDemo),
    bi({
      slug: 'object-layers', name: 'ObjectLayerPanel', group: 'Authoring & objets', kind: 'objectpanel', hasControls: true,
      tagline: 'Panneau de calques/objets (arbre TreeView).',
      useCase:
        "Gérer les calques d'un tableau de bord (bandeaux, graphiques, objets) en arborescence, avec visibilité par calque. Bâti sur le TreeView du design system.",
      code: propCode(['ObjectLayerPanel'], {
        svelte: `<ObjectLayerPanel layers={layers} defaultExpandedIds={['kpis', 'charts']} label="Calques" />`,
        react: `<ObjectLayerPanel layers={layers} defaultExpandedIds={['kpis', 'charts']} label="Calques" />`,
        vue: `<ObjectLayerPanel :layers="layers" :defaultExpandedIds="['kpis', 'charts']" label="Calques" />`,
      }),
    }, BiDemo),
  ];
}
