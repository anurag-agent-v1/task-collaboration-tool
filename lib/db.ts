import Database from "better-sqlite3";
import path from "path";
import { Idea, IdeaStatus, IdeaSource } from "./ideaPipeline";

const dbPath = path.join(process.cwd(), "data", "ideas.db");
const db = new Database(dbPath, { readonly: false });

function mapRowToIdea(row: any): Idea {
  return {
    id: row.id,
    title: row.title,
    status: row.status as IdeaStatus,
    source: row.source as IdeaSource,
    summary: row.summary,
    detail: row.detail,
    tags: row.tags ? row.tags.split(",").map((tag: string) => tag.trim()).filter(Boolean) : [],
    estimatedTime: row.estimated_time || "",
    createdAt: row.created_at
  };
}

export function fetchIdeas(): Idea[] {
  const statement = db.prepare("SELECT * FROM ideas ORDER BY created_at DESC");
  return statement.all().map(mapRowToIdea);
}

export function persistIdea(idea: Omit<Idea, "id">): Idea {
  const id = `idea-${Date.now()}`;
  const tags = idea.tags.join(",");
  const stmt = db.prepare(
    `INSERT INTO ideas (id, title, status, source, summary, detail, tags, estimated_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  stmt.run(id, idea.title, idea.status, idea.source, idea.summary, idea.detail, tags, idea.estimatedTime, idea.createdAt);
  return { ...idea, id };
}
