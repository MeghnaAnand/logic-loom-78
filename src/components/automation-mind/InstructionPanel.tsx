import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";
import { TEST_DATA } from "./GameCanvas";
import { Progress } from "@/components/ui/progress";

interface InstructionPanelProps {
  testingPhase: "idle" | "loading" | "running" | "success" | "failure";
  currentTestItem: number;
  onTest: () => void;
  onReset: () => void;
  onNextLevel: () => void;
  hasBlocks: boolean;
  isConnected: boolean;
  isBusy: boolean;
}

const InstructionPanel = ({
  testingPhase,
  currentTestItem,
  onTest,
  onReset,
  onNextLevel,
  hasBlocks,
  isConnected,
  isBusy,
}: InstructionPanelProps) => {
  const progressValue = testingPhase === "running"
    ? ((currentTestItem + 1) / TEST_DATA.length) * 100
    : testingPhase === "success"
      ? 100
      : 0;

  return (
    <div className="w-80 border-l border-border bg-card p-5 flex flex-col gap-5 overflow-y-auto">
      {/* Instructions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full font-display">
            Level 1
          </span>
          <h2 className="font-display font-bold text-card-foreground">Your First Automation</h2>
        </div>

        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground leading-relaxed space-y-3 shadow-sm">
          <p>
            <strong className="text-foreground">Challenge:</strong> You run a small online shop. Every time someone fills out your contact form, you need to save their information. Right now you're copying it manually. Let's automate this!
          </p>
          <p>
            <strong className="text-foreground">Goal:</strong> Connect the right trigger to the right action to automatically save form submissions.
          </p>
        </div>
      </div>

      {/* Steps guide */}
      <div className="space-y-2 text-sm">
        <motion.div
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${hasBlocks ? "text-success bg-success/5" : "text-muted-foreground"}`}
          animate={hasBlocks ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span>{hasBlocks ? "✅" : "1️⃣"}</span>
          <span>Add a trigger and an action block</span>
        </motion.div>
        <motion.div
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${isConnected ? "text-success bg-success/5" : "text-muted-foreground"}`}
          animate={isConnected ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span>{isConnected ? "✅" : "2️⃣"}</span>
          <span>Click both blocks to connect them</span>
        </motion.div>
        <motion.div
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${testingPhase === "success" ? "text-success bg-success/5" : "text-muted-foreground"}`}
        >
          <span>{testingPhase === "success" ? "✅" : "3️⃣"}</span>
          <span>Hit "Test Automation" to validate</span>
        </motion.div>
      </div>

      {/* Test results */}
      <AnimatePresence mode="wait">
        {testingPhase === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-muted rounded-xl p-6 text-sm shadow-sm flex flex-col items-center gap-3"
          >
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-foreground font-display font-semibold">Initializing automation...</p>
            <p className="text-muted-foreground text-xs">Setting up test environment</p>
          </motion.div>
        )}

        {testingPhase === "running" && (
          <motion.div
            key="running"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-muted rounded-xl p-4 text-sm font-mono space-y-2 shadow-sm"
          >
            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-display font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Testing...
                </span>
                <span className="text-muted-foreground font-display">
                  {currentTestItem + 1}/{TEST_DATA.length} complete
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>

            {/* Sequential results */}
            <div className="space-y-1 pt-1">
              {TEST_DATA.slice(0, currentTestItem + 1).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  <span className="text-xs">
                    Form #{i + 1}: {item.name} ({item.email}) → Saved
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {testingPhase === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-success/10 border border-success/30 rounded-xl p-4 text-sm space-y-1.5 shadow-sm"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-semibold text-foreground">✅ Test complete</p>
              <span className="text-xs text-success font-display font-bold">5/5</span>
            </div>
            <Progress value={100} className="h-2 mb-2" />
            {TEST_DATA.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="flex items-center gap-2 text-muted-foreground font-mono text-xs"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.15 + 0.1, type: "spring", bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                </motion.div>
                <span>Form #{i + 1}: {item.name} ({item.email}) → Saved</span>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-2 border-t border-success/20"
            >
              <p className="text-success font-bold font-display text-base">
                🎉 You're a natural! All 5 forms saved flawlessly!
              </p>
              <p className="text-success font-display text-sm mt-1">
                Level 1 crushed! You're on your way to becoming an automation pro 🚀
              </p>
            </motion.div>
          </motion.div>
        )}

        {testingPhase === "failure" && (
          <motion.div
            key="failure"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: [0, -4, 4, -2, 2, 0] }}
            transition={{ duration: 0.4 }}
            className="relative bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm shadow-sm"
          >
            <button
              onClick={onReset}
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-destructive/20 hover:bg-destructive/40 flex items-center justify-center transition-colors"
            >
              <X className="w-3 h-3 text-destructive" />
            </button>
            <p className="text-destructive font-semibold">
              ❌ This automation won't work.
            </p>
            <p className="text-muted-foreground mt-2">
              <strong>Hint:</strong> You need a trigger that detects form submissions and an action that saves data.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action buttons */}
      <div className="mt-auto flex flex-col gap-2">
        {testingPhase === "success" ? (
          <>
            <Button onClick={onNextLevel} className="gap-2 bg-success text-success-foreground hover:bg-success/90 rounded-xl hover:scale-[1.02] transition-transform">
              Next Level <ArrowRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onReset} className="gap-1 rounded-xl hover:scale-[1.02] transition-transform">
              <RotateCcw className="w-3 h-3" /> Try Again
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onTest}
              disabled={!isConnected || isBusy}
              className="gap-2 rounded-xl hover:scale-[1.02] transition-transform"
            >
              {isBusy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Test Automation
                </>
              )}
            </Button>
            {hasBlocks && (
              <Button variant="outline" size="sm" onClick={onReset} disabled={isBusy} className="gap-1 rounded-xl hover:scale-[1.02] transition-transform">
                <RotateCcw className="w-3 h-3" /> Reset
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default InstructionPanel;
