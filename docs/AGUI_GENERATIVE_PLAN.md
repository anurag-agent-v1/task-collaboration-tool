# AG-UI Generative UI Delivery Plan

## Overview
- AG-UI (Agent User Interaction Protocol) is the open, event-based standard for streaming, multimodal agent experiences (https://docs.ag-ui.com/introduction).
- The goal is to deliver a **customizable generative UI** layer that agents can steer while the hosting application remains in control of layout, tone, and validations.
- Our frontend (Next.js) will render AG-UI-inspired templates, allow stakeholders to tweak constraints, and feed those updates back to agent execution flows orchestrated through **N8N**.

## Goals
1. Define a typed AG-UI schema that can serialize intents, component trees, and constraint metadata so generators stay predictable.
2. Surface a builder panel that lets users pick templates, override metadata (title/description/tone/priority), and see the resulting JSON + summary in real time.
3. Keep the generative surface covered by unit tests (Vitest + React Testing Library) so front-end updates never break the intent modeling.
4. Capture the entire story—technical decisions, tasks, and how N8N workflows will trigger AG-UI updates—for future contributors and orchestrators.

## Execution Roadmap
| Task | Description | Deliverables | Validation |
| --- | --- | --- | --- |
| 1. Story + plan | Write the narrative, constraints, and checklist so the team knows what "customizable AG-UI" means. | This doc with task list + N8N mapping | Dev server sanity check + confirmation that documentation reflects intent. |
| 2. Schema helpers | Extend `lib/agui.ts` with generative template metadata, constraint helpers, and an N8N flow mapper. | New helpers, sample payload builder, exported metadata | Vitest suite covering payload cloning + N8N mapping. |
| 3. Generative UI builder | Build a React control panel (components + page section) showing live previews and summary/flow snippets. | New `GenerativeUiBuilder` component + integration in `app/page.tsx` | RTL smoke test + existing UI still renders (dev server check). |
| 4. Testing + documentation | Add unit tests for new helpers/components and log how N8N would trigger the experience. | Tests under `tests/` + doc section linking to new helpers | `npm run test`, `npm run build`, dev server preview. |

## Customizable AG-UI Pillars
1. **Template-driven components** – Each template declares a tree of cards, text blocks, buttons, and lists that match AG-UI conventions.
2. **Constraint overrides** – Tone, priority, title, and description can be overridden while preserving the typed structure; component overrides keep generative UIs consistent.
3. **Feedback loop** – The builder panel shows both the generated payload and a short summary so stakeholders stay confident before shipping the intent to an agent runtime.
4. **N8N-ready metadata** – Each intent can be mapped to a lightweight N8N flow definition that demonstrates how an orchestrator can listen for AG-UI events, apply business logic, and push updates.

## N8N Considerations
- We plan to orchestrate agent development through N8N by mapping AG-UI intents to node sequences (webhook trigger → set metadata → HTTP request or agent event). Example mapping:
  1. **Webhook listener** node accepts AG-UI events (template name, overrides, viewer metadata).
  2. **Set node** normalizes tone/priority to match agent expectations.
  3. **HTTP Request** or **Agent call** forwards embedded `components` and `metadata` to the runtime.
- Document the mapping in this repo so future contributors can connect a flow, swap templates, and see how AG-UI events drive UI changes.

## Validation & Testing Notes
- Run `npm run test` after every schema/component change to ensure the builder, helpers, and idea pipeline remain solid.
- Launch `npm run dev` and hit http://localhost:3000 to confirm the UI renders after each task; capture screenshots or `curl` logs in the task journal if possible.

## Implementation Task List
1. **Schema helpers & payload tooling** – Extend `lib/agui.ts` with any missing template metadata, override helpers, and an N8N-friendly mapper so we can produce AG-UI intents programmatically.
2. **Generative UI builder controls** – Create a dedicated React component (and related styles) that mirrors AG-UI templates, offers metadata overrides (tone, priority, description), and renders the resulting payload summary + JSON preview.
3. **Unit tests + documentation** – Add Vitest suites covering the AG-UI helpers and builder component, then document the workflow (including the N8N mapping) so future contributors understand how to iterate safely.

## Next Steps
- After the builder ships, capture a short technical note (in docs or memory logs) showing how an N8N stack would update the AG-UI payload, including any placeholder nodes for the future.
- Keep iterating on AG-UI templates (multimodal cards, streaming sections) once the core schema + builder are stable.
