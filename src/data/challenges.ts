export type BlockType = "trigger" | "action" | "condition" | "data" | "output";

/**
 * Structural role of a block — controls visual indentation and connector rendering.
 * - undefined / "step": regular linear step
 * - "if": opens a conditional branch (indents following blocks)
 * - "else": marks the else branch
 * - "endif": closes the conditional
 * - "loop-start": opens a loop (indents following blocks)
 * - "loop-end": closes the loop
 * - "try": opens error handling
 * - "catch": marks the catch branch
 * - "end-try": closes error handling
 */
export type BlockStructure =
  | "step"
  | "if"
  | "else"
  | "endif"
  | "loop-start"
  | "loop-end"
  | "try"
  | "catch"
  | "end-try";

export interface Block {
  id: string;
  type: BlockType;
  label: string;
  icon: string;
  /** Structural role — affects indentation and visual connectors */
  structure?: BlockStructure;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  /** Progressive tier: 1 = linear, 2 = conditions, 3 = loops, 4 = loops+conditions, 5 = error handling + combined */
  tier: 1 | 2 | 3 | 4 | 5;
  /** Short label for the new concept introduced at this tier */
  newConcept?: string;
  scenario: string;
  availableBlocks: Block[];
  correctOrder: string[];
  hint: string;
  successMessage: string;
}

// ──────────────────────────────────────────────
// TIER 1 — Simple linear flows (4-5 blocks)
// Concept: trigger → action → output
// ──────────────────────────────────────────────

const tier1Challenges: Challenge[] = [
  {
    id: "job-application",
    title: "Auto-Apply to Jobs",
    description: "Detect new listings, filter, apply, and log.",
    difficulty: "beginner",
    tier: 1,
    scenario:
      "You're job hunting and want to automate the repetitive parts. Build a simple flow that watches for new listings and sends applications.",
    availableBlocks: [
      { id: "watch-listings", type: "trigger", label: "New Job Posted", icon: "👀" },
      { id: "format-resume", type: "action", label: "Tailor Resume", icon: "📄" },
      { id: "send-app", type: "action", label: "Send Application", icon: "📨" },
      { id: "log-result", type: "output", label: "Log to Tracker", icon: "📊" },
    ],
    correctOrder: ["watch-listings", "format-resume", "send-app", "log-result"],
    hint: "Start with the trigger, then prepare, then act, then log!",
    successMessage: "🎉 Your first linear automation! Trigger → Actions → Output.",
  },
  {
    id: "customer-onboarding",
    title: "Customer Welcome Flow",
    description: "Automate onboarding for new signups.",
    difficulty: "beginner",
    tier: 1,
    scenario:
      "Every new customer needs a welcome email and account setup. Build the flow to handle it automatically.",
    availableBlocks: [
      { id: "new-signup", type: "trigger", label: "New Signup", icon: "🆕" },
      { id: "create-account", type: "action", label: "Create Account", icon: "👤" },
      { id: "send-welcome", type: "action", label: "Send Welcome Email", icon: "💌" },
      { id: "log-crm", type: "output", label: "Log in CRM", icon: "📋" },
    ],
    correctOrder: ["new-signup", "create-account", "send-welcome", "log-crm"],
    hint: "First the trigger, then create the account before you can welcome them!",
    successMessage: "🎉 Smooth onboarding! Simple linear flow mastered.",
  },
  {
    id: "backup-automation",
    title: "Auto Backup System",
    description: "Nightly backup to cloud storage.",
    difficulty: "beginner",
    tier: 1,
    scenario:
      "You've lost files before. Set up an automated nightly backup to the cloud.",
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
    id: "social-media-poster",
    title: "Social Media Auto-Poster",
    description: "Post content across platforms.",
    difficulty: "beginner",
    tier: 1,
    scenario:
      "You manage social media for a brand. Automate posting from a content queue.",
    availableBlocks: [
      { id: "content-ready", type: "trigger", label: "New Content Ready", icon: "✏️" },
      { id: "resize-image", type: "action", label: "Resize Image", icon: "🖼️" },
      { id: "post-social", type: "action", label: "Post to Platforms", icon: "📱" },
      { id: "track-engagement", type: "output", label: "Track Engagement", icon: "📈" },
    ],
    correctOrder: ["content-ready", "resize-image", "post-social", "track-engagement"],
    hint: "Prepare the content first, then post, then track!",
    successMessage: "🎉 Content marketing on autopilot!",
  },
];

// ──────────────────────────────────────────────
// TIER 2 — Conditions (IF / ELSE / ENDIF)
// Concept: branching logic
// ──────────────────────────────────────────────

