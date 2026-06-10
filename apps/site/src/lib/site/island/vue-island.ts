// Vue island — mounts the REAL @sentropic/dataviz-vue components into a DOM
// host, mirroring the design-system docs site's `vue-island.ts`.
//
// 100% client-side: vue and the dataviz-vue package are dynamically imported so
// they stay out of the Svelte SPA's eager bundle. The dataviz-vue components are
// render-function components (`defineComponent` + `h`), so no SFC compiler is
// needed — we build the tree directly with `h`.

import type { NodeSpec } from './specs';
import type { IslandHandle } from './react-island';

export type { IslandHandle } from './react-island';

export async function mountVueIsland(
  container: HTMLElement,
  nodes: NodeSpec[],
): Promise<IslandHandle> {
  const [{ createApp, h, defineComponent }, dvVue] = await Promise.all([
    import('vue'),
    import('@sentropic/dataviz-vue'),
  ]);

  const components = dvVue as unknown as Record<string, unknown>;

  const Root = defineComponent({
    name: 'DatavizSiteVueIslandRoot',
    setup() {
      return () =>
        nodes.map((node) => {
          const Comp = components[node.comp];
          if (!Comp) return null;
          return h(Comp as never, { ...node.props });
        });
    },
  });

  const app = createApp(Root);
  app.mount(container);

  // Defensive, idempotent teardown — same guard as the DS site's vue-island.
  //
  // Why: the island host (`container`) is SHARED with the Svelte and React
  // render paths. On a framework switch, the incoming island (React
  // `createRoot(container)`, or a Svelte re-render) can empty/replace the host's
  // children BEFORE the outgoing Vue `app.unmount()` finishes walking its tree.
  // Vue then steps onto already-detached fragment anchors and throws
  // (`reading 'nextSibling'` in dev, `reading '$set'` minified — same teardown
  // path). Guards:
  //   • `disposed` makes `unmount()` idempotent (Vue 3 forbids a double
  //     `app.unmount()` on the same app);
  //   • we call `app.unmount()` once, then drop the reference;
  //   • the try/catch absorbs a teardown racing a host already cleared by the
  //     incoming island — render stays correct, console stays clean.
  let appRef: ReturnType<typeof createApp> | null = app;
  let disposed = false;

  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      const current = appRef;
      appRef = null;
      if (!current) return;
      try {
        current.unmount();
      } catch {
        // Host already cleared by the incoming island — safe to ignore.
      }
    },
  };
}
