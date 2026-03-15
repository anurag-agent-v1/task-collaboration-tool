import { describe, expect, it } from "vitest";
import {
  IdeaSource,
  IdeaStatus,
  IdeaPriority,
  filterIdeas,
  matchesIdea,
  ideaStatusOrder,
  summarizeSourceCounts
} from "../lib/ideaPipeline";

const sampleIdea = {
  id: "i-123",
  title: "Make the idea pipeline friendlier",
  summary: "Show statuses and allow quick filtering.",
  detail: "Provide a small UI that highlights where each idea lives and makes it easy to capture new sparks.",
  tags: ["ux", "workflow"],
  status: "draft" as IdeaStatus,
  source: "ai" as IdeaSource,
  priority: "medium" as unknown as any,
  createdAt: "2026-03-10"
};

describe("matchesIdea", () => {
  it("matches on title regardless of case", () => {
    expect(matchesIdea(sampleIdea, "pipeline")).toBe(true);
    expect(matchesIdea(sampleIdea, "PIPELINE")).toBe(true);
  });

  it("returns true when query is empty", () => {
    expect(matchesIdea(sampleIdea, "")).toBe(true);
  });

  it("returns false when no fields match", () => {
    expect(matchesIdea(sampleIdea, "banana")).toBe(false);
  });
});

describe("filterIdeas", () => {
  const ideas = [
    sampleIdea,
    {
      ...sampleIdea,
      id: "i-456",
      status: "review" as IdeaStatus,
      source: "human" as IdeaSource,
      title: "Add a reminder about idea reviews",
      summary: "Prompt contributors when feedback is needed",
      detail: "Use lightweight nudges so ideas in review don’t stall."
    },
    {
      ...sampleIdea,
      id: "i-789",
      status: "approved" as IdeaStatus,
      source: "ai" as IdeaSource,
      title: "Document approved experiments",
      summary: "Capture what’s ready to ship",
      detail: "Link each approved idea to its implementation notes."
    }
  ];

  it("allows filtering by status", () => {
    const filtered = filterIdeas(ideas, "review", "all", "");
    expect(filtered.every((idea) => idea.status === "review")).toBe(true);
  });

  it("allows filtering by source", () => {
    const filtered = filterIdeas(ideas, "all", "human", "");
    expect(filtered.every((idea) => idea.source === "human")).toBe(true);
  });

  it("respects the query term", () => {
    const filtered = filterIdeas(ideas, "all", "all", "all", "friendlier");
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("i-123");
  });

  it("returns all ideas when there is no filter", () => {
    const filtered = filterIdeas(ideas, "all", "all", "all", "");
    expect(filtered.length).toBe(3);
  });
});

describe("summarizeSourceCounts", () => {
  it("reports counts in the configured order", () => {
    const humanIdea = { ...sampleIdea, id: "i-999", source: "human" as IdeaSource };
    const counts = summarizeSourceCounts([sampleIdea, humanIdea]);

    expect(counts).toEqual([
      { source: "ai", count: 1 },
      { source: "human", count: 1 }
    ]);
  });
});
