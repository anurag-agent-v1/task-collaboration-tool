import entries, { Entry } from "../data/entries";

type DateFilterKey = "all" | "week" | "month";

type TypeFilterKey = "all" | Entry["type"];

const dateFilters: Record<DateFilterKey, (entryDate: Date) => boolean> = {
  all: () => true,
  week: (entryDate) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return entryDate >= cutoff;
  },
  month: (entryDate) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    return entryDate >= cutoff;
  }
};

const normalize = (value: string) => value.trim().toLowerCase();

export function filterEntries(
  term: string,
  typeFilter: TypeFilterKey,
  dateFilter: DateFilterKey,
  source?: Entry[]
) {
  const normalizedTerm = normalize(term);
  const data = source ?? entries;

  return data.filter((entry) => {
    if (typeFilter !== "all" && entry.type !== typeFilter) return false;
    const entryDate = new Date(entry.date);
    if (!dateFilters[dateFilter](entryDate)) return false;
    if (!normalizedTerm) return true;
    const haystack = `${entry.title} ${entry.summary} ${entry.detail} ${entry.tags.join(" ")}`.toLowerCase();
    return haystack.includes(normalizedTerm);
  });
}

export function globalSearch(query: string, source?: Entry[]) {
  const normalized = normalize(query);
  if (!normalized) return [];
  const data = source ?? entries;
  return data
    .filter((entry) => {
      const haystack = `${entry.title} ${entry.summary} ${entry.detail} ${entry.tags.join(" ")}`.toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, 5);
}

export type { Entry };
