export type AGUIComponentType = "text" | "button" | "input" | "card" | "list";

export interface AGUIComponent {
  id: string;
  type: AGUIComponentType;
  label?: string;
  content?: string;
  props?: Record<string, string | number | boolean>;
  children?: AGUIComponent[];
}

export interface AGUIIntent {
  id: string;
  title: string;
  description: string;
  tone: "calm" | "assertive" | "neutral" | "curious";
  priority: "low" | "medium" | "high";
  components: AGUIComponent[];
  metadata: {
    version: string;
    origin: string;
  };
}

export const aguiTemplates: Record<string, AGUIIntent> = {
  onboarding: {
    id: "intent-onboarding",
    title: "Guided onboarding",
    description: "Introduce new users to the AG-UI workflow with friendly prompts.",
    tone: "calm",
    priority: "medium",
    components: [
      {
        id: "card-welcome",
        type: "card",
        label: "Welcome card",
        children: [
          {
            id: "text-welcome",
            type: "text",
            content: "Welcome! AG-UI will keep the experience flowing while you stay in control.",
            props: { weight: "medium" }
          },
          {
            id: "button-start",
            type: "button",
            label: "Start tour",
            props: { variant: "primary" }
          }
        ]
      }
    ],
    metadata: {
      version: "1.0",
      origin: "template"
    }
  },
  assistant: {
    id: "intent-assistant",
    title: "Assistant summary",
    description: "Surface the latest agent insights and let users react.",
    tone: "assertive",
    priority: "high",
    components: [
      {
        id: "list-suggestions",
        type: "list",
        label: "Suggestions",
        children: [
          {
            id: "text-suggestion-1",
            type: "text",
            content: "Draft the AG-UI generative UI plan based on the introduction guide."
          },
          {
            id: "button-approve",
            type: "button",
            label: "Approve",
            props: { color: "green" }
          }
        ]
      }
    ],
    metadata: {
      version: "1.2",
      origin: "template"
    }
  }
};

export interface AGUIPayloadOptions {
  template: keyof typeof aguiTemplates;
  overrides?: Partial<Omit<AGUIIntent, "components">>;
  componentOverrides?: Partial<Record<string, Partial<AGUIComponent>>>;
}

export function buildAGUIPayload(options: AGUIPayloadOptions): AGUIIntent {
  const template = aguiTemplates[options.template];
  const clonedComponents = template.components.map((component) => ({
    ...component,
    props: { ...component.props },
    children: component.children?.map((child) => ({ ...child }))
  }));

  const patchedComponents = clonedComponents.map((component) => {
    const override = options.componentOverrides?.[component.id];
    if (!override) {
      return component;
    }
    return {
      ...component,
      ...override,
      props: { ...(component.props ?? {}), ...(override.props ?? {}) },
      children: override.children ?? component.children
    };
  });

  return {
    ...template,
    ...options.overrides,
    components: patchedComponents
  };
}

export function summarizeGeneratedIntent(intent: AGUIIntent) {
  return `${intent.title} • ${intent.description} (${intent.priority} priority)`;
}
