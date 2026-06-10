<!-- Left navigation: sections (Charts / Dashboards / Grids / Guides) with grouped component links. -->
<script lang="ts">
  import { groupsFor, SECTION_META } from '../registry/index';
  import type { Section } from '../registry/types';
  import { router, onLinkClick } from './router.svelte';

  let { open = false }: { open?: boolean } = $props();

  const sections: Section[] = ['charts', 'dashboards', 'grids'];
  const current = $derived(router.path);

  function isActive(href: string): boolean {
    return current === href;
  }
  function sectionOpen(section: Section): boolean {
    return current.startsWith(`/${section}`);
  }
</script>

<aside class="dv-sidebar" class:dv-sidebar--open={open}>
  {#each sections as section (section)}
    <h2>{SECTION_META[section].label}</h2>
    {#each groupsFor(section) as group (group.label)}
      <details class="dv-side-group" open={sectionOpen(section)}>
        <summary>{group.label}</summary>
        {#each group.entries as entry (entry.slug)}
          {@const href = `/${section}/${entry.slug}`}
          <a
            class="dv-side-link"
            href={router.href(href)}
            aria-current={isActive(href) ? 'page' : undefined}
            onclick={(e) => onLinkClick(e, href)}
          >
            {entry.name}
          </a>
        {/each}
      </details>
    {/each}
  {/each}

  <h2>Guides</h2>
  <a
    class="dv-side-link"
    href={router.href('/guides')}
    aria-current={isActive('/guides') ? 'page' : undefined}
    onclick={(e) => onLinkClick(e, '/guides')}
  >
    Prise en main
  </a>
</aside>
