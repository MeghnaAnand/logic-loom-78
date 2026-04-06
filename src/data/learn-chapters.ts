export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  emoji: string;
  description: string;
  content: string[];
  questions: QuizQuestion[];
}

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
    questions: [
      {
        question: "What is the best way to describe automation?",
        options: [
          "Writing complex code from scratch",
          "Making a computer repeat tasks you'd normally do by hand",
          "Replacing all human workers with robots",
          "Only useful for large companies",
        ],
        correctIndex: 1,
        explanation: "Automation is about making repetitive tasks run on their own — not replacing people, but freeing them to do higher-value work.",
      },
      {
        question: "Do you need to know programming to use automation tools?",
        options: [
          "Yes, you need to be a software engineer",
          "No, visual tools let you automate without code",
          "Only if you use Power Automate",
          "Yes, you must learn Python first",
        ],
        correctIndex: 1,
        explanation: "Tools like Zapier and Make provide visual, no-code interfaces. You build workflows by connecting blocks, not writing code.",
      },
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
    questions: [
      {
        question: "What role does a trigger play in an automation?",
        options: [
          "It ends the automation",
          "It starts the automation when an event happens",
          "It filters out bad data",
          "It sends the final notification",
        ],
        correctIndex: 1,
        explanation: "A trigger is the starting point — it watches for a specific event and kicks off the workflow when that event occurs.",
      },
      {
        question: "Which of these is an example of a trigger?",
        options: [
          "Sending an email",
          "Formatting a spreadsheet column",
          "A new form submission is received",
          "Creating a PDF report",
        ],
        correctIndex: 2,
        explanation: "A new form submission is an event that can start an automation. The other options are actions that happen after a trigger fires.",
      },
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
    questions: [
      {
        question: "What is an action in an automation workflow?",
        options: [
          "The event that starts the workflow",
          "A step that performs a task like sending an email or updating a record",
          "A rule that decides which path to take",
          "The app you connect to",
        ],
        correctIndex: 1,
        explanation: "Actions are the steps that do the actual work — they execute tasks like sending messages, creating records, or updating data.",
      },
      {
        question: "Can an automation have more than one action?",
        options: [
          "No, only one action per automation",
          "Yes, you can chain multiple actions together",
          "Only if you use a paid plan",
          "Only two actions maximum",
        ],
        correctIndex: 1,
        explanation: "Automations commonly chain multiple actions — e.g., save data, send email, and notify a team channel all in one workflow.",
      },
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
    questions: [
      {
        question: "What does a condition do in a workflow?",
        options: [
          "It always stops the automation",
          "It checks a value and decides which path to follow",
          "It sends data to a spreadsheet",
          "It triggers the automation",
        ],
        correctIndex: 1,
        explanation: "Conditions evaluate whether something is true or false, then route the workflow down the appropriate path.",
      },
      {
        question: "In Zapier, what is a condition called?",
        options: [
          "Module",
          "Scenario",
          "Filter or Path",
          "Connector",
        ],
        correctIndex: 2,
        explanation: "Zapier uses 'Filter' (to stop/continue) and 'Path' (to branch into multiple routes) for conditional logic.",
      },
      {
        question: "Which scenario best uses a condition?",
        options: [
          "Send every email to the same folder",
          "Route urgent tickets to senior staff and low-priority ones to a queue",
          "Add a row to a spreadsheet",
          "Wait 5 minutes before the next step",
        ],
        correctIndex: 1,
        explanation: "Routing based on ticket priority requires checking a value (priority level) and branching — that's exactly what conditions do.",
      },
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
    questions: [
      {
        question: "What is data mapping in automation?",
        options: [
          "Drawing a map of your office",
          "Connecting output data from one step to input fields of the next step",
          "Deleting unnecessary data",
          "Creating a new database table",
        ],
        correctIndex: 1,
        explanation: "Data mapping connects the dots — it tells each step which data from previous steps to use in its fields.",
      },
      {
        question: "What is the most common reason automations fail?",
        options: [
          "The internet goes down",
          "Wrong data mapped to the wrong fields",
          "Too many actions in the workflow",
          "Using free automation tools",
        ],
        correctIndex: 1,
        explanation: "Incorrect data mapping — like putting a name where an email should go — is the #1 cause of automation errors.",
      },
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
    questions: [
      {
        question: "When would you use a loop in an automation?",
        options: [
          "When you only have one item to process",
          "When you need to process multiple items from a list one by one",
          "When you want to stop the automation early",
          "When you need to check a condition",
        ],
        correctIndex: 1,
        explanation: "Loops are used when your data contains multiple items (like rows or emails) and you need to perform the same action on each one.",
      },
      {
        question: "What does 'iteration' mean?",
        options: [
          "Stopping an automation",
          "Going through items in a list one at a time",
          "Sending a notification",
          "Mapping data between steps",
        ],
        correctIndex: 1,
        explanation: "Iteration means processing items one by one — the loop 'iterates' through each item in the list and runs the same steps.",
      },
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
    questions: [
      {
        question: "Why is error handling important in automation?",
        options: [
          "It makes automations run faster",
          "It prevents workflows from crashing silently and losing data",
          "It's only needed for complex automations",
          "It replaces the need for triggers",
        ],
        correctIndex: 1,
        explanation: "Without error handling, a failed step can crash the whole workflow. Error handling catches failures and takes corrective action.",
      },
      {
        question: "What is a 'try-catch' pattern?",
        options: [
          "Try one app, then catch the output",
          "Try an action, and if it fails, catch the error and handle it",
          "Catch all triggers and try them one by one",
          "A way to filter data",
        ],
        correctIndex: 1,
        explanation: "Try-catch means: attempt an action (try), and if it fails, execute a fallback or alert (catch) instead of crashing.",
      },
      {
        question: "Which is NOT a common error handling strategy?",
        options: [
          "Retry the failed step after a delay",
          "Send an alert when something fails",
          "Ignore all errors and hope for the best",
          "Log the error details for debugging",
        ],
        correctIndex: 2,
        explanation: "Ignoring errors is the opposite of error handling. Good strategies include retrying, alerting, using fallbacks, and logging.",
      },
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
    questions: [
      {
        question: "How is a webhook different from polling?",
        options: [
          "Webhooks check for data every 5 minutes",
          "Webhooks send data instantly when an event happens, instead of checking periodically",
          "Webhooks only work with email",
          "There is no difference",
        ],
        correctIndex: 1,
        explanation: "Polling checks repeatedly on a schedule. Webhooks push data instantly when something happens — faster and more efficient.",
      },
      {
        question: "Which is a real-world example of a webhook?",
        options: [
          "Manually checking your inbox every hour",
          "Stripe instantly notifying your app when a payment is made",
          "Copying data from one spreadsheet to another by hand",
          "Scheduling a report to run at midnight",
        ],
        correctIndex: 1,
        explanation: "Stripe sending payment data to your app the moment it happens is a classic webhook — real-time, automatic, and instant.",
      },
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
    questions: [
      {
        question: "When would you use a scheduled automation instead of an event trigger?",
        options: [
          "When you need instant responses",
          "When tasks should run at regular intervals regardless of events",
          "When you only have one item to process",
          "When you don't know what data to expect",
        ],
        correctIndex: 1,
        explanation: "Scheduled automations are ideal for recurring tasks — like daily reports or weekly cleanups — that should run at set times.",
      },
      {
        question: "Which task is best suited for a scheduled automation?",
        options: [
          "Responding to a customer message immediately",
          "Generating a weekly sales report every Monday",
          "Sending a welcome email when someone signs up",
          "Routing urgent tickets to the right team",
        ],
        correctIndex: 1,
        explanation: "A weekly sales report runs at a fixed time regardless of events — a perfect use case for a scheduled trigger.",
      },
    ],
  },
];