const tier2Challenges: Challenge[] = [
  {
    id: "expense-approver",
    title: "Expense Auto-Approver",
    description: "Auto-approve small expenses, escalate large ones.",
    difficulty: "intermediate",
    tier: 2,
    newConcept: "IF / ELSE branching",
    scenario:
      "Finance gets hundreds of expense reports. Automate approval for small expenses and escalate large ones to a manager.",
    availableBlocks: [
      { id: "expense-filed", type: "trigger", label: "Expense Submitted", icon: "🧾" },
      { id: "read-amount", type: "data", label: "Read Amount", icon: "💰" },
      { id: "if-under-200", type: "condition", label: "IF Under $200", icon: "❓", structure: "if" },
      { id: "auto-approve", type: "action", label: "Auto-Approve", icon: "✅" },
      { id: "else-over", type: "condition", label: "ELSE (Over $200)", icon: "↪️", structure: "else" },
      { id: "send-manager", type: "action", label: "Send to Manager", icon: "👔" },
      { id: "endif-expense", type: "condition", label: "END IF", icon: "⏹️", structure: "endif" },
      { id: "log-finance", type: "output", label: "Log in Finance DB", icon: "🏦" },
    ],
    correctOrder: ["expense-filed", "read-amount", "if-under-200", "auto-approve", "else-over", "send-manager", "endif-expense", "log-finance"],
    hint: "After reading the amount, use IF to branch: one path auto-approves, the other escalates. END IF merges the paths, then log.",
    successMessage: "🎉 You just built conditional logic! IF amount < $200 → approve, ELSE → escalate.",
  },
  {
    id: "email-sorter-v2",
    title: "Smart Email Sorter",
    description: "Route priority vs normal emails differently.",
    difficulty: "intermediate",
    tier: 2,
    newConcept: "IF / ELSE branching",
    scenario:
      "Your inbox is chaos. Priority emails need instant attention; normal ones just get filed.",
    availableBlocks: [
      { id: "new-email", type: "trigger", label: "Email Received", icon: "📬" },
      { id: "read-sender", type: "data", label: "Extract Sender", icon: "🔍" },
      { id: "if-priority", type: "condition", label: "IF Is Priority", icon: "❓", structure: "if" },
      { id: "notify-urgent", type: "action", label: "Send Urgent Alert", icon: "🚨" },
      { id: "else-normal", type: "condition", label: "ELSE (Normal)", icon: "↪️", structure: "else" },
      { id: "file-folder", type: "action", label: "Move to Folder", icon: "📁" },
      { id: "endif-email", type: "condition", label: "END IF", icon: "⏹️", structure: "endif" },
      { id: "log-processed", type: "output", label: "Log Processed", icon: "📊" },
    ],
    correctOrder: ["new-email", "read-sender", "if-priority", "notify-urgent", "else-normal", "file-folder", "endif-email", "log-processed"],
    hint: "Extract sender info, then IF priority → alert, ELSE → file. END IF before logging.",
    successMessage: "🎉 Branching mastered! Priority emails get alerts, normal ones get filed.",
  },
  {
    id: "lead-router",
    title: "Lead Scoring Router",
    description: "Route hot leads to sales, cold leads to nurture.",
    difficulty: "intermediate",
    tier: 2,
    newConcept: "IF / ELSE branching",
    scenario:
      "Marketing captures leads but sales wastes time on cold ones. Score them and route accordingly.",
    availableBlocks: [
      { id: "new-lead", type: "trigger", label: "New Lead Captured", icon: "🎣" },
      { id: "enrich-data", type: "data", label: "Enrich Lead Data", icon: "📇" },
      { id: "score-lead", type: "action", label: "Calculate Score", icon: "⭐" },
      { id: "if-hot", type: "condition", label: "IF Score > 80", icon: "❓", structure: "if" },
      { id: "alert-sales", type: "action", label: "Alert Sales Rep", icon: "📞" },
      { id: "else-cold", type: "condition", label: "ELSE (Cold)", icon: "↪️", structure: "else" },
      { id: "add-nurture", type: "action", label: "Add to Nurture List", icon: "📧" },
      { id: "endif-lead", type: "condition", label: "END IF", icon: "⏹️", structure: "endif" },
    ],
    correctOrder: ["new-lead", "enrich-data", "score-lead", "if-hot", "alert-sales", "else-cold", "add-nurture", "endif-lead"],
    hint: "Enrich data → score → IF hot → sales, ELSE → nurture. Close with END IF.",
    successMessage: "🎉 Conditional routing! Hot leads → sales, cold leads → nurture campaigns.",
  },
];

// ──────────────────────────────────────────────
// TIER 3 — Loops (FOR EACH / END LOOP)
// Concept: iteration over collections
// ──────────────────────────────────────────────

const tier3Challenges: Challenge[] = [
  {
    id: "batch-invoices",
    title: "Batch Invoice Sender",
    description: "Loop through pending invoices and send each one.",
    difficulty: "intermediate",
    tier: 3,
    newConcept: "FOR EACH loops",
    scenario:
      "Your accounting system has 50 pending invoices every Friday. Instead of sending them one by one, loop through them all automatically.",
    availableBlocks: [
      { id: "friday-trigger", type: "trigger", label: "Every Friday 5PM", icon: "📅" },
      { id: "fetch-invoices", type: "data", label: "Fetch Pending Invoices", icon: "📋" },
      { id: "for-each-invoice", type: "action", label: "FOR EACH Invoice", icon: "🔄", structure: "loop-start" },
      { id: "generate-pdf", type: "action", label: "Generate PDF", icon: "📄" },
      { id: "send-email", type: "action", label: "Send to Customer", icon: "📧" },
      { id: "end-loop-invoice", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "send-summary", type: "output", label: "Send Summary Report", icon: "📊" },
    ],
    correctOrder: ["friday-trigger", "fetch-invoices", "for-each-invoice", "generate-pdf", "send-email", "end-loop-invoice", "send-summary"],
    hint: "Fetch all invoices, then FOR EACH one: generate PDF → send email. END LOOP, then summary.",
    successMessage: "🎉 Loops unlocked! You just processed a whole collection of invoices automatically.",
  },
  {
    id: "data-cleanup",
    title: "Database Cleanup Bot",
    description: "Loop through records, clean duplicates, archive old ones.",
    difficulty: "intermediate",
    tier: 3,
    newConcept: "FOR EACH loops",
    scenario:
      "Your CRM has thousands of messy records. Loop through them to standardize and clean the data.",
    availableBlocks: [
      { id: "daily-trigger", type: "trigger", label: "Every Day 3AM", icon: "🌙" },
      { id: "fetch-records", type: "data", label: "Fetch All Records", icon: "📥" },
      { id: "for-each-record", type: "action", label: "FOR EACH Record", icon: "🔄", structure: "loop-start" },
      { id: "normalize", type: "action", label: "Normalize Fields", icon: "🔧" },
      { id: "deduplicate", type: "action", label: "Remove Duplicates", icon: "🗑️" },
      { id: "end-loop-records", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "log-cleaned", type: "output", label: "Log Cleaned Count", icon: "📊" },
    ],
    correctOrder: ["daily-trigger", "fetch-records", "for-each-record", "normalize", "deduplicate", "end-loop-records", "log-cleaned"],
    hint: "Fetch all records, then loop: normalize → deduplicate inside the loop. Close loop, then log.",
    successMessage: "🎉 Batch processing mastered! You cleaned an entire database with a loop.",
  },
  {
    id: "multi-platform-post",
    title: "Multi-Platform Publisher",
    description: "Loop through social platforms and post to each one.",
    difficulty: "intermediate",
    tier: 3,
    newConcept: "FOR EACH loops",
    scenario:
      "You need to post the same content across Twitter, LinkedIn, Instagram, and Facebook. Loop through each platform.",
    availableBlocks: [
      { id: "content-approved", type: "trigger", label: "Content Approved", icon: "✅" },
      { id: "get-platforms", type: "data", label: "Get Platform List", icon: "📋" },
      { id: "for-each-platform", type: "action", label: "FOR EACH Platform", icon: "🔄", structure: "loop-start" },
      { id: "format-post", type: "action", label: "Format for Platform", icon: "🎨" },
      { id: "publish", type: "action", label: "Publish Post", icon: "📤" },
      { id: "end-loop-platform", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "track-results", type: "output", label: "Track Engagement", icon: "📈" },
    ],
    correctOrder: ["content-approved", "get-platforms", "for-each-platform", "format-post", "publish", "end-loop-platform", "track-results"],
    hint: "Get the platform list, then loop: format → publish per platform. End loop, then track.",
    successMessage: "🎉 One post, many platforms! Loops make batch operations easy.",
  },
];

// ──────────────────────────────────────────────
// TIER 4 — Loops + Conditions combined
// Concept: nested logic — loops containing branches
// ──────────────────────────────────────────────

