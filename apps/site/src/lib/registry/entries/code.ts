/**
 * Code-snippet builders. Every component shares the same scaffolding (create a
 * store from { model, data }, then render the component), so we template it per
 * framework and inject the component-specific tag + props.
 */
import type { CodeTabs } from '../types';

const IMPORT_DATA = `import { model, data } from './data';`;

/** Build Svelte / React / Vue snippets for a store-bound component. */
export function storeCode(
  componentNames: string[],
  // markup lines, written once in a framework-agnostic-ish way per framework
  body: { svelte: string; react: string; vue: string },
): CodeTabs {
  const named = componentNames.join(',\n  ');
  return {
    svelte: `<script lang="ts">
  import { createDashboardStore, ${componentNames.join(', ')} } from '@sentropic/dataviz-svelte';
  ${IMPORT_DATA}

  const store = createDashboardStore({ model, data });
</script>

${body.svelte}`,
    react: `import { useMemo } from 'react';
import {
  createDashboardStore,
  ${named},
} from '@sentropic/dataviz-react';
${IMPORT_DATA}

export function Demo() {
  const store = useMemo(() => createDashboardStore({ model, data }), []);
  return (
${indent(body.react, 4)}
  );
}`,
    vue: `<script setup lang="ts">
import {
  createDashboardStore,
  ${named},
} from '@sentropic/dataviz-vue';
${IMPORT_DATA}

const store = createDashboardStore({ model, data });
</script>

<template>
${indent(body.vue, 2)}
</template>`,
  };
}

/** Build snippets for a component that takes plain props (no store binding). */
export function propCode(
  componentNames: string[],
  body: { svelte: string; react: string; vue: string },
  setup?: { svelte?: string; react?: string; vue?: string },
): CodeTabs {
  const named = componentNames.join(',\n  ');
  return {
    svelte: `<script lang="ts">
  import { ${componentNames.join(', ')} } from '@sentropic/dataviz-svelte';
${setup?.svelte ? '\n  ' + setup.svelte + '\n' : ''}</script>

${body.svelte}`,
    react: `import {
  ${named},
} from '@sentropic/dataviz-react';
${setup?.react ? '\n' + setup.react + '\n' : ''}
export function Demo() {
  return (
${indent(body.react, 4)}
  );
}`,
    vue: `<script setup lang="ts">
import {
  ${named},
} from '@sentropic/dataviz-vue';
${setup?.vue ? '\n' + setup.vue + '\n' : ''}</script>

<template>
${indent(body.vue, 2)}
</template>`,
  };
}

function indent(s: string, n: number): string {
  const pad = ' '.repeat(n);
  return s
    .split('\n')
    .map((l) => (l.trim() ? pad + l : l))
    .join('\n');
}
