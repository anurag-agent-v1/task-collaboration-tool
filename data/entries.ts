export type Entry = {
  id: string;
  title: string;
  type: "memory" | "conversation";
  date: string;
  summary: string;
  tags: string[];
  detail: string;
};

const entries: Entry[] = [
  {
    id: "mb-001",
    title: "Refined onboarding checklist",
    type: "memory",
    date: "2026-03-09",
    summary: "Captured the latest steps and reminders for new teammates.",
    detail: "Documented onboarding modules, assigned reading, and people to meet in the first 2 weeks.",
    tags: ["process", "team", "onboarding"]
  },
  {
    id: "mb-002",
    title: "Design sync recap",
    type: "conversation",
    date: "2026-03-07",
    summary: "Jess shared the rationale behind the simplified card layout.",
    detail: "Key decisions: reduce density on the homepage, keep contrast high, and treat animations as optional.",
    tags: ["design", "meeting", "team"]
  },
  {
    id: "mb-003",
    title: "Quarterly goals review",
    type: "conversation",
    date: "2026-03-02",
    summary: "Strategy call that scoped the next sprint’s metrics.",
    detail: "Agreed on focusing on activation rate (+12%), bridging analytics gaps, and documenting the playbook.",
    tags: ["strategy", "metrics"]
  },
  {
    id: "mb-004",
    title: "Browser automation idea",
    type: "memory",
    date: "2026-02-25",
    summary: "Experimented with a small script to sync quick notes from the command line.",
    detail: "Explored shell hooks and simple HTML parsing so that future references can be clipped into the second brain.",
    tags: ["experiment", "automation"]
  },
  {
    id: "mb-005",
    title: "Customer story — revenue team",
    type: "conversation",
    date: "2026-02-15",
    summary: "Spoke with Maya about how the dashboard shifted her workflow.",
    detail: "She valued the ‘reviewed by’ timeline and requested deeper filtering to audit wins and blockers.",
    tags: ["customer", "feedback"]
  },
  {
    id: "mb-006",
    title: "Personal note on focus",
    type: "memory",
    date: "2026-01-30",
    summary: "Reminder to batch deep work in the mornings and let the afternoons be for outreach.",
    detail: "Written after noticing the strongest results arrive when the first two hours are shielded from chat.",
    tags: ["personal", "habits"]
  }
];

export default entries;
