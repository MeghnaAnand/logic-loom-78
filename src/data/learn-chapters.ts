import type { FlowBlock } from "@/components/learn/FlowDiagram";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  concept: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  emoji: string;
  description: string;
  content: string[];
  diagram?: FlowBlock[];
  diagramCaption?: string;
  questions: QuizQuestion[];
  isWalkthrough?: boolean;
}

export const PASS_THRESHOLD = 0.6;

export const chapters: Chapter[] = [
  {
    id: "what-is-automation",
    number: 1,
    title: "What is Automation?",
    emoji: "🤖",
    description: "Understand what automation means and why it matters in the modern workplace.",
    content: [
      "Automation is about making a computer do repetitive tasks for you — things you'd normally do by hand, over and over. Think of it as setting up a chain of dominoes: once you push the first one, the rest fall on their own.",
      "In the workplace, automation handles things like sending follow-up emails, moving data between apps, generating reports, and updating spreadsheets. Instead of doing these tasks manually every day, you build a workflow once and let it run.",
      "You don't need to be a programmer to automate. Tools like Zapier, Make, and Power Automate use visual builders — you drag blocks, connect them, and set rules. If you can describe a task step-by-step, you can automate it.",
    ],
    diagram: [
      { label: "Form Submitted", type: "trigger" },
      { label: "Save to Spreadsheet", type: "action" },
      { label: "Send Confirmation Email", type: "action" },
    ],
    diagramCaption: "A simple 3-step automation: trigger → action → action",
    questions: [
      { question: "What is the best way to describe automation?", options: ["Writing complex code from scratch", "Making a computer repeat tasks you'd normally do by hand", "Replacing all human workers with robots", "Only useful for large companies"], correctIndex: 1, explanation: "Automation is about making repetitive tasks run on their own — not replacing people, but freeing them to do higher-value work.", concept: "Definition of automation" },
      { question: "Do you need to know programming to use automation tools?", options: ["Yes, you need to be a software engineer", "No, visual tools let you automate without code", "Only if you use Power Automate", "Yes, you must learn Python first"], correctIndex: 1, explanation: "Tools like Zapier and Make provide visual, no-code interfaces. You build workflows by connecting blocks, not writing code.", concept: "No-code tools" },
      { question: "Which of these is a good example of workplace automation?", options: ["Manually typing each email reply", "Automatically sending a follow-up email after a form submission", "Reading a report and summarizing it yourself", "Calling each customer individually"], correctIndex: 1, explanation: "Automating follow-up emails after form submissions is a classic example — the task is repetitive and rule-based.", concept: "Real-world automation examples" },
      { question: "What is a 'workflow' in the context of automation?", options: ["A single button click", "A sequence of automated steps that run in order", "A type of spreadsheet", "A programming language"], correctIndex: 1, explanation: "A workflow is a series of steps that execute automatically in sequence — like dominoes falling one after another.", concept: "Workflows" },
      { question: "What makes automation different from just using software?", options: ["Automation costs more money", "Automation runs tasks without you doing them manually each time", "There is no difference", "Automation only works offline"], correctIndex: 1, explanation: "The key difference is that automation runs on its own after setup — you don't need to manually perform the task each time.", concept: "Automation vs manual work" },
    ],
  },
  {
    id: "triggers",
    number: 2,
    title: "Triggers — Starting the Chain",
    emoji: "⚡",
    description: "Learn what triggers are and how every automation begins with one.",
    content: [
      "Every automation starts with a trigger — an event that says 'go.' Without a trigger, nothing happens. It's the starting pistol of your workflow.",
      "A trigger can be almost anything: a new email arriving, a form being submitted, a new row added to a spreadsheet, a specific time of day, or even a message in Slack. The trigger watches and waits for that event.",
      "When the trigger fires, it passes data to the next step. For example, if the trigger is 'new email received,' it passes along the sender, subject, body, and attachments — so the rest of your workflow can use that information.",
    ],
    diagram: [
      { label: "New Email Arrives", type: "trigger" },
      { label: "Extract Sender & Subject", type: "data" },
      { label: "Send Slack Notification", type: "action" },
    ],
    diagramCaption: "The trigger fires, passes data, and actions use it",
    questions: [
      { question: "What role does a trigger play in an automation?", options: ["It ends the automation", "It starts the automation when an event happens", "It filters out bad data", "It sends the final notification"], correctIndex: 1, explanation: "A trigger is the starting point — it watches for a specific event and kicks off the workflow when that event occurs.", concept: "Purpose of triggers" },
      { question: "Which of these is an example of a trigger?", options: ["Sending an email", "Formatting a spreadsheet column", "A new form submission is received", "Creating a PDF report"], correctIndex: 2, explanation: "A new form submission is an event that can start an automation. The other options are actions that happen after a trigger fires.", concept: "Trigger examples" },
      { question: "What happens when a trigger fires?", options: ["The automation stops", "It passes data to the next step in the workflow", "It deletes the original event", "Nothing until you click a button"], correctIndex: 1, explanation: "When a trigger fires, it captures event data (like email sender, subject) and passes it forward for the next steps to use.", concept: "Data passing from triggers" },
      { question: "Can an automation work without a trigger?", options: ["Yes, actions can run on their own", "No, every automation needs a trigger to start", "Only in Power Automate", "Yes, if you schedule it"], correctIndex: 1, explanation: "Every automation requires a trigger — even scheduled automations use time as their trigger event.", concept: "Trigger requirement" },
      { question: "Which of these could NOT be a trigger?", options: ["A new Slack message", "A spreadsheet row being added", "Formatting text to uppercase", "A scheduled time (e.g., every Monday at 9 AM)"], correctIndex: 2, explanation: "Formatting text is an action (it does something), not a trigger (an event that starts things). Triggers are events, not operations.", concept: "Triggers vs actions" },
    ],
  },
  {
    id: "actions",
    number: 3,
    title: "Actions — Doing the Work",
    emoji: "⚙️",
    description: "Understand actions — the steps that actually perform tasks in your workflow.",
    content: [
      "Actions are the 'verbs' of automation — they do things. After a trigger fires, actions carry out the actual work: sending an email, creating a record, updating a file, posting a message.",
      "A single automation can have many actions chained together. For example: trigger (new order) → action 1 (add to spreadsheet) → action 2 (send confirmation email) → action 3 (notify the team on Slack).",
      "Each action takes data from previous steps and uses it. When you send that confirmation email, you can pull in the customer's name, order number, and total from the trigger data. This is what makes automations powerful — data flows through every step.",
    ],
    diagram: [
      { label: "New Order Received", type: "trigger" },
      { label: "Add to Spreadsheet", type: "action" },
      { label: "Send Confirmation Email", type: "action" },
      { label: "Notify Team on Slack", type: "action" },
    ],
    diagramCaption: "One trigger, three chained actions — data flows through each step",
    questions: [
      { question: "What is an action in an automation workflow?", options: ["The event that starts the workflow", "A step that performs a task like sending an email or updating a record", "A rule that decides which path to take", "The app you connect to"], correctIndex: 1, explanation: "Actions are the steps that do the actual work — they execute tasks like sending messages, creating records, or updating data.", concept: "Definition of actions" },
      { question: "Can an automation have more than one action?", options: ["No, only one action per automation", "Yes, you can chain multiple actions together", "Only if you use a paid plan", "Only two actions maximum"], correctIndex: 1, explanation: "Automations commonly chain multiple actions — e.g., save data, send email, and notify a team channel all in one workflow.", concept: "Chaining actions" },
      { question: "How do actions get the data they need?", options: ["You type it manually each time", "They use data passed from the trigger and previous steps", "They generate random data", "Actions don't use any data"], correctIndex: 1, explanation: "Actions pull data from earlier steps — the trigger and preceding actions pass information forward through the workflow.", concept: "Data flow between actions" },
      { question: "Which of these is an action?", options: ["A new email arrives", "Send a Slack notification", "A form is submitted", "12:00 PM every day"], correctIndex: 1, explanation: "Sending a Slack notification is performing a task — that's an action. The others are events (triggers).", concept: "Identifying actions" },
      { question: "In the workflow: New Order → Add to Sheet → Send Email → Notify Team, how many actions are there?", options: ["1", "2", "3", "4"], correctIndex: 2, explanation: "There are 3 actions (Add to Sheet, Send Email, Notify Team). 'New Order' is the trigger, not an action.", concept: "Counting actions in a workflow" },
    ],
  },
  {
    id: "conditions",
    number: 4,
    title: "Conditions — Making Decisions",
    emoji: "🔀",
    description: "Learn how conditions let your automations make smart choices.",
    content: [
      "Conditions are the decision-makers. They check if something is true or false and route the automation accordingly — like a fork in the road. 'If this, then do that. Otherwise, do something else.'",
      "For example: when a new support ticket arrives, check the priority. If it's 'urgent,' send it to the senior team immediately. If it's 'low,' add it to the regular queue. The condition checks the priority and decides the path.",
      "In automation tools, conditions are called different names: Zapier calls them 'Filters' or 'Paths,' Make calls them 'Routers,' and Power Automate calls them 'Conditions.' The concept is always the same — check a value and branch.",
    ],
    diagram: [
      { label: "New Support Ticket", type: "trigger" },
      { label: "Check Priority Level", type: "condition" },
      { label: "Route to Senior Team", type: "action" },
      { label: "Add to Regular Queue", type: "action" },
    ],
    diagramCaption: "Condition checks priority, then branches to different actions",
    questions: [
      { question: "What does a condition do in a workflow?", options: ["It always stops the automation", "It checks a value and decides which path to follow", "It sends data to a spreadsheet", "It triggers the automation"], correctIndex: 1, explanation: "Conditions evaluate whether something is true or false, then route the workflow down the appropriate path.", concept: "Purpose of conditions" },
      { question: "In Zapier, what is a condition called?", options: ["Module", "Scenario", "Filter or Path", "Connector"], correctIndex: 2, explanation: "Zapier uses 'Filter' (to stop/continue) and 'Path' (to branch into multiple routes) for conditional logic.", concept: "Tool-specific terminology" },
      { question: "Which scenario best uses a condition?", options: ["Send every email to the same folder", "Route urgent tickets to senior staff and low-priority ones to a queue", "Add a row to a spreadsheet", "Wait 5 minutes before the next step"], correctIndex: 1, explanation: "Routing based on ticket priority requires checking a value (priority level) and branching — that's exactly what conditions do.", concept: "When to use conditions" },
      { question: "What happens if a condition evaluates to 'false'?", options: ["The automation crashes", "The workflow takes an alternative path or stops that branch", "Nothing, it's ignored", "It retries until it becomes true"], correctIndex: 1, explanation: "When a condition is false, the workflow either follows an 'else' branch or stops that particular path — it doesn't crash.", concept: "False condition behavior" },
      { question: "How is a condition different from an action?", options: ["Conditions perform tasks, actions make decisions", "Conditions make decisions, actions perform tasks", "There is no difference", "Conditions only work with numbers"], correctIndex: 1, explanation: "Conditions decide (check values, branch paths). Actions do (send emails, update records). They serve different purposes.", concept: "Conditions vs actions" },
    ],
  },
  {
    id: "data-mapping",
    number: 5,
    title: "Data Mapping — Connecting the Dots",
    emoji: "📊",
    description: "Learn how data flows between steps and how to map fields correctly.",
    content: [
      "Data mapping is how you tell each step where to find the information it needs. When a trigger fires, it produces data — and every action after it can use that data by 'mapping' fields.",
      "Think of it like filling out a form template. The trigger says 'a new customer signed up' and provides their name, email, and company. Your action (send welcome email) maps those fields: 'To' = customer email, 'Name' = customer name.",
      "Getting data mapping wrong is the #1 reason automations fail. If you map the wrong field — like putting the customer's company name in the 'email' field — the step will error. Always double-check which fields you're connecting.",
    ],
    diagram: [
      { label: "New Customer Signs Up", type: "trigger" },
      { label: "Extract Name & Email", type: "data" },
      { label: "Map to Email Template", type: "data" },
      { label: "Send Welcome Email", type: "action" },
    ],
    diagramCaption: "Data from the trigger is mapped into the email action fields",
    questions: [
      { question: "What is data mapping in automation?", options: ["Drawing a map of your office", "Connecting output data from one step to input fields of the next step", "Deleting unnecessary data", "Creating a new database table"], correctIndex: 1, explanation: "Data mapping connects the dots — it tells each step which data from previous steps to use in its fields.", concept: "Definition of data mapping" },
      { question: "What is the most common reason automations fail?", options: ["The internet goes down", "Wrong data mapped to the wrong fields", "Too many actions in the workflow", "Using free automation tools"], correctIndex: 1, explanation: "Incorrect data mapping — like putting a name where an email should go — is the #1 cause of automation errors.", concept: "Common mapping errors" },
      { question: "In a 'send welcome email' action, which field should the customer's email address go into?", options: ["The 'Subject' field", "The 'Body' field", "The 'To' field", "The 'CC' field"], correctIndex: 2, explanation: "The customer's email address should be mapped to the 'To' field — that's where the recipient goes.", concept: "Correct field mapping" },
      { question: "Where does the data for mapping come from?", options: ["You type it manually every time", "From the trigger and previous steps in the workflow", "From a random generator", "Only from spreadsheets"], correctIndex: 1, explanation: "Data flows forward — triggers and previous actions produce output data that subsequent steps can map and use.", concept: "Data sources in workflows" },
      { question: "What should you do before running an automation with data mapping?", options: ["Delete all the data first", "Double-check that each field is mapped to the correct data", "Run it immediately without checking", "Only map one field at a time"], correctIndex: 1, explanation: "Always verify your mappings before running — one wrong field can cause the entire workflow to error.", concept: "Mapping best practices" },
    ],
  },
  {
    id: "loops",
    number: 6,
    title: "Loops — Repeating for Each Item",
    emoji: "🔄",
    description: "Understand how loops process multiple items one by one.",
    content: [
      "Sometimes your trigger doesn't return one item — it returns a list. A new spreadsheet with 50 rows. An inbox with 10 unread emails. A database query with 200 results. Loops let you process each item one at a time.",
      "A loop (also called an iterator or 'for each') takes a list and runs the same set of actions for every item in that list. Send an invoice to each customer. Update each row. Check each email.",
      "The key concept is iteration — going through items one by one. Without loops, you'd need to build 50 separate automations for 50 items. With a loop, you build one workflow and it handles all of them.",
    ],
    diagram: [
      { label: "Get All Spreadsheet Rows", type: "trigger" },
      { label: "FOR EACH Row", type: "loop" },
      { label: "Send Invoice Email", type: "action" },
      { label: "Log Result", type: "output" },
    ],
    diagramCaption: "The loop processes each row one at a time, running the same actions",
    questions: [
      { question: "When would you use a loop in an automation?", options: ["When you only have one item to process", "When you need to process multiple items from a list one by one", "When you want to stop the automation early", "When you need to check a condition"], correctIndex: 1, explanation: "Loops are used when your data contains multiple items (like rows or emails) and you need to perform the same action on each one.", concept: "When to use loops" },
      { question: "What does 'iteration' mean?", options: ["Stopping an automation", "Going through items in a list one at a time", "Sending a notification", "Mapping data between steps"], correctIndex: 1, explanation: "Iteration means processing items one by one — the loop 'iterates' through each item in the list and runs the same steps.", concept: "Iteration concept" },
      { question: "What is another name for a loop in automation tools?", options: ["Trigger", "Iterator or 'for each'", "Webhook", "Filter"], correctIndex: 1, explanation: "Loops are also called iterators or 'for each' — they all mean the same thing: process each item in a list.", concept: "Loop terminology" },
      { question: "Without loops, how would you process 50 spreadsheet rows?", options: ["Build 50 separate automations", "It's impossible", "Use one action that handles everything", "Just ignore the extra rows"], correctIndex: 0, explanation: "Without loops, you'd need a separate automation for each item — loops eliminate that by handling every item in one workflow.", concept: "Why loops matter" },
      { question: "What does a loop need as input?", options: ["A single text value", "A list or collection of items", "A true/false value", "A time schedule"], correctIndex: 1, explanation: "Loops take a list (of rows, emails, records, etc.) and process each item in that list one at a time.", concept: "Loop inputs" },
    ],
  },
  {
    id: "error-handling",
    number: 7,
    title: "Error Handling — When Things Go Wrong",
    emoji: "🛡️",
    description: "Learn how to make your automations resilient with error handling.",
    content: [
      "Automations break. APIs go down, data is missing, rate limits are hit, formats are unexpected. Error handling is how you prepare for failure so your workflow doesn't just crash and lose data.",
      "The most common pattern is try-catch: 'Try this action. If it fails, catch the error and do something else.' For example: try to save to the database. If it fails, log the error and send an alert to the admin.",
      "Good error handling includes: retry logic (try again after a delay), fallback actions (use a backup method), notifications (alert someone when things fail), and logging (record what went wrong for debugging).",
    ],
    diagram: [
      { label: "New Data Received", type: "trigger" },
      { label: "TRY: Save to Database", type: "action" },
      { label: "CATCH: Log Error", type: "error" },
      { label: "Send Admin Alert", type: "output" },
    ],
    diagramCaption: "If TRY fails, CATCH handles the error gracefully",
    questions: [
      { question: "Why is error handling important in automation?", options: ["It makes automations run faster", "It prevents workflows from crashing silently and losing data", "It's only needed for complex automations", "It replaces the need for triggers"], correctIndex: 1, explanation: "Without error handling, a failed step can crash the whole workflow. Error handling catches failures and takes corrective action.", concept: "Importance of error handling" },
      { question: "What is a 'try-catch' pattern?", options: ["Try one app, then catch the output", "Try an action, and if it fails, catch the error and handle it", "Catch all triggers and try them one by one", "A way to filter data"], correctIndex: 1, explanation: "Try-catch means: attempt an action (try), and if it fails, execute a fallback or alert (catch) instead of crashing.", concept: "Try-catch pattern" },
      { question: "Which is NOT a common error handling strategy?", options: ["Retry the failed step after a delay", "Send an alert when something fails", "Ignore all errors and hope for the best", "Log the error details for debugging"], correctIndex: 2, explanation: "Ignoring errors is the opposite of error handling. Good strategies include retrying, alerting, using fallbacks, and logging.", concept: "Error handling strategies" },
      { question: "What is 'retry logic'?", options: ["Deleting the failed step", "Automatically trying the failed action again after a short delay", "Restarting the entire workflow from scratch", "Sending the error to the user"], correctIndex: 1, explanation: "Retry logic automatically attempts the failed step again after a delay — useful for temporary issues like API timeouts.", concept: "Retry logic" },
      { question: "What should happen when an automation step fails and can't be retried?", options: ["Silently ignore it", "Log the error and notify someone so it can be investigated", "Delete all the data", "Shut down the entire system"], correctIndex: 1, explanation: "When retries fail, the best practice is to log the error and alert the team so the issue can be diagnosed and fixed.", concept: "Fallback and notification" },
    ],
  },
  {
    id: "webhooks",
    number: 8,
    title: "Webhooks — Real-Time Connections",
    emoji: "🔗",
    description: "Discover how webhooks enable instant communication between apps.",
    content: [
      "A webhook is a way for one app to send data to another in real time. Instead of your automation checking every 5 minutes ('Is there new data? How about now?'), a webhook says 'Hey, something just happened — here's the data.'",
      "Think of webhooks like a doorbell. Instead of checking the door every few minutes (polling), the doorbell rings when someone arrives (webhook). It's faster, more efficient, and gives you instant updates.",
      "Webhooks are used for things like: Stripe notifying your app about a new payment, GitHub alerting your workflow about a new commit, or a form tool sending submission data the instant someone clicks 'Submit.'",
    ],
    diagram: [
      { label: "Stripe Payment Received", type: "trigger" },
      { label: "Webhook Sends Data Instantly", type: "data" },
      { label: "Update Order Status", type: "action" },
      { label: "Send Receipt Email", type: "action" },
    ],
    diagramCaption: "Webhook delivers payment data instantly — no polling needed",
    questions: [
      { question: "How is a webhook different from polling?", options: ["Webhooks check for data every 5 minutes", "Webhooks send data instantly when an event happens, instead of checking periodically", "Webhooks only work with email", "There is no difference"], correctIndex: 1, explanation: "Polling checks repeatedly on a schedule. Webhooks push data instantly when something happens — faster and more efficient.", concept: "Webhooks vs polling" },
      { question: "Which is a real-world example of a webhook?", options: ["Manually checking your inbox every hour", "Stripe instantly notifying your app when a payment is made", "Copying data from one spreadsheet to another by hand", "Scheduling a report to run at midnight"], correctIndex: 1, explanation: "Stripe sending payment data to your app the moment it happens is a classic webhook — real-time, automatic, and instant.", concept: "Webhook examples" },
      { question: "What analogy best describes a webhook?", options: ["An alarm clock", "A doorbell that rings when someone arrives", "A filing cabinet", "A calculator"], correctIndex: 1, explanation: "A doorbell notifies you instantly when someone is at the door — just like a webhook notifies your app instantly when an event occurs.", concept: "Webhook analogy" },
      { question: "Why are webhooks more efficient than polling?", options: ["They use more server resources", "They only send data when something actually happens, avoiding unnecessary checks", "They're slower but more reliable", "They only work once per day"], correctIndex: 1, explanation: "Polling wastes resources by checking repeatedly even when nothing changed. Webhooks only fire when there's actual new data.", concept: "Webhook efficiency" },
      { question: "What kind of data does a webhook send?", options: ["Only text messages", "Information about the event that just happened", "Random sample data", "Only error messages"], correctIndex: 1, explanation: "Webhooks send a payload containing details about the event — like payment amount, customer info, or commit details.", concept: "Webhook payloads" },
    ],
  },
  {
    id: "scheduling",
    number: 9,
    title: "Scheduling — Time-Based Automation",
    emoji: "⏰",
    description: "Learn how to run automations on a schedule — hourly, daily, or weekly.",
    content: [
      "Not every automation needs an external trigger. Sometimes you want things to run on a schedule: generate a report every Monday, clean up old data every night, or send a summary email every Friday at 5 PM.",
      "Scheduled automations use time as the trigger. You set the frequency (every hour, every day, every week) and the automation runs at that interval. It's like setting an alarm clock for your workflow.",
      "Scheduling is especially useful for: batch processing (handle all new records at end of day), maintenance tasks (archive old files weekly), reporting (send metrics every Monday morning), and syncing data between systems on a regular basis.",
    ],
    diagram: [
      { label: "Every Monday at 9 AM", type: "trigger" },
      { label: "Query Sales Database", type: "data" },
      { label: "Generate Report", type: "action" },
      { label: "Email to Team", type: "output" },
    ],
    diagramCaption: "Time-based trigger runs the workflow on a fixed schedule",
    questions: [
      { question: "When would you use a scheduled automation instead of an event trigger?", options: ["When you need instant responses", "When tasks should run at regular intervals regardless of events", "When you only have one item to process", "When you don't know what data to expect"], correctIndex: 1, explanation: "Scheduled automations are ideal for recurring tasks — like daily reports or weekly cleanups — that should run at set times.", concept: "When to use scheduling" },
      { question: "Which task is best suited for a scheduled automation?", options: ["Responding to a customer message immediately", "Generating a weekly sales report every Monday", "Sending a welcome email when someone signs up", "Routing urgent tickets to the right team"], correctIndex: 1, explanation: "A weekly sales report runs at a fixed time regardless of events — a perfect use case for a scheduled trigger.", concept: "Scheduling use cases" },
      { question: "What acts as the 'trigger' in a scheduled automation?", options: ["A user clicking a button", "A specific time or time interval", "An incoming email", "A database change"], correctIndex: 1, explanation: "In scheduled automations, time itself is the trigger — the workflow fires when the clock hits the configured interval.", concept: "Time as a trigger" },
      { question: "Which is NOT a good use case for scheduling?", options: ["Archiving old files every week", "Sending daily sales summaries", "Instantly responding to a customer complaint", "Syncing data between systems every night"], correctIndex: 2, explanation: "Instant responses need event-based triggers (like a webhook), not schedules. Schedules are for recurring, non-urgent tasks.", concept: "Scheduling vs event triggers" },
      { question: "What is 'batch processing' in the context of scheduling?", options: ["Processing items one at a time in real-time", "Collecting items and processing them all at once at a scheduled time", "Deleting old records", "Sending emails manually"], correctIndex: 1, explanation: "Batch processing means waiting and handling all accumulated items at once — e.g., processing all new orders at end of day.", concept: "Batch processing" },
    ],
  },
  {
    id: "build-a-zap",
    number: 10,
    title: "Build a Real Zap",
    emoji: "🚀",
    description: "Put it all together — build and test a real automation with Zapier.",
    content: [
      "You've learned triggers, actions, conditions, data mapping, loops, error handling, webhooks, and scheduling. Now it's time to build something real. In this chapter, you'll create your first Zapier automation (called a 'Zap') step by step.",
      "Here's what we'll build: a webhook that receives data and triggers an action. This is the foundation of every real-world automation — once you understand this pattern, you can build anything.",
      "Step 1: Go to zapier.com and create a free account. Click 'Create Zap'. Step 2: For the trigger, search for 'Webhooks by Zapier' and select 'Catch Hook'. This gives you a unique URL. Step 3: Add an action — try 'Email by Zapier' to send yourself a notification. Map the webhook data to the email fields. Step 4: Turn on your Zap, then paste your webhook URL below to test it!",
      "Once you've built this Zap, you can extend it: add conditions to filter incoming data, add more actions to chain multiple steps, or swap the trigger for a different app like Google Sheets or Slack.",
    ],
    diagram: [
      { label: "Webhook Receives Data", type: "trigger" },
      { label: "Extract Key Fields", type: "data" },
      { label: "Send Email Notification", type: "action" },
      { label: "Log to Spreadsheet", type: "output" },
    ],
    diagramCaption: "Your first real Zap: webhook trigger → data mapping → action → output",
    isWalkthrough: true,
    questions: [
      { question: "What is a 'Zap' in Zapier?", options: ["A type of code", "An automated workflow connecting apps", "A file format", "A Zapier employee"], correctIndex: 1, explanation: "A Zap is Zapier's term for an automated workflow — it connects a trigger to one or more actions across different apps.", concept: "Zapier terminology" },
      { question: "What does 'Webhooks by Zapier - Catch Hook' do?", options: ["Sends an email", "Provides a URL that receives incoming data and starts the Zap", "Creates a spreadsheet", "Schedules a task"], correctIndex: 1, explanation: "Catch Hook gives you a unique URL. When data is sent to that URL, it triggers the Zap — perfect for connecting any app.", concept: "Webhook trigger setup" },
      { question: "After building a webhook Zap, what's a good next step?", options: ["Delete it immediately", "Add a condition to filter incoming data before the action runs", "Never modify it", "Build the same Zap again"], correctIndex: 1, explanation: "Adding conditions lets you filter data — for example, only sending emails for high-priority items. This makes your automation smarter.", concept: "Extending your first Zap" },
      { question: "What makes webhooks a powerful starting trigger?", options: ["They only work with one app", "Any app or service can send data to a webhook URL", "They're the cheapest option", "They don't require any setup"], correctIndex: 1, explanation: "Webhooks are universal — any system that can make an HTTP request can trigger your Zap, making them incredibly flexible.", concept: "Webhook versatility" },
      { question: "What should you always do before turning on a Zap?", options: ["Delete the trigger", "Test it with sample data to make sure it works", "Share it publicly", "Remove all actions"], correctIndex: 1, explanation: "Always test with sample data before going live — this catches data mapping errors and ensures everything flows correctly.", concept: "Testing before deploying" },
    ],
  },
];
