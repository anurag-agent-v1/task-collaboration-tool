export const ideaStatusOrder = ["draft", "review", "approved", "implemented"] as const;
export const ideaSourceOrder = ["ai", "human"] as const;

export type IdeaStatus = (typeof ideaStatusOrder)[number];
export type IdeaSource = (typeof ideaSourceOrder)[number];

export type Idea = {
  id: string;
  title: string;
  status: IdeaStatus;
  source: IdeaSource;
  summary: string;
  detail: string;
  tags: string[];
  estimatedTime: string;
  createdAt: string;
};

export const ideaStatusMetadata: Record<IdeaStatus, { label: string; color: string; background: string }> = {
  draft: { label: "Draft", color: "#1f2937", background: "#e5e7eb" },
  review: { label: "In review", color: "#7c3aed", background: "#ede9fe" },
  approved: { label: "Approved", color: "#047857", background: "#dcfce7" },
  implemented: { label: "Implemented", color: "#0f172a", background: "#dbeafe" }
};

export const ideaSourceMetadata: Record<IdeaSource, { label: string; color: string; icon: string }> = {
  ai: { label: "AI idea", color: "#0ea5e9", icon: "🤖" },
  human: { label: "Human idea", color: "#9333ea", icon: "🧠" }
};

const normalize = (value: string) => value.trim().toLowerCase();

export function summarizeStatusCounts(ideas: Idea[]) {
  const counts: Record<IdeaStatus, number> = {
    draft: 0,
    review: 0,
    approved: 0,
    implemented: 0
  };

  ideas.forEach((idea) => {
    counts[idea.status] += 1;
  });

  return ideaStatusOrder.map((status) => ({ status, count: counts[status] }));
}

export function summarizeSourceCounts(ideas: Idea[]) {
  const counts: Record<IdeaSource, number> = {
    ai: 0,
    human: 0
  };

  ideas.forEach((idea) => {
    counts[idea.source] += 1;
  });

  return ideaSourceOrder.map((source) => ({ source, count: counts[source] }));
}

export function formatDailyDigest(ideas: Idea[]) {
  if (!ideas.length) {
    return "No ideas captured yet.";
  }

  const statusCounts = summarizeStatusCounts(ideas);
  const sourceCounts = summarizeSourceCounts(ideas);
  const latestIdea = ideas[0];

  const lines = [
    "Daily AI touchpoint summary",
    "-----------------------------",
    `Ideas captured: ${ideas.length}`,
    "Status counts:",
    ...statusCounts.map(({ status, count }) => `- ${ideaStatusMetadata[status].label}: ${count}`),
    "Source recap:",
    ...sourceCounts.map(({ source, count }) => `- ${ideaSourceMetadata[source].label}: ${count}`),
    "",
    "Latest spark",
    `Title: ${latestIdea.title}`,
    `Summary: ${latestIdea.summary}`,
    `Detail: ${latestIdea.detail}`,
    `Estimated time: ${latestIdea.estimatedTime}`
  ];

  return lines.join("\n");
}

export function matchesIdea(idea: Idea, query: string) {
  if (!query.trim()) return true;
  const normalized = normalize(query);
  const haystack = `${idea.title} ${idea.summary} ${idea.detail} ${idea.tags.join(" ")}`.toLowerCase();
  return haystack.includes(normalized);
}

export function filterIdeas(
  ideas: Idea[],
  statusFilter: "all" | IdeaStatus,
  sourceFilter: "all" | IdeaSource,
  query: string
) {
  return ideas.filter((idea) => {
    if (statusFilter !== "all" && idea.status !== statusFilter) return false;
    if (sourceFilter !== "all" && idea.source !== sourceFilter) return false;
    return matchesIdea(idea, query);
  });
}
