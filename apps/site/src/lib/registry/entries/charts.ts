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

    // ── Évolution & classements ──────────────────────────────────────────
    chart({
      slug: 'bump', name: 'BumpChart', group: 'Évolution & classements', kind: 'bump', hasControls: false,
      tagline: 'Classements comparatifs dans le temps (bump chart).',
      useCase:
        "Suivre l'évolution des positions relatives de plusieurs séries sur une dimension ordonnée (ici les catégories produit classées par revenu mensuel). Les lignes qui se croisent révèlent des renversements de classement que les barres ne montrent pas.\n\n`series` définit les entités à classer, `category` l'axe temporel ou ordonné, `measure` la valeur sur laquelle le rang est calculé (rang 1 = valeur la plus haute par défaut).",
      code: storeCode(['BumpChart'], {
        svelte: `<BumpChart {store} viewId="c" series="category" category="month" measure="revenue" label="Classement mensuel des catégories" />`,
        react: `<BumpChart store={store} viewId="c" series="category" category="month" measure="revenue" label="Classement mensuel des catégories" />`,
        vue: `<BumpChart :store="store" viewId="c" series="category" category="month" measure="revenue" label="Classement mensuel des catégories" />`,
      }),
    }, ChartDemo),

    // ── Distribution & statistique ───────────────────────────────────────
    chart({
      slug: 'violin', name: 'ViolinChart', group: 'Distribution & statistique', kind: 'violin', hasControls: false,
      tagline: 'Distribution en violon avec médiane et quartiles par groupe.',
      useCase:
        "Comparer la forme de la distribution d'une variable numérique entre plusieurs groupes. Contrairement au box plot, le violon révèle la densité locale : un ventre large indique un pic de concentration. Ici la distribution des prix unitaires par catégorie de produit.\n\n`groupBy` divise les données par groupe (une colonne par groupe), `measure` collecte les valeurs numériques. `quartiles` superpose médiane et boîte q1–q3.",
      code: storeCode(['ViolinChart'], {
        svelte: `<ViolinChart {store} viewId="c" groupBy="category" measure="price" label="Distribution des prix par catégorie" />`,
        react: `<ViolinChart store={store} viewId="c" groupBy="category" measure="price" label="Distribution des prix par catégorie" />`,
        vue: `<ViolinChart :store="store" viewId="c" groupBy="category" measure="price" label="Distribution des prix par catégorie" />`,
      }),
    }, ChartDemo),
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

    chart({
      slug: 'solid-gauge', name: 'SolidGaugeChart', group: 'Distribution & statistique', kind: 'solid-gauge', hasControls: false,
      tagline: 'Anneau de progression à seuils colorés (arc plein, sans aiguille).',
      useCase:
        "Afficher une mesure unique sous forme d'anneau rempli sur une échelle bornée ; la zone de seuil atteinte teinte l'arc. Variante « jauge solide » du cadran à aiguille, idéale pour un score ou un taux d'objectif.",
      code: storeCode(['SolidGaugeChart'], {
        svelte: `<SolidGaugeChart {store} viewId="c" value="revenue" min={0} max={2000000} unit="€"
  thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} label="Revenu vs objectif" format="number" />`,
        react: `<SolidGaugeChart store={store} viewId="c" value="revenue" min={0} max={2000000} unit="€"
  thresholds={[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]} label="Revenu vs objectif" format="number" />`,
        vue: `<SolidGaugeChart :store="store" viewId="c" value="revenue" :min="0" :max="2000000" unit="€"
  :thresholds="[{ value: 800000, tone: 'warning' }, { value: 1400000, tone: 'success' }]" label="Revenu vs objectif" format="number" />`,
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

    chart({
      slug: 'parallel-coordinates', name: 'ParallelCoordinatesChart', group: 'Couche analytique', kind: 'parallel', hasControls: false,
      tagline: 'Axes verticaux parallèles pour comparer des profils multivariés.',
      useCase:
        "Visualiser simultanément plusieurs variables numériques sur un même graphique. Chaque polyligne est un enregistrement ; l'orientation commune révèle les corrélations et les groupes. Ici chaque transaction est tracée sur trois axes : prix unitaire, unités vendues et taux de marge.\n\nLa prop `measures` liste les champs mesure à exposer comme axes (de gauche à droite). `series` colore les lignes par dimension catégorielle.",
      code: storeCode(['ParallelCoordinatesChart'], {
        svelte: `<ParallelCoordinatesChart {store} viewId="c" measures={['price', 'units', 'marginRate']} series="category" label="Profil multivarié (prix / unités / marge)" />`,
        react: `<ParallelCoordinatesChart store={store} viewId="c" measures={['price', 'units', 'marginRate']} series="category" label="Profil multivarié (prix / unités / marge)" />`,
        vue: `<ParallelCoordinatesChart :store="store" viewId="c" :measures="['price', 'units', 'marginRate']" series="category" label="Profil multivarié (prix / unités / marge)" />`,
      }),
    }, ChartDemo),

    // ── Finance ──────────────────────────────────────────────────────────
    chart({
      slug: 'candlestick', name: 'CandlestickChart', group: 'Finance', kind: 'candlestick', hasControls: false,
      tagline: 'Bougies OHLC pour visualiser des cours financiers.',
      useCase:
        "Afficher l\'évolution d\'un titre sur une série de séances boursières. Chaque bougie encode l\'ouverture, le plus haut, le plus bas et la clôture. Les bougies vertes signalent une hausse (close > open), les rouges une baisse.\n\nLa prop `label_field` désigne la dimension de session (date ou libellé) et les quatre champs `open`/`high`/`low`/`close` pointent les mesures correspondantes du modèle.",
      code: storeCode(['CandlestickChart'], {
        svelte: `<CandlestickChart {store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers (28 séances)" />`,
        react: `<CandlestickChart store={store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers (28 séances)" />`,
        vue: `<CandlestickChart :store="store" viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers (28 séances)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'heikin-ashi', name: 'HeikinAshiChart', group: 'Finance', kind: 'heikin-ashi', hasControls: false,
      tagline: 'Bougies Heikin-Ashi lissées pour mieux lire la tendance.',
      useCase:
        "Variante lissée des bougies japonaises : les valeurs OHLC sont recalculées (close = moyenne OHLC, open = moyenne des bougies HA précédentes) pour filtrer le bruit et faire ressortir la tendance. Mêmes données et mêmes champs que CandlestickChart.\n\n`label_field` désigne la session et `open`/`high`/`low`/`close` les mesures.",
      code: storeCode(['HeikinAshiChart'], {
        svelte: `<HeikinAshiChart {store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours Heikin-Ashi (28 séances)" />`,
        react: `<HeikinAshiChart store={store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours Heikin-Ashi (28 séances)" />`,
        vue: `<HeikinAshiChart :store="store" viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours Heikin-Ashi (28 séances)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'hollow-candlestick', name: 'HollowCandlestickChart', group: 'Finance', kind: 'hollow-candlestick', hasControls: false,
      tagline: 'Bougies creuses : le corps évidé/plein distingue hausse et baisse.',
      useCase:
        "Variante des bougies japonaises où le corps est creux quand la clôture dépasse l'ouverture (tendance haussière) et plein sinon. Mêmes données OHLC que CandlestickChart.\n\n`label_field` désigne la session et `open`/`high`/`low`/`close` les mesures.",
      code: storeCode(['HollowCandlestickChart'], {
        svelte: `<HollowCandlestickChart {store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Bougies creuses (28 séances)" />`,
        react: `<HollowCandlestickChart store={store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Bougies creuses (28 séances)" />`,
        vue: `<HollowCandlestickChart :store="store" viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Bougies creuses (28 séances)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'hlc', name: 'HLCChart', group: 'Finance', kind: 'hlc', hasControls: false,
      tagline: 'Bâtons High-Low-Close : fourchette de prix et clôture, sans ouverture.',
      useCase:
        "Représenter la fourchette (haut/bas) et la clôture d'un titre par séance, sans l'ouverture — utile quand l'open n'est pas pertinent ou indisponible.\n\n`label_field` désigne la session ; `high`/`low`/`close` les mesures.",
      code: storeCode(['HLCChart'], {
        svelte: `<HLCChart {store} viewId="ohlc" label_field="session" high="high" low="low" close="close" label="Cours HLC (28 séances)" />`,
        react: `<HLCChart store={store} viewId="ohlc" label_field="session" high="high" low="low" close="close" label="Cours HLC (28 séances)" />`,
        vue: `<HLCChart :store="store" viewId="ohlc" label_field="session" high="high" low="low" close="close" label="Cours HLC (28 séances)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'ohlc', name: 'OHLCChart', group: 'Finance', kind: 'ohlc', hasControls: false,
      tagline: 'Barres OHLC (Open/High/Low/Close) pour des cours financiers.',
      useCase:
        "Alternative à la bougie japonaise : chaque barre OHLC affiche l'ouverture (tiret gauche), le plus haut, le plus bas et la clôture (tiret droit). Les mêmes données financières que le CandlestickChart, format barres.\n\nSupporte `annotations`, `dataLabels`, `hoverKey`/`onHoverKeyChange` (synchronisation du crosshair) et `keyboardNav`/`onSelectKey` (navigation clavier a11y).",
      code: storeCode(['OHLCChart'], {
        svelte: `<OHLCChart {store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />`,
        react: `<OHLCChart store={store} viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />`,
        vue: `<OHLCChart :store="store" viewId="ohlc" label_field="session" open="open" high="high" low="low" close="close" label="Cours boursiers OHLC (28 séances)" />`,
      }),
    }, ChartDemo),

    // ── Projet & temps ──────────────────────────────────────────────────────
    chart({
      slug: 'gantt', name: 'GanttChart', group: 'Projet & temps', kind: 'gantt', hasControls: false,
      tagline: 'Diagramme de Gantt pour planifier des tâches sur une timeline.',
      useCase:
        "Visualiser un planning de projet : chaque tâche est une barre entre son début et sa fin (indices de jours). Les `category` groupent les tâches par phase. Le `marker` positionne un indicateur \"aujourd'hui\".\n\n`task` désigne la dimension libellé, `start`/`end` les mesures de borne temporelle.",
      code: storeCode(['GanttChart'], {
        svelte: `<GanttChart {store} viewId="gantt" task="task" start="start" end="end" category="category" marker={10} label="Planning de projet" />`,
        react: `<GanttChart store={store} viewId="gantt" task="task" start="start" end="end" category="category" marker={10} label="Planning de projet" />`,
        vue: `<GanttChart :store="store" viewId="gantt" task="task" start="start" end="end" category="category" :marker="10" label="Planning de projet" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'timeline', name: 'TimelineChart', group: 'Projet & temps', kind: 'timeline', hasControls: false,
      tagline: "Frise chronologique d'événements jalons.",
      useCase:
        "Représenter des jalons ponctuels sur un axe de temps — ici les étapes clés d'un projet (lancement, alpha, mise en production). Chaque événement a une `position` numérique, un `label`, une `description` optionnelle et un `tone` catégoriel.\n\n`label_field` désigne la dimension libellé, `position` la mesure de position sur l'axe.",
      code: storeCode(['TimelineChart'], {
        svelte: `<TimelineChart {store} viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />`,
        react: `<TimelineChart store={store} viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />`,
        vue: `<TimelineChart :store="store" viewId="timeline" label_field="event" position="position" description="description" tone="tone" label="Jalons du projet" />`,
      }),
    }, ChartDemo),

    // ── Évolution & flux ────────────────────────────────────────────────────
    chart({
      slug: 'streamgraph', name: 'StreamgraphChart', group: 'Évolution & classements', kind: 'streamgraph', hasControls: false,
      tagline: "Flux empilés lisses pour l'évolution de séries.",
      useCase:
        "Montrer l'évolution relative de plusieurs séries sur une dimension ordonnée (ici le revenu par canal sur 6 mois). Les flux sont empilés de façon organique ; `smooth` adoucit les transitions.\n\n`category` désigne la dimension X (mois), `series` la dimension couleur/légende, `measure` la valeur de chaque flux.",
      code: storeCode(['StreamgraphChart'], {
        svelte: `<StreamgraphChart {store} viewId="sg" category="month" series="channel" measure="revenue" smooth showLegend label="Revenu par canal (flux)" />`,
        react: `<StreamgraphChart store={store} viewId="sg" category="month" series="channel" measure="revenue" smooth showLegend label="Revenu par canal (flux)" />`,
        vue: `<StreamgraphChart :store="store" viewId="sg" category="month" series="channel" measure="revenue" :smooth="true" :showLegend="true" label="Revenu par canal (flux)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'ribbon', name: 'RibbonChart', group: 'Évolution & classements', kind: 'ribbon', hasControls: false,
      tagline: 'Classements empilés à rubans par période.',
      useCase:
        "Suivre la part relative et le rang de plusieurs catégories sur des périodes ordonnées. Les rubans lissés entre les colonnes révèlent les inversions de classement que les barres empilées classiques ne matérialisent pas.\n\n`category` est la dimension colorée, `period` l'axe ordonné, `value` la hauteur.",
      code: storeCode(['RibbonChart'], {
        svelte: `<RibbonChart {store} viewId="rb" category="product" period="quarter" value="sales" label="Parts par trimestre" />`,
        react: `<RibbonChart store={store} viewId="rb" category="product" period="quarter" value="sales" label="Parts par trimestre" />`,
        vue: `<RibbonChart :store="store" viewId="rb" category="product" period="quarter" value="sales" label="Parts par trimestre" />`,
      }),
    }, ChartDemo),

    // ── Cartographie ────────────────────────────────────────────────────────
    chart({
      slug: 'tilemap', name: 'TileMapChart', group: 'Cartographie géo', kind: 'tilemap', hasControls: false,
      tagline: 'Cartogramme en grille de tuiles (tile map).',
      useCase:
        "Visualiser des données régionales sur une grille cartographique stylisée où chaque cellule encode le revenu par couleur. Contrairement à la choroplèthe, les tuiles sont toutes de même taille — elles encodent la valeur par couleur, pas par aire.\n\n`label_field` est la dimension région, `col`/`row` les coordonnées grille (0-based), `value` la mesure.",
      code: storeCode(['TileMapChart'], {
        svelte: `<TileMapChart {store} viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />`,
        react: `<TileMapChart store={store} viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />`,
        vue: `<TileMapChart :store="store" viewId="tm" label_field="region" col="col" row="row" value="revenue" label="Revenu régional (grille)" />`,
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

    // ── Plages & intervalles ─────────────────────────────────────────────
    chart({
      slug: 'area-range', name: 'AreaRangeChart', group: 'Plages & intervalles', kind: 'area-range', hasControls: false,
      tagline: 'Plage d\'aire entre une borne basse et haute sur axe continu.',
      useCase:
        "Représenter une fourchette de valeurs (ex. températures min/max mensuelles) comme une aire remplie entre deux courbes. Le champ `x_field` est l'axe X (dimension), `low` et `high` les bornes numériques.\n\nIdéal pour les intervalles de confiance, les plages de prix ou les variations climatiques saisonnières.",
      code: storeCode(['AreaRangeChart'], {
        svelte: `<AreaRangeChart {store} viewId="r" x_field="month" low="low" high="high" label="Températures min/max (°C)" />`,
        react: `<AreaRangeChart store={store} viewId="r" x_field="month" low="low" high="high" label="Températures min/max (°C)" />`,
        vue: `<AreaRangeChart :store="store" viewId="r" x_field="month" low="low" high="high" label="Températures min/max (°C)" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'area-spline-range', name: 'AreaSplineRangeChart', group: 'Plages & intervalles', kind: 'area-spline-range', hasControls: false,
      tagline: 'Plage d\'aire lissée (spline) entre borne basse et haute.',
      useCase:
        "Variante lissée de l'AreaRangeChart : les courbes sont des splines cubiques pour un rendu plus fluide. Même mapping de champs : `x_field`, `low`, `high`.\n\nPréférer cette variante pour des données naturellement continues (météo, biologie, finance).",
      code: storeCode(['AreaSplineRangeChart'], {
        svelte: `<AreaSplineRangeChart {store} viewId="r" x_field="month" low="low" high="high" label="Plage lissée (°C)" />`,
        react: `<AreaSplineRangeChart store={store} viewId="r" x_field="month" low="low" high="high" label="Plage lissée (°C)" />`,
        vue: `<AreaSplineRangeChart :store="store" viewId="r" x_field="month" low="low" high="high" label="Plage lissée (°C)" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'column-range', name: 'ColumnRangeChart', group: 'Plages & intervalles', kind: 'column-range', hasControls: false,
      tagline: 'Colonnes montrant l\'étendue entre minimum et maximum par catégorie.',
      useCase:
        "Comparer l'amplitude d'une plage de valeurs par catégorie. Chaque colonne s'étend de `low` à `high`. Orientation verticale ou horizontale.\n\n`category` désigne la dimension de regroupement, `low` et `high` les mesures de borne.",
      code: storeCode(['ColumnRangeChart'], {
        svelte: `<ColumnRangeChart {store} viewId="r" category="month" low="low" high="high" label="Amplitude mensuelle (°C)" />`,
        react: `<ColumnRangeChart store={store} viewId="r" category="month" low="low" high="high" label="Amplitude mensuelle (°C)" />`,
        vue: `<ColumnRangeChart :store="store" viewId="r" category="month" low="low" high="high" label="Amplitude mensuelle (°C)" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'dumbbell', name: 'DumbbellChart', group: 'Plages & intervalles', kind: 'dumbbell', hasControls: false,
      tagline: 'Haltère reliant deux valeurs par catégorie (avant/après).',
      useCase:
        "Comparer deux états (minimum et maximum, avant et après, objectif vs réalisé) pour chaque catégorie. Les deux extrémités de la tige peuvent avoir des couleurs distinctes (`lowTone`/`highTone`) et des légendes (`lowLabel`/`highLabel`).\n\n`category` est la dimension, `low` et `high` les mesures des deux points.",
      code: storeCode(['DumbbellChart'], {
        svelte: `<DumbbellChart {store} viewId="r" category="month" low="low" high="high" lowLabel="Min" highLabel="Max" label="Écart mensuel (°C)" />`,
        react: `<DumbbellChart store={store} viewId="r" category="month" low="low" high="high" lowLabel="Min" highLabel="Max" label="Écart mensuel (°C)" />`,
        vue: `<DumbbellChart :store="store" viewId="r" category="month" low="low" high="high" lowLabel="Min" highLabel="Max" label="Écart mensuel (°C)" />`,
      }),
    }, ChartDemo),

    // ── Proportions ──────────────────────────────────────────────────────
    chart({
      slug: 'variable-pie', name: 'VariablePieChart', group: 'Proportions', kind: 'variable-pie', hasControls: false,
      tagline: 'Camembert à rayon variable encodant deux dimensions.',
      useCase:
        "Double encodage : l'angle de chaque secteur encode une mesure (part des voix) tandis que le rayon encode une seconde mesure (nombre de sièges). Idéal pour comparer à la fois la popularité et la représentation d'un ensemble d'entités.\n\n`label_field` est la dimension (libellé de chaque secteur), `value` l'angle, `z` le rayon.",
      code: storeCode(['VariablePieChart'], {
        svelte: `<VariablePieChart {store} viewId="vp" label_field="party" value="votes" z="seats" label="Partis : voix (angle) × sièges (rayon)" />`,
        react: `<VariablePieChart store={store} viewId="vp" label_field="party" value="votes" z="seats" label="Partis : voix (angle) × sièges (rayon)" />`,
        vue: `<VariablePieChart :store="store" viewId="vp" label_field="party" value="votes" z="seats" label="Partis : voix (angle) × sièges (rayon)" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'item-chart', name: 'ItemChart', group: 'Proportions', kind: 'item-chart', hasControls: false,
      tagline: 'Hémicycle de sièges (pictogramme proportionnel).',
      useCase:
        "Visualiser la répartition de sièges parlementaires ou d'unités discrètes en hémicycle. Chaque point représente un siège ; les groupes sont colorés dans l'ordre fourni.\n\n`label_field` nomme chaque groupe, `value` donne le nombre de sièges.",
      code: storeCode(['ItemChart'], {
        svelte: `<ItemChart {store} viewId="ic" label_field="party" value="seats" label="Répartition des sièges" />`,
        react: `<ItemChart store={store} viewId="ic" label_field="party" value="seats" label="Répartition des sièges" />`,
        vue: `<ItemChart :store="store" viewId="ic" label_field="party" value="seats" label="Répartition des sièges" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'waffle', name: 'WaffleChart', group: 'Proportions', kind: 'waffle', hasControls: false,
      tagline: 'Grille de cellules encodant la proportion de chaque catégorie.',
      useCase:
        "Visualiser la composition d'un tout en grille N×M où chaque cellule représente une fraction de 100 %. Chaque catégorie occupe un nombre de cellules proportionnel à sa valeur.\n\n`label_field` nomme chaque segment, `value` son poids ; `totalCells` (100) et `columns` (10) règlent la grille.",
      code: storeCode(['WaffleChart'], {
        svelte: `<WaffleChart {store} viewId="ic" label_field="party" value="seats" label="Répartition des sièges (waffle)" />`,
        react: `<WaffleChart store={store} viewId="ic" label_field="party" value="seats" label="Répartition des sièges (waffle)" />`,
        vue: `<WaffleChart :store="store" viewId="ic" label_field="party" value="seats" label="Répartition des sièges (waffle)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'column-pyramid', name: 'ColumnPyramidChart', group: 'Proportions', kind: 'column-pyramid', hasControls: false,
      tagline: 'Colonnes en pyramide pour un entonnoir ou un classement décroissant.',
      useCase:
        "Visualiser un entonnoir d'acquisition ou un classement décroissant : chaque étape est une colonne dont la largeur se réduit, formant une pyramide. Une ligne par étape (pas d'agrégation).\n\n`category` nomme chaque étape, `value` donne sa valeur.",
      code: storeCode(['ColumnPyramidChart'], {
        svelte: `<ColumnPyramidChart {store} viewId="cp" category="stage" value="users" label="Funnel d'acquisition" />`,
        react: `<ColumnPyramidChart store={store} viewId="cp" category="stage" value="users" label="Funnel d'acquisition" />`,
        vue: `<ColumnPyramidChart :store="store" viewId="cp" category="stage" value="users" label="Funnel d'acquisition" />`,
      }),
    }, ChartDemo),

    // ── Distribution & statistique (bell curve) ──────────────────────────
    chart({
      slug: 'bell-curve', name: 'BellCurveChart', group: 'Distribution & statistique', kind: 'bell-curve', hasControls: false,
      tagline: 'Courbe de Gauss tracée à partir d\'un échantillon numérique.',
      useCase:
        "Superposer la courbe de densité normale théorique à un échantillon de données. Pratique pour valider qu'une distribution est approximativement gaussienne, ou pour comparer plusieurs populations.\n\n`measure` désigne le champ numérique dont les valeurs brutes forment l'échantillon.",
      code: storeCode(['BellCurveChart'], {
        svelte: `<BellCurveChart {store} viewId="bc" measure="score" label="Distribution des scores (/100)" />`,
        react: `<BellCurveChart store={store} viewId="bc" measure="score" label="Distribution des scores (/100)" />`,
        vue: `<BellCurveChart :store="store" viewId="bc" measure="score" label="Distribution des scores (/100)" />`,
      }),
    }, ChartDemo),

    // ── Hiérarchie ───────────────────────────────────────────────────────
    chart({
      slug: 'organization', name: 'OrganizationChart', group: 'Hiérarchie', kind: 'organization', hasControls: false,
      tagline: 'Organigramme hiérarchique (nœuds plats parent → enfant).',
      useCase:
        "Représenter une hiérarchie d'organisation (entreprise, équipe, dossiers) sous forme d'arbre top-down. Les nœuds sont définis en format plat avec une relation `id`/`parentId`.\n\n`id_field` est la clé unique, `parent_field` la clé du parent (null = racine), `label_field` le libellé affiché.",
      code: storeCode(['OrganizationChart'], {
        svelte: `<OrganizationChart {store} viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Organigramme" />`,
        react: `<OrganizationChart store={store} viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Organigramme" />`,
        vue: `<OrganizationChart :store="store" viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Organigramme" />`,
      }),
    }, ChartDemo),
    chart({
      slug: 'treegraph', name: 'TreegraphChart', group: 'Hiérarchie', kind: 'treegraph', hasControls: false,
      tagline: 'Arbre hiérarchique en layout graphe (horizontal ou radial).',
      useCase:
        "Alternative à l'organigramme classique : disposition en arbre graphe pour des hiérarchies plus profondes ou plus larges. Même format de données plat (`id`/`parentId`/`label`).\n\nPréférer ce chart pour des arborescences de dossiers, de catégories imbriquées ou de thèmes de connaissances.",
      code: storeCode(['TreegraphChart'], {
        svelte: `<TreegraphChart {store} viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Arbre hiérarchique" />`,
        react: `<TreegraphChart store={store} viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Arbre hiérarchique" />`,
        vue: `<TreegraphChart :store="store" viewId="org" id_field="id" parent_field="parentId" label_field="name" label="Arbre hiérarchique" />`,
      }),
    }, ChartDemo),

    // ── Ensembles ────────────────────────────────────────────────────────
    chart({
      slug: 'venn', name: 'VennChart', group: 'Ensembles', kind: 'venn', hasControls: false,
      tagline: 'Diagramme de Venn pour visualiser des ensembles et leurs intersections.',
      useCase:
        "Montrer les recouvrements entre 2 ou 3 ensembles — compétences partagées entre équipes, audiences communes entre canaux, fonctionnalités couvertes par plusieurs produits.\n\nLa prop `areas` reçoit une liste d'objets `{sets: string[], value: number}` — un par sous-ensemble (singletons, paires, triplet). La taille de chaque zone encode le volume.",
      code: storeCode(['VennChart'], {
        svelte: `<!-- VennChart accepte les aires directement (structure ensembliste non dérivable de lignes tabulaires) -->
<VennChart areas={[
  { sets: ['Dev'],    value: 60 },
  { sets: ['Data'],   value: 50 },
  { sets: ['Design'], value: 45 },
  { sets: ['Dev', 'Data'],    value: 20 },
  { sets: ['Dev', 'Design'],  value: 15 },
  { sets: ['Data', 'Design'], value: 12 },
  { sets: ['Dev', 'Data', 'Design'], value: 8 },
]} label="Compétences partagées" />`,
        react: `<VennChart areas={[
  { sets: ['Dev'],    value: 60 },
  { sets: ['Data'],   value: 50 },
  { sets: ['Design'], value: 45 },
  { sets: ['Dev', 'Data'],    value: 20 },
  { sets: ['Dev', 'Design'],  value: 15 },
  { sets: ['Data', 'Design'], value: 12 },
  { sets: ['Dev', 'Data', 'Design'], value: 8 },
]} label="Compétences partagées" />`,
        vue: `<VennChart :areas="[
  { sets: ['Dev'],    value: 60 },
  { sets: ['Data'],   value: 50 },
  { sets: ['Design'], value: 45 },
  { sets: ['Dev', 'Data'],    value: 20 },
  { sets: ['Dev', 'Design'],  value: 15 },
  { sets: ['Data', 'Design'], value: 12 },
  { sets: ['Dev', 'Data', 'Design'], value: 8 },
]" label="Compétences partagées" />`,
      }),
    }, ChartDemo),

    // ── Texte & nuages ───────────────────────────────────────────────────
    chart({
      slug: 'word-cloud', name: 'WordCloudChart', group: 'Texte & nuages', kind: 'word-cloud', hasControls: false,
      tagline: 'Nuage de mots proportionnel aux poids/fréquences.',
      useCase:
        "Visualiser la fréquence relative de termes (mots-clés, tags, thèmes) en faisant varier la taille de police proportionnellement au poids. Pratique pour des analyses de verbatim, des nuages de tags ou des rapports de fréquences lexicales.\n\n`word_field` désigne la dimension texte, `weight` la mesure numérique de fréquence ou d'importance.",
      code: storeCode(['WordCloudChart'], {
        svelte: `<WordCloudChart {store} viewId="wc" word_field="keyword" weight="frequency" label="Mots-clés tech (fréquence)" />`,
        react: `<WordCloudChart store={store} viewId="wc" word_field="keyword" weight="frequency" label="Mots-clés tech (fréquence)" />`,
        vue: `<WordCloudChart :store="store" viewId="wc" word_field="keyword" weight="frequency" label="Mots-clés tech (fréquence)" />`,
      }),
    }, ChartDemo),

    // ── Formes ───────────────────────────────────────────────────────────
    chart({
      slug: 'polygon', name: 'PolygonChart', group: 'Formes', kind: 'polygon', hasControls: false,
      tagline: 'Polygone arbitraire défini par une liste de points (x, y).',
      useCase:
        "Tracer un contour géométrique quelconque à partir de coordonnées numériques — plan d'étage simplifié, zone géographique en coordonnées locales, silhouette de données spatiales.\n\n`x` et `y` désignent les champs de coordonnées ; les points sont reliés dans l'ordre des lignes et le dernier point est connecté au premier.",
      code: storeCode(['PolygonChart'], {
        svelte: `<PolygonChart {store} viewId="pg" x="x" y="y" label="Plan d'étage simplifié" />`,
        react: `<PolygonChart store={store} viewId="pg" x="x" y="y" label="Plan d'étage simplifié" />`,
        vue: `<PolygonChart :store="store" viewId="pg" x="x" y="y" label="Plan d'étage simplifié" />`,
      }),
    }, ChartDemo),

    // ── Réseaux & graphes ────────────────────────────────────────────────
    chart({
      slug: 'force-graph', name: 'ForceGraph', group: 'Réseaux & graphes', kind: 'force-graph', hasControls: false,
      tagline: 'Graphe force-directed pour réseaux et dépendances entre entités.',
      useCase:
        "Représenter les dépendances entre services, les relations sociales ou tout réseau orienté. Les nœuds sont déduits automatiquement des colonnes source/target ; le poids module l'épaisseur des arêtes et le rayon des nœuds.\n\n`source` et `target` sont des identifiants de nœuds ; `weight` est optionnel.",
      code: storeCode(['ForceGraph'], {
        svelte: `<ForceGraph {store} viewId="fg" source="source" target="target" weight="weight" label="Dépendances entre microservices" />`,
        react: `<ForceGraph store={store} viewId="fg" source="source" target="target" weight="weight" label="Dépendances entre microservices" />`,
        vue: `<ForceGraph :store="store" viewId="fg" source="source" target="target" weight="weight" label="Dépendances entre microservices" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'arc-diagram', name: 'ArcDiagramChart', group: 'Réseaux & graphes', kind: 'arc-diagram', hasControls: false,
      tagline: 'Liens pondérés entre nœuds alignés sur un axe, reliés par des arcs.',
      useCase:
        "Visualiser les relations et la force des connexions entre entités alignées sur une ligne — co-occurrences, collaborations, flux entre nœuds. L'épaisseur de l'arc reflète le poids du lien.\n\n`source` et `target` désignent les extrémités du lien, `weight` sa force.",
      code: storeCode(['ArcDiagramChart'], {
        svelte: `<ArcDiagramChart {store} viewId="ad" source="source" target="target" weight="weight" label="Collaborations entre équipes" />`,
        react: `<ArcDiagramChart store={store} viewId="ad" source="source" target="target" weight="weight" label="Collaborations entre équipes" />`,
        vue: `<ArcDiagramChart :store="store" viewId="ad" source="source" target="target" weight="weight" label="Collaborations entre équipes" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'dependency-wheel', name: 'DependencyWheelChart', group: 'Réseaux & graphes', kind: 'dependency-wheel', hasControls: false,
      tagline: 'Roue de dépendances : flux circulaires pondérés entre modules ou entités.',
      useCase:
        "Visualiser les dépendances et imports entre modules d'une application, ou tout flux orienté entre entités, sur une disposition circulaire où l'épaisseur des rubans reflète le poids.\n\n`source` et `target` désignent les extrémités du lien, `weight` sa force.",
      code: storeCode(['DependencyWheelChart'], {
        svelte: `<DependencyWheelChart {store} viewId="dw" source="source" target="target" weight="weight" label="Dépendances entre modules" />`,
        react: `<DependencyWheelChart store={store} viewId="dw" source="source" target="target" weight="weight" label="Dépendances entre modules" />`,
        vue: `<DependencyWheelChart :store="store" viewId="dw" source="source" target="target" weight="weight" label="Dépendances entre modules" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'scatter-matrix', name: 'ScatterPlotMatrix', group: 'Couche analytique', kind: 'scatter-matrix', hasControls: false,
      tagline: 'Matrice de nuages (SPLOM) : toutes les paires de mesures en un coup d\'œil.',
      useCase:
        "Comparer simultanément N mesures deux à deux dans une grille N×N de nuages de points — exploration multivariée des corrélations et structures. Chaque cellule est un vrai nuage de points du design system.\n\n`measures` liste les champs numériques à croiser.",
      code: storeCode(['ScatterPlotMatrix'], {
        svelte: `<ScatterPlotMatrix {store} viewId="c" measures={['price', 'units', 'marginRate']} label="Matrice de nuages" />`,
        react: `<ScatterPlotMatrix store={store} viewId="c" measures={['price', 'units', 'marginRate']} label="Matrice de nuages" />`,
        vue: `<ScatterPlotMatrix :store="store" view-id="c" :measures="['price', 'units', 'marginRate']" label="Matrice de nuages" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'animated-bubble', name: 'AnimatedBubbleChart', group: 'Couche analytique', kind: 'animated-bubble', hasControls: false,
      tagline: 'Nuage de bulles animé (Gapminder) : trois mesures dans le temps, en lecture continue.',
      useCase:
        "Visualiser l'évolution simultanée de trois mesures (x, y, taille) sur une dimension temporelle, avec lecture/pause et curseur de pas — idéal pour comparer des entités sur la durée (PIB/hab vs espérance de vie vs population).\n\n`x`/`y`/`size` sont des mesures, `time` la dimension temporelle, `series` colore les bulles.",
      code: storeCode(['AnimatedBubbleChart'], {
        svelte: `<AnimatedBubbleChart {store} viewId="ab" x="gdpPerCapita" y="lifeExpectancy" size="population" time="year" series="country" label="Espérance de vie vs PIB/hab" />`,
        react: `<AnimatedBubbleChart store={store} viewId="ab" x="gdpPerCapita" y="lifeExpectancy" size="population" time="year" series="country" label="Espérance de vie vs PIB/hab" />`,
        vue: `<AnimatedBubbleChart :store="store" viewId="ab" x="gdpPerCapita" y="lifeExpectancy" size="population" time="year" series="country" label="Espérance de vie vs PIB/hab" />`,
      }),
    }, ChartDemo),

    // ── Observabilité ────────────────────────────────────────────────────
    chart({
      slug: 'state-timeline', name: 'StateTimelineChart', group: 'Observabilité', kind: 'state-timeline', hasControls: false,
      tagline: "Bandes d'états discrets dans le temps, par service ou ressource.",
      useCase:
        "Visualiser l'historique de santé de plusieurs services sur une période : chaque lane est un service, chaque segment coloré indique l'état (up / degraded / down). Idéal pour les tableaux de bord d'observabilité, d'uptime ou de SLA.\n\n`series` désigne la lane, `start`/`end` les bornes temporelles, `state` la valeur d'état (couleur stable par état).",
      code: storeCode(['StateTimelineChart'], {
        svelte: `<StateTimelineChart {store} viewId="st" series="service" start="start" end="end" state="state" label="États des services (24 h)" />`,
        react: `<StateTimelineChart store={store} viewId="st" series="service" start="start" end="end" state="state" label="États des services (24 h)" />`,
        vue: `<StateTimelineChart :store="store" viewId="st" series="service" start="start" end="end" state="state" label="États des services (24 h)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'status-history', name: 'StatusHistoryChart', group: 'Observabilité', kind: 'status-history', hasControls: false,
      tagline: 'Jalons de statut ponctuels par service sur un axe temporel.',
      useCase:
        "Visualiser l'historique de statut point-par-point (ok / warn / crit) de plusieurs services sur une même fenêtre horaire. Chaque bucket correspond à un instant mesuré — idéal pour corréler des incidents entre services.\n\n`series` désigne la lane, `at` l'instant, `value` le statut (couleur stable par statut).",
      code: storeCode(['StatusHistoryChart'], {
        svelte: `<StatusHistoryChart {store} viewId="sh" series="service" at="at" value="status" label="Historique de statut (8 h)" />`,
        react: `<StatusHistoryChart store={store} viewId="sh" series="service" at="at" value="status" label="Historique de statut (8 h)" />`,
        vue: `<StatusHistoryChart :store="store" viewId="sh" series="service" at="at" value="status" label="Historique de statut (8 h)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'anomaly-swimlane', name: 'AnomalySwimLaneChart', group: 'Observabilité', kind: 'anomaly-swimlane', hasControls: false,
      tagline: "Swim lanes de scores d'anomalie ML par job dans le temps.",
      useCase:
        "Surveiller l'évolution des scores d'anomalie (continus) de plusieurs jobs ML sur une fenêtre temporelle ; l'intensité de couleur encode le score normalisé Low→High. Idéal pour les dashboards AIOps.\n\n`job` désigne la lane, `at` l'instant du bucket, `score` la valeur d'anomalie ; `max` borne l'échelle.",
      code: storeCode(['AnomalySwimLaneChart'], {
        svelte: `<AnomalySwimLaneChart {store} viewId="asl" job="job" at="at" score="score" max={100} label="Scores d'anomalie ML" />`,
        react: `<AnomalySwimLaneChart store={store} viewId="asl" job="job" at="at" score="score" max={100} label="Scores d'anomalie ML" />`,
        vue: `<AnomalySwimLaneChart :store="store" viewId="asl" job="job" at="at" score="score" :max="100" label="Scores d'anomalie ML" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'flamegraph', name: 'FlamegraphChart', group: 'Observabilité', kind: 'flamegraph', hasControls: false,
      tagline: 'Profil d’exécution en flammes (call stacks).',
      useCase:
        "Visualiser un profil CPU ou un arbre d'appels : chaque barre est une frame, sa largeur est proportionnelle au temps passé, l'empilement vertical suit la pile d'appels. Indispensable pour repérer les hot paths en profiling (continuous profiling type Grafana Pyroscope).\n\n`id`/`parentId` décrivent l'arbre, `name` est le libellé de la frame, `value` le temps (largeur).",
      code: storeCode(['FlamegraphChart'], {
        svelte: `<FlamegraphChart {store} viewId="fg" id="id" parentId="parent" name="name" value="value" label="Profil CPU (flamegraph)" />`,
        react: `<FlamegraphChart store={store} viewId="fg" id="id" parentId="parent" name="name" value="value" label="Profil CPU (flamegraph)" />`,
        vue: `<FlamegraphChart :store="store" viewId="fg" id="id" parentId="parent" name="name" value="value" label="Profil CPU (flamegraph)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'trace-waterfall', name: 'TraceWaterfallChart', group: 'Observabilité', kind: 'trace-waterfall', hasControls: false,
      tagline: 'Cascade des spans d’une trace distribuée.',
      useCase:
        "Inspecter une trace distribuée : chaque span est une barre positionnée par son `start` et dimensionnée par sa `duration`, l'imbrication parent/enfant matérialise le chemin critique entre services. C'est la vue waterfall des APM (Grafana Tempo, Jaeger).\n\n`spanId`/`parentSpanId` décrivent l'arbre des spans, `service` la lane, `start`/`duration` la position temporelle.",
      code: storeCode(['TraceWaterfallChart'], {
        svelte: `<TraceWaterfallChart {store} viewId="tw" spanId="spanId" parentSpanId="parentSpanId" service="service" start="start" duration="duration" label="Trace distribuée (waterfall)" />`,
        react: `<TraceWaterfallChart store={store} viewId="tw" spanId="spanId" parentSpanId="parentSpanId" service="service" start="start" duration="duration" label="Trace distribuée (waterfall)" />`,
        vue: `<TraceWaterfallChart :store="store" viewId="tw" spanId="spanId" parentSpanId="parentSpanId" service="service" start="start" duration="duration" label="Trace distribuée (waterfall)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'decomposition-tree', name: 'DecompositionTreeChart', group: 'Hiérarchie', kind: 'decomposition-tree', hasControls: false,
      tagline: 'Décomposition hiérarchique d’une mesure par niveaux.',
      useCase:
        "Décomposer une mesure agrégée niveau par niveau (region → category → product) pour comprendre d'où vient une valeur, à la manière du Decomposition Tree de Power BI. Chaque niveau ventile le total du niveau parent.\n\n`measure` est la mesure agrégée, `levels` la liste ordonnée des dimensions de décomposition.",
      code: storeCode(['DecompositionTreeChart'], {
        svelte: `<DecompositionTreeChart {store} viewId="dt" measure="revenue" levels={['region', 'category', 'product']} label="Décomposition du CA" />`,
        react: `<DecompositionTreeChart store={store} viewId="dt" measure="revenue" levels={['region', 'category', 'product']} label="Décomposition du CA" />`,
        vue: `<DecompositionTreeChart :store="store" viewId="dt" measure="revenue" :levels="['region', 'category', 'product']" label="Décomposition du CA" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'density-2d', name: 'Density2DChart', group: 'Distribution & statistique', kind: 'density-2d', hasControls: false,
      tagline: 'Densité 2D binnée d’un nuage de points.',
      useCase:
        "Révéler la densité d'un nuage de points trop dense pour un scatter classique : le plan est découpé en cellules (`bins`) dont l'intensité encode le nombre de points. Équivalent non-géo du hexbin/heatmap de densité (Tableau, Dataiku).\n\n`x`/`y` sont les axes, `bins` la résolution de la grille.",
      code: storeCode(['Density2DChart'], {
        svelte: `<Density2DChart {store} viewId="d2" x="x" y="y" bins={24} label="Densité 2D (nuage binné)" />`,
        react: `<Density2DChart store={store} viewId="d2" x="x" y="y" bins={24} label="Densité 2D (nuage binné)" />`,
        vue: `<Density2DChart :store="store" viewId="d2" x="x" y="y" :bins="24" label="Densité 2D (nuage binné)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'event-feed', name: 'EventFeedPanel', group: 'Observabilité', kind: 'event-feed', hasControls: false,
      tagline: 'Flux d’événements datés scrollable.',
      useCase:
        "Présenter un flux d'événements horodatés (déploiements, alertes, scalings…) trié du plus récent au plus ancien, avec une pastille de sévérité tokenisée (info/success/warning/error). C'est le panneau « event feed » des outils d'observabilité (New Relic, Datadog).\n\n`at` est l'horodatage (tri desc), `type` la catégorie, `severity` pilote la couleur, `message` le texte.",
      code: storeCode(['EventFeedPanel'], {
        svelte: `<EventFeedPanel {store} viewId="ef" at="at" type="type" severity="severity" message="message" maxHeight={360} label="Flux d'événements" />`,
        react: `<EventFeedPanel store={store} viewId="ef" at="at" type="type" severity="severity" message="message" maxHeight={360} label="Flux d'événements" />`,
        vue: `<EventFeedPanel :store="store" viewId="ef" at="at" type="type" severity="severity" message="message" :maxHeight="360" label="Flux d'événements" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'vector-field', name: 'VectorFieldChart', group: 'Distribution & statistique', kind: 'vector-field', hasControls: false,
      tagline: 'Champ de vecteurs (magnitude + direction).',
      useCase:
        "Visualiser un champ vectoriel 2D : à chaque point `(x, y)` une flèche dont la longueur encode la magnitude et l'orientation la direction (en degrés). Idéal pour les champs de flux, de vent ou de gradient (équivalent du vector plot de Highcharts / SAS).\n\n`x`/`y` positionnent la flèche, `length` sa magnitude, `direction` son angle en degrés.",
      code: storeCode(['VectorFieldChart'], {
        svelte: `<VectorFieldChart {store} viewId="vf" x="x" y="y" length="length" direction="direction" label="Champ de vecteurs (flux)" />`,
        react: `<VectorFieldChart store={store} viewId="vf" x="x" y="y" length="length" direction="direction" label="Champ de vecteurs (flux)" />`,
        vue: `<VectorFieldChart :store="store" viewId="vf" x="x" y="y" length="length" direction="direction" label="Champ de vecteurs (flux)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'contour', name: 'ContourChart', group: 'Distribution & statistique', kind: 'contour', hasControls: false,
      tagline: 'Bandes de contour sur grille 2D.',
      useCase:
        "Représenter un champ scalaire continu (altitude, température, densité) par des bandes d'iso-valeurs sur une grille 2D — la carte de contour classique (Highcharts contour, cartes topographiques).\n\n`x`/`y` positionnent la cellule, `value` est la valeur scalaire (bande de couleur), `levels` fixe le nombre de paliers.",
      code: storeCode(['ContourChart'], {
        svelte: `<ContourChart {store} viewId="ct" x="x" y="y" value="value" levels={8} label="Contour (champ scalaire 2D)" />`,
        react: `<ContourChart store={store} viewId="ct" x="x" y="y" value="value" levels={8} label="Contour (champ scalaire 2D)" />`,
        vue: `<ContourChart :store="store" viewId="ct" x="x" y="y" value="value" :levels="8" label="Contour (champ scalaire 2D)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'wind-barb', name: 'WindBarbChart', group: 'Distribution & statistique', kind: 'wind-barb', hasControls: false,
      tagline: 'Barbules de vent météo sur axe temporel.',
      useCase:
        "Afficher l'évolution du vent dans le temps avec les barbules météo conventionnelles : chaque hampe encode la direction (d'où vient le vent, 0° = Nord) et les barbules la vitesse en nœuds (traits 5/10, fanion 50). Standard météorologique (Highcharts windbarb).\n\n`at` est l'instant, `speed` la vitesse en nœuds, `direction` la provenance en degrés.",
      code: storeCode(['WindBarbChart'], {
        svelte: `<WindBarbChart {store} viewId="wb" at="at" speed="speed" direction="direction" label="Vent (barbules)" />`,
        react: `<WindBarbChart store={store} viewId="wb" at="at" speed="speed" direction="direction" label="Vent (barbules)" />`,
        vue: `<WindBarbChart :store="store" viewId="wb" at="at" speed="speed" direction="direction" label="Vent (barbules)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'renko', name: 'RenkoChart', group: 'Finance', kind: 'renko', hasControls: false,
      tagline: 'Briques Renko (filtrage du bruit de prix).',
      useCase:
        "Filtrer le bruit temporel d'une série de prix : une nouvelle brique n'apparaît que lorsque le cours franchit une taille de boîte (`boxSize`), indépendamment du temps. Hausse en vert, baisse en rouge — la lecture de tendance classique du Renko (Highcharts Stock).\n\n`date` ordonne la série, `close` est le cours de clôture, `boxSize` la taille de brique.",
      code: storeCode(['RenkoChart'], {
        svelte: `<RenkoChart {store} viewId="rk" date="date" close="close" boxSize={3} label="Renko (briques de prix)" />`,
        react: `<RenkoChart store={store} viewId="rk" date="date" close="close" boxSize={3} label="Renko (briques de prix)" />`,
        vue: `<RenkoChart :store="store" viewId="rk" date="date" close="close" :boxSize="3" label="Renko (briques de prix)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'point-and-figure', name: 'PointAndFigureChart', group: 'Finance', kind: 'point-and-figure', hasControls: false,
      tagline: 'Colonnes X/O Point & Figure.',
      useCase:
        "Représenter les mouvements de prix par colonnes de X (hausse) et O (baisse), sans axe temporel régulier : une nouvelle colonne se forme à chaque renversement de `reversal` boîtes. Outil d'analyse technique pur signal (Highcharts Stock).\n\n`date` ordonne la série, `close` le cours, `boxSize` la taille de boîte, `reversal` le seuil de renversement.",
      code: storeCode(['PointAndFigureChart'], {
        svelte: `<PointAndFigureChart {store} viewId="pf" date="date" close="close" boxSize={2} reversal={3} label="Point & Figure (X/O)" />`,
        react: `<PointAndFigureChart store={store} viewId="pf" date="date" close="close" boxSize={2} reversal={3} label="Point & Figure (X/O)" />`,
        vue: `<PointAndFigureChart :store="store" viewId="pf" date="date" close="close" :boxSize="2" :reversal="3" label="Point & Figure (X/O)" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'palette-picker', name: 'PalettePicker', group: 'Couche analytique', kind: 'palette-picker', hasControls: false,
      tagline: 'Aperçu des trois familles d’échelles de couleur.',
      useCase:
        "Différencier les trois familles d'échelles : **catégorielle** (teintes distinctes pour des catégories non ordonnées), **séquentielle** (rampe mono-teinte clair→foncé pour une mesure continue Low→High — la bonne échelle pour un heatmap), et **divergente** (deux teintes via un neutre central, pour une valeur signée/centrée). Les rampes séquentielle et divergente sont interpolées en **OKLab** (`dataviz-core`) → perceptuellement régulières, sans zone terne au milieu (contrairement à un dégradé sRGB naïf). Rendu 100% via les composants DS `ColorSwatch` + `ColorScaleBar` ; les couleurs viennent des tokens DS (ici des palettes d'exemple).",
      code: storeCode(['PalettePicker'], {
        svelte: `<PalettePicker categorical={cat} sequential={seq} diverging={div} min="Low" max="High" label="Revenu" />`,
        react: `<PalettePicker categorical={cat} sequential={seq} diverging={div} min="Low" max="High" label="Revenu" />`,
        vue: `<PalettePicker :categorical="cat" :sequential="seq" :diverging="div" min="Low" max="High" label="Revenu" />`,
      }),
    }, ChartDemo),

    chart({
      slug: 'correlation-matrix', name: 'CorrelationMatrix', group: 'Distribution & statistique', kind: 'correlation-matrix', hasControls: false,
      tagline: 'Matrice de corrélation de Pearson entre mesures numériques.',
      useCase:
        "Identifier les liens statistiques entre KPIs : chaque cellule encode le coefficient de Pearson (−1 à 1) entre deux mesures, rendu en carte de chaleur. Diagonale = 1.\n\n`measures` liste les champs numériques à corréler.",
      code: storeCode(['CorrelationMatrix'], {
        svelte: `<CorrelationMatrix {store} viewId="c" measures={['price', 'units', 'marginRate', 'revenue']} label="Corrélations" />`,
        react: `<CorrelationMatrix store={store} viewId="c" measures={['price', 'units', 'marginRate', 'revenue']} label="Corrélations" />`,
        vue: `<CorrelationMatrix :store="store" view-id="c" :measures="['price', 'units', 'marginRate', 'revenue']" label="Corrélations" />`,
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
