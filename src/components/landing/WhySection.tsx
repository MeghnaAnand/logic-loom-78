import { motion } from "framer-motion";
import { AlertTriangle, Lightbulb, Target } from "lucide-react";

const sections = [
  {
    icon: <AlertTriangle className="w-6 h-6" />,
    badge: "The Problem",
    badgeColor: "bg-destructive/10 text-destructive",
    title: "Automation is eating the workplace — most people are being left behind",
    points: [
      {
        heading: "Tutorials are passive",
        text: "Watching a 45-minute video on Zapier doesn't build the mental models needed to design workflows from scratch. Users learn button clicks, not concepts.",
      },
      {
        heading: "Documentation is tool-specific",
        text: "Zapier docs teach Zapier. Make docs teach Make. Nobody teaches the underlying logic that transfers across all platforms.",
      },
      {
        heading: "The learning curve is invisible",
        text: "Simple workflows are trivial. But branching logic, loops, nested conditions, and error handling create a wall most self-taught users don't see coming.",
      },
      {
        heading: "There's no structured path",
        text: "Unlike programming, automation thinking has no formal curriculum. People figure it out through trial and error — or they don't.",
      },
    ],
  },
  {
    icon: <Lightbulb className="w-6 h-6" />,
    badge: "The Solution",
    badgeColor: "bg-accent/20 text-accent-foreground",
    title: "Turn automation logic into something you solve, not something you read",
    points: [
      {
        heading: "30-second micro-lessons first",
        text: "Before each puzzle, a focused explainer teaches why a block type exists and how it maps to real tools — Zapier Filters, Make Routers, Power Automate Conditions.",
      },
      {
        heading: "Drag blocks, solve real scenarios",
        text: "Arrange workflow blocks like '📬 New Email' → '🔀 Check Priority' → '📊 Format Report' → '📤 Send to Manager' while a timer and attempt counter track your performance.",
      },
      {
        heading: "Wrong answers teach, not punish",
        text: "Each incorrect attempt explains exactly what went wrong — 'The data transform must come before the action because the action depends on formatted data.'",
      },
      {
        heading: "Post-puzzle breakdowns connect to real tools",
        text: "After solving, each block is explained in context: why it's in that position and how it maps to Zapier, Make, Power Automate, and n8n.",
      },
    ],
  },
  {
    icon: <Target className="w-6 h-6" />,
    badge: "Why It Matters",
    badgeColor: "bg-secondary/10 text-secondary",
    title: "Learn how to think, not how to click",
    points: [
      {
        heading: "Concept transfer, not tool memorization",
        text: "Learn the logic pattern once — triggers, conditions, transforms, actions — and apply it to any automation platform. Learn once, apply everywhere.",
      },
      {
        heading: "Active recall beats passive watching",
        text: "Dragging blocks into the correct sequence forces you to reason about workflow logic. This is learning by doing, backed by cognitive science.",
      },
      {
        heading: "Progressive scaffolding prevents the complexity wall",
        text: "Master linear flows before IF/ELSE, master IF/ELSE before loops. Each tier builds on mental models from the previous one.",
      },
      {
        heading: "Measurable growth replaces vague confidence",
        text: "A radar chart tracks mastery across five skill dimensions. Session history shows improvement over time. You can prove you're learning.",
      },
    ],
  },
];

const WhySection = () => {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto space-y-16">
        {sections.map((section, sectionIdx) => (
          <motion.div
            key={section.badge}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: sectionIdx * 0.1 }}
          >
            {/* Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold font-display ${section.badgeColor}`}
              >
                {section.icon}
                {section.badge}
              </span>
            </div>

            {/* Title */}
            <h3 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-6 leading-snug">
              {section.title}
            </h3>

            {/* Points grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {section.points.map((point, i) => (
                <motion.div
                  key={point.heading}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.08 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-sm"
                >
                  <h4 className="font-display font-semibold text-card-foreground mb-1.5 text-sm">
                    {point.heading}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {point.text}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhySection;
