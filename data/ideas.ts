import { Idea } from "../lib/ideaPipeline";

const ideas: Idea[] = [
  {
    id: "idea-001",
    title: "Share a lightweight idea backlog",
    status: "draft",
    source: "ai",
    summary: "Capture short ideas that can be reviewed asynchronously.",
    detail:
      "A small backlog keeps each contributor’s spark on record. Show a summary, status, and tags so nothing slips away during busy weeks.",
    tags: ["workflow", "collaboration"],
    estimatedTime: "15 min",
    createdAt: "2026-03-10"
  },
  {
    id: "idea-002",
    title: "Status-aware idea cards",
    status: "review",
    source: "human",
    summary: "Visualize whether an idea is being evaluated or already green-lighted.",
    detail:
      "Status chips, counts, and filters help everyone know whether an idea is ready for implementation or still in exploration.",
    tags: ["UI", "status"],
    estimatedTime: "1 day",
    createdAt: "2026-03-09"
  },
  {
    id: "idea-003",
    title: "Daily AI touchpoint",
    status: "implemented",
    source: "ai",
    summary: "Have the AI summarize and hand off ideas in a digestible file.",
    detail:
      "A daily summary file keeps the user in the loop and makes it easy to approve concepts with a single response.",
    tags: ["automation", "workflow"],
    estimatedTime: "4 hours",
    createdAt: "2026-03-08"
  }
];

export default ideas;
