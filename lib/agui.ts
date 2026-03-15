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
  },
  statusBoard: {
    id: "intent-status",
    title: "Status dashboard",
    description: "Visualize the latest agent tasks and let users pull relevant context.",
    tone: "curious",
    priority: "low",
    components: [
      {
        id: "card-status",
        type: "card",
        label: "Agent status",
        children: [
          {
            id: "text-status",
            type: "text",
            content: "Current focus: research the AG-UI generative UI plan and capture action items.",
            props: { weight: "medium" }
          },
          {
            id: "button-refresh",
            type: "button",
            label: "Refresh",
            props: { variant: "ghost" }
          }
        ]
      }
    ],
    metadata: {
      version: "1.1",
      origin: "template"
    }
  }
};

export interface AGUITemplateOption {
  id: keyof typeof aguiTemplates;
  title: string;
  description: string;
  priority: AGUIIntent["priority"];
}

export const aguiTemplateOptions: AGUITemplateOption[] = Object.entries(aguiTemplates).map(([id, template]) => ({
  id: id as keyof typeof aguiTemplates,
  title: template.title,
  description: template.description,
  priority: template.priority
}));

export interface AGUIPayloadOptions {
  template: keyof typeof aguiTemplates;
  overrides?: Partial<Omit<AGUIIntent, "components">>;
  componentOverrides?: Partial<Record<string, Partial<AGUIComponent>>>;
}

export function buildAGUIPayload(options: AGUIPayloadOptions): AGUIIntent {
  const template = aguiTemplates[options.template];

  const cloneComponent = (component: AGUIComponent): AGUIComponent => ({
    ...component,
    props: component.props ? { ...component.props } : undefined,
    children: component.children ? component.children.map(cloneComponent) : undefined
  });

  const applyOverrides = (component: AGUIComponent): AGUIComponent => {
    const clonedChildren = component.children ? component.children.map(applyOverrides) : undefined;
    const override = options.componentOverrides?.[component.id];
    return {
      ...component,
      ...(override ?? {}),
      props: {
        ...(component.props ?? {}),
        ...(override?.props ?? {})
      },
      children: override?.children ?? clonedChildren
    };
  };

  const patchedComponents = template.components.map((component) => applyOverrides(cloneComponent(component)));

  return {
    ...template,
    ...options.overrides,
    components: patchedComponents
  };
}

export function summarizeGeneratedIntent(intent: AGUIIntent) {
  const componentCount = flattenComponents(intent).length;
  return `${intent.title} • ${intent.description} (${intent.priority} priority, ${componentCount} component${componentCount === 1 ? "" : "s"})`;
}

export function flattenComponents(intent: AGUIIntent): AGUIComponent[] {
  const stack: AGUIComponent[] = [...intent.components];
  const collected: AGUIComponent[] = [];

  while (stack.length) {
    const current = stack.shift()!;
    collected.push(current);
    if (current.children) {
      stack.unshift(...current.children);
    }
  }

  return collected;
}

export interface AGUIN8NContext {
  agentId: string;
  channel: string;
  callbackUrl?: string;
}

export interface AGUIN8NNode {
  id: string;
  type: string;
  label: string;
  params: Record<string, unknown>;
}

export interface AGUIN8NFlow {
  trigger: string;
  nodes: AGUIN8NNode[];
  summary: string;
}

export function mapIntentToN8NFlow(intent: AGUIIntent, context: AGUIN8NContext): AGUIN8NFlow {
  const webhookPath = `/webhooks/ag-ui/${context.channel}`;
  const callback = context.callbackUrl ?? `https://agents.local/${context.agentId}/run`;

  const nodes: AGUIN8NNode[] = [
    {
      id: "webhook-receive",
      type: "Webhook",
      label: "Capture AG-UI payload",
      params: {
        path: webhookPath,
        method: "POST"
      }
    },
    {
      id: "set-metadata",
      type: "Set",
      label: "Normalize intent metadata",
      params: {
        values: [
          { key: "tone", value: intent.tone },
          { key: "priority", value: intent.priority },
          { key: "summary", value: intent.description }
        ]
      }
    },
    {
      id: "dispatch-agent",
      type: "HTTP Request",
      label: "Dispatch to agent runtime",
      params: {
        url: callback,
        method: "POST",
        body: {
          intentId: intent.id,
          intentPayload: intent,
          channel: context.channel
        }
      }
    }
  ];

  return {
    trigger: `Webhook listens on ${webhookPath}`,
    nodes,
    summary: `Intent "${intent.title}" flows through nodes for agent ${context.agentId}.`
  };
}
