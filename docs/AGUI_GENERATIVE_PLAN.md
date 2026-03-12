# AG-UI Generative UI Delivery Plan

## Overview
- AG-UI (Agent User Interaction Protocol) is the open, event-based standard for streaming, multimodal agent experiences (https://docs.ag-ui.com/introduction).
- The goal is to deliver a **customizable generative UI** layer that can be directed by agents and orchestrated from a modern frontend (Next.js) while keeping the user in control.
- The project will also explore how AG-UI meshes with existing tooling such as **N8N** for agent orchestration.

## Goals
1. Define an AG-UI-flavored data model that supports generative UI intents, layout templates, and agent-driven constraints.
2. Build frontend controls that allow a stakeholder to preview and tweak generated component trees, mirroring AG-UI’s declarative patterns.
3. Instrument unit tests (Vitest + React Testing Library) so the generative UI logic stays reliable even as customization grows.
4. Document the experience for future contributors, including N8N integration notes.

## Task Breakdown
1. **Document the AG-UI generative UI story & task list** – capture high-level narrative, constraints (N8N agent plan), and the work breakdown so everyone stays aligned.
2. **Add AG-UI schema helpers and mocks** – create `lib/agui.ts` (or similar) to define typed AG-UI intents, events, and sample generative UI payloads we can reuse in the frontend.
3. **Implement the Generative UI Builder panel** – add React components that render AG-UI-style control panels, allow picking templates, editing fields, and previewing the generated payload.
4. **Cover the AG-UI helpers with unit tests** – build Vitest tests (and a component smoke test if needed) to ensure the schema helpers and generative preview stay stable.

Each task becomes its own git commit. For each commit we will:
- Update files and run the relevant tests (Vitest/formatting) before committing.
- Spin up the Next.js dev server, exercise the page via HTTP (mocking inputs if needed), and log what we inspected.

## N8N Considerations
- Plan to orchestrate agent workflows through N8N by translating AG-UI actions into N8N nodes (design doc to capture at least one example in future iterations).
- Document the mapping between AG-UI intents, generative UI metadata, and how an N8N flow could trigger UI updates (placeholder in this doc).