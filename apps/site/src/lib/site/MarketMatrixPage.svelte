<!-- Page Couverture marché : matrice de mapping composants ↔ 9 solutions. -->
<script lang="ts">
  import { Badge } from '@sentropic/design-system-svelte';
  import {
    MARKET_SOLUTIONS,
    MARKET_COVERAGE,
    MARKET_SUMMARY,
  } from '../data/market-matrix';

  // Grouper les lignes par famille (group)
  const groups = $derived.by(() => {
    const map = new Map<string, typeof MARKET_COVERAGE>();
    for (const row of MARKET_COVERAGE) {
      if (!map.has(row.group)) map.set(row.group, []);
      map.get(row.group)!.push(row);
    }
    return Array.from(map.entries()).map(([label, rows]) => ({ label, rows }));
  });

  // Mapping statut → tone DS Badge
  function badgeTone(status: 'covered' | 'gap-filled' | 'fr-ds'): 'success' | 'info' | 'warning' {
    if (status === 'covered') return 'success';
    if (status === 'gap-filled') return 'info';
    return 'warning';
  }

  function badgeLabel(status: 'covered' | 'gap-filled' | 'fr-ds', since?: string): string {
    if (status === 'covered') return 'Couvert';
    if (status === 'gap-filled') return since ? `Comblé ${since}` : 'Comblé';
    return 'FR DS';
  }
</script>

