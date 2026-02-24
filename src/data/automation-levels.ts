export interface GameBlock {
  id: string;
  type: "trigger" | "action" | "condition" | "data";
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
  /** Level 3: extraction steps shown during test */
  extractions?: string[];
}

export interface DataPreviewItem {
  original: string;
  extracted: { label: string; value: string }[];
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  difficulty: number;
  newConcept?: string;
  learningGoal?: string;
  estimatedTime?: string;
  averageTime?: string;
  bonusChallenge?: string;
  challenge: string;
  goal: string;
  hint: string;
  blocks: GameBlock[];
  maxTriggers: number;
  maxActions: number;
  maxConditions: number;
  maxData?: number;
  /** Level uses linear chain layout instead of branching */
  layout?: "simple" | "branch" | "chain";
  /** Expected block order for chain validation */
  chainOrder?: string[];
  validate: (connections: Connection[], canvasBlocks: GameBlock[]) => boolean;
  testData: TestItem[];
  dataPreview?: DataPreviewItem[];
  successTitle: string;
  successSubtitle: string;
  failureMessage: string;
  failureHint: string;
  teachingTip?: string;
}

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    title: "Your First Automation",
    subtitle: "Level 1",
    difficulty: 2,
    newConcept: "Automation Basics",
    learningGoal: "Trigger → Action flow",
    estimatedTime: "~3 minutes",
    averageTime: "3:45",
    layout: "simple",
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
    difficulty: 3,
    newConcept: "Decision Making",
    learningGoal: "Conditional logic (IF/ELSE)",
    estimatedTime: "~5 minutes",
    averageTime: "5:30",
    layout: "branch",
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
      "You need a CONDITION block to check the amount, then TWO different actions based on YES or NO.",
  },
  {
    id: 3,
    title: "Data Detective",
    subtitle: "Level 3",
    difficulty: 5,
    newConcept: "Data Extraction",
    learningGoal: "Multi-step data transformation",
    estimatedTime: "~7 minutes",
    averageTime: "6:15",
    bonusChallenge: "What if you also needed to extract a phone number? You'd add a 4th extraction block — try imagining where it would go in the chain!",
    layout: "chain",
    challenge:
      "Your inbox is flooding with messy order confirmation emails. Each email contains an order number, customer name, and amount buried in paragraphs of text. You need to extract this data and save it cleanly.",
    goal: "Build a 5-block chain that extracts data step by step:\n📧 Email → 🔍 Extract Order # → 👤 Extract Customer → 💲 Extract Amount → 💾 Save",
    hint: "Connect blocks in sequence: trigger first, then all three extraction steps in order, then the save action at the end.",
    blocks: [
      { id: "email-received", type: "trigger", label: "Email Received", icon: "📧" },
      { id: "webhook-fired", type: "trigger", label: "Webhook Fired", icon: "🔗" },
      { id: "extract-order", type: "data", label: "Extract Order #", icon: "🔍" },
      { id: "extract-customer", type: "data", label: "Extract Customer", icon: "👤" },
      { id: "extract-amount", type: "data", label: "Extract Amount", icon: "💲" },
      { id: "format-date", type: "data", label: "Format Date", icon: "📅" },
      { id: "save-database", type: "action", label: "Save to Database", icon: "💾" },
      { id: "send-slack", type: "action", label: "Send to Slack", icon: "💬" },
    ],
    maxTriggers: 1,
    maxActions: 1,
    maxConditions: 0,
    maxData: 3,
    chainOrder: ["email-received", "extract-order", "extract-customer", "extract-amount", "save-database"],
    validate: (connections, blocks) => {
      // Must have exactly 4 connections forming the correct chain
      if (connections.length !== 4) return false;
      const chain = [
        connections.find((c) => c.from === "email-received" && c.to === "extract-order"),
        connections.find((c) => c.from === "extract-order" && c.to === "extract-customer"),
        connections.find((c) => c.from === "extract-customer" && c.to === "extract-amount"),
        connections.find((c) => c.from === "extract-amount" && c.to === "save-database"),
      ];
      return chain.every(Boolean);
    },
    testData: [
      {
        label: "Email #1",
        actionLabel: "Saved ✓",
        path: "direct",
        extractions: ["ORD-4521", "Sarah Johnson", "$299"],
      },
      {
        label: "Email #2",
        actionLabel: "Saved ✓",
        path: "direct",
        extractions: ["ORD-7833", "Mike Chen", "$1,450"],
      },
      {
        label: "Email #3",
        actionLabel: "Saved ✓",
        path: "direct",
        extractions: ["ORD-2190", "Emma Wilson", "$89"],
      },
      {
        label: "Email #4",
        actionLabel: "Saved ✓",
        path: "direct",
        extractions: ["ORD-5567", "James Rivera", "$675"],
      },
      {
        label: "Email #5",
        actionLabel: "Saved ✓",
        path: "direct",
        extractions: ["ORD-9012", "Ana López", "$340"],
      },
    ],
    dataPreview: [
      {
        original: "Hi, this is to confirm order ORD-4521 placed by Sarah Johnson for a total of $299. Thank you for shopping!",
        extracted: [
          { label: "Order", value: "ORD-4521" },
          { label: "Customer", value: "Sarah Johnson" },
          { label: "Amount", value: "$299" },
        ],
      },
      {
        original: "Order confirmation: ORD-7833. Customer Mike Chen ordered items worth $1,450. Shipping in 3 days.",
        extracted: [
          { label: "Order", value: "ORD-7833" },
          { label: "Customer", value: "Mike Chen" },
          { label: "Amount", value: "$1,450" },
        ],
      },
    ],
    successTitle: "🎉 Data Detective extraordinaire! 5/5 emails extracted perfectly!",
    successSubtitle: "You turned messy emails into clean, structured data. Real-world skill unlocked! 📊",
    failureMessage: "❌ The extraction pipeline isn't right.",
    failureHint:
      "Make sure all 3 extraction blocks are connected in the correct sequence: Order → Customer → Amount. The trigger starts the chain and the action ends it.",
    teachingTip:
      "💡 What you learned: Real-world data is messy. Automation can extract and clean information from unstructured text — a skill used in thousands of workflows!",
  },
];
