import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLOCK_TYPE_LESSONS } from "@/data/micro-lessons";
import type { BlockType } from "@/data/challenges";

const blockTypeColors: Record<BlockType, string> = {
  trigger: "bg-block-trigger",
  condition: "bg-block-condition",
  action: "bg-block-action",
  data: "bg-block-data",
  output: "bg-block-output",
};

const extendedExamples: Record<BlockType, { examples: string[]; tools: { name: string; usage: string }[] }> = {
  trigger: {
    examples: [
      "A new email arrives in your inbox",
      "A form is submitted on your website",
      "A scheduled time (e.g., every Monday at 9AM)",
      "A new row is added to a spreadsheet",
      "A payment is received in Stripe",
    ],
    tools: [
      { name: "Zapier", usage: "The first step in every Zap — the event that starts the automation" },
      { name: "Make (Integromat)", usage: "The first module in a scenario — watches for new data" },
      { name: "Power Automate", usage: "Called a 'Trigger' — e.g., 'When a new email arrives'" },
      { name: "n8n", usage: "Trigger nodes that listen for webhooks, schedules, or app events" },
    ],
  },
  condition: {
    examples: [
      "Is this email from a VIP client?",
      "Is the order total above $100?",
      "Does the applicant have 3+ years experience?",
      "Is today a weekday?",
      "Did the payment succeed or fail?",
    ],
    tools: [
      { name: "Zapier", usage: "Filter steps or Paths — route data based on conditions" },
      { name: "Make", usage: "Router module with filters — splits the flow into branches" },
      { name: "Power Automate", usage: "Condition action — if yes, do X; if no, do Y" },
      { name: "n8n", usage: "IF node — evaluates expressions and branches accordingly" },
    ],
  },
  action: {
    examples: [
      "Send a Slack message to the team",
      "Create a new row in Google Sheets",
      "Generate a PDF report",
      "Update a CRM record",
      "Resize an image for social media",
    ],
    tools: [
      { name: "Zapier", usage: "Action steps — the 'do something' part of your Zap" },
      { name: "Make", usage: "Action modules — Create, Update, Delete operations" },
      { name: "Power Automate", usage: "Actions like 'Send an email' or 'Create item'" },
      { name: "n8n", usage: "Regular nodes that perform operations on external services" },
    ],
  },
  data: {
    examples: [
      "Extract the sender's name from an email",
      "Parse a JSON response from an API",
      "Look up a customer record by ID",
      "Format a date from '2024-01-15' to 'January 15, 2024'",
      "Calculate the total from line items",
    ],
    tools: [
      { name: "Zapier", usage: "Formatter, Lookup Table, or Code steps" },
      { name: "Make", usage: "Set Variable, Parse JSON, Aggregator modules" },
      { name: "Power Automate", usage: "Compose, Parse JSON, or Initialize Variable actions" },
      { name: "n8n", usage: "Set, Function, or Item Lists nodes" },
    ],
  },
  output: {
    examples: [
      "Send a confirmation email to the customer",
      "Log the result in a tracking spreadsheet",
      "Post a summary to a Slack channel",
      "Save a generated report to Google Drive",
      "Send a push notification to your phone",
    ],
    tools: [
      { name: "Zapier", usage: "Usually the last Action step — delivers the final result" },
      { name: "Make", usage: "Final module — stores, sends, or notifies" },
      { name: "Power Automate", usage: "Last action in the flow — confirmation or storage" },
      { name: "n8n", usage: "End nodes that send results to external services" },
    ],
  },
};

const conceptOrder: BlockType[] = ["trigger", "condition", "action", "data", "output"];

const Glossary = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card sticky top-0 z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          <h1 className="font-display font-bold text-foreground">Automation Glossary</h1>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
            The 5 Building Blocks of Automation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every automation — whether in Zapier, Make, Power Automate, or n8n — is built from these five concepts. 
            Master them and you can build anything.
          </p>
        </motion.div>

        <div className="space-y-6">
          {conceptOrder.map((type, i) => {
            const lesson = BLOCK_TYPE_LESSONS[type];
            const extended = extendedExamples[type];

            return (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {/* Concept header */}
                <div className="p-5 pb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${blockTypeColors[type]} flex items-center justify-center text-xl`}>
                      {lesson.emoji}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-card-foreground">
                        {lesson.concept}
                      </h3>
                      <span className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                        {type}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lesson.explanation}
                  </p>
                </div>

                {/* Examples */}
                <div className="px-5 pb-4">
                  <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Real-world examples
                  </h4>
                  <div className="grid gap-1.5">
                    {extended.examples.map((ex, j) => (
                      <div key={j} className="flex items-start gap-2 text-sm text-card-foreground">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tool mapping */}
                <div className="bg-muted/50 border-t border-border px-5 py-4">
                  <h4 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                    <ExternalLink className="w-3 h-3" /> In real tools
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {extended.tools.map((tool) => (
                      <div key={tool.name} className="bg-card rounded-lg p-2.5 border border-border/50">
                        <p className="text-xs font-display font-bold text-card-foreground mb-0.5">
                          {tool.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">
                          {tool.usage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-muted-foreground mb-4 font-display">
            Ready to put these concepts into practice?
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/play")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display gap-2"
          >
            Start Puzzling <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Glossary;
