import type { GameBlock } from "@/data/automation-levels";

export interface SandboxBlock extends GameBlock {
  category: string;
}

export const SANDBOX_BLOCKS: SandboxBlock[] = [
  // Triggers
  { id: "sb-form-submitted", type: "trigger", label: "Form Submitted", icon: "📝", category: "Triggers" },
  { id: "sb-email-received", type: "trigger", label: "Email Received", icon: "📧", category: "Triggers" },
  { id: "sb-order-received", type: "trigger", label: "Order Received", icon: "🛒", category: "Triggers" },
  { id: "sb-schedule-daily", type: "trigger", label: "Schedule: Daily", icon: "⏰", category: "Triggers" },
  { id: "sb-webhook-fired", type: "trigger", label: "Webhook Fired", icon: "🔗", category: "Triggers" },
  { id: "sb-file-uploaded", type: "trigger", label: "File Uploaded", icon: "📁", category: "Triggers" },
  { id: "sb-new-user", type: "trigger", label: "New User Signup", icon: "👤", category: "Triggers" },

  // Conditions
  { id: "sb-if-amount", type: "condition", label: "IF Amount > $500", icon: "❓", category: "Conditions" },
  { id: "sb-if-vip", type: "condition", label: "IF Customer = VIP", icon: "⭐", category: "Conditions" },
  { id: "sb-if-contains", type: "condition", label: "IF Contains Keyword", icon: "🔎", category: "Conditions" },
  { id: "sb-if-weekday", type: "condition", label: "IF Weekday", icon: "📅", category: "Conditions" },
  { id: "sb-if-priority", type: "condition", label: "IF Priority = High", icon: "🔴", category: "Conditions" },

  // Data Operations
  { id: "sb-extract-order", type: "data", label: "Extract Order #", icon: "🔍", category: "Data Ops" },
  { id: "sb-extract-customer", type: "data", label: "Extract Customer", icon: "👤", category: "Data Ops" },
  { id: "sb-extract-amount", type: "data", label: "Extract Amount", icon: "💲", category: "Data Ops" },
  { id: "sb-format-date", type: "data", label: "Format Date", icon: "📅", category: "Data Ops" },
  { id: "sb-parse-json", type: "data", label: "Parse JSON", icon: "🧩", category: "Data Ops" },
  { id: "sb-lookup-db", type: "data", label: "Lookup in DB", icon: "🗄️", category: "Data Ops" },

  // Actions
  { id: "sb-save-spreadsheet", type: "action", label: "Save to Spreadsheet", icon: "📊", category: "Actions" },
  { id: "sb-save-database", type: "action", label: "Save to Database", icon: "💾", category: "Actions" },
  { id: "sb-send-email", type: "action", label: "Send Email", icon: "📤", category: "Actions" },
  { id: "sb-send-slack", type: "action", label: "Send to Slack", icon: "💬", category: "Actions" },
  { id: "sb-send-to-manager", type: "action", label: "Send to Manager", icon: "👔", category: "Actions" },
  { id: "sb-auto-approve", type: "action", label: "Auto-Approve", icon: "✅", category: "Actions" },
  { id: "sb-create-ticket", type: "action", label: "Create Ticket", icon: "🎫", category: "Actions" },
  { id: "sb-send-sms", type: "action", label: "Send SMS", icon: "📱", category: "Actions" },
  { id: "sb-generate-pdf", type: "action", label: "Generate PDF", icon: "📄", category: "Actions" },
];
