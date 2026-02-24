export type BlockType = "trigger" | "action" | "condition" | "data" | "output";

export interface Block {
  id: string;
  type: BlockType;
  label: string;
  icon: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  scenario: string;
  availableBlocks: Block[];
  correctOrder: string[]; // block IDs in correct order
  hint: string;
  successMessage: string;
}

export const challenges: Challenge[] = [
  {
    id: "job-application",
    title: "Auto-Apply to Jobs",
    description: "Build an automation that finds new job listings and sends your application automatically.",
    difficulty: "beginner",
    scenario: "You're job hunting and want to automate the repetitive parts. Build a flow that watches for new listings, filters by your skills, and sends applications.",
    availableBlocks: [
      { id: "watch-listings", type: "trigger", label: "New Job Posted", icon: "👀" },
      { id: "filter-skills", type: "condition", label: "Matches My Skills?", icon: "🎯" },
      { id: "format-resume", type: "action", label: "Tailor Resume", icon: "📄" },
      { id: "send-app", type: "action", label: "Send Application", icon: "📨" },
      { id: "log-result", type: "output", label: "Log to Tracker", icon: "📊" },
    ],
    correctOrder: ["watch-listings", "filter-skills", "format-resume", "send-app", "log-result"],
    hint: "Think about the order: first you need to detect something, then decide, then act!",
    successMessage: "🎉 You just automated job applications! This is exactly how tools like Zapier work.",
  },
  {
    id: "email-workflow",
    title: "Smart Email Sorter",
    description: "Create an automation that reads incoming emails and sorts them into the right folders.",
    difficulty: "beginner",
    scenario: "Your inbox is chaos. Build a flow that reads each email, checks who it's from, and files it appropriately.",
    availableBlocks: [
      { id: "new-email", type: "trigger", label: "Email Received", icon: "📬" },
      { id: "read-sender", type: "data", label: "Extract Sender", icon: "🔍" },
      { id: "check-priority", type: "condition", label: "Is Priority?", icon: "⚡" },
      { id: "move-folder", type: "action", label: "Move to Folder", icon: "📁" },
      { id: "send-notification", type: "output", label: "Notify Me", icon: "🔔" },
    ],
    correctOrder: ["new-email", "read-sender", "check-priority", "move-folder", "send-notification"],
    hint: "Start with the trigger — what kicks off this whole process?",
    successMessage: "🎉 Inbox zero, automated! You just built a real email automation workflow.",
  },
  {
    id: "data-pipeline",
    title: "Sales Report Builder",
    description: "Automate pulling sales data, crunching numbers, and generating a weekly report.",
    difficulty: "intermediate",
    scenario: "Every Monday your boss wants a sales report. Instead of spending 2 hours on it, automate the whole thing.",
    availableBlocks: [
      { id: "schedule", type: "trigger", label: "Every Monday 9AM", icon: "⏰" },
      { id: "fetch-data", type: "data", label: "Pull Sales Data", icon: "📥" },
      { id: "calculate", type: "action", label: "Calculate Totals", icon: "🧮" },
      { id: "check-target", type: "condition", label: "Hit Target?", icon: "🎯" },
      { id: "generate-report", type: "output", label: "Create PDF Report", icon: "📑" },
    ],
    correctOrder: ["schedule", "fetch-data", "calculate", "check-target", "generate-report"],
    hint: "What comes first — the schedule or the data? Think chronologically.",
    successMessage: "🎉 No more manual reports! You just built a data pipeline used by real businesses.",
  },
];
