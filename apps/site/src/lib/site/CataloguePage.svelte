<!-- Section index: blurb + grouped cards linking to each component page. -->
<script lang="ts">
  import { Breadcrumb, Tile } from '@sentropic/design-system-svelte';
  import { groupsFor, SECTION_META } from '../registry/index';
  import type { Section } from '../registry/types';
  import { router, onLinkClick } from './router.svelte';

  let { section }: { section: Section } = $props();
  const meta = $derived(SECTION_META[section]);
  const groups = $derived(groupsFor(section));

  const breadcrumbItems = $derived([{ label: meta.label, current: true }]);
</script>

<div class="dv-prose">
  <Breadcrumb items={breadcrumbItems} label="Fil d'Ariane" />
  <h1 class="dv-h1">{meta.label}</h1>
  <p class="dv-lead">{meta.blurb}</p>

  {#each groups as group (group.label)}
    <section class="dv-section">
      <h2>{group.label}</h2>
      <div class="dv-cards">
        {#each group.entries as entry (entry.slug)}
          {@const href = `/${section}/${entry.slug}`}
          <Tile
            variant="clickable"
            href={router.href(href)}
            onclick={(e) => onLinkClick(e, href)}
          >
            <p class="dv-card__name">{entry.name}</p>
            <p class="dv-card__tag">{entry.tagline}</p>
          </Tile>
        {/each}
      </div>
    </section>
  {/each}
</div>
