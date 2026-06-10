<!--
  Copy-paste code tabs for Svelte / React / Vue. The active tab follows the
  global framework store (so switching the header framework switches all code
  blocks + the live island, exactly like the DS docs site).
-->
<script lang="ts">
  import { ContentSwitcher } from '@sentropic/design-system-svelte';
  import { framework, FRAMEWORKS, type FrameworkId } from './stores.svelte';
  import type { CodeTabs } from '../registry/types';

  let { code }: { code: CodeTabs } = $props();

  const active = $derived(framework.value);
  const snippet = $derived(code[active]);

  let copied = $state(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
      copied = true;
      setTimeout(() => (copied = false), 1400);
    } catch {
      copied = false;
    }
  }
</script>

<div class="dv-code">
  <div class="dv-code__tabs">
    <ContentSwitcher
      size="sm"
      label="Framework"
      items={FRAMEWORKS.map((f) => ({ value: f.id, label: f.label }))}
      value={active}
      onchange={(v) => framework.set(v as FrameworkId)}
    />
  </div>
  <button class="dv-ctrl dv-copy" type="button" onclick={copy}>
    {copied ? 'Copié ✓' : 'Copier'}
  </button>
  <pre><code>{snippet}</code></pre>
</div>
