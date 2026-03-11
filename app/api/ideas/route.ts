import { NextRequest, NextResponse } from "next/server";
import { fetchIdeas, persistIdea } from "../../lib/db";
import { IdeaStatus, IdeaSource } from "../../lib/ideaPipeline";

export async function GET() {
  try {
    const ideas = fetchIdeas();
    return NextResponse.json(ideas);
  } catch (error) {
    return NextResponse.json({ error: "Unable to fetch ideas" }, { status: 500 });
  }
}

type IdeaPayload = {
  title: string;
  summary: string;
  detail: string;
  tags: string[];
  estimatedTime: string;
  status: IdeaStatus;
  source: IdeaSource;
};

export async function POST(request: NextRequest) {
  try {
    const payload: IdeaPayload = await request.json();
    if (!payload.title || !payload.summary || !payload.status || !payload.source) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const idea: Omit<ReturnType<typeof persistIdea>, "id"> = {
      title: payload.title.trim(),
      summary: payload.summary.trim(),
      detail: payload.detail.trim(),
      tags: payload.tags,
      estimatedTime: payload.estimatedTime.trim() || "TBD",
      status: payload.status,
      source: payload.source,
      createdAt: new Date().toISOString().split("T")[0]
    };

    const saved = persistIdea(idea as any);
    return NextResponse.json(saved);
  } catch (error) {
    return NextResponse.json({ error: "Unable to persist idea" }, { status: 500 });
  }
}
