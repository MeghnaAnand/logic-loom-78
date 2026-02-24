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

const allChallenges: Challenge[] = [
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
  {
    id: "social-media-poster",
    title: "Social Media Auto-Poster",
    description: "Schedule and post content across multiple social media platforms automatically.",
    difficulty: "beginner",
    scenario: "You manage social media for a brand. Instead of logging into each platform, automate posting from a single content queue.",
    availableBlocks: [
      { id: "content-ready", type: "trigger", label: "New Content Ready", icon: "✏️" },
      { id: "resize-image", type: "action", label: "Resize Image", icon: "🖼️" },
      { id: "check-schedule", type: "condition", label: "Best Time to Post?", icon: "🕐" },
      { id: "post-social", type: "action", label: "Post to Platforms", icon: "📱" },
      { id: "track-engagement", type: "output", label: "Track Engagement", icon: "📈" },
    ],
    correctOrder: ["content-ready", "resize-image", "check-schedule", "post-social", "track-engagement"],
    hint: "Prepare the content first, then decide when to post, then post and track!",
    successMessage: "🎉 Content marketing on autopilot! Social media managers love this kind of automation.",
  },
  {
    id: "customer-onboarding",
    title: "Customer Welcome Flow",
    description: "Automate the onboarding process for new customers who sign up.",
    difficulty: "beginner",
    scenario: "Every new customer needs a welcome email, account setup, and a follow-up. Build the flow to handle it all automatically.",
    availableBlocks: [
      { id: "new-signup", type: "trigger", label: "New Signup", icon: "🆕" },
      { id: "create-account", type: "action", label: "Create Account", icon: "👤" },
      { id: "send-welcome", type: "action", label: "Send Welcome Email", icon: "💌" },
      { id: "schedule-followup", type: "action", label: "Schedule Follow-up", icon: "📅" },
      { id: "log-crm", type: "output", label: "Log in CRM", icon: "📋" },
    ],
    correctOrder: ["new-signup", "create-account", "send-welcome", "schedule-followup", "log-crm"],
    hint: "First the trigger, then create the account before you can welcome them!",
    successMessage: "🎉 Smooth onboarding! Every new customer now gets the VIP treatment automatically.",
  },
  {
    id: "inventory-alert",
    title: "Low Stock Alert",
    description: "Monitor inventory levels and alert the team when stock runs low.",
    difficulty: "intermediate",
    scenario: "Your warehouse needs to reorder products before they sell out. Build an automation that checks stock and alerts when it's low.",
    availableBlocks: [
      { id: "check-inventory", type: "trigger", label: "Hourly Stock Check", icon: "📦" },
      { id: "read-levels", type: "data", label: "Read Stock Levels", icon: "📊" },
      { id: "below-threshold", type: "condition", label: "Below Minimum?", icon: "⚠️" },
      { id: "send-alert", type: "action", label: "Alert Team", icon: "🚨" },
      { id: "create-order", type: "output", label: "Create Reorder", icon: "🛒" },
    ],
    correctOrder: ["check-inventory", "read-levels", "below-threshold", "send-alert", "create-order"],
    hint: "Check stock first, read the data, then decide if action is needed.",
    successMessage: "🎉 Never run out of stock again! Supply chain automation at its finest.",
  },
  {
    id: "bug-tracker",
    title: "Bug Report Processor",
    description: "Automatically triage incoming bug reports and assign them to the right team.",
    difficulty: "intermediate",
    scenario: "Your support team gets dozens of bug reports daily. Automate the triage: extract details, check severity, assign, and notify.",
    availableBlocks: [
      { id: "bug-submitted", type: "trigger", label: "Bug Report Filed", icon: "🐛" },
      { id: "extract-details", type: "data", label: "Extract Bug Details", icon: "🔍" },
      { id: "check-severity", type: "condition", label: "Is Critical?", icon: "🔴" },
      { id: "assign-team", type: "action", label: "Assign to Team", icon: "👥" },
      { id: "notify-slack", type: "output", label: "Notify on Slack", icon: "💬" },
    ],
    correctOrder: ["bug-submitted", "extract-details", "check-severity", "assign-team", "notify-slack"],
    hint: "First get the report, understand it, decide priority, then route it.",
    successMessage: "🎉 Bug triage automated! Your dev team can focus on fixing, not sorting.",
  },
  {
    id: "lead-scoring",
    title: "Lead Scoring Engine",
    description: "Score incoming leads and route hot ones to sales immediately.",
    difficulty: "intermediate",
    scenario: "Your marketing generates leads but sales wastes time on cold ones. Build a scoring system that identifies hot leads fast.",
    availableBlocks: [
      { id: "new-lead", type: "trigger", label: "New Lead Captured", icon: "🎣" },
      { id: "enrich-data", type: "data", label: "Enrich Lead Data", icon: "📇" },
      { id: "score-lead", type: "action", label: "Calculate Score", icon: "⭐" },
      { id: "is-hot", type: "condition", label: "Score > 80?", icon: "🔥" },
      { id: "alert-sales", type: "output", label: "Alert Sales Rep", icon: "📞" },
    ],
    correctOrder: ["new-lead", "enrich-data", "score-lead", "is-hot", "alert-sales"],
    hint: "You need data before you can score it, and a score before you can decide!",
    successMessage: "🎉 Sales pipeline optimized! Hot leads go straight to closers.",
  },
  {
    id: "backup-automation",
    title: "Auto Backup System",
    description: "Automatically back up important files to cloud storage on a schedule.",
    difficulty: "beginner",
    scenario: "You've lost files before and never want it to happen again. Set up an automated nightly backup to the cloud.",
    availableBlocks: [
      { id: "nightly-trigger", type: "trigger", label: "Every Night 2AM", icon: "🌙" },
      { id: "scan-files", type: "data", label: "Scan Changed Files", icon: "🔎" },
      { id: "compress", type: "action", label: "Compress Files", icon: "🗜️" },
      { id: "upload-cloud", type: "action", label: "Upload to Cloud", icon: "☁️" },
      { id: "confirm-backup", type: "output", label: "Send Confirmation", icon: "✅" },
    ],
    correctOrder: ["nightly-trigger", "scan-files", "compress", "upload-cloud", "confirm-backup"],
    hint: "Scan first, then prepare, then upload, then confirm!",
    successMessage: "🎉 Your data is safe! Automated backups run while you sleep.",
  },
  {
    id: "expense-approver",
    title: "Expense Auto-Approver",
    description: "Process expense reports: check amounts, approve or escalate, and log everything.",
    difficulty: "intermediate",
    scenario: "Finance is drowning in expense reports. Automate approval for small expenses and escalate large ones.",
    availableBlocks: [
      { id: "expense-filed", type: "trigger", label: "Expense Submitted", icon: "🧾" },
      { id: "read-amount", type: "data", label: "Read Amount", icon: "💰" },
      { id: "under-limit", type: "condition", label: "Under $200?", icon: "📏" },
      { id: "process-expense", type: "action", label: "Auto-Approve", icon: "✅" },
      { id: "log-finance", type: "output", label: "Log in Finance DB", icon: "🏦" },
    ],
    correctOrder: ["expense-filed", "read-amount", "under-limit", "process-expense", "log-finance"],
    hint: "Read the amount before you can check it against the limit!",
    successMessage: "🎉 Finance team rejoices! Routine expenses are handled automatically.",
  },
  {
    id: "meeting-scheduler",
    title: "Smart Meeting Scheduler",
    description: "Automatically find available slots, send invites, and prepare meeting docs.",
    difficulty: "beginner",
    scenario: "Scheduling meetings is a nightmare of back-and-forth emails. Automate the whole process from request to confirmation.",
    availableBlocks: [
      { id: "meeting-request", type: "trigger", label: "Meeting Requested", icon: "📩" },
      { id: "check-calendar", type: "data", label: "Check Calendars", icon: "📅" },
      { id: "find-slot", type: "action", label: "Find Best Slot", icon: "🕐" },
      { id: "send-invite", type: "action", label: "Send Calendar Invite", icon: "✉️" },
      { id: "prep-doc", type: "output", label: "Create Agenda Doc", icon: "📝" },
    ],
    correctOrder: ["meeting-request", "check-calendar", "find-slot", "send-invite", "prep-doc"],
    hint: "You need to check availability before you can find a slot!",
    successMessage: "🎉 No more scheduling ping-pong! Meetings book themselves now.",
  },
  {
    id: "review-monitor",
    title: "Review Sentiment Monitor",
    description: "Track product reviews, analyze sentiment, and respond to negative ones fast.",
    difficulty: "advanced",
    scenario: "Bad reviews can tank your product. Build an automation that catches negative reviews instantly so you can respond.",
    availableBlocks: [
      { id: "new-review", type: "trigger", label: "New Review Posted", icon: "⭐" },
      { id: "extract-text", type: "data", label: "Extract Review Text", icon: "📖" },
      { id: "analyze-sentiment", type: "action", label: "Analyze Sentiment", icon: "🧠" },
      { id: "is-negative", type: "condition", label: "Is Negative?", icon: "👎" },
      { id: "escalate-team", type: "output", label: "Escalate to Team", icon: "🚀" },
    ],
    correctOrder: ["new-review", "extract-text", "analyze-sentiment", "is-negative", "escalate-team"],
    hint: "Extract the text first, then analyze it, then decide what to do.",
    successMessage: "🎉 Reputation management automated! Negative reviews get instant attention.",
  },
];

/** Number of challenges shown per session */
const SESSION_SIZE = 5;

/** Shuffle array using Fisher-Yates */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const DIFFICULTY_ORDER: Record<Challenge["difficulty"], number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/** Pick SESSION_SIZE random challenges, sorted by ascending difficulty */
export function pickSessionChallenges(): Challenge[] {
  return shuffle(allChallenges)
    .slice(0, SESSION_SIZE)
    .sort((a, b) => DIFFICULTY_ORDER[a.difficulty] - DIFFICULTY_ORDER[b.difficulty]);
}

/** Legacy export — picks a random set on import (for backwards compat) */
export const challenges: Challenge[] = pickSessionChallenges();
