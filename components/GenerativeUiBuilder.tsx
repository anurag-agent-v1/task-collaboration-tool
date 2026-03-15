"use client";

import { ChangeEvent, useMemo, useState } from "react";
import {
  AGUIIntent,
  aguiTemplateOptions,
  aguiTemplates,
  buildAGUIPayload,
  mapIntentToN8NFlow,
  summarizeGeneratedIntent
} from "../lib/agui";

const toneOptions: AGUIIntent["tone"][] = ["calm", "assertive", "neutral", "curious"];
const priorityOptions: AGUIIntent["priority"][] = ["low", "medium", "high"];

const defaultTemplate = aguiTemplateOptions[0]?.id ?? "onboarding";

export default function GenerativeUiBuilder() {
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplate);
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customTone, setCustomTone] = useState<AGUIIntent["tone"]>(toneOptions[0]);
  const [customPriority, setCustomPriority] = useState<AGUIIntent["priority"]>(priorityOptions[1]);

  const payload = useMemo(() => {
    const template = aguiTemplates[selectedTemplate];
    const overrides: Partial<Omit<AGUIIntent, "components">> = {};

    if (customTitle.trim()) {
      overrides.title = customTitle.trim();
    }
    if (customDescription.trim()) {
      overrides.description = customDescription.trim();
    }
    if (template && customTone !== template.tone) {
      overrides.tone = customTone;
    }
    if (template && customPriority !== template.priority) {
      overrides.priority = customPriority;
    }

    return buildAGUIPayload({
      template: selectedTemplate,
      overrides,
      componentOverrides: {
        "text-status": {
          content: "Live preview of the AG-UI intent before it ships",
          props: { weight: "bold" }
        }
      }
    });
  }, [customDescription, customPriority, customTitle, customTone, selectedTemplate]);

  const flow = useMemo(
    () =>
      mapIntentToN8NFlow(payload, {
        agentId: "builder-preview",
        channel: "preview",
        callbackUrl: "https://preview.agents.local/intent"
      }),
    [payload]
  );

  const summary = useMemo(() => summarizeGeneratedIntent(payload), [payload]);

  const handleFieldChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.value);
  };

  return (
    <section className="generative-builder">
      <header>
        <h2>Generative UI Builder</h2>
        <p>Pick a template, apply metadata overrides, and watch AG-UI payloads evolve live.</p>
      </header>
      <div className="generative-builder-grid">
        <form className="builder-form">
          <label>
            Template
            <select value={selectedTemplate} onChange={(event) => setSelectedTemplate(event.target.value as keyof typeof aguiTemplates)}>
              {aguiTemplateOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Title override
            <input value={customTitle} onChange={handleFieldChange(setCustomTitle)} placeholder="Keep default" />
          </label>
          <label>
            Description override
            <input
              value={customDescription}
              onChange={handleFieldChange(setCustomDescription)}
              placeholder="Add more context"
            />
          </label>
          <label>
            Tone
            <select value={customTone} onChange={(event) => setCustomTone(event.target.value as AGUIIntent["tone"])}>
              {toneOptions.map((tone) => (
                <option key={tone} value={tone}>
                  {tone}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select
              value={customPriority}
              onChange={(event) => setCustomPriority(event.target.value as AGUIIntent["priority"])}
            >
              {priorityOptions.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>
        </form>
        <div className="builder-preview">
          <p className="builder-summary" data-testid="builder-summary">
            {summary}
          </p>
          <div className="builder-flow">
            <h3>N8N flow</h3>
            <p>{flow.trigger}</p>
            <p className="builder-flow-summary">{flow.summary}</p>
            <ul>
              {flow.nodes.map((node) => (
                <li key={node.id}>
                  <strong>{node.label}</strong> <span>({node.type})</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="builder-json" data-testid="builder-preview">
            <h3>AI payload</h3>
            <pre>{JSON.stringify(payload, null, 2)}</pre>
          </div>
        </div>
      </div>
    </section>
  );
}
