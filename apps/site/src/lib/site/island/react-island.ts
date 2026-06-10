// React island — mounts the REAL @sentropic/dataviz-react components into a DOM
// host, mirroring the design-system docs site's `react-island.ts`.
//
// 100% client-side: react, react-dom/client and the dataviz-react package are
// all dynamically imported so they never enter the Svelte SPA's SSR/main bundle
// eagerly. Returns an idempotent `{ unmount }` handle so the Svelte host can
// tear the island down cleanly on framework switch or navigation.

import type { NodeSpec } from './specs';

export interface IslandHandle {
  unmount(): void;
}

export async function mountReactIsland(
  container: HTMLElement,
  nodes: NodeSpec[],
): Promise<IslandHandle> {
  const [React, { createRoot }, dvReact] = await Promise.all([
    import('react'),
    import('react-dom/client'),
    import('@sentropic/dataviz-react'),
  ]);

  const components = dvReact as unknown as Record<
    string,
    React.ComponentType<Record<string, unknown>>
  >;

  let key = 0;
  const children = nodes.map((node) => {
    const Comp = components[node.comp];
    if (!Comp) return null;
    return React.createElement(Comp, { key: `n${key++}`, ...node.props });
  });

  const root = createRoot(container);
  root.render(React.createElement(React.Fragment, null, children));

  // Idempotent teardown: React 19 tolerates a double `root.unmount()` but the
  // host DOM is shared with the Svelte/Vue paths, so we guard anyway and absorb
  // a teardown that races an incoming island already clearing the container.
  let disposed = false;
  return {
    unmount() {
      if (disposed) return;
      disposed = true;
      try {
        root.unmount();
      } catch {
        // Host already cleared by the incoming island — harmless.
      }
    },
  };
}
