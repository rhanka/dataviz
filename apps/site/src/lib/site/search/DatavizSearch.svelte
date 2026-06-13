<script lang="ts">
  import { Search as SearchIcon } from "@lucide/svelte";
  import { onLinkClick, router } from "../router.svelte";
  import { searchDataviz } from "./search-index";
  import { locale } from "../locale.svelte";

  let { onSelect = () => {} }: { onSelect?: () => void } = $props();

  let query = $state("");
  const results = $derived(searchDataviz(query));
</script>

<div class="docs-search">
  <label class="docs-search__label" for="dataviz-search-input">{locale.value === "fr" ? "Recherche" : "Search"}</label>
  <div class="docs-search__field">
    <SearchIcon size={18} aria-hidden="true" />
    <input
      id="dataviz-search-input"
      type="search"
      bind:value={query}
      placeholder={locale.value === "fr" ? "Rechercher un chart, dashboard ou grille" : "Search charts, dashboards or grids"}
      autocomplete="off"
    />
  </div>

  <div class="docs-search__results" role="listbox" aria-label="Résultats de recherche">
    {#each results as result (result.href)}
      <a
        class="docs-search-result"
        href={router.href(result.href)}
        onclick={(event) => {
          onLinkClick(event, result.href);
          onSelect();
        }}
      >
        <span class="docs-search-result__body">
          <span class="docs-search-result__title">{result.title}</span>
          <span class="docs-search-result__description">{result.description}</span>
        </span>
        <span class="docs-search-result__meta">{result.meta}</span>
      </a>
    {:else}
      <p class="docs-search__empty">{locale.value === "fr" ? "Aucun résultat." : "No results."}</p>
    {/each}
  </div>
</div>
