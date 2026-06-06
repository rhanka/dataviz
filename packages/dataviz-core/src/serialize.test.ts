import { describe, it, expect } from 'vitest';
import {
  type DataModel,
  type FilterState,
  isFilterSpec,
  serializeFilters,
  deserializeFilters,
} from './index.js';

const model: DataModel = {
  dimensions: [
    { id: 'country', label: 'Country', type: 'discrete' },
    { id: 'age', label: 'Age', type: 'continuous' },
  ],
  measures: [{ id: 'revenue', label: 'Revenue', aggregation: 'sum' }],
};

describe('isFilterSpec', () => {
  it('accepts include/exclude with string values', () => {
    expect(isFilterSpec({ kind: 'include', values: ['a'] })).toBe(true);
    expect(isFilterSpec({ kind: 'exclude', values: [] })).toBe(true);
  });
  it('accepts range with numeric or absent bounds', () => {
    expect(isFilterSpec({ kind: 'range' })).toBe(true);
    expect(isFilterSpec({ kind: 'range', min: 1, max: 2 })).toBe(true);
  });
  it('rejects unknown kinds', () => {
    expect(isFilterSpec({ kind: 'nope' })).toBe(false);
  });
  it('rejects include with non-string values', () => {
    expect(isFilterSpec({ kind: 'include', values: [1, 2] })).toBe(false);
  });
  it('rejects range with non-numeric bounds', () => {
    expect(isFilterSpec({ kind: 'range', min: 'x' })).toBe(false);
  });
  it('rejects null / non-object', () => {
    expect(isFilterSpec(null)).toBe(false);
    expect(isFilterSpec('x')).toBe(false);
  });
});

describe('serialize / deserialize round-trip', () => {
  it('round-trips an include filter', () => {
    const filters: FilterState = { country: { kind: 'include', values: ['FR', 'US'] } };
    const encoded = serializeFilters({ filters });
    expect(deserializeFilters(encoded, model)).toEqual(filters);
  });

  it('round-trips a range filter', () => {
    const filters: FilterState = { age: { kind: 'range', min: 18, max: 65 } };
    const encoded = serializeFilters({ filters });
    expect(deserializeFilters(encoded, model)).toEqual(filters);
  });

  it('round-trips an exclude filter', () => {
    const filters: FilterState = { country: { kind: 'exclude', values: ['XX'] } };
    expect(deserializeFilters(serializeFilters({ filters }), model)).toEqual(filters);
  });

  it('round-trips multiple filters', () => {
    const filters: FilterState = {
      country: { kind: 'include', values: ['FR'] },
      age: { kind: 'range', min: 21 },
    };
    expect(deserializeFilters(serializeFilters({ filters }), model)).toEqual(filters);
  });

  it('round-trips an empty filter state', () => {
    expect(deserializeFilters(serializeFilters({ filters: {} }), model)).toEqual({});
  });

  it('produces a URL-safe string (no raw braces/quotes)', () => {
    const encoded = serializeFilters({
      filters: { country: { kind: 'include', values: ['FR'] } },
    });
    expect(encoded).not.toMatch(/[{}"]/);
    // and survives a query-string round-trip
    const url = new URL(`https://x.test/?f=${encoded}`);
    expect(deserializeFilters(url.searchParams.get('f')!, model)).toEqual({
      country: { kind: 'include', values: ['FR'] },
    });
  });

  it('is deterministic regardless of key insertion order', () => {
    const a = serializeFilters({
      filters: { age: { kind: 'range', min: 1 }, country: { kind: 'include', values: ['FR'] } },
    });
    const b = serializeFilters({
      filters: { country: { kind: 'include', values: ['FR'] }, age: { kind: 'range', min: 1 } },
    });
    expect(a).toBe(b);
  });
});

describe('deserialize robustness', () => {
  it('returns {} for empty string', () => {
    expect(deserializeFilters('', model)).toEqual({});
  });
  it('returns {} for garbage', () => {
    expect(deserializeFilters('%%%not-json%%%', model)).toEqual({});
    expect(deserializeFilters(encodeURIComponent('not json'), model)).toEqual({});
  });
  it('returns {} for a non-object JSON payload', () => {
    expect(deserializeFilters(encodeURIComponent('[1,2,3]'), model)).toEqual({});
    expect(deserializeFilters(encodeURIComponent('42'), model)).toEqual({});
  });
  it('drops filters on unknown dimensions', () => {
    const payload = encodeURIComponent(
      JSON.stringify({ ghost: { kind: 'include', values: ['x'] } }),
    );
    expect(deserializeFilters(payload, model)).toEqual({});
  });
  it('drops malformed specs but keeps valid ones', () => {
    const payload = encodeURIComponent(
      JSON.stringify({
        country: { kind: 'include', values: ['FR'] },
        age: { kind: 'bogus' },
      }),
    );
    expect(deserializeFilters(payload, model)).toEqual({
      country: { kind: 'include', values: ['FR'] },
    });
  });
});