const tier4Challenges: Challenge[] = [
  {
    id: "order-fulfillment",
    title: "Smart Order Fulfillment",
    description: "Loop through orders, conditionally route each one.",
    difficulty: "advanced",
    tier: 4,
    newConcept: "Nested logic (loops + conditions)",
    scenario:
      "You have a batch of orders. Each one needs different handling: domestic orders ship immediately, international orders need customs forms first.",
    availableBlocks: [
      { id: "batch-trigger", type: "trigger", label: "New Order Batch", icon: "📦" },
      { id: "fetch-orders", type: "data", label: "Fetch All Orders", icon: "📋" },
      { id: "for-each-order", type: "action", label: "FOR EACH Order", icon: "🔄", structure: "loop-start" },
      { id: "if-international", type: "condition", label: "IF International", icon: "❓", structure: "if" },
      { id: "customs-form", type: "action", label: "Generate Customs", icon: "📝" },
      { id: "else-domestic", type: "condition", label: "ELSE (Domestic)", icon: "↪️", structure: "else" },
      { id: "ship-direct", type: "action", label: "Ship Directly", icon: "🚚" },
      { id: "endif-order", type: "condition", label: "END IF", icon: "⏹️", structure: "endif" },
      { id: "end-loop-orders", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "send-report", type: "output", label: "Send Fulfillment Report", icon: "📊" },
    ],
    correctOrder: [
      "batch-trigger", "fetch-orders", "for-each-order",
      "if-international", "customs-form", "else-domestic", "ship-direct", "endif-order",
      "end-loop-orders", "send-report",
    ],
    hint: "Fetch orders → FOR EACH → IF international → customs, ELSE → ship. END IF inside END LOOP.",
    successMessage: "🎉 Nested logic! You combined loops WITH conditions — real production-level thinking.",
  },
  {
    id: "student-grader",
    title: "Auto Grade Assignments",
    description: "Loop through submissions, grade based on score thresholds.",
    difficulty: "advanced",
    tier: 4,
    newConcept: "Nested logic (loops + conditions)",
    scenario:
      "A professor has 200 student submissions. Loop through each, check the score, and assign pass/fail automatically.",
    availableBlocks: [
      { id: "deadline-passed", type: "trigger", label: "Submission Deadline", icon: "⏰" },
      { id: "fetch-submissions", type: "data", label: "Fetch Submissions", icon: "📥" },
      { id: "for-each-sub", type: "action", label: "FOR EACH Submission", icon: "🔄", structure: "loop-start" },
      { id: "calculate-score", type: "action", label: "Calculate Score", icon: "🧮" },
      { id: "if-passing", type: "condition", label: "IF Score ≥ 60", icon: "❓", structure: "if" },
      { id: "mark-pass", type: "action", label: "Mark as PASS", icon: "✅" },
      { id: "else-fail", type: "condition", label: "ELSE (Below 60)", icon: "↪️", structure: "else" },
      { id: "mark-fail", type: "action", label: "Mark as FAIL", icon: "❌" },
      { id: "endif-grade", type: "condition", label: "END IF", icon: "⏹️", structure: "endif" },
      { id: "end-loop-subs", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "publish-grades", type: "output", label: "Publish Grade Report", icon: "📊" },
    ],
    correctOrder: [
      "deadline-passed", "fetch-submissions", "for-each-sub",
      "calculate-score", "if-passing", "mark-pass", "else-fail", "mark-fail", "endif-grade",
      "end-loop-subs", "publish-grades",
    ],
    hint: "Fetch submissions → LOOP → calculate → IF passing → pass, ELSE → fail. END IF inside END LOOP, then publish.",
    successMessage: "🎉 Complex nested logic mastered! Loop + branch = real-world automation power.",
  },
];

// ──────────────────────────────────────────────
// TIER 5 — Error handling + combined patterns
// Concept: TRY/CATCH + loops + conditions
// ──────────────────────────────────────────────

