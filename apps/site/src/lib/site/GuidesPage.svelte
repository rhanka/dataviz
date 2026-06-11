<!-- Getting-started guide: install, data model, store, golden rule. -->
<script lang="ts">
  import { Breadcrumb } from '@sentropic/design-system-svelte';
  import CodeBlock from './CodeBlock.svelte';
  import type { CodeTabs } from '../registry/types';

  const install: CodeTabs = {
    svelte: `npm i @sentropic/dataviz-svelte @sentropic/design-system-svelte @sentropic/design-system-themes`,
    react: `npm i @sentropic/dataviz-react @sentropic/design-system-react @sentropic/design-system-themes`,
    vue: `npm i @sentropic/dataviz-vue @sentropic/design-system-vue @sentropic/design-system-themes`,
  };

  const setup: CodeTabs = {
    svelte: `// data.ts — your model + rows
import type { DataModel, Row } from '@sentropic/dataviz-svelte';

export const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'date', label: 'Date', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenu', aggregation: 'sum' }],
};

export const data: Row[] = [/* … your rows … */];`,
    react: `// data.ts — your model + rows
import type { DataModel, Row } from '@sentropic/dataviz-react';

export const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'date', label: 'Date', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenu', aggregation: 'sum' }],
};

export const data: Row[] = [/* … your rows … */];`,
    vue: `// data.ts — your model + rows
import type { DataModel, Row } from '@sentropic/dataviz-vue';

export const model: DataModel = {
  dimensions: [
    { id: 'region', label: 'Région', type: 'discrete' },
    { id: 'date', label: 'Date', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenu', aggregation: 'sum' }],
};

export const data: Row[] = [/* … your rows … */];`,
  };

  const theme: CodeTabs = {
    svelte: `// Inject a design-system theme once (tokens drive every visual).
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';
import '@sentropic/design-system-svelte/styles.css'; // or react/styles.css

const style = document.createElement('style');
style.textContent = compileTheme(sentTechTheme, { selector: ':root' });
document.head.appendChild(style);`,
    react: `// Inject a design-system theme once (tokens drive every visual).
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';
import '@sentropic/design-system-react/styles.css';

const style = document.createElement('style');
style.textContent = compileTheme(sentTechTheme, { selector: ':root' });
document.head.appendChild(style);`,
    vue: `// Inject a design-system theme once (tokens drive every visual).
import { compileTheme, sentTechTheme } from '@sentropic/design-system-themes';
import '@sentropic/design-system-vue/styles.css';

const style = document.createElement('style');
style.textContent = compileTheme(sentTechTheme, { selector: ':root' });
document.head.appendChild(style);`,
  };
</script>

<div class="dv-prose">
  <Breadcrumb items={[{ label: 'Guides', current: true }]} label="Fil d'Ariane" />
  <h1 class="dv-h1">Prise en main</h1>
  <p class="dv-lead">
    Trois étapes : installer, déclarer un modèle + des lignes, créer un store. La
    présentation vient ensuite gratuitement du design system.
  </p>

  <section class="dv-section">
    <h2>1. Installer</h2>
    <CodeBlock code={install} />
  </section>

  <section class="dv-section">
    <h2>2. Déclarer le modèle de données</h2>
    <p>
      Le modèle décrit vos <b>dimensions</b> (discrètes ou continues) et vos
      <b>mesures</b> (avec agrégation). Les lignes sont de simples objets clé →
      valeur. Tout composant lit ce contrat via le store.
    </p>
    <CodeBlock code={setup} />
  </section>

  <section class="dv-section">
    <h2>3. Créer un store et brancher des composants</h2>
    <p>
      <code>createDashboardStore({'{ model, data }'})</code> renvoie l'état
      partagé. Passez-le à n'importe quel composant : charts, filtres, drill,
      pivots… Ils se synchronisent automatiquement (cross-filter, drill,
      sélection).
    </p>
    <p>
      Voir chaque page composant pour un exemple complet copiable dans les trois
      frameworks.
    </p>
  </section>

  <section class="dv-section">
    <h2>Thème &amp; couleurs</h2>
    <p>
      Aucune couleur n'est codée en dur : chaque visuel lit des
      <b>tokens du design system</b>. Le thème Sentropic est injecté une fois et
      fournit les 8 couleurs de séries via <code>--st-semantic-data-categoryN</code> ;
      le mode sombre s'active via <code>data-color-mode="dark"</code>. Aucune
      palette « maison » : les couleurs sont exactement celles du design system.
    </p>
    <CodeBlock code={theme} />
  </section>

  <section class="dv-section">
    <h2>Golden rule</h2>
    <p>
      <b>Présentation = design system ; dataviz = état &amp; orchestration.</b>
      Cross-filter, drill, sync, signets, scoping et modèle de données viennent
      de <code>dataviz-core</code> ; tout le rendu (axes, contraste, a11y) vient
      des surfaces du design system Sentropic. Rien n'est peint « à la main ».
    </p>
  </section>
</div>
