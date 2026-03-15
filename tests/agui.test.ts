import { describe, expect, it } from "vitest";
import {
  aguiTemplateOptions,
  buildAGUIPayload,
  flattenComponents,
  mapIntentToN8NFlow,
  summarizeGeneratedIntent
} from "../lib/agui";

describe("AG-UI helpers", () => {
  it("exposes template options for the builder", () => {
    const optionIds = aguiTemplateOptions.map((option) => option.id);
    expect(optionIds).toContain("onboarding");
    expect(optionIds).toContain("assistant");
    expect(optionIds).toContain("statusBoard");
  });

  it("builds payloads with overrides and clones components", () => {
    const payload = buildAGUIPayload({
      template: "onboarding",
      overrides: { title: "Fresh welcome" },
      componentOverrides: {
        "button-start": {
          label: "Begin now",
          props: { variant: "secondary" }
        }
      }
    });

    expect(payload.title).toBe("Fresh welcome");
    const card = payload.components[0];
    const button = card.children?.find((child) => child.id === "button-start");
    expect(button?.label).toBe("Begin now");
    expect(button?.props?.variant).toBe("secondary");
  });

  it("summarizes intents with component counts", () => {
    const intent = buildAGUIPayload({ template: "statusBoard" });
    const summary = summarizeGeneratedIntent(intent);
    expect(summary).toContain("Status dashboard");
    expect(summary).toContain("component");
  });

  it("flattens nested components", () => {
    const intent = buildAGUIPayload({ template: "assistant" });
    const components = flattenComponents(intent);
    expect(components.some((component) => component.type === "button")).toBe(true);
    expect(components.length).toBeGreaterThan(2);
  });

  it("generates an N8N flow map with provided context", () => {
    const intent = buildAGUIPayload({ template: "assistant" });
    const flow = mapIntentToN8NFlow(intent, {
      agentId: "session-1",
      channel: "web",
      callbackUrl: "https://example.com/agent"
    });

    expect(flow.trigger).toContain("/webhooks/ag-ui/web");
    expect(flow.nodes.length).toBe(3);
    expect(flow.summary).toContain("agent session-1");
    const dispatchNode = flow.nodes.find((node) => node.id === "dispatch-agent");
    expect(dispatchNode?.params).toHaveProperty("body");
  });
});
