export interface GameBlock {
  id: string;
  type: "trigger" | "action" | "condition";
  label: string;
  icon: string;
}

export interface Connection {
  from: string;
  to: string;
  branch?: "yes" | "no";
}

export interface TestItem {
  label: string;
  amount?: number;
  conditionResult?: "yes" | "no";
  actionLabel: string;
  path: "direct" | "yes" | "no";
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  difficulty: number; // 1-5
  newConcept?: string;
  learningGoal?: string;
  estimatedTime?: string;
  challenge: string;
  goal: string;
  hint: string;
  blocks: GameBlock[];
  maxTriggers: number;
  maxActions: number;
  maxConditions: number;
  validate: (connections: Connection[], canvasBlocks: GameBlock[]) => boolean;
  testData: TestItem[];
  successTitle: string;
  successSubtitle: string;
  failureMessage: string;
  failureHint: string;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Your First Automation",
    subtitle: "Level 1",
    difficulty: 1,
    newConcept: "Automation Basics",
    learningGoal: "Trigger → Action flow",
    estimatedTime: "~3 minutes",
    challenge:
      "You run a small online shop. Every time someone fills out your contact form, you need to save their information. Right now you're copying it manually. Let's automate this!",
    goal: "Connect the right trigger to the right action to automatically save form submissions.",
    hint: "Which trigger fires when a form is filled? Which action saves data?",
    blocks: [
      { id: "form-submitted", type: "trigger", label: "Form Submitted", icon: "📝" },
      { id: "email-received", type: "trigger", label: "Email Received", icon: "📧" },
      { id: "schedule-daily", type: "trigger", label: "Schedule: Daily", icon: "⏰" },
      { id: "save-spreadsheet", type: "action", label: "Save to Spreadsheet", icon: "📊" },
      { id: "save-database", type: "action", label: "Save to Database", icon: "💾" },
      { id: "send-email", type: "action", label: "Send Email", icon: "📤" },
    ],
    maxTriggers: 1,
    maxActions: 1,
    maxConditions: 0,
    validate: (connections, blocks) => {
      if (connections.length !== 1) return false;
      const c = connections[0];
      return c.from === "form-submitted" && c.to === "save-spreadsheet";
    },
    testData: [
      { label: "John (john@email.com)", actionLabel: "Saved", path: "direct" },
      { label: "Sarah (sarah@email.com)", actionLabel: "Saved", path: "direct" },
      { label: "Mike (mike@email.com)", actionLabel: "Saved", path: "direct" },
      { label: "Emma (emma@email.com)", actionLabel: "Saved", path: "direct" },
      { label: "David (david@email.com)", actionLabel: "Saved", path: "direct" },
    ],
    successTitle: "🎉 You're a natural! All 5 forms saved flawlessly!",
    successSubtitle: "Level 1 crushed! You're on your way to becoming an automation pro 🚀",
    failureMessage: "❌ This automation won't work.",
    failureHint:
      "You need a trigger that detects form submissions and an action that saves data.",
  },
  {
    id: 2,
    title: "Smart Decisions",
    subtitle: "Level 2",
    challenge:
      "Your shop gets orders of all sizes. Large orders over $500 need manager approval before shipping. Smaller orders can be approved automatically.",
    goal: "Build an automation that checks order amounts and routes them correctly:\n• Orders OVER $500 → Send to Manager\n• Orders $500 or LESS → Auto-Approve",
    hint: "You'll need a trigger, a condition to check the amount, and two different actions — one for YES and one for NO.",
    blocks: [
      { id: "order-received", type: "trigger", label: "Order Received", icon: "🛒" },
      { id: "form-submitted", type: "trigger", label: "Form Submitted", icon: "📝" },
      { id: "if-amount-500", type: "condition", label: "IF Amount > $500", icon: "❓" },
      { id: "if-vip", type: "condition", label: "IF Customer = VIP", icon: "⭐" },
      { id: "send-to-manager", type: "action", label: "Send to Manager", icon: "👔" },
      { id: "auto-approve", type: "action", label: "Auto-Approve", icon: "✅" },
      { id: "save-spreadsheet", type: "action", label: "Save to Spreadsheet", icon: "📊" },
      { id: "send-welcome", type: "action", label: "Send Welcome Email", icon: "💌" },
    ],
    maxTriggers: 1,
    maxActions: 2,
    maxConditions: 1,
    validate: (connections, blocks) => {
      // Need 3 connections: trigger→condition, condition(yes)→action, condition(no)→action
      if (connections.length !== 3) return false;
      const triggerToCondition = connections.find(
        (c) => c.from === "order-received" && c.to === "if-amount-500" && !c.branch
      );
      const yesPath = connections.find(
        (c) => c.from === "if-amount-500" && c.to === "send-to-manager" && c.branch === "yes"
      );
      const noPath = connections.find(
        (c) => c.from === "if-amount-500" && c.to === "auto-approve" && c.branch === "no"
      );
      return !!triggerToCondition && !!yesPath && !!noPath;
    },
    testData: [
      { label: "$750", amount: 750, conditionResult: "yes", actionLabel: "Sent to Manager", path: "yes" },
      { label: "$200", amount: 200, conditionResult: "no", actionLabel: "Auto-Approved", path: "no" },
      { label: "$1,200", amount: 1200, conditionResult: "yes", actionLabel: "Sent to Manager", path: "yes" },
      { label: "$89", amount: 89, conditionResult: "no", actionLabel: "Auto-Approved", path: "no" },
      { label: "$450", amount: 450, conditionResult: "no", actionLabel: "Auto-Approved", path: "no" },
      { label: "$820", amount: 820, conditionResult: "yes", actionLabel: "Sent to Manager", path: "yes" },
      { label: "$95", amount: 95, conditionResult: "no", actionLabel: "Auto-Approved", path: "no" },
      { label: "$1,500", amount: 1500, conditionResult: "yes", actionLabel: "Sent to Manager", path: "yes" },
      { label: "$320", amount: 320, conditionResult: "no", actionLabel: "Auto-Approved", path: "no" },
      { label: "$670", amount: 670, conditionResult: "yes", actionLabel: "Sent to Manager", path: "yes" },
    ],
    successTitle: "🎉 Perfect! 10/10 orders routed correctly!",
    successSubtitle:
      "5 sent to manager, 5 auto-approved. You've mastered conditional logic! 🧠",
    failureMessage: "❌ Not quite right. Orders are being routed incorrectly.",
    failureHint:
      "You need a CONDITION block to check the amount, then TWO different actions — one for YES and one for NO.",
  },
];
