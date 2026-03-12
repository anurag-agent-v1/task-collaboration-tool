import { describe, it, expect } from "vitest";
import { buildAGUIPayload, summarizeGeneratedIntent } from "../lib/agui";

describe("AGUI helpers", () => {
  it("builds payloads from templates", () => {
    const payload = buildAGUIPayload({ template: "onboarding" });

    expect(payload.id).toBe("intent-onboarding");
    expect(payload.components.length).toBeGreaterThan(0);
  });

  it("applies overrides and component updates", () => {
    const payload = buildAGUIPayload({
      template: "assistant",
      overrides: { priority: "low", title: "Peaceful assistant" },
      componentOverrides: {
        "button-approve": { label: "Confirm", props: { color: "blue" } }
      }
    });

    const button = payload.components
      .flatMap((component) => component.children ?? [])
      .find((child) => child?.id === "button-approve");

    expect(payload.priority).toBe("low");
    expect(payload.title).toBe("Peaceful assistant");
    expect(button?.label).toBe("Confirm");
    expect(button?.props?.color).toBe("blue");
  });

  it("summarizes intent descriptions", () => {
    const payload = buildAGUIPayload({ template: "onboarding" });
    const summary = summarizeGeneratedIntent(payload);
    expect(summary).toContain(payload.title);
    expect(summary).toContain(payload.priority);
  });
});
