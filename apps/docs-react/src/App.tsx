import { useMemo } from 'react';
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
} from '@sentropic/dataviz-react';
import { model, data, crossfilter } from './data.js';
import './app.css';

const legendLabels = { byCountry: 'Pays', byProduct: 'Produit' };

export function App() {
  const store = useMemo(() => createDashboardStore({ model, data, crossfilter }), []);
  return (
    <main className="page">
      <header className="page__head">
        <div>
          <h1>dataviz — démo cross-filter (React)</h1>
          <p>
            Tout est piloté par l'état partagé <code>@sentropic/dataviz-core</code> ; la présentation
            vient à 100 % du design system Sent Tech.
          </p>
        </div>
        <ExportMenu store={store} />
      </header>

      <section className="bar">
        <DashboardFilterBar store={store} />
        <SelectionLegend store={store} labels={legendLabels} />
      </section>

      <section className="controls">
        <ValueSlicer store={store} dimension="country" orientation="horizontal" />
        <TopNFilter store={store} dimension="product" measure="sales" defaultN={2} label="Top N produits" />
      </section>

      <section className="charts">
        <article className="card">
          <h2>Ventes par pays</h2>
          <p className="hint">Clique une barre pour filtrer les autres vues.</p>
          <CrossfilteredBarChart store={store} viewId="byCountry" dimension="country" measure="sales" label="Ventes par pays" />
        </article>
        <article className="card">
          <h2>Ventes par produit</h2>
          <p className="hint">Lié à la sélection « Pays » (et inversement).</p>
          <CrossfilteredBarChart store={store} viewId="byProduct" dimension="product" measure="sales" label="Ventes par produit" tone="category2" />
        </article>
      </section>

      <section className="card">
        <h2>Small multiples — ventes par produit, par pays</h2>
        <SmallMultiples store={store} viewId="facets" facetBy="country" dimension="product" measure="sales" label="Ventes" columns={3} />
      </section>

      <section className="card">
        <h2>Drill — pays → ville</h2>
        <DrillBreadcrumb store={store} viewId="drill" hierarchy={['country', 'city']} />
        <DrillBarChart store={store} viewId="drill" hierarchy={['country', 'city']} measure="sales" label="Ventes (drill)" tone="category3" />
      </section>

      <section className="card">
        <h2>Enregistrements (cross-filtrés)</h2>
        <RecordsTable store={store} pageSize={8} />
      </section>
    </main>
  );
}
