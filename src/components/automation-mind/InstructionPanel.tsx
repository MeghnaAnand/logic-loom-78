import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, RotateCcw, CheckCircle2, Loader2, X, Lock, Clock, Sparkles, BookOpen, ChevronDown, ChevronUp, Lightbulb, Rewind } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { LevelConfig } from "@/data/automation-levels";

interface InstructionPanelProps {
  level: LevelConfig;
  testingPhase: "idle" | "loading" | "running" | "success" | "failure";
  currentTestItem: number;
  onTest: () => void;
  onReset: () => void;
  onNextLevel: () => void;
  onReplay?: () => void;
  hasMinBlocks: boolean;
  isFullyConnected: boolean;
  isBusy: boolean;
  currentLevelIndex: number;
  totalLevels: number;
  completedLevels: Set<number>;
  timeTaken?: string;
}

const BADGES = [
  { level: 0, label: "First Automation", emoji: "✅" },
  { level: 1, label: "Conditional Logic", emoji: "✅" },
  { level: 2, label: "Data Detective", emoji: "🔍" },
];

const InstructionPanel = ({
  level,
  testingPhase,
  currentTestItem,
  onTest,
  onReset,
  onNextLevel,
  onReplay,
  hasMinBlocks,
  isFullyConnected,
  isBusy,
  currentLevelIndex,
  totalLevels,
  completedLevels,
  timeTaken,
}: InstructionPanelProps) => {
  const [dataPreviewOpen, setDataPreviewOpen] = useState(false);
  const testData = level.testData;
  const progressValue =
    testingPhase === "running"
      ? ((currentTestItem + 1) / testData.length) * 100
      : testingPhase === "success"
        ? 100
        : 0;

  const levelProgress = completedLevels.size;
  const isLastLevel = currentLevelIndex >= totalLevels - 1;
  const earnedBadges = BADGES.filter((b) => completedLevels.has(b.level));

  return (
    <div className="w-80 border-l border-border bg-card p-5 flex flex-col gap-5 overflow-y-auto">
      {/* Level badge and progress */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full font-display">
            {level.subtitle}
          </span>
          <h2 className="font-display font-bold text-card-foreground">{level.title}</h2>
        </div>

        {/* Difficulty & metadata row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm tracking-wide" title={`Difficulty: ${level.difficulty}/5`}>
            {Array.from({ length: 5 }, (_, i) => (
              <span key={i} className={i < level.difficulty ? "text-amber-400" : "text-muted-foreground/30"}>★</span>
            ))}
          </span>
          {level.estimatedTime && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3" /> {level.estimatedTime}
            </span>
          )}
        </div>

        {/* New concept badge */}
        {level.newConcept && (
          <div className="inline-flex items-center gap-1.5 bg-am-condition/15 text-foreground text-xs font-bold px-2.5 py-1 rounded-lg font-display mb-2">
            <Sparkles className="w-3 h-3 text-am-condition" /> New Concept: {level.newConcept}
          </div>
        )}

        {/* Learning goal */}
        {level.learningGoal && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>What you're learning: <strong className="text-foreground">{level.learningGoal}</strong></span>
          </div>
        )}

        {/* Overall progress bar */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
          <Progress value={(levelProgress / totalLevels) * 100} className="h-1.5 flex-1" />
          <span className="font-display font-semibold">{levelProgress}/{totalLevels}</span>
        </div>

        {/* Earned badges */}
        {earnedBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {earnedBadges.map((badge) => (
              <span
                key={badge.level}
                className="inline-flex items-center gap-1 bg-success/10 text-success text-[10px] font-bold font-display px-2 py-0.5 rounded-full"
              >
                {badge.emoji} {badge.label}
              </span>
            ))}
          </div>
        )}

        <div className="bg-muted rounded-xl p-4 text-sm text-muted-foreground leading-relaxed space-y-3 shadow-sm">
          <p>
            <strong className="text-foreground">Challenge:</strong> {level.challenge}
          </p>
          <p className="whitespace-pre-line">
            <strong className="text-foreground">Goal:</strong> {level.goal}
          </p>
        </div>
      </div>

      {/* Steps guide */}
      <div className="space-y-2 text-sm">
        <motion.div
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${hasMinBlocks ? "text-success bg-success/5" : "text-muted-foreground"}`}
          animate={hasMinBlocks ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span>{hasMinBlocks ? "✅" : "1️⃣"}</span>
          <span>Add the right blocks to the canvas</span>
        </motion.div>
        <motion.div
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${isFullyConnected ? "text-success bg-success/5" : "text-muted-foreground"}`}
          animate={isFullyConnected ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 0.3 }}
        >
          <span>{isFullyConnected ? "✅" : "2️⃣"}</span>
          <span>Connect all blocks together</span>
        </motion.div>
        <motion.div
          className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors ${testingPhase === "success" ? "text-success bg-success/5" : "text-muted-foreground"}`}
        >
          <span>{testingPhase === "success" ? "✅" : "3️⃣"}</span>
          <span>Test your automation</span>
        </motion.div>
      </div>

      {/* Hint */}
      {testingPhase === "idle" && !isFullyConnected && hasMinBlocks && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-accent/15 rounded-xl p-3 text-xs text-accent-foreground"
        >
          💡 <strong>Hint:</strong> {level.hint}
        </motion.div>
      )}

      {/* Data Preview Panel (Level 3) */}
      {level.dataPreview && level.dataPreview.length > 0 && (
        <div className="bg-muted/50 border border-border rounded-xl overflow-hidden">
          <button
            onClick={() => setDataPreviewOpen(!dataPreviewOpen)}
            className="w-full flex items-center justify-between px-3 py-2 text-xs font-display font-bold text-foreground hover:bg-muted transition-colors"
          >
            <span className="flex items-center gap-1.5">
              📋 Data Preview
            </span>
            {dataPreviewOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          <AnimatePresence>
            {dataPreviewOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 space-y-3">
                  {level.dataPreview.map((preview, i) => (
                    <div key={i} className="space-y-1.5">
                      <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-2">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1 font-display">Original Email:</div>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed">{preview.original}</p>
                      </div>
                      <div className="flex items-center justify-center text-muted-foreground">
                        <span className="text-xs">↓</span>
                      </div>
                      <div className="bg-success/5 border border-success/10 rounded-lg p-2">
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1 font-display">After Extraction:</div>
                        <div className="space-y-0.5">
                          {preview.extracted.map((item, j) => (
                            <div key={j} className="flex items-center gap-1 text-[11px]">
                              <span className="text-muted-foreground">-</span>
                              <span className="text-muted-foreground">{item.label}:</span>
                              <span className="text-foreground font-bold font-display">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

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
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground font-display font-semibold flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Testing...
                </span>
                <span className="text-muted-foreground font-display">
                  {currentTestItem + 1}/{testData.length} complete
                </span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
            <div className="space-y-1 pt-1 max-h-48 overflow-y-auto">
              {testData.slice(0, currentTestItem + 1).map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center gap-1.5 text-muted-foreground"
                >
                  <CheckCircle2
                    className="w-3.5 h-3.5 shrink-0"
                    style={{
                      color: item.path === "yes"
                        ? "hsl(var(--am-yes))"
                        : item.path === "no"
                          ? "hsl(var(--am-no))"
                          : "hsl(var(--success))",
                    }}
                  />
                  <span className="text-xs">
                    {level.id === 3
                      ? `${item.label}: ${item.extractions?.join(" → ")} → ${item.actionLabel}`
                      : level.id === 2
                        ? `Order ${item.label} → ${item.conditionResult === "yes" ? "YES" : "NO"} → ${item.actionLabel}`
                        : `Form: ${item.label} → ${item.actionLabel}`
                    }
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
              <span className="text-xs text-success font-display font-bold">
                {testData.length}/{testData.length}
              </span>
            </div>
            <Progress value={100} className="h-2 mb-2" />
            <div className="max-h-40 overflow-y-auto space-y-1">
              {testData.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-muted-foreground font-mono text-xs"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 + 0.05, type: "spring", bounce: 0.5 }}
                  >
                    <CheckCircle2
                      className="w-3.5 h-3.5 shrink-0"
                      style={{
                        color: item.path === "yes"
                          ? "hsl(var(--am-yes))"
                          : item.path === "no"
                            ? "hsl(var(--am-no))"
                            : "hsl(var(--success))",
                      }}
                    />
                  </motion.div>
                  <span>
                    {level.id === 3
                      ? `${item.label}: ${item.extractions?.join(" → ")} → ${item.actionLabel}`
                      : level.id === 2
                        ? `${item.label} → ${item.conditionResult === "yes" ? "YES" : "NO"} → ${item.actionLabel}`
                        : `${item.label} → ${item.actionLabel}`
                    }
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="pt-2 border-t border-success/20"
            >
              <p className="text-success font-bold font-display text-base">
                {level.successTitle}
              </p>
              <p className="text-success font-display text-sm mt-1">
                {level.successSubtitle}
              </p>
            </motion.div>

            {/* Time taken + comparison */}
            {timeTaken && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="mt-2 flex items-center gap-3 text-xs"
              >
                <div className="flex items-center gap-1 bg-primary/10 text-primary font-display font-bold px-2.5 py-1 rounded-lg">
                  <Clock className="w-3 h-3" />
                  <span>Time: {timeTaken}</span>
                </div>
                {level.averageTime && (
                  <div className="flex items-center gap-1 text-muted-foreground font-display">
                    <span>Most people: <strong className="text-foreground">{level.averageTime}</strong></span>
                  </div>
                )}
              </motion.div>
            )}

            {/* Before / After comparison for Level 3 */}
            {level.dataPreview && level.dataPreview.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-3 space-y-2"
              >
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-display font-bold">Before → After</div>
                {level.dataPreview.slice(0, 2).map((preview, i) => (
                  <div key={i} className="flex gap-2 items-stretch text-[10px]">
                    <div className="flex-1 bg-destructive/5 border border-destructive/10 rounded-lg p-1.5">
                      <div className="text-[8px] uppercase tracking-wider text-muted-foreground font-display mb-0.5">Messy</div>
                      <p className="text-muted-foreground italic leading-snug line-clamp-2">{preview.original}</p>
                    </div>
                    <div className="flex items-center text-muted-foreground text-xs">→</div>
                    <div className="flex-1 bg-success/5 border border-success/10 rounded-lg p-1.5">
                      <div className="text-[8px] uppercase tracking-wider text-muted-foreground font-display mb-0.5">Clean</div>
                      {preview.extracted.map((item, j) => (
                        <div key={j} className="flex gap-0.5 text-[10px]">
                          <span className="text-muted-foreground">{item.label}:</span>
                          <span className="text-foreground font-bold font-display">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Rewind button */}
            {onReplay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
                className="mt-2"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onReplay}
                  className="gap-1.5 rounded-xl hover:scale-[1.02] transition-transform w-full text-xs"
                >
                  <Rewind className="w-3 h-3" /> Replay Data Flow
                </Button>
              </motion.div>
            )}
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
            <p className="text-destructive font-semibold">{level.failureMessage}</p>
            <p className="text-muted-foreground mt-2">
              <strong>Hint:</strong> {level.failureHint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Teaching tip after success */}
      {testingPhase === "success" && level.teachingTip && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="bg-accent/10 border border-accent/20 rounded-xl p-3 text-xs text-accent-foreground leading-relaxed"
        >
          <div className="flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent" />
            <span>{level.teachingTip}</span>
          </div>
        </motion.div>
      )}

      {/* Bonus challenge after success */}
      {testingPhase === "success" && level.bonusChallenge && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8 }}
          className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-foreground leading-relaxed"
        >
          <div className="flex items-start gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
            <div>
              <span className="font-display font-bold text-primary">Bonus Challenge:</span>{" "}
              <span className="text-muted-foreground">{level.bonusChallenge}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {testingPhase === "success" ? (
          <>
            {isLastLevel ? (
              <Button disabled className="gap-2 rounded-xl opacity-60">
                <Lock className="w-4 h-4" /> Level {currentLevelIndex + 2} Coming Soon
              </Button>
            ) : (
              <Button
                onClick={onNextLevel}
                className="gap-2 bg-success text-success-foreground hover:bg-success/90 rounded-xl hover:scale-[1.02] transition-transform"
              >
                Next Level <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-1 rounded-xl hover:scale-[1.02] transition-transform"
            >
              <RotateCcw className="w-3 h-3" /> Try Again
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={onTest}
              disabled={!isFullyConnected || isBusy}
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
            {hasMinBlocks && (
              <Button
                variant="outline"
                size="sm"
                onClick={onReset}
                disabled={isBusy}
                className="gap-1 rounded-xl hover:scale-[1.02] transition-transform"
              >
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
