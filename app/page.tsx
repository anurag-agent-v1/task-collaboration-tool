"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import entries, { Entry } from "../data/entries";
import ideasData from "../data/ideas";
import { filterEntries, globalSearch } from "../lib/filters";
import {
  Idea,
  IdeaPriority,
  IdeaSource,
  IdeaStatus,
  filterIdeas,
  ideaPriorityMetadata,
  ideaPriorityOrder,
  ideaSourceMetadata,
  ideaSourceOrder,
  ideaStatusMetadata,
  ideaStatusOrder,
  summarizePriorityCounts,
  summarizeSourceCounts,
  summarizeStatusCounts
} from "../lib/ideaPipeline";
import GenerativeUiBuilder from "../components/GenerativeUiBuilder";

const initialIdeaFormState = {
  title: "",
  summary: "",
  detail: "",
  tags: "",
  estimatedTime: "",
  status: "draft" as IdeaStatus,
  source: "ai" as IdeaSource,
  priority: "medium" as IdeaPriority
};

type IdeaFormState = typeof initialIdeaFormState;

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | Entry["type"]>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month">("all");
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalQuery, setGlobalQuery] = useState("");

  const [ideaPipeline, setIdeaPipeline] = useState<Idea[]>(ideasData);
  const [ideaStatusFilter, setIdeaStatusFilter] = useState<"all" | IdeaStatus>("all");
  const [ideaSourceFilter, setIdeaSourceFilter] = useState<"all" | IdeaSource>("all");
  const [ideaPriorityFilter, setIdeaPriorityFilter] = useState<"all" | IdeaPriority>("all");
  const [ideaQuery, setIdeaQuery] = useState("");
  const [ideaFormState, setIdeaFormState] = useState<IdeaFormState>(initialIdeaFormState);

  const filteredEntries = useMemo(() => filterEntries(searchTerm, typeFilter, dateFilter, entries), [searchTerm, typeFilter, dateFilter]);

  const globalResults = useMemo(() => {
    if (!globalSearchOpen) return [];
    return globalSearch(globalQuery, entries);
  }, [globalQuery, globalSearchOpen]);

  const filteredIdeas = useMemo(
    () => filterIdeas(ideaPipeline, ideaStatusFilter, ideaSourceFilter, ideaPriorityFilter, ideaQuery),
    [ideaPipeline, ideaStatusFilter, ideaSourceFilter, ideaPriorityFilter, ideaQuery]
  );

  const ideaStatusCounts = useMemo(() => summarizeStatusCounts(ideaPipeline), [ideaPipeline]);
  const ideaSourceCounts = useMemo(() => summarizeSourceCounts(ideaPipeline), [ideaPipeline]);
  const ideaPriorityCounts = useMemo(() => summarizePriorityCounts(ideaPipeline), [ideaPipeline]);

  const toggleGlobalSearch = useCallback(() => {
    setGlobalSearchOpen((prev) => !prev);
    setGlobalQuery("");
  }, []);

  const handleIdeaFieldChange = useCallback((field: keyof IdeaFormState, value: string) => {
    setIdeaFormState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleIdeaSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ideaFormState.title.trim() || !ideaFormState.summary.trim()) {
        return;
      }

      const tags = ideaFormState.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const newIdea: Idea = {
        id: `idea-${Date.now()}`,
        title: ideaFormState.title.trim(),
        summary: ideaFormState.summary.trim(),
        detail: ideaFormState.detail.trim(),
        status: ideaFormState.status,
        source: ideaFormState.source,
        tags,
        estimatedTime: ideaFormState.estimatedTime.trim() || "TBD",
        createdAt: new Date().toISOString().split("T")[0]
      };

      setIdeaPipeline((prev) => [newIdea, ...prev]);
      setIdeaFormState(initialIdeaFormState);
    },
    [ideaFormState]
  );

  const handleApproveIdea = useCallback((ideaId: string) => {
    setIdeaPipeline((prev) =>
      prev.map((idea) => (idea.id === ideaId ? { ...idea, status: "approved" as IdeaStatus } : idea))
    );
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
        <p>A calm, searchable view of our memories, conversations, and sparks.</p>
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
        {filteredEntries.length === 0 && <p className="note">No matches yet — broaden your filters or add more notes.</p>}
      </section>

      <section className="idea-pipeline">
        <header className="idea-header">
          <div>
            <h2>Idea pipeline</h2>
            <p>Keep a record of every spark the AI shares and the thoughts you pass back.</p>
          </div>
          <div className="idea-summary-grid">
            {ideaStatusCounts.map(({ status, count }) => (
              <div key={status} className="idea-summary-card">
                <span>{ideaStatusMetadata[status].label}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </div>
          <div className="idea-source-summary">
            <h3>Source recap</h3>
            <div className="idea-source-grid">
              {ideaSourceCounts.map(({ source, count }) => (
                <div key={source} className="idea-source-summary-card">
                  <span>{ideaSourceMetadata[source].icon}</span>
                  <strong>{count}</strong>
                  <p>{ideaSourceMetadata[source].label}</p>
                </div>
              ))}
            </div>
            <div className="idea-priority-filters">
              <span>Priority</span>
              <button type="button" className={ideaPriorityFilter === "all" ? "active" : ""} onClick={() => setIdeaPriorityFilter("all")}>
                Any priority
              </button>
              {ideaPriorityOrder.map((priority) => (
                <button
                  key={priority}
                  type="button"
                  className={ideaPriorityFilter === priority ? "active" : ""}
                  onClick={() => setIdeaPriorityFilter(priority)}
                >
                  {ideaPriorityMetadata[priority].label}
                </button>
              ))}
            </div>
          </div>
          <div className="idea-priority-summary">
            <h3>Priority recap</h3>
            <div className="idea-priority-grid">
              {ideaPriorityCounts.map(({ priority, count }) => (
                <div key={priority} className="idea-priority-summary-card">
                  <span>{ideaPriorityMetadata[priority].label}</span>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="idea-controls">
          <div className="idea-filter-groups">
            <div className="idea-filters">
              <button
                type="button"
                className={ideaStatusFilter === "all" ? "active" : ""}
                onClick={() => setIdeaStatusFilter("all")}
              >
                All ideas ({ideaPipeline.length})
              </button>
              {ideaStatusOrder.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={ideaStatusFilter === status ? "active" : ""}
                  onClick={() => setIdeaStatusFilter(status)}
                >
                  {ideaStatusMetadata[status].label}
                </button>
              ))}
            </div>
            <div className="idea-source-filters">
              <span>Source</span>
              <button
                type="button"
                className={ideaSourceFilter === "all" ? "active" : ""}
                onClick={() => setIdeaSourceFilter("all")}
              >
                Any source
              </button>
              {ideaSourceOrder.map((source) => (
                <button
                  key={source}
                  type="button"
                  className={ideaSourceFilter === source ? "active" : ""}
                  onClick={() => setIdeaSourceFilter(source)}
                >
                  {ideaSourceMetadata[source].label}
                </button>
              ))}
            </div>
          </div>
          <input
            type="search"
            placeholder="Search ideas..."
            value={ideaQuery}
            onChange={(event) => setIdeaQuery(event.target.value)}
          />
        </div>

        <div className="idea-grid">
          {filteredIdeas.map((idea) => {
            const canApprove = idea.status !== "approved";
            return (
              <article key={idea.id} className="idea-card">
                <div className="idea-card-meta">
                  <span>{ideaStatusMetadata[idea.status].label}</span>
                  <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>
                <div
                  className="idea-source-pill"
                  style={{
                    borderColor: ideaSourceMetadata[idea.source].color,
                    color: ideaSourceMetadata[idea.source].color
                  }}
                >
                  {ideaSourceMetadata[idea.source].icon} {ideaSourceMetadata[idea.source].label}
                </div>
                <h3>{idea.title}</h3>
                <p className="note">{idea.summary}</p>
                <p className="note" style={{ fontSize: "0.9rem", color: "#1e293b" }}>
                  {idea.detail}
                </p>
                <p className="note" style={{ fontSize: "0.85rem", color: "#4b5563", margin: 0 }}>
                  Estimated time: {idea.estimatedTime || "TBD"}
                </p>
                <div className="tags">
                  {idea.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
                {canApprove && (
                  <button type="button" className="approve-button" onClick={() => handleApproveIdea(idea.id)}>
                    Approve this idea
                  </button>
                )}
              </article>
            );
          })}
          {filteredIdeas.length === 0 && <p className="note">No ideas found — broaden the filters or add a new spark.</p>}
        </div>

        <form className="idea-form" onSubmit={handleIdeaSubmit}>
          <div className="form-grid">
            <label>
              Title
              <input
                type="text"
                value={ideaFormState.title}
                onChange={(event) => handleIdeaFieldChange("title", event.target.value)}
                required
              />
            </label>
            <label>
              Summary
              <input
                type="text"
                value={ideaFormState.summary}
                onChange={(event) => handleIdeaFieldChange("summary", event.target.value)}
                required
              />
            </label>
            <label>
              Status
              <select
                value={ideaFormState.status}
                onChange={(event) => handleIdeaFieldChange("status", event.target.value as IdeaStatus)}
              >
                {ideaStatusOrder.map((status) => (
                  <option key={status} value={status}>
                    {ideaStatusMetadata[status].label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source
              <select
                value={ideaFormState.source}
                onChange={(event) => handleIdeaFieldChange("source", event.target.value as IdeaSource)}
              >
                {ideaSourceOrder.map((source) => (
                  <option key={source} value={source}>
                    {ideaSourceMetadata[source].label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Priority
              <select
                value={ideaFormState.priority}
                onChange={(event) => handleIdeaFieldChange("priority", event.target.value)}
              >
                {ideaPriorityOrder.map((priority) => (
                  <option key={priority} value={priority}>
                    {ideaPriorityMetadata[priority].label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Tags
              <input
                type="text"
                value={ideaFormState.tags}
                onChange={(event) => handleIdeaFieldChange("tags", event.target.value)}
                placeholder="Comma-separated"
              />
            </label>
            <label>
              Estimated time
              <input
                type="text"
                value={ideaFormState.estimatedTime}
                onChange={(event) => handleIdeaFieldChange("estimatedTime", event.target.value)}
                placeholder="e.g. 2 hrs"
              />
            </label>
          </div>
          <label className="stretch">
            Details
            <textarea
              value={ideaFormState.detail}
              onChange={(event) => handleIdeaFieldChange("detail", event.target.value)}
            />
          </label>
          <button type="submit">Capture idea</button>
        </form>
      </section>

      <GenerativeUiBuilder />

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
