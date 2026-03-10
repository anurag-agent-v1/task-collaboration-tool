export const ideaStatusOrder = ["draft", "review", "approved", "implemented"] as const;

export type IdeaStatus = (typeof ideaStatusOrder)[number];

export type Idea = {
  id: string;
  title: string;
  status: IdeaStatus;
  summary: string;
  detail: string;
  tags: string[];
  createdAt: string;
};

export const ideaStatusMetadata: Record<IdeaStatus, { label: string; color: string; background: string }> = {
  draft: { label: "Draft", color: "#1f2937", background: "#e5e7eb" },
  review: { label: "In review", color: "#7c3aed", background: "#ede9fe" },
  approved: { label: "Approved", color: "#047857", background: "#dcfce7" },
  implemented: { label: "Implemented", color: "#0f172a", background: "#dbeafe" }
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

export function matchesIdea(idea: Idea, query: string) {
  if (!query.trim()) return true;
  const normalized = normalize(query);
  const haystack = `${idea.title} ${idea.summary} ${idea.detail} ${idea.tags.join(" ")}`.toLowerCase();
  return haystack.includes(normalized);
}

export function filterIdeas(ideas: Idea[], statusFilter: "all" | IdeaStatus, query: string) {
  return ideas.filter((idea) => {
    if (statusFilter !== "all" && idea.status !== statusFilter) return false;
    return matchesIdea(idea, query);
  });
}
