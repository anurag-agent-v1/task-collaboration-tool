import { describe, expect, it } from "vitest";
import entries from "../data/entries";
import { filterEntries, globalSearch } from "../lib/filters";

describe("filterEntries", () => {
  it("returns all entries when no filters applied", () => {
    const results = filterEntries("", "all", "all", entries);
    expect(results.length).toBe(entries.length);
  });

  it("filters by type", () => {
    const results = filterEntries("", "memory", "all", entries);
    expect(results.every((entry) => entry.type === "memory")).toBe(true);
  });

  it("filters by term across title/summary/tags", () => {
    const results = filterEntries("automation", "all", "all", entries);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].tags).toContain("automation");
  });
});

describe("globalSearch", () => {
  it("returns an empty array for blank queries", () => {
    expect(globalSearch("", entries)).toEqual([]);
  });

  it("returns up to five matches for a populated query", () => {
    const results = globalSearch("review", entries);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(5);
  });

  it("is case insensitive", () => {
    expect(globalSearch("REVIEW", entries)[0]).toEqual(globalSearch("review", entries)[0]);
  });
});