const tier5Challenges: Challenge[] = [
  {
    id: "api-sync-resilient",
    title: "Resilient API Sync",
    description: "Sync data with error handling — retry failed items.",
    difficulty: "advanced",
    tier: 5,
    newConcept: "TRY / CATCH error handling",
    scenario:
      "You're syncing customer data to an external API. Some requests fail due to timeouts. Build a resilient flow with error handling.",
    availableBlocks: [
      { id: "hourly-sync", type: "trigger", label: "Hourly Sync", icon: "⏰" },
      { id: "fetch-customers", type: "data", label: "Fetch Customers", icon: "📥" },
      { id: "for-each-customer", type: "action", label: "FOR EACH Customer", icon: "🔄", structure: "loop-start" },
      { id: "try-sync", type: "action", label: "TRY", icon: "🛡️", structure: "try" },
      { id: "push-api", type: "action", label: "Push to API", icon: "🔗" },
      { id: "catch-error", type: "action", label: "CATCH Error", icon: "⚠️", structure: "catch" },
      { id: "log-error", type: "action", label: "Log Error & Retry", icon: "🔄" },
      { id: "end-try", type: "action", label: "END TRY", icon: "⏹️", structure: "end-try" },
      { id: "end-loop-sync", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "sync-report", type: "output", label: "Send Sync Report", icon: "📊" },
    ],
    correctOrder: [
      "hourly-sync", "fetch-customers", "for-each-customer",
      "try-sync", "push-api", "catch-error", "log-error", "end-try",
      "end-loop-sync", "sync-report",
    ],
    hint: "Loop through customers. Inside the loop: TRY pushing to API, CATCH any errors and log them. END TRY inside END LOOP.",
    successMessage: "🎉 Production-grade! TRY/CATCH inside loops = real engineering resilience.",
  },
  {
    id: "payment-processor",
    title: "Fault-Tolerant Payments",
    description: "Process payments with error handling and conditional receipts.",
    difficulty: "advanced",
    tier: 5,
    newConcept: "TRY / CATCH + conditions",
    scenario:
      "Process a batch of payments. Each payment might fail (declined card, timeout). Handle errors gracefully and send the right receipt.",
    availableBlocks: [
      { id: "batch-payments", type: "trigger", label: "Payment Batch Ready", icon: "💳" },
      { id: "load-payments", type: "data", label: "Load Payments", icon: "📥" },
      { id: "for-each-pay", type: "action", label: "FOR EACH Payment", icon: "🔄", structure: "loop-start" },
      { id: "try-charge", type: "action", label: "TRY", icon: "🛡️", structure: "try" },
      { id: "charge-card", type: "action", label: "Charge Card", icon: "💰" },
      { id: "send-receipt", type: "output", label: "Send Receipt", icon: "🧾" },
      { id: "catch-decline", type: "action", label: "CATCH Error", icon: "⚠️", structure: "catch" },
      { id: "notify-customer", type: "action", label: "Notify Customer", icon: "📧" },
      { id: "end-try-pay", type: "action", label: "END TRY", icon: "⏹️", structure: "end-try" },
      { id: "end-loop-pay", type: "action", label: "END LOOP", icon: "⏹️", structure: "loop-end" },
      { id: "reconcile", type: "output", label: "Reconciliation Report", icon: "📊" },
    ],
    correctOrder: [
      "batch-payments", "load-payments", "for-each-pay",
      "try-charge", "charge-card", "send-receipt", "catch-decline", "notify-customer", "end-try-pay",
      "end-loop-pay", "reconcile",
    ],
    hint: "Loop through payments. TRY: charge → receipt. CATCH: notify customer. END TRY inside END LOOP, then reconcile.",
    successMessage: "🎉 Enterprise-grade automation! Loops + error handling + outputs = bulletproof systems.",
  },
];

// ──────────────────────────────────────────────
// All challenges combined
// ──────────────────────────────────────────────

const allChallenges: Challenge[] = [
  ...tier1Challenges,
  ...tier2Challenges,
  ...tier3Challenges,
  ...tier4Challenges,
  ...tier5Challenges,
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

/**
 * Pick one challenge per tier (1-5) for a progressive session.
 * Falls back to random if a tier has no challenges available.
 */
export function pickSessionChallenges(): Challenge[] {
  const session: Challenge[] = [];
  for (let tier = 1; tier <= 5; tier++) {
    const pool = allChallenges.filter((c) => c.tier === tier);
    if (pool.length > 0) {
      session.push(shuffle(pool)[0]);
    }
  }
  // If we have fewer than SESSION_SIZE, pad with random
  while (session.length < SESSION_SIZE) {
    const remaining = allChallenges.filter((c) => !session.some((s) => s.id === c.id));
    if (remaining.length === 0) break;
    session.push(shuffle(remaining)[0]);
  }
  return session.sort((a, b) => a.tier - b.tier);
}

/** Compute the nesting indent level for a given position in the placed blocks array */
export function getBlockIndent(blocks: Block[], index: number): number {
  let indent = 0;
  for (let i = 0; i < index; i++) {
    const s = blocks[i].structure;
    if (s === "if" || s === "loop-start" || s === "try") indent++;
    if (s === "endif" || s === "loop-end" || s === "end-try") indent--;
    // else/catch: same level as if/try (step back then forward)
  }
  const currentStructure = blocks[index].structure;
  if (currentStructure === "else" || currentStructure === "catch") indent--;
  if (currentStructure === "endif" || currentStructure === "loop-end" || currentStructure === "end-try") indent--;
  return Math.max(0, indent);
}

/** Legacy export */
export const challenges: Challenge[] = pickSessionChallenges();
