"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import entries, { Entry } from "../data/entries";

const dateFilters: Record<string, (entryDate: Date) => boolean> = {
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

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Entry["type"]>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month">("all");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

  const normalizedTerm = useMemo(() => searchTerm.trim().toLowerCase(), [searchTerm]);
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      if (typeFilter !== "all" && entry.type !== typeFilter) return false;
      const entryDate = new Date(entry.date);
      if (!dateFilters[dateFilter](entryDate)) return false;
      if (!normalizedTerm) return true;
      return (
        entry.title.toLowerCase().includes(normalizedTerm) ||
        entry.summary.toLowerCase().includes(normalizedTerm) ||
        entry.detail.toLowerCase().includes(normalizedTerm) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(normalizedTerm))
      );
    });
  }, [normalizedTerm, typeFilter, dateFilter]);

  const globalResults = useMemo(() => {
    const normalized = globalQuery.trim().toLowerCase();
    if (!globalSearchOpen || !normalized) return [];
    return entries
      .filter((entry) => {
        return (
          entry.title.toLowerCase().includes(normalized) ||
          entry.summary.toLowerCase().includes(normalized) ||
          entry.detail.toLowerCase().includes(normalized) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(normalized))
        );
      })
      .slice(0, 5);
  }, [globalQuery, globalSearchOpen]);

  const toggleGlobalSearch = useCallback(() => {
    setGlobalSearchOpen((prev) => !prev);
    setGlobalQuery("");
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (event.key === "Escape") {
        setGlobalSearchOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div>
      <header className="header">
        <h1>Second Brain</h1>
        <p>A calm, searchable view of our memories and conversations.</p>
      </header>

      <section className="controls">
        <input
          type="search"
          placeholder="Search memories, conversations, tags..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as any)}>
          <option value="all">All types</option>
          <option value="memory">Memories only</option>
          <option value="conversation">Conversations only</option>
        </select>
        <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as any)}>
          <option value="all">All time</option>
          <option value="week">Last 7 days</option>
          <option value="month">Last 30 days</option>
        </select>
        <button type="button" onClick={toggleGlobalSearch}>
          Global search <span style={{ opacity: 0.7 }}>(Cmd+K)</span>
        </button>
      </section>

      <section className="card-grid">
        {filteredEntries.map((entry) => (
          <article key={entry.id} className="memory-card">
            <div className="meta">
              <span>{new Date(entry.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
              <span>{entry.type === "memory" ? "Memory" : "Conversation"}</span>
            </div>
            <h3>{entry.title}</h3>
            <p className="note">{entry.summary}</p>
            <p className="note" style={{ fontSize: "0.9rem", color: "#1e293b" }}>
              {entry.detail}
            </p>
            <div className="tags">
              {entry.tags.map((tag) => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
        {filteredEntries.length === 0 && (
          <p className="note">No matches yet — broaden your filters or add more notes.</p>
        )}
      </section>

      {globalSearchOpen && (
        <div className="global-search-overlay" role="dialog" aria-modal="true">
          <div className="global-search-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2>Global search</h2>
              <button type="button" onClick={() => setGlobalSearchOpen(false)}>
                Close
              </button>
            </div>
            <input
              type="search"
              placeholder="Search everything"
              value={globalQuery}
              onChange={(event) => setGlobalQuery(event.target.value)}
              autoFocus
            />
            {globalResults.map((entry) => (
              <div key={entry.id} className="result">
                <h4>{entry.title}</h4>
                <span>
                  {entry.type === "memory" ? "Memory" : "Conversation"} • {new Date(entry.date).toLocaleDateString()}
                </span>
                <p className="note" style={{ color: "rgba(255, 255, 255, 0.75)", margin: "0.25rem 0 0" }}>
                  {entry.summary}
                </p>
              </div>
            ))}
            {globalResults.length === 0 && <p style={{ color: "rgba(255, 255, 255, 0.7)" }}>No hits yet. Expand your query.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
