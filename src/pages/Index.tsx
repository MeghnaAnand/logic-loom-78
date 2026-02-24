import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Zap, Puzzle, Sparkles, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const floatingBlocks = [
  { label: "📬 Email Received", color: "bg-block-trigger", delay: 0 },
  { label: "🎯 Filter Results", color: "bg-block-condition", delay: 0.5 },
  { label: "📄 Format Data", color: "bg-block-action", delay: 1 },
  { label: "📊 Send Report", color: "bg-block-output", delay: 1.5 },
];

const features = [
  {
    icon: <Puzzle className="w-6 h-6" />,
    title: "Drag & Drop Blocks",
    description: "No code, no jargon. Just drag visual blocks into the right order to solve real automation puzzles.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Real-World Problems",
    description: "Automate job applications, sort emails, build reports — skills that actually get you hired.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Instant Feedback",
    description: "See your logic work immediately. No waiting, no guessing. Build confidence with every puzzle solved.",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              No experience needed
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
              Learn automation
              <br />
              <span className="text-primary">by solving puzzles</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg leading-relaxed">
              Drag blocks. Solve real problems. Build skills employers actually want — 
              no manuals, no code, no boring tutorials. Just puzzles that click.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/play")}
                className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-display text-base px-8 gap-2"
              >
                Start Puzzling <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="font-display text-base"
              >
                How It Works
              </Button>
            </div>
          </motion.div>

          {/* Right: Floating blocks demo */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full h-[420px] rounded-2xl bg-workspace workspace-grid border border-border/30 p-8">
              <div className="absolute top-4 left-4 flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-accent/60" />
                <div className="w-3 h-3 rounded-full bg-success/60" />
              </div>
              
              {/* Flow arrow spine */}
              <div className="absolute left-1/2 top-16 bottom-8 w-0.5 bg-workspace-foreground/10 -translate-x-1/2" />

              {floatingBlocks.map((block, i) => (
                <motion.div
                  key={block.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + block.delay * 0.3, duration: 0.5 }}
                  className={`
                    absolute left-1/2 -translate-x-1/2
                    ${block.color} text-primary-foreground
                    rounded-lg px-5 py-3 font-display font-semibold text-sm
                    shadow-lg
                  `}
                  style={{ top: `${70 + i * 85}px` }}
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.4 }}
                  >
                    {block.label}
                  </motion.div>
                </motion.div>
              ))}

              {/* Connection dots */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary animate-pulse-glow"
                  style={{ top: `${140 + i * 85}px` }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 + i * 0.3 }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl lg:text-4xl font-bold mb-4 text-foreground">
              Three steps. Zero confusion.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Each puzzle teaches you a real automation concept used by tools like Zapier, Make, and Power Automate.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display text-lg font-semibold mb-2 text-card-foreground">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center bg-workspace rounded-2xl p-12 workspace-grid relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="font-display text-3xl font-bold text-workspace-foreground mb-4">
              Ready to think like an automator?
            </h2>
            <p className="text-workspace-foreground/70 mb-8">
              3 puzzles. 10 minutes. A whole new skill.
            </p>
            <Button
              size="lg"
              onClick={() => navigate("/play")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 glow-primary font-display text-base px-8 gap-2"
            >
              Start Your First Puzzle <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Index;
