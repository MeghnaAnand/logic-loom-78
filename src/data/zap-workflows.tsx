import { Mail, FileSpreadsheet, MessageSquare, Zap, ShoppingCart, Bell, CheckSquare, Calendar, Users } from "lucide-react";

export interface SimStep {
  id: number;
  title: string;
  description: string;
  appIcon: React.ReactNode;
  appName: string;
  appColor: string;
  instruction: string;
  fields: { label: string; value: string; type: "trigger" | "action" | "filter" }[];
  dataPreview: { label: string; value: string }[];
}

export interface Workflow {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  description: string;
  steps: SimStep[];
}

export const WORKFLOWS: Workflow[] = [
  {
    id: "email-to-sheets",
    title: "Email → Sheets → Slack",
    subtitle: "Log & notify on new emails",
    emoji: "📧",
    description: "When a client email arrives, log it in a spreadsheet and ping your team on Slack.",
    steps: [
      {
        id: 1,
        title: "Choose a Trigger",
        description: "Every Zap starts with a trigger — the event that kicks off automation.",
        appIcon: <Mail className="w-6 h-6" />,
        appName: "Gmail",
        appColor: "bg-red-500",
        instruction: "We'll trigger when a new email arrives in Gmail.",
        fields: [
          { label: "Trigger Event", value: "New Email Received", type: "trigger" },
          { label: "Label/Folder", value: "Inbox", type: "trigger" },
          { label: "From contains", value: "client@company.com", type: "filter" },
        ],
        dataPreview: [
          { label: "From", value: "client@company.com" },
          { label: "Subject", value: "Q4 Report Ready" },
          { label: "Body", value: "Hi, please find attached the Q4 report..." },
          { label: "Date", value: "2025-01-15 09:23 AM" },
        ],
      },
      {
        id: 2,
        title: "Add a Filter",
        description: "Filters let your Zap only continue when conditions are met.",
        appIcon: <Zap className="w-5 h-5" />,
        appName: "Filter by Zapier",
        appColor: "bg-orange-500",
        instruction: "Only continue if the subject contains 'Report'.",
        fields: [
          { label: "Field", value: "Subject", type: "filter" },
          { label: "Condition", value: "(Text) Contains", type: "filter" },
          { label: "Value", value: "Report", type: "filter" },
        ],
        dataPreview: [
          { label: "Filter Result", value: "✅ Passed — subject contains 'Report'" },
          { label: "Subject", value: "Q4 Report Ready" },
        ],
      },
      {
        id: 3,
        title: "Send to Google Sheets",
        description: "Actions are what happen after the trigger fires and passes filters.",
        appIcon: <FileSpreadsheet className="w-6 h-6" />,
        appName: "Google Sheets",
        appColor: "bg-green-600",
        instruction: "Log the email details into a spreadsheet row.",
        fields: [
          { label: "Action Event", value: "Create Spreadsheet Row", type: "action" },
          { label: "Spreadsheet", value: "Client Reports Tracker", type: "action" },
          { label: "Column A — From", value: "{{Gmail: From}}", type: "action" },
          { label: "Column B — Subject", value: "{{Gmail: Subject}}", type: "action" },
          { label: "Column C — Date", value: "{{Gmail: Date}}", type: "action" },
        ],
        dataPreview: [
          { label: "Row Added", value: "Row #42 in 'Client Reports Tracker'" },
          { label: "A (From)", value: "client@company.com" },
          { label: "B (Subject)", value: "Q4 Report Ready" },
          { label: "C (Date)", value: "2025-01-15 09:23 AM" },
        ],
      },
      {
        id: 4,
        title: "Notify via Slack",
        description: "Chain another action to alert your team instantly.",
        appIcon: <MessageSquare className="w-6 h-6" />,
        appName: "Slack",
        appColor: "bg-purple-600",
        instruction: "Post a notification in #reports channel.",
        fields: [
          { label: "Action Event", value: "Send Channel Message", type: "action" },
          { label: "Channel", value: "#reports", type: "action" },
          { label: "Message Text", value: "📧 New report from {{Gmail: From}}: {{Gmail: Subject}}", type: "action" },
        ],
        dataPreview: [
          { label: "Channel", value: "#reports" },
          { label: "Message Sent", value: "📧 New report from client@company.com: Q4 Report Ready" },
          { label: "Posted at", value: "9:23 AM" },
        ],
      },
    ],
  },
  {
    id: "form-to-task",
    title: "Form → Task → Calendar",
    subtitle: "Turn submissions into tasks & meetings",
    emoji: "📋",
    description: "When someone submits a form, create a task in your project tracker and schedule a follow-up call.",
    steps: [
      {
        id: 1,
        title: "Choose a Trigger",
        description: "This Zap starts when a new form response comes in.",
        appIcon: <Users className="w-6 h-6" />,
        appName: "Google Forms",
        appColor: "bg-indigo-500",
        instruction: "Trigger when a new response is submitted to your intake form.",
        fields: [
          { label: "Trigger Event", value: "New Response in Spreadsheet", type: "trigger" },
          { label: "Spreadsheet", value: "Client Intake Responses", type: "trigger" },
          { label: "Worksheet", value: "Form Responses 1", type: "trigger" },
        ],
        dataPreview: [
          { label: "Name", value: "Alex Johnson" },
          { label: "Email", value: "alex@startup.io" },
          { label: "Company", value: "StartupIO" },
          { label: "Request", value: "Need help with onboarding automation" },
          { label: "Priority", value: "High" },
        ],
      },
      {
        id: 2,
        title: "Filter by Priority",
        description: "Only create tasks for high-priority requests.",
        appIcon: <Zap className="w-5 h-5" />,
        appName: "Filter by Zapier",
        appColor: "bg-orange-500",
        instruction: "Only continue if Priority equals 'High'.",
        fields: [
          { label: "Field", value: "Priority", type: "filter" },
          { label: "Condition", value: "(Text) Exactly matches", type: "filter" },
          { label: "Value", value: "High", type: "filter" },
        ],
        dataPreview: [
          { label: "Filter Result", value: "✅ Passed — Priority is 'High'" },
          { label: "Priority", value: "High" },
        ],
      },
      {
        id: 3,
        title: "Create a Task",
        description: "Turn the form response into a trackable task.",
        appIcon: <CheckSquare className="w-6 h-6" />,
        appName: "Trello",
        appColor: "bg-blue-600",
        instruction: "Create a new card on your 'Incoming' board.",
        fields: [
          { label: "Action Event", value: "Create Card", type: "action" },
          { label: "Board", value: "Client Projects", type: "action" },
          { label: "List", value: "Incoming", type: "action" },
          { label: "Card Name", value: "{{Forms: Company}} — {{Forms: Request}}", type: "action" },
          { label: "Description", value: "Contact: {{Forms: Name}} ({{Forms: Email}})", type: "action" },
        ],
        dataPreview: [
          { label: "Card Created", value: "StartupIO — Need help with onboarding automation" },
          { label: "Board", value: "Client Projects → Incoming" },
          { label: "Description", value: "Contact: Alex Johnson (alex@startup.io)" },
        ],
      },
      {
        id: 4,
        title: "Schedule a Follow-up",
        description: "Automatically create a calendar event to follow up.",
        appIcon: <Calendar className="w-6 h-6" />,
        appName: "Google Calendar",
        appColor: "bg-sky-500",
        instruction: "Create a 30-min event tomorrow at 10 AM.",
        fields: [
          { label: "Action Event", value: "Create Detailed Event", type: "action" },
          { label: "Calendar", value: "Work", type: "action" },
          { label: "Summary", value: "Follow-up: {{Forms: Company}}", type: "action" },
          { label: "Start Date/Time", value: "Tomorrow, 10:00 AM", type: "action" },
          { label: "Duration", value: "30 minutes", type: "action" },
          { label: "Description", value: "Re: {{Forms: Request}}\nContact: {{Forms: Email}}", type: "action" },
        ],
        dataPreview: [
          { label: "Event Created", value: "Follow-up: StartupIO" },
          { label: "When", value: "Tomorrow, 10:00–10:30 AM" },
          { label: "Calendar", value: "Work" },
          { label: "Notes", value: "Re: Need help with onboarding automation" },
        ],
      },
      {
        id: 5,
        title: "Send Confirmation Email",
        description: "Let the requester know you're on it.",
        appIcon: <Mail className="w-6 h-6" />,
        appName: "Gmail",
        appColor: "bg-red-500",
        instruction: "Send a confirmation reply to the form submitter.",
        fields: [
          { label: "Action Event", value: "Send Email", type: "action" },
          { label: "To", value: "{{Forms: Email}}", type: "action" },
          { label: "Subject", value: "We received your request, {{Forms: Name}}!", type: "action" },
          { label: "Body", value: "Hi {{Forms: Name}}, we'll follow up within 24 hours.", type: "action" },
        ],
        dataPreview: [
          { label: "To", value: "alex@startup.io" },
          { label: "Subject", value: "We received your request, Alex!" },
          { label: "Status", value: "✅ Sent" },
        ],
      },
    ],
  },
];
