export function normalizeAppHref(href: string): string {
  let value = href.trim();
  if (!value) return "/";

  try {
    const url = new URL(value, "https://dataviz.local");
    value = `${url.pathname}${url.hash}`;
  } catch {
    // Keep relative values and normalize them below.
  }

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  if (base && base !== "." && value.startsWith(base)) value = value.slice(base.length) || "/";

  const queryIndex = value.indexOf("?");
  if (queryIndex >= 0) value = value.slice(0, queryIndex);
  if (!value.startsWith("/")) value = `/${value}`;

  return value.replace(/\/+$/, "") || "/";
}

export function isExternalHref(href: string): boolean {
  if (/^(mailto:|tel:|#)/i.test(href)) return true;
  if (!/^https?:\/\//i.test(href)) return false;
  if (typeof window === "undefined") return true;

  try {
    return new URL(href).origin !== window.location.origin;
  } catch {
    return true;
  }
}
