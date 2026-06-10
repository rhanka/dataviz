/**
 * Minimal hash-free SPA router. Static-host friendly: relies on the History API
 * for in-app navigation, but every route is reachable directly because GitHub
 * Pages serves index.html for unknown paths via the 404 fallback copied at
 * deploy time. Routes are plain paths under the deployed base.
 */
const browser = typeof window !== 'undefined';

function normalize(path: string): string {
  // Strip the deploy base (e.g. /dataviz/site) so routing is base-agnostic.
  let p = path;
  // Vite injects import.meta.env.BASE_URL like "/dataviz/site/" or "./".
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  if (base && base !== '.' && p.startsWith(base)) p = p.slice(base.length);
  if (!p.startsWith('/')) p = '/' + p;
  return p === '' ? '/' : p.replace(/\/+$/, '') || '/';
}

class RouterStore {
  path = $state<string>('/');

  init(): void {
    if (!browser) return;
    this.path = normalize(window.location.pathname);
    window.addEventListener('popstate', () => {
      this.path = normalize(window.location.pathname);
    });
  }

  /** Resolve an app path ("/charts/area") to a real href under the base. */
  href(appPath: string): string {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    const clean = appPath.startsWith('/') ? appPath : '/' + appPath;
    if (!base || base === '.') return '.' + clean;
    return base + clean;
  }

  navigate(appPath: string): void {
    if (!browser) return;
    const target = normalize(appPath);
    if (target === this.path) return;
    window.history.pushState({}, '', this.href(target));
    this.path = target;
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }
}

export const router = new RouterStore();

/** Click handler for in-app links: intercept and route via History API. */
export function onLinkClick(event: MouseEvent, appPath: string): void {
  if (event.defaultPrevented) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  router.navigate(appPath);
}