<div class="dv-prose">
  <h1 class="dv-h1">Couverture marché</h1>
  <p class="dv-lead">
    Audit de {MARKET_SUMMARY.solutions} solutions de référence (Grafana, New Relic, Kibana, Highcharts,
    Tableau, Power BI, Qlik, Dataiku, SAS Visual Analytics) : {MARKET_SUMMARY.total} capacités
    inventoriées, {MARKET_SUMMARY.covered} couvertes d'origine, {MARKET_SUMMARY.gapFilled} écarts comblés
    (<em>gap-filled</em>) et {MARKET_SUMMARY.frDs} composants demandés au design system (<em>fr-ds</em>).
  </p>

  <!-- Bandeau de synthèse -->
  <div class="mm-summary">
    <div class="mm-summary__stat">
      <span class="mm-summary__value">{MARKET_SUMMARY.solutions}</span>
      <span class="mm-summary__label">solutions auditées</span>
    </div>
    <div class="mm-summary__stat">
      <span class="mm-summary__value">{MARKET_SUMMARY.total}</span>
      <span class="mm-summary__label">composants</span>
    </div>
    <div class="mm-summary__stat">
      <Badge tone="success">{MARKET_SUMMARY.covered} couverts</Badge>
    </div>
    <div class="mm-summary__stat">
      <Badge tone="info">{MARKET_SUMMARY.gapFilled} comblés</Badge>
    </div>
    <div class="mm-summary__stat">
      <Badge tone="warning">{MARKET_SUMMARY.frDs} FR DS</Badge>
    </div>
  </div>

  <!-- Légende -->
  <div class="mm-legend">
    <span class="mm-legend__item"><span class="mm-check">✓</span> Présent dans la solution</span>
    <span class="mm-legend__sep" aria-hidden="true">·</span>
    <Badge tone="success">Couvert</Badge> couvert d'origine
    <span class="mm-legend__sep" aria-hidden="true">·</span>
    <Badge tone="info">Comblé v0.x.x</Badge> écart comblé dans dataviz
    <span class="mm-legend__sep" aria-hidden="true">·</span>
    <Badge tone="warning">FR DS</Badge> demandé au design system
  </div>

  <!-- Matrice -->
  {#each groups as group (group.label)}
    <section class="dv-section mm-group">
      <h2>{group.label}</h2>
      <div class="mm-table-wrap">
        <table class="mm-table">
          <thead>
            <tr>
              <th class="mm-th mm-th--component" scope="col">Composant</th>
              {#each MARKET_SOLUTIONS as sol (sol.id)}
                <th class="mm-th mm-th--solution" scope="col" title={sol.name}>{sol.name}</th>
              {/each}
              <th class="mm-th mm-th--status" scope="col">Statut</th>
            </tr>
          </thead>
          <tbody>
            {#each group.rows as row (row.component)}
              <tr class="mm-tr">
                <td class="mm-td mm-td--component">
                  <span class="mm-component-name">{row.component}</span>
                  {#if row.marketNames}
                    <span class="mm-market-names">{row.marketNames}</span>
                  {/if}
                </td>
                {#each MARKET_SOLUTIONS as sol (sol.id)}
                  <td class="mm-td mm-td--check" aria-label="{sol.name}: {row.inSolutions.includes(sol.id) ? 'présent' : 'absent'}">
                    {#if row.inSolutions.includes(sol.id)}
                      <span class="mm-check" aria-hidden="true">✓</span>
                    {/if}
                  </td>
                {/each}
                <td class="mm-td mm-td--status">
                  <Badge tone={badgeTone(row.status)}>
                    {badgeLabel(row.status, row.since)}
                  </Badge>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </section>
  {/each}
</div>

<style>
  /* ── Bandeau de synthèse ───────────────────────────────────────────── */
  .mm-summary {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-space-4, 1rem);
    align-items: center;
    padding: var(--st-space-4, 1rem) var(--st-space-5, 1.25rem);
    border: 1px solid var(--st-color-border-subtle, currentColor);
    border-radius: var(--st-radius-md, 0.5rem);
    background: var(--st-color-surface-raised, transparent);
    margin-bottom: var(--st-space-6, 1.5rem);
  }

  .mm-summary__stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--st-space-1, 0.25rem);
  }

  .mm-summary__value {
    font-size: var(--st-font-size-2xl, 1.5rem);
    font-weight: var(--st-font-weight-bold, 700);
    line-height: 1;
    color: var(--st-color-text-primary, inherit);
  }

  .mm-summary__label {
    font-size: var(--st-font-size-xs, 0.75rem);
    color: var(--st-color-text-subtle, inherit);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* ── Légende ───────────────────────────────────────────────────────── */
  .mm-legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--st-space-2, 0.5rem);
    align-items: center;
    font-size: var(--st-font-size-sm, 0.875rem);
    color: var(--st-color-text-subtle, inherit);
    margin-bottom: var(--st-space-6, 1.5rem);
  }

  .mm-legend__sep {
    color: var(--st-color-border-default, currentColor);
    font-size: var(--st-font-size-lg, 1.125rem);
  }

  .mm-legend__item {
    display: flex;
    align-items: center;
    gap: var(--st-space-1, 0.25rem);
  }

  /* ── Groupe / section ──────────────────────────────────────────────── */
  .mm-group {
    margin-bottom: var(--st-space-8, 2rem);
  }

  /* ── Table wrapper (responsive) ───────────────────────────────────── */
  .mm-table-wrap {
    overflow-x: auto;
    border: 1px solid var(--st-color-border-subtle, currentColor);
    border-radius: var(--st-radius-md, 0.5rem);
  }

  /* ── Table ─────────────────────────────────────────────────────────── */
  .mm-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--st-font-size-sm, 0.875rem);
    color: var(--st-color-text-primary, inherit);
  }

  .mm-th {
    padding: var(--st-space-2, 0.5rem) var(--st-space-3, 0.75rem);
    text-align: center;
    font-weight: var(--st-font-weight-semibold, 600);
    font-size: var(--st-font-size-xs, 0.75rem);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--st-color-text-subtle, inherit);
    border-bottom: 1px solid var(--st-color-border-subtle, currentColor);
    white-space: nowrap;
    background: var(--st-color-surface-raised, transparent);
  }

  .mm-th--component {
    text-align: left;
    min-width: 14rem;
    position: sticky;
    left: 0;
    z-index: 1;
    background: var(--st-color-surface-raised, var(--st-color-surface-default, transparent));
  }

  .mm-th--solution {
    min-width: 5.5rem;
    max-width: 6rem;
  }

  .mm-th--status {
    min-width: 8rem;
  }

  .mm-tr:nth-child(even) {
    background: var(--st-color-surface-subtle, transparent);
  }

  .mm-tr:hover {
    background: var(--st-color-surface-hover, transparent);
  }

  .mm-td {
    padding: var(--st-space-2, 0.5rem) var(--st-space-3, 0.75rem);
    border-bottom: 1px solid var(--st-color-border-subtle, currentColor);
    vertical-align: middle;
  }

  .mm-td--component {
    text-align: left;
    position: sticky;
    left: 0;
    background: inherit;
    z-index: 1;
  }

  .mm-tr:nth-child(even) .mm-td--component {
    background: var(--st-color-surface-subtle, transparent);
  }

  .mm-tr:hover .mm-td--component {
    background: var(--st-color-surface-hover, transparent);
  }

  .mm-td--check {
    text-align: center;
  }

  .mm-td--status {
    text-align: center;
    white-space: nowrap;
  }

  .mm-component-name {
    display: block;
    font-weight: var(--st-font-weight-medium, 500);
    color: var(--st-color-text-primary, inherit);
    font-family: var(--st-font-family-mono, monospace);
    font-size: var(--st-font-size-xs, 0.75rem);
  }

  .mm-market-names {
    display: block;
    font-size: var(--st-font-size-xs, 0.75rem);
    color: var(--st-color-text-subtle, inherit);
    margin-top: var(--st-space-1, 0.25rem);
    font-style: italic;
  }

  .mm-check {
    color: var(--st-color-success-default, currentColor);
    font-weight: var(--st-font-weight-bold, 700);
  }
</style>
