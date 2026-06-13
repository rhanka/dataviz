import { ENTRIES, SECTION_META, type Section } from "../../registry";

export type SearchResult = {
  title: string;
  description: string;
  href: string;
  meta: string;
};

const SECTION_ORDER: Section[] = ["charts", "dashboards", "grids"];

const STATIC_RESULTS: SearchResult[] = [
  {
    title: "Vue d'ensemble",
    description: "Présentation de la librairie dataviz, des sections et du tableau de bord de démonstration.",
    href: "/",
    meta: "Documentation",
  },
  ...SECTION_ORDER.map((section) => ({
    title: SECTION_META[section].label,
    description: SECTION_META[section].blurb,
    href: SECTION_META[section].href,
    meta: "Catalogue",
  })),
];

const COMPONENT_RESULTS: SearchResult[] = ENTRIES.map((entry) => ({
  title: entry.name,
  description: entry.tagline,
  href: `/${entry.section}/${entry.slug}`,
  meta: SECTION_META[entry.section].label,
}));

export const SEARCH_RESULTS: SearchResult[] = [...STATIC_RESULTS, ...COMPONENT_RESULTS];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function scoreResult(result: SearchResult, tokens: string[]): number {
  const title = normalize(result.title);
  const description = normalize(result.description);
  const meta = normalize(result.meta);
  let score = 0;

  for (const token of tokens) {
    if (title === token) score += 12;
    else if (title.startsWith(token)) score += 8;
    else if (title.includes(token)) score += 5;
    if (meta.includes(token)) score += 3;
    if (description.includes(token)) score += 2;
  }

  return score;
}

export function searchDataviz(query: string): SearchResult[] {
  const tokens = normalize(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return SEARCH_RESULTS.slice(0, 8);

  return SEARCH_RESULTS.map((result) => ({ result, score: scoreResult(result, tokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.result.title.localeCompare(b.result.title))
    .slice(0, 12)
    .map((item) => item.result);
}
