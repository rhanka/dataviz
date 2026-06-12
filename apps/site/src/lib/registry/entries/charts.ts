import type { Component } from 'svelte';
import type { DemoEntry } from '../types';
import { storeCode } from './code';

type Demo = Component<{ kind?: string; controls?: boolean }>;

// Helper to build a chart entry quickly.
function chart(
  e: Omit<DemoEntry, 'section' | 'demo'> & { kind: string },
  Comp: Demo,
): DemoEntry {
  const { kind, ...rest } = e;
  return { ...rest, section: 'charts', demo: Comp, demoProps: { kind } };
}

export function CHART_ENTRIES(ChartDemo: Demo, GeoDemo: Demo): DemoEntry[] {
  return [
    // ── Catégoriels & combo ──────────────────────────────────────────────
    chart({
      slug: 'area', name: 'AreaChart', group: 'Catégoriels & combo', kind: 'area', hasControls: true,
      tagline: 'Aire empilable sur axe catégoriel, avec lissage optionnel.',
      useCase:
        "Suivre l'évolution d'une mesure (revenu, marge, unités) à travers une dimension catégorielle. Idéal pour visualiser une tendance par mois ou comparer des parts cumulées.\n\nLe lissage (`smooth`) adoucit la courbe pour les rapports exécutifs ; la mesure et la dimension sont commutables ci-dessous.\n\nLes `annotations` ajoutent une ligne objectif et une bande cible directement en coordonnées de données ; `dataLabels` formate les valeurs avec un formateur Intl (ici devise CAD).",
      code: storeCode(['AreaChart'], {
        svelte: `<!-- Import makeFormatter from @sentropic/dataviz-core for the dataLabels format fn -->
<AreaChart {store} viewId="c" category="category" measure="revenue" label="Revenu par catégorie" smooth
  annotations={[
    { kind: 'line', axis: 'y', value: 400000, label: 'Objectif' },
    { kind: 'region', axis: 'y', from: 350000, to: 500000, label: 'Zone cible' },
  ]}
  dataLabels={{ format: (v) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v) }} />`,
        react: `<AreaChart store={store} viewId="c" category="category" measure="revenue" label="Revenu par catégorie" smooth
  annotations={[
    { kind: 'line', axis: 'y', value: 400000, label: 'Objectif' },
    { kind: 'region', axis: 'y', from: 350000, to: 500000, label: 'Zone cible' },
  ]}
  dataLabels={{ format: (v) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v) }} />`,
        vue: `<AreaChart :store="store" viewId="c" category="category" measure="revenue" label="Revenu par catégorie" smooth
  :annotations="[
    { kind: 'line', axis: 'y', value: 400000, label: 'Objectif' },
    { kind: 'region', axis: 'y', from: 350000, to: 500000, label: 'Zone cible' },
  ]"
  :dataLabels="{ format: (v) => new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }).format(v) }" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'combo', name: 'ComboChart', group: 'Catégoriels & combo', kind: 'combo', hasControls: false,
      tagline: 'Barres + lignes sur double axe (revenu vs unités).',
      useCase:
        "Combiner deux mesures d'échelles différentes sur un même graphique — par exemple le revenu (barres, axe gauche) et les unités vendues (ligne, axe droit). Le combo est la réponse BI classique au « montre-moi le volume ET la valeur ».",
      code: storeCode(['ComboChart'], {
        svelte: `<ComboChart {store} viewId="c" category="category"
  measures={[{ measure: 'revenue', mode: 'bar', label: 'Revenu' },
             { measure: 'units', mode: 'line', label: 'Unités' }]}
  leftAxisLabel="Revenu (€)" rightAxisLabel="Unités" legend label="Revenu & unités" />`,
        react: `<ComboChart store={store} viewId="c" category="category"
  measures={[{ measure: 'revenue', mode: 'bar', label: 'Revenu' },
             { measure: 'units', mode: 'line', label: 'Unités' }]}
  leftAxisLabel="Revenu (€)" rightAxisLabel="Unités" legend label="Revenu & unités" />`,
        vue: `<ComboChart :store="store" viewId="c" category="category"
  :measures="[{ measure: 'revenue', mode: 'bar', label: 'Revenu' },
              { measure: 'units', mode: 'line', label: 'Unités' }]"
  leftAxisLabel="Revenu (€)" rightAxisLabel="Unités" legend label="Revenu & unités" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'stacked-bar', name: 'StackedBarChart', group: 'Catégoriels & combo', kind: 'stacked', hasControls: true,
      tagline: 'Barres empilées ou 100 %, segmentées par série.',
      useCase:
        "Décomposer une mesure par une seconde dimension (ici le canal de vente) à l'intérieur de chaque catégorie. Passez en mode 100 % pour comparer des compositions plutôt que des volumes absolus.\n\n`hiddenSeries` + `onToggleSeries` activent un toggle de légende contrôlé : cliquer une série dans la légende la masque ou la révèle instantanément.",
      code: storeCode(['StackedBarChart'], {
        svelte: `<!-- hiddenSeries + onToggleSeries : toggle de légende contrôlé -->
<StackedBarChart {store} viewId="c" category="category" series="channel" measure="revenue" mode="stacked"
  label="Par catégorie et canal" {hiddenSeries} {onToggleSeries} />

<!-- Dans le <script> parent :
  let hiddenSeries = $state<string[]>([]);
  const onToggleSeries = (id: string) => {
    hiddenSeries = hiddenSeries.includes(id)
      ? hiddenSeries.filter((s) => s !== id) : [...hiddenSeries, id];
  }; -->`,
        react: `<StackedBarChart store={store} viewId="c" category="category" series="channel" measure="revenue" mode="stacked"
  label="Par catégorie et canal" hiddenSeries={hiddenSeries} onToggleSeries={onToggleSeries} />

{/* Wiring dans le composant parent :
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  const onToggleSeries = (id: string) =>
    setHiddenSeries((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]); */}`,
        vue: `<StackedBarChart :store="store" viewId="c" category="category" series="channel" measure="revenue" mode="stacked"
  label="Par catégorie et canal" :hiddenSeries="hiddenSeries" :onToggleSeries="onToggleSeries" />

<!-- Dans <script setup> :
  const hiddenSeries = ref<string[]>([]);
  const onToggleSeries = (id: string) => {
    hiddenSeries.value = hiddenSeries.value.includes(id)
      ? hiddenSeries.value.filter((s) => s !== id) : [...hiddenSeries.value, id];
  }; -->`,
      }),
    }, ChartDemo),
    chart({
      slug: 'lollipop', name: 'LollipopChart', group: 'Catégoriels & combo', kind: 'lollipop', hasControls: true,
      tagline: 'Alternative épurée au bar chart pour un classement.',
      useCase:
        "Quand un classement compte plus que les volumes exacts, le lollipop réduit l'encre et met l'accent sur l'ordre. Orientation horizontale pour des libellés longs.",
      code: storeCode(['LollipopChart'], {
        svelte: `<LollipopChart {store} viewId="c" category="category" measure="revenue" orientation="horizontal" label="Lollipop" />`,
        react: `<LollipopChart store={store} viewId="c" category="category" measure="revenue" orientation="horizontal" label="Lollipop" />`,
        vue: `<LollipopChart :store="store" viewId="c" category="category" measure="revenue" orientation="horizontal" label="Lollipop" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'step-line', name: 'StepLineChart', group: 'Catégoriels & combo', kind: 'step', hasControls: true,
      tagline: 'Ligne en escalier pour des valeurs discrètes dans le temps.',
      useCase:
        "Représenter une mesure qui change par paliers (tarifs, stock, état) plutôt que continûment. Ici l'évolution mensuelle du revenu en escalier.",
      code: storeCode(['StepLineChart'], {
        svelte: `<StepLineChart {store} viewId="c" category="month" measure="revenue" label="Évolution mensuelle" />`,
        react: `<StepLineChart store={store} viewId="c" category="month" measure="revenue" label="Évolution mensuelle" />`,
        vue: `<StepLineChart :store="store" viewId="c" category="month" measure="revenue" label="Évolution mensuelle" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'pareto', name: 'ParetoChart', group: 'Catégoriels & combo', kind: 'pareto', hasControls: true,
      tagline: 'Barres triées + courbe cumulée (loi 80/20).',
      useCase:
        "Identifier les « vital few » : les barres triées par contribution décroissante, surmontées de la courbe cumulée. Parfait pour répondre à « quels produits font 80 % du revenu ? ».",
      code: storeCode(['ParetoChart'], {
        svelte: `<ParetoChart {store} viewId="c" category="product" measure="revenue" label="Pareto produits" />`,
        react: `<ParetoChart store={store} viewId="c" category="product" measure="revenue" label="Pareto produits" />`,
        vue: `<ParetoChart :store="store" viewId="c" category="product" measure="revenue" label="Pareto produits" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'diverging-bar', name: 'DivergingBarChart', group: 'Catégoriels & combo', kind: 'diverging', hasControls: true,
      tagline: 'Barres divergentes autour de zéro (positif/négatif).',
      useCase:
        "Comparer des écarts signés — variations de marge, sur/sous-performance vs objectif. La divergence autour de zéro rend instantané le tri gagnants/perdants.",
      code: storeCode(['DivergingBarChart'], {
        svelte: `<DivergingBarChart {store} viewId="c" category="category" measure="margin" showLegend label="Marge par catégorie" />`,
        react: `<DivergingBarChart store={store} viewId="c" category="category" measure="margin" showLegend label="Marge par catégorie" />`,
        vue: `<DivergingBarChart :store="store" viewId="c" category="category" measure="margin" showLegend label="Marge par catégorie" />`,
      }),
    }, ChartDemo),

    // ── Part-of-whole & flux ─────────────────────────────────────────────
    chart({
      slug: 'donut', name: 'DonutChart', group: 'Part-of-whole & flux', kind: 'donut', hasControls: true,
      tagline: 'Anneau de répartition avec total au centre.',
      useCase:
        "Montrer la composition d'un tout (mix de catégories, de canaux). Le label central porte le total agrégé, lisible d'un coup d'œil.",
      code: storeCode(['DonutChart'], {
        svelte: `<DonutChart {store} viewId="c" category="category" measure="revenue" centerLabel="Total" label="Répartition" />`,
        react: `<DonutChart store={store} viewId="c" category="category" measure="revenue" centerLabel="Total" label="Répartition" />`,
        vue: `<DonutChart :store="store" viewId="c" category="category" measure="revenue" centerLabel="Total" label="Répartition" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'funnel', name: 'FunnelChart', group: 'Part-of-whole & flux', kind: 'funnel', hasControls: false,
      tagline: "Entonnoir d'étapes avec taux de conversion.",
      useCase:
        "Visualiser une progression à étapes (pipeline commercial, parcours d'achat par canal) avec les pourcentages de conversion d'une étape à l'autre.",
      code: storeCode(['FunnelChart'], {
        svelte: `<FunnelChart {store} viewId="c" category="channel" measure="revenue" showPercentages legend label="Entonnoir par canal" />`,
        react: `<FunnelChart store={store} viewId="c" category="channel" measure="revenue" showPercentages legend label="Entonnoir par canal" />`,
        vue: `<FunnelChart :store="store" viewId="c" category="channel" measure="revenue" showPercentages legend label="Entonnoir par canal" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'waterfall', name: 'WaterfallChart', group: 'Part-of-whole & flux', kind: 'waterfall', hasControls: false,
      tagline: 'Cascade de contributions vers un total.',
      useCase:
        "Expliquer comment on passe d'un point de départ à un total via des contributions positives/négatives — un pont de revenu par catégorie, ou une variance budgétaire.",
      code: storeCode(['WaterfallChart'], {
        svelte: `<WaterfallChart {store} viewId="c" category="category" measure="revenue" totalLabel="Total" label="Cascade" />`,
        react: `<WaterfallChart store={store} viewId="c" category="category" measure="revenue" totalLabel="Total" label="Cascade" />`,
        vue: `<WaterfallChart :store="store" viewId="c" category="category" measure="revenue" totalLabel="Total" label="Cascade" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'treemap', name: 'TreemapChart', group: 'Part-of-whole & flux', kind: 'treemap', hasControls: true,
      tagline: 'Pavage hiérarchique proportionnel à la mesure.',
      useCase:
        "Explorer une hiérarchie (région → pays → ville) où l'aire de chaque tuile encode le revenu. Dense et efficace pour des centaines de feuilles.",
      code: storeCode(['TreemapChart'], {
        svelte: `<TreemapChart {store} viewId="c" hierarchy={['region', 'country', 'city']} measure="revenue" label="Treemap géographique" />`,
        react: `<TreemapChart store={store} viewId="c" hierarchy={['region', 'country', 'city']} measure="revenue" label="Treemap géographique" />`,
        vue: `<TreemapChart :store="store" viewId="c" :hierarchy="['region', 'country', 'city']" measure="revenue" label="Treemap géographique" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'sunburst', name: 'SunburstChart', group: 'Part-of-whole & flux', kind: 'sunburst', hasControls: true,
      tagline: 'Anneaux concentriques pour une hiérarchie.',
      useCase:
        "Comme le treemap mais en radial : chaque anneau est un niveau de hiérarchie (région → catégorie → produit). Pratique pour montrer la profondeur d'une arborescence.",
      code: storeCode(['SunburstChart'], {
        svelte: `<SunburstChart {store} viewId="c" hierarchy={['region', 'category', 'product']} measure="revenue" legend label="Sunburst" />`,
        react: `<SunburstChart store={store} viewId="c" hierarchy={['region', 'category', 'product']} measure="revenue" legend label="Sunburst" />`,
        vue: `<SunburstChart :store="store" viewId="c" :hierarchy="['region', 'category', 'product']" measure="revenue" legend label="Sunburst" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'sankey', name: 'SankeyChart', group: 'Part-of-whole & flux', kind: 'sankey', hasControls: true,
      tagline: 'Diagramme de flux source → cible.',
      useCase:
        "Suivre des flux pondérés entre deux ensembles — région vers catégorie de produit, ou origine vers destination logistique. L'épaisseur encode le volume.",
      code: storeCode(['SankeyChart'], {
        svelte: `<SankeyChart {store} viewId="c" source="region" target="category" measure="revenue" label="Flux région → catégorie" />`,
        react: `<SankeyChart store={store} viewId="c" source="region" target="category" measure="revenue" label="Flux région → catégorie" />`,
        vue: `<SankeyChart :store="store" viewId="c" source="region" target="category" measure="revenue" label="Flux région → catégorie" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'chord', name: 'ChordChart', group: 'Part-of-whole & flux', kind: 'chord', hasControls: true,
      tagline: 'Matrice de relations en arc circulaire.',
      useCase:
        "Visualiser des relations bidirectionnelles entre catégories (région ↔ canal). Les rubans encodent l'intensité des échanges entre deux nœuds.",
      code: storeCode(['ChordChart'], {
        svelte: `<ChordChart {store} viewId="c" source="region" target="channel" measure="revenue" label="Chord région ↔ canal" />`,
        react: `<ChordChart store={store} viewId="c" source="region" target="channel" measure="revenue" label="Chord région ↔ canal" />`,
        vue: `<ChordChart :store="store" viewId="c" source="region" target="channel" measure="revenue" label="Chord région ↔ canal" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'radar', name: 'RadarChart', group: 'Part-of-whole & flux', kind: 'radar', hasControls: true,
      tagline: 'Profil multi-axes par série.',
      useCase:
        "Comparer plusieurs entités sur les mêmes axes (forces/faiblesses par catégorie). Lisible pour 3–8 axes ; au-delà, préférez un small-multiple de barres.",
      code: storeCode(['RadarChart'], {
        svelte: `<RadarChart {store} viewId="c" axes={['Capteurs','Réseau','Contrôleurs','Énergie','Affichage']} series="category" measure="revenue" legend label="Profil" />`,
        react: `<RadarChart store={store} viewId="c" axes={['Capteurs','Réseau','Contrôleurs','Énergie','Affichage']} series="category" measure="revenue" legend label="Profil" />`,
        vue: `<RadarChart :store="store" viewId="c" :axes="['Capteurs','Réseau','Contrôleurs','Énergie','Affichage']" series="category" measure="revenue" legend label="Profil" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'mekko', name: 'MekkoChart', group: 'Part-of-whole & flux', kind: 'mekko', hasControls: true,
      tagline: 'Marimekko : largeur ET hauteur porteuses de sens.',
      useCase:
        "Encoder deux dimensions de poids simultanément : la largeur des colonnes (part de la catégorie) et la hauteur des segments (part du canal). Dense mais très informatif pour des revues de portefeuille.",
      code: storeCode(['MekkoChart'], {
        svelte: `<MekkoChart {store} viewId="c" category="category" series="channel" measure="revenue" label="Marimekko" />`,
        react: `<MekkoChart store={store} viewId="c" category="category" series="channel" measure="revenue" label="Marimekko" />`,
        vue: `<MekkoChart :store="store" viewId="c" category="category" series="channel" measure="revenue" label="Marimekko" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'rose', name: 'RoseChart', group: 'Part-of-whole & flux', kind: 'rose', hasControls: true,
      tagline: 'Diagramme polaire (rose de Nightingale).',
      useCase:
        "Variante polaire du bar chart où l'aire encode la mesure. Élégant pour des données cycliques (saisonnalité, répartition par catégorie).",
      code: storeCode(['RoseChart'], {
        svelte: `<RoseChart {store} viewId="c" category="category" measure="revenue" label="Rose polaire" />`,
        react: `<RoseChart store={store} viewId="c" category="category" measure="revenue" label="Rose polaire" />`,
        vue: `<RoseChart :store="store" viewId="c" category="category" measure="revenue" label="Rose polaire" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'packed-bubble', name: 'PackedBubbleChart', group: 'Part-of-whole & flux', kind: 'packed', hasControls: true,
      tagline: 'Bulles compactées proportionnelles à la mesure.',
      useCase:
        "Comparer des magnitudes sans axe : chaque bulle est une catégorie, sa surface encode le revenu. Compact et accrocheur pour des dashboards de synthèse.",
      code: storeCode(['PackedBubbleChart'], {
        svelte: `<PackedBubbleChart {store} viewId="c" category="category" measure="revenue" label="Bulles" />`,
        react: `<PackedBubbleChart store={store} viewId="c" category="category" measure="revenue" label="Bulles" />`,
        vue: `<PackedBubbleChart :store="store" viewId="c" category="category" measure="revenue" label="Bulles" />`,
      }),
    }, ChartDemo),

    // ── Distribution & statistique ───────────────────────────────────────
    chart({
      slug: 'histogram', name: 'HistogramChart', group: 'Distribution & statistique', kind: 'histogram', hasControls: false,
      tagline: 'Distribution binée d\'une variable continue.',
      useCase:
        "Comprendre la forme d'une distribution — ici les prix unitaires sur ~700 lignes. Le nombre de bins est paramétrable pour ajuster la granularité.",
      code: storeCode(['HistogramChart'], {
        svelte: `<HistogramChart {store} value="price" bins={16} label="Distribution des prix" />`,
        react: `<HistogramChart store={store} value="price" bins={16} label="Distribution des prix" />`,
        vue: `<HistogramChart :store="store" value="price" :bins="16" label="Distribution des prix" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'box-plot', name: 'BoxPlotChart', group: 'Distribution & statistique', kind: 'box', hasControls: false,
      tagline: 'Boîte à moustaches par groupe.',
      useCase:
        "Comparer des distributions entre groupes (prix par catégorie) : médiane, quartiles et étendue d'un coup d'œil, valeurs aberrantes incluses.",
      code: storeCode(['BoxPlotChart'], {
        svelte: `<BoxPlotChart {store} value="price" group="category" label="Prix par catégorie" />`,
        react: `<BoxPlotChart store={store} value="price" group="category" label="Prix par catégorie" />`,
        vue: `<BoxPlotChart :store="store" value="price" group="category" label="Prix par catégorie" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'heatmap', name: 'HeatmapChart', group: 'Distribution & statistique', kind: 'heatmap', hasControls: true,
      tagline: 'Matrice de chaleur catégorie × catégorie.',
      useCase:
        "Croiser deux dimensions et lire l'intensité d'une mesure par couleur (catégorie × canal). La heatmap révèle des concentrations invisibles dans un tableau.",
      code: storeCode(['HeatmapChart'], {
        svelte: `<HeatmapChart {store} x="category" y="channel" measure="revenue" legend label="Catégorie × canal" />`,
        react: `<HeatmapChart store={store} x="category" y="channel" measure="revenue" legend label="Catégorie × canal" />`,
        vue: `<HeatmapChart :store="store" x="category" y="channel" measure="revenue" legend label="Catégorie × canal" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'calendar-heatmap', name: 'CalendarHeatmapChart', group: 'Distribution & statistique', kind: 'calendar', hasControls: true,
      tagline: 'Heatmap calendaire façon GitHub.',
      useCase:
        "Visualiser une activité quotidienne sur un an : chaque cellule est un jour, la couleur encode le revenu. Idéal pour repérer saisonnalité et trous d'activité.",
      code: storeCode(['CalendarHeatmapChart'], {
        svelte: `<CalendarHeatmapChart {store} date="date" measure="revenue" label="Activité par jour" />`,
        react: `<CalendarHeatmapChart store={store} date="date" measure="revenue" label="Activité par jour" />`,
        vue: `<CalendarHeatmapChart :store="store" date="date" measure="revenue" label="Activité par jour" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'bullet', name: 'BulletChart', group: 'Distribution & statistique', kind: 'bullet', hasControls: false,
      tagline: 'Jauge linéaire valeur vs objectif et plages.',
      useCase:
        "Comparer une valeur à un objectif et à des plages qualitatives (rouge/orange/vert) sur une barre compacte — parfait pour un bandeau de KPI.",
      code: storeCode(['BulletChart'], {
        svelte: `<BulletChart {store} value="revenue" target={1500000} category="Revenu" ranges={[800000,1200000,1600000]} label="Objectif de revenu" />`,
        react: `<BulletChart store={store} value="revenue" target={1500000} category="Revenu" ranges={[800000,1200000,1600000]} label="Objectif de revenu" />`,
        vue: `<BulletChart :store="store" value="revenue" :target="1500000" category="Revenu" :ranges="[800000,1200000,1600000]" label="Objectif de revenu" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'gauge', name: 'GaugeChart', group: 'Distribution & statistique', kind: 'gauge', hasControls: false,
      tagline: 'Cadran radial avec seuils colorés.',
      useCase:
        "Afficher une mesure unique sur une échelle bornée avec des seuils (avertissement/succès). Lisible à distance sur un mur de KPI.",
      code: storeCode(['GaugeChart'], {
        svelte: `<GaugeChart {store} value="revenue" min={0} max={2000000} unit="€"
  thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} label="Revenu" />`,
        react: `<GaugeChart store={store} value="revenue" min={0} max={2000000} unit="€"
  thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} label="Revenu" />`,
        vue: `<GaugeChart :store="store" value="revenue" :min="0" :max="2000000" unit="€"
  :thresholds="[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]" label="Revenu" />`,
      }),
    }, ChartDemo),

    // ── Couche analytique ────────────────────────────────────────────────
    chart({
      slug: 'reference-line', name: 'ReferenceLineChart', group: 'Couche analytique', kind: 'reference', hasControls: false,
      tagline: 'Série + ligne de référence (moyenne, cible).',
      useCase:
        "Superposer une ligne de référence (moyenne, objectif, seuil) à une série pour contextualiser chaque point. Utilise la surface LineChart du design system.",
      code: storeCode(['ReferenceLineChart'], {
        svelte: `<ReferenceLineChart {store} viewId="c" measure="revenue" referenceLabel="Moyenne" label="Revenu + référence" />`,
        react: `<ReferenceLineChart store={store} viewId="c" measure="revenue" referenceLabel="Moyenne" label="Revenu + référence" />`,
        vue: `<ReferenceLineChart :store="store" viewId="c" measure="revenue" referenceLabel="Moyenne" label="Revenu + référence" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'percentile-band', name: 'PercentileBandChart', group: 'Couche analytique', kind: 'percentile', hasControls: false,
      tagline: 'Bande inter-percentiles autour d\'une distribution.',
      useCase:
        "Matérialiser une zone de normalité (ex. 10e–90e percentile des prix) pour distinguer le typique de l'exceptionnel.",
      code: storeCode(['PercentileBandChart'], {
        svelte: `<PercentileBandChart {store} viewId="c" value="price" lower={0.1} upper={0.9} label="Bande 10–90e (prix)" />`,
        react: `<PercentileBandChart store={store} viewId="c" value="price" lower={0.1} upper={0.9} label="Bande 10–90e (prix)" />`,
        vue: `<PercentileBandChart :store="store" viewId="c" value="price" :lower="0.1" :upper="0.9" label="Bande 10–90e (prix)" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'trend-line', name: 'TrendLineChart', group: 'Couche analytique', kind: 'trend', hasControls: false,
      tagline: 'Régression linéaire sur un nuage temporel.',
      useCase:
        "Ajouter une tendance (droite de régression) sur une série temporelle pour résumer la direction générale malgré le bruit.",
      code: storeCode(['TrendLineChart'], {
        svelte: `<TrendLineChart {store} viewId="c" x="date" y="revenue" label="Tendance du revenu" />`,
        react: `<TrendLineChart store={store} viewId="c" x="date" y="revenue" label="Tendance du revenu" />`,
        vue: `<TrendLineChart :store="store" viewId="c" x="date" y="revenue" label="Tendance du revenu" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'forecast-line', name: 'ForecastLineChart', group: 'Couche analytique', kind: 'forecast', hasControls: false,
      tagline: 'Prolongement prévisionnel (segments pointillés).',
      useCase:
        "Projeter une série sur N périodes futures avec un segment pointillé distinct de l'historique — pour des prévisions de revenu simples et lisibles.",
      code: storeCode(['ForecastLineChart'], {
        svelte: `<ForecastLineChart {store} viewId="c" x="date" y="revenue" periods={6} label="Prévision (6 mois)" />`,
        react: `<ForecastLineChart store={store} viewId="c" x="date" y="revenue" periods={6} label="Prévision (6 mois)" />`,
        vue: `<ForecastLineChart :store="store" viewId="c" x="date" y="revenue" :periods="6" label="Prévision (6 mois)" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'error-bars', name: 'ErrorBarsChart', group: 'Couche analytique', kind: 'errorbars', hasControls: false,
      tagline: 'Moyenne ± écart-type / erreur-type par catégorie.',
      useCase:
        "Communiquer l'incertitude : moyenne par catégorie avec moustaches d'écart-type. Indispensable pour ne pas surinterpréter des écarts non significatifs.",
      code: storeCode(['ErrorBarsChart'], {
        svelte: `<ErrorBarsChart {store} viewId="c" category="category" value="price" interval="stdev" label="Prix moyen ± σ" />`,
        react: `<ErrorBarsChart store={store} viewId="c" category="category" value="price" interval="stdev" label="Prix moyen ± σ" />`,
        vue: `<ErrorBarsChart :store="store" viewId="c" category="category" value="price" interval="stdev" label="Prix moyen ± σ" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'cluster-plot', name: 'AnalyticsClusterPlot', group: 'Couche analytique', kind: 'cluster', hasControls: false,
      tagline: 'k-means sur un nuage de points, centroïdes inclus.',
      useCase:
        "Segmenter automatiquement des points (prix vs taux de marge) en k groupes via k-means, avec affichage des centroïdes. Première étape d'une analyse de portefeuille.",
      code: storeCode(['AnalyticsClusterPlot'], {
        svelte: `<AnalyticsClusterPlot {store} viewId="c" fields={['price', 'marginRate']} k={3} label="Clusters prix/marge" />`,
        react: `<AnalyticsClusterPlot store={store} viewId="c" fields={['price', 'marginRate']} k={3} label="Clusters prix/marge" />`,
        vue: `<AnalyticsClusterPlot :store="store" viewId="c" :fields="['price', 'marginRate']" :k="3" label="Clusters prix/marge" />`,
      }),
    }, ChartDemo),

    // ── Indicateurs ──────────────────────────────────────────────────────
    chart({
      slug: 'scatter', name: 'ScatterPlot', group: 'Couche analytique', kind: 'scatter', hasControls: false,
      tagline: 'Nuage de points (x/y) avec tones catégorielles optionnelles.',
      useCase:
        "Comparer deux mesures numériques (revenu vs unités) point à point. La propriété `series` colore les points par dimension catégorielle (ici la catégorie produit), révélant des groupes sans clustering.\n\nContrairement à `AnalyticsClusterPlot` (k-means), `ScatterPlot` est une lecture directe sans transformation statistique : chaque ligne du dataset devient un point.",
      code: storeCode(['ScatterPlot'], {
        svelte: `<ScatterPlot {store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités" />`,
        react: `<ScatterPlot store={store} viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités" />`,
        vue: `<ScatterPlot :store="store" viewId="c" x="revenue" y="units" series="category" labelField="category" label="Revenu vs unités" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'sparkline', name: 'Sparkline', group: 'Indicateurs', kind: 'sparkline', hasControls: false,
      tagline: 'Mini-courbe de tendance inline.',
      useCase:
        "Intégrer une tendance compacte dans un tableau de bord ou une fiche KPI. `dimension` ordonne les points (ex. 'month'), `measure` fournit les valeurs. `area` ajoute un remplissage semi-transparent pour améliorer la lisibilité.",
      code: storeCode(['Sparkline'], {
        svelte: `<Sparkline {store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle" />`,
        react: `<Sparkline store={store} viewId="c" dimension="month" measure="revenue" area label="Tendance mensuelle" />`,
        vue: `<Sparkline :store="store" viewId="c" dimension="month" measure="revenue" :area="true" label="Tendance mensuelle" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'scorecard', name: 'ScoreCard', group: 'Indicateurs', kind: 'scorecard', hasControls: false,
      tagline: 'Carte KPI unique avec delta, sparkline et objectif.',
      useCase:
        "Afficher un indicateur clé isolé — valeur agrégée, variation par rapport à une période précédente (`comparisonData`), objectif de progression (`goal`) et mini-sparkline. Variante single-card de `KpiCardGroup` : même moteur `buildKpiCards`, un seul slot.",
      code: storeCode(['ScoreCard'], {
        svelte: `<ScoreCard {store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" tone="category1" label="Revenu total" />`,
        react: `<ScoreCard store={store} viewId="c" measure="revenue" sparklineDimension="month" format="currency" tone="category1" label="Revenu total" />`,
        vue: `<ScoreCard :store="store" viewId="c" measure="revenue" sparklineDimension="month" format="currency" tone="category1" label="Revenu total" />`,
      }),
    }, ChartDemo),

    // ── Cartographie géo ─────────────────────────────────────────────────
    geo({
      slug: 'geo-point', name: 'GeoPointMap', kind: 'point', hasControls: true,
      tagline: 'Pins géolocalisés pondérés par une mesure.',
      useCase:
        "Placer chaque ville sur la carte, le rayon du point encodant le revenu. La base lat/lng du dataset alimente directement la surface GeoMap du design system.",
      code: storeCode(['GeoPointMap'], {
        svelte: `<GeoPointMap {store} viewId="g" latitude="lat" longitude="lng" labelField="city" value="revenue" label="Ventes par ville" />`,
        react: `<GeoPointMap store={store} viewId="g" latitude="lat" longitude="lng" labelField="city" value="revenue" label="Ventes par ville" />`,
        vue: `<GeoPointMap :store="store" viewId="g" latitude="lat" longitude="lng" labelField="city" value="revenue" label="Ventes par ville" />`,
      }),
    }, GeoDemo),
    geo({
      slug: 'choropleth', name: 'ChoroplethMap', kind: 'choropleth', hasControls: true,
      tagline: 'Aplats régionaux teintés par la mesure.',
      useCase:
        "Colorer des régions/pays selon une mesure agrégée (revenu par pays). La carte choroplèthe est le standard pour comparer des territoires.",
      code: storeCode(['ChoroplethMap'], {
        svelte: `<ChoroplethMap {store} viewId="g" region="country" measure="revenue" label="Revenu par pays" />`,
        react: `<ChoroplethMap store={store} viewId="g" region="country" measure="revenue" label="Revenu par pays" />`,
        vue: `<ChoroplethMap :store="store" viewId="g" region="country" measure="revenue" label="Revenu par pays" />`,
      }),
    }, GeoDemo),
    geo({
      slug: 'geo-flow', name: 'GeoFlowMap', kind: 'flow', hasControls: false,
      tagline: 'Arcs de flux source → destination.',
      useCase:
        "Tracer des flux entre points géographiques (routes logistiques, migrations de comptes) sous forme d'arcs dont l'épaisseur encode le volume.",
      code: storeCode(['GeoFlowMap'], {
        svelte: `<GeoFlowMap {store} viewId="g" sourceLatitude="lat" sourceLongitude="lng" targetLatitude="lat" targetLongitude="lng" value="revenue" label="Flux" />`,
        react: `<GeoFlowMap store={store} viewId="g" sourceLatitude="lat" sourceLongitude="lng" targetLatitude="lat" targetLongitude="lng" value="revenue" label="Flux" />`,
        vue: `<GeoFlowMap :store="store" viewId="g" sourceLatitude="lat" sourceLongitude="lng" targetLatitude="lat" targetLongitude="lng" value="revenue" label="Flux" />`,
      }),
    }, GeoDemo),
    geo({
      slug: 'geo-hexbin', name: 'GeoHexbinMap', kind: 'hexbin', hasControls: true,
      tagline: 'Agrégation hexagonale de densité.',
      useCase:
        "Agréger des milliers de points en cellules hexagonales pour révéler la densité sans surcharge visuelle. Taille de cellule ajustable.",
      code: storeCode(['GeoHexbinMap'], {
        svelte: `<GeoHexbinMap {store} viewId="g" latitude="lat" longitude="lng" value="revenue" cellSize={28} label="Densité hexagonale" />`,
        react: `<GeoHexbinMap store={store} viewId="g" latitude="lat" longitude="lng" value="revenue" cellSize={28} label="Densité hexagonale" />`,
        vue: `<GeoHexbinMap :store="store" viewId="g" latitude="lat" longitude="lng" value="revenue" :cellSize="28" label="Densité hexagonale" />`,
      }),
    }, GeoDemo),
    geo({
      slug: 'geo-cluster', name: 'GeoClusterMap', kind: 'cluster', hasControls: true,
      tagline: 'Regroupement de points proches en clusters.',
      useCase:
        "Regrouper les points proches en grappes comptées, pour des cartes lisibles à n'importe quel niveau de zoom.",
      code: storeCode(['GeoClusterMap'], {
        svelte: `<GeoClusterMap {store} viewId="g" latitude="lat" longitude="lng" value="revenue" radius={40} label="Clustering" />`,
        react: `<GeoClusterMap store={store} viewId="g" latitude="lat" longitude="lng" value="revenue" radius={40} label="Clustering" />`,
        vue: `<GeoClusterMap :store="store" viewId="g" latitude="lat" longitude="lng" value="revenue" :radius="40" label="Clustering" />`,
      }),
    }, GeoDemo),
    geo({
      slug: 'geo-density', name: 'GeoDensityMap', kind: 'density', hasControls: true,
      tagline: 'Carte de chaleur de densité continue.',
      useCase:
        "Lisser des points en une nappe de chaleur continue pour visualiser des zones d'intensité (ventes, trafic) plutôt que des positions exactes.",
      code: storeCode(['GeoDensityMap'], {
        svelte: `<GeoDensityMap {store} viewId="g" latitude="lat" longitude="lng" value="revenue" label="Densité" />`,
        react: `<GeoDensityMap store={store} viewId="g" latitude="lat" longitude="lng" value="revenue" label="Densité" />`,
        vue: `<GeoDensityMap :store="store" viewId="g" latitude="lat" longitude="lng" value="revenue" label="Densité" />`,
      }),
    }, GeoDemo),
  ];
}

function geo(
  e: Omit<DemoEntry, 'section' | 'demo' | 'group'> & { kind: string },
  Comp: Demo,
): DemoEntry {
  const { kind, ...rest } = e;
  return { ...rest, group: 'Cartographie géo', section: 'charts', demo: Comp, demoProps: { kind } };
}
