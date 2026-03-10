import { describe, expect, it } from "vitest";
import { IdeaStatus, filterIdeas, matchesIdea, ideaStatusOrder } from "../lib/ideaPipeline";

const sampleIdea = {
  id: "i-123",
  title: "Make the idea pipeline friendlier",
  summary: "Show statuses and allow quick filtering.",
  detail: "Provide a small UI that highlights where each idea lives and makes it easy to capture new sparks.",
  tags: ["ux", "workflow"],
  status: "draft" as IdeaStatus,
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
      title: "Add a reminder about idea reviews",
      summary: "Prompt contributors when feedback is needed",
      detail: "Use lightweight nudges so ideas in review don’t stall."
    },
    {
      ...sampleIdea,
      id: "i-789",
      status: "approved" as IdeaStatus,
      title: "Document approved experiments",
      summary: "Capture what’s ready to ship",
      detail: "Link each approved idea to its implementation notes."
    }
  ];

  it("allows filtering by status", () => {
    const filtered = filterIdeas(ideas, "review", "");
    expect(filtered.every((idea) => idea.status === "review")).toBe(true);
  });

  it("respects the query term", () => {
    const filtered = filterIdeas(ideas, "all", "friendlier");
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("i-123");
  });

  it("returns all ideas when there is no filter", () => {
    const filtered = filterIdeas(ideas, "all", "");
    expect(filtered.length).toBe(3);
  });
});
