<!--
  Per-component documentation page: title + tagline, live interactive demo,
  use-case writeup, and copy-paste code tabs for the three frameworks.
-->
<script lang="ts">
  import { Breadcrumb } from '@sentropic/design-system-svelte';
  import type { DemoEntry } from '../registry/types';
  import { SECTION_META } from '../registry/index';
  import LiveDemo from './LiveDemo.svelte';
  import CodeBlock from './CodeBlock.svelte';

  let { entry }: { entry: DemoEntry } = $props();
  const paras = $derived(entry.useCase.split('\n\n'));

  const breadcrumbItems = $derived([
    { label: SECTION_META[entry.section].label },
    { label: entry.group, current: true },
  ]);
</script>

<article class="dv-prose">
  <Breadcrumb items={breadcrumbItems} label="Fil d'Ariane" />

  <h1 class="dv-h1">{entry.name}</h1>
  <p class="dv-lead">{entry.tagline}</p>

  <section class="dv-section">
    <h2>Démo interactive</h2>
    <p class="dv-prose" style="margin-bottom:0.75rem;">
      Données réalistes et déterministes (~700 commandes). Basculez le mode
      sombre dans l'en-tête : la présentation vient à 100 % du design system.
    </p>
    <LiveDemo {entry} />
  </section>

  <section class="dv-section">
    <h2>Cas d'usage</h2>
    {#each paras as p (p)}
      <p>{p}</p>
    {/each}
  </section>

  <section class="dv-section">
    <h2>Code</h2>
    <p>Identique d'un framework à l'autre : sélectionnez Svelte, React ou Vue.</p>
    <CodeBlock code={entry.code} />
  </section>
</article>
