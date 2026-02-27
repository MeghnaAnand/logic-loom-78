// Micro-lesson content for pre-puzzle explainers and post-puzzle breakdowns
// Keyed by block type for reusable concept explanations

import type { BlockType } from "./challenges";

export interface MicroLesson {
  concept: string;
  emoji: string;
  explanation: string;
  realWorldTool: string; // e.g. "Zapier Trigger", "Make Scenario"
}

export interface PostBreakdownStep {
  blockLabel: string;
  icon: string;
  why: string;
  realTool: string; // "In Zapier, this is…" / "In Make, this is…"
}

/** Concept explainers by block type */
export const BLOCK_TYPE_LESSONS: Record<BlockType, MicroLesson> = {
  trigger: {
    concept: "Triggers",
    emoji: "⚡",
    explanation:
      "Triggers start every automation. They listen for an event — like a new email, a form submission, or a scheduled time — and kick off the workflow.",
    realWorldTool: "In Zapier this is the 'Trigger' step. In Make, it's the first module in a scenario.",
  },
  condition: {
    concept: "Conditions",
    emoji: "🔀",
    explanation:
      "Conditions check if something is true or false, then route the flow accordingly. Think of them as 'if this, then that' decision points.",
    realWorldTool: "In Zapier this is a 'Filter' or 'Path'. In Make, it's a 'Router' with conditions.",
  },
  action: {
    concept: "Actions",
    emoji: "⚙️",
    explanation:
      "Actions do the actual work — sending an email, updating a record, creating a file. They're the 'verbs' of your automation.",
    realWorldTool: "In Zapier these are 'Action' steps. In Make, they're modules like 'Create a Record'.",
  },
  data: {
    concept: "Data Steps",
    emoji: "📊",
    explanation:
      "Data steps extract, transform, or enrich information. They prepare raw data so the next steps can use it properly.",
    realWorldTool: "In Zapier this is a 'Formatter' or 'Lookup'. In Make, it's a 'Set Variable' or 'Parse' module.",
  },
  output: {
    concept: "Outputs",
    emoji: "📤",
    explanation:
      "Outputs are the final result — a notification sent, a report saved, a log updated. They're how you confirm the automation did its job.",
    realWorldTool: "In Zapier this is often the last Action. In Make, it's the final module that stores or sends results.",
  },
};

/** Get the primary concept for a challenge based on its block types */
export function getChallengeLesson(blockTypes: BlockType[]): {
  primaryConcept: MicroLesson;
  secondaryConcepts: MicroLesson[];
} {
  // Find the most "interesting" concept (not trigger, since every puzzle has one)
  const uniqueTypes = [...new Set(blockTypes)];
  const priority: BlockType[] = ["condition", "data", "action", "output", "trigger"];
  const primaryType = priority.find((t) => uniqueTypes.includes(t)) || "trigger";
  const primary = BLOCK_TYPE_LESSONS[primaryType];
  const secondary = uniqueTypes
    .filter((t) => t !== primaryType)
    .map((t) => BLOCK_TYPE_LESSONS[t]);

  return { primaryConcept: primary, secondaryConcepts: secondary };
}

/** Generate post-puzzle breakdown steps */
export function getBreakdownSteps(
  blocks: { id: string; type: BlockType; label: string; icon: string }[]
): PostBreakdownStep[] {
  return blocks.map((block, i) => {
    const lesson = BLOCK_TYPE_LESSONS[block.type];
    const positionContext =
      i === 0
        ? "This comes first because every automation needs something to start it."
        : i === blocks.length - 1
          ? "This is the final step — it delivers the result of all the work above."
          : `Step ${i + 1}: this ${block.type === "condition" ? "decides what happens next" : block.type === "data" ? "prepares the information" : "performs the action"}.`;

    return {
      blockLabel: `${block.icon} ${block.label}`,
      icon: lesson.emoji,
      why: positionContext,
      realTool: lesson.realWorldTool,
    };
  });
}
