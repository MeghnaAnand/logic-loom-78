import { useState, useCallback, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw, CheckCircle2, Trophy, Sparkles, Loader2, Code2, History, ChevronDown, ChevronUp, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickSessionChallenges, type Block, type Challenge, getBlockIndent } from "@/data/challenges";
import { LANGUAGE_META, type CodeLanguage, getFullCode } from "@/data/puzzle-code-translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { playDing, playError, playWhoosh, playCelebration } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { updateUserSkills } from "@/lib/updateSkills";
import WrongAnswerOverlay from "@/components/puzzle/WrongAnswerOverlay";
import PuzzleTimer from "@/components/puzzle/PuzzleTimer";
import ConceptModal from "@/components/puzzle/ConceptModal";

const blockColorMap: Record<string, string> = {
  trigger: "bg-block-trigger",
  action: "bg-block-action",
  condition: "bg-block-condition",
  data: "bg-block-data",
  output: "bg-block-output",
};

const WRONG_MESSAGES = [
  "Oops! That's not quite right!",
  "Almost, but not there yet!",
  "Hmm, the order's off!",
  "Nope! Think about the flow!",
  "So close! Try rearranging!",
];

const Playground = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [blockLibraryOpen, setBlockLibraryOpen] = useState(false);
  const [sessionChallenges, setSessionChallenges] = useState<Challenge[]>(() => pickSessionChallenges());
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>(sessionChallenges[0].availableBlocks);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<number>>(new Set());
  const [showWrong, setShowWrong] = useState(false);
  const [wrongMessage, setWrongMessage] = useState("");
  const [wrongShake, setWrongShake] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [finalTime, setFinalTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>("pseudocode");
  const [showCode, setShowCode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [conceptModal, setConceptModal] = useState<string | null>(null);

  const [levelStats, setLevelStats] = useState<{ attempts: number; time: number }[]>(
    () => sessionChallenges.map(() => ({ attempts: 0, time: 0 }))
  );

  const [isLoadingTips, setIsLoadingTips] = useState(false);

  const challenge = sessionChallenges[currentChallenge];

  const applyNewChallenges = useCallback((newChallenges: Challenge[]) => {
    setSessionChallenges(newChallenges);
    setCurrentChallenge(0);
    setAvailableBlocks([...newChallenges[0].availableBlocks]);
    setPlacedBlocks([]);
    setShowHint(false);
    setSolved(false);
    setShowSuccess(false);
    setSolvedChallenges(new Set());
    setShowWrong(false);
    setTimerResetKey((k) => k + 1);
    setTimerRunning(false);
    setAttempts(0);
    setLevelStats(newChallenges.map(() => ({ attempts: 0, time: 0 })));
    setStreak(0);
  }, []);

  const fetchAIChallenges = useCallback(async () => {
    setIsLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-challenges");
      if (error) throw error;
      const challenges = data?.challenges;
      if (!challenges || !Array.isArray(challenges) || challenges.length === 0) {
        throw new Error("Invalid AI response");
      }
      for (const c of challenges) {
        if (!c.id || !c.availableBlocks || !c.correctOrder || c.availableBlocks.length === 0) {
          throw new Error("Malformed challenge from AI");
        }
      }
      const diffOrder: Record<string, number> = { beginner: 0, intermediate: 1, advanced: 2 };
      challenges.sort((a: Challenge, b: Challenge) => (diffOrder[a.difficulty] ?? 1) - (diffOrder[b.difficulty] ?? 1));
      applyNewChallenges(challenges);
      toast.success("🤖 Fresh AI-generated puzzles loaded!");
    } catch (e) {
      console.error("AI challenge generation failed:", e);
      toast.error("AI generation failed — loading random puzzles instead");
      applyNewChallenges(pickSessionChallenges());
    } finally {
      setIsLoadingAI(false);
    }
  }, [applyNewChallenges]);

  const resetPuzzle = () => {
    setAvailableBlocks([...challenge.availableBlocks]);
    setPlacedBlocks([]);
    setShowHint(false);
    setSolved(false);
    setShowSuccess(false);
    setShowWrong(false);
    setTimerResetKey((k) => k + 1);
    setTimerRunning(false);
    setAttempts(0);
  };

  const loadChallenge = (index: number) => {
    setCurrentChallenge(index);
    const c = sessionChallenges[index];
    setAvailableBlocks([...c.availableBlocks]);
    setPlacedBlocks([]);
    setShowHint(false);
    setSolved(false);
    setShowSuccess(false);
    setShowWrong(false);
    setTimerResetKey((k) => k + 1);
    setTimerRunning(false);
    setAttempts(0);
  };

  const triggerWrongAnswer = useCallback(() => {
    setAttempts((a) => a + 1);
    setStreak(0);
    const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
    setWrongMessage(msg);
    setShowWrong(true);
    playError();
    setWrongShake(true);
    setTimeout(() => setWrongShake(false), 1000);
  }, []);

  const saveSession = useCallback(async (allStats: { attempts: number; time: number }[]) => {
    setIsLoadingTips(true);
    let tipsData = null;
    try {
      const payload = allStats.map((s, i) => ({
        level: i + 1,
        difficulty: sessionChallenges[i]?.difficulty ?? "beginner",
        attempts: s.attempts,
        timeSec: s.time,
        solved: true,
      }));
      const { data, error } = await supabase.functions.invoke("learning-tips", {
        body: { stats: payload },
      });
      if (error) throw error;
      if (data?.summary && data?.tips) tipsData = data;
    } catch (e) {
      console.error("Learning tips failed:", e);
    } finally {
      setIsLoadingTips(false);
    }

    if (user) {
      try {
        const levelStatsPayload = allStats.map((s, i) => ({
          level: i + 1,
          difficulty: sessionChallenges[i]?.difficulty ?? "beginner",
          attempts: s.attempts,
          time: s.time,
        }));
        await supabase.from("session_history").insert({
          user_id: user.id,
          level_stats: levelStatsPayload,
          ai_learning_tips: tipsData,
        });
        toast.success("Session saved to your history!");
      } catch (e) {
        console.error("Failed to save session:", e);
      }
    }
  }, [sessionChallenges, user]);

  const checkSolution = useCallback((placed: Block[]) => {
    const correct = challenge.correctOrder;
    if (placed.length !== correct.length) return;

    const isCorrect = placed.every((b, i) => b.id === correct[i]);
    if (isCorrect) {
      setSolved(true);
      setShowSuccess(true);
      setShowWrong(false);
      setTimerRunning(false);

      // Streak: increment if no wrong attempts this puzzle
      setStreak((s) => (attempts === 0 ? s + 1 : 1));

      playDing();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FFD700', '#4ECDC4', '#96E6A1'],
        gravity: 1.2,
      });

      const updatedStats = [...levelStats];
      updatedStats[currentChallenge] = { attempts, time: finalTime };
      setLevelStats(updatedStats);

      if (user) {
        const blockTypes = challenge.availableBlocks
          .filter((b) => challenge.correctOrder.includes(b.id))
          .map((b) => b.type);
        updateUserSkills(user.id, blockTypes, challenge.difficulty, attempts).catch(console.error);
      }

      const newSolved = new Set([...solvedChallenges, currentChallenge]);
      setSolvedChallenges(newSolved);

      if (newSolved.size === sessionChallenges.length) {
        saveSession(updatedStats);
        playCelebration();
        const duration = 2000;
        const end = Date.now() + duration;
        const interval = setInterval(() => {
          if (Date.now() > end) { clearInterval(interval); return; }
          confetti({
            particleCount: 30,
            spread: 120,
            startVelocity: 35,
            origin: { x: Math.random(), y: Math.random() * 0.4 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'],
          });
        }, 100);
      }
    } else {
      triggerWrongAnswer();
    }
  }, [challenge, currentChallenge, triggerWrongAnswer, levelStats, attempts, finalTime, solvedChallenges, sessionChallenges, saveSession, user]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (!timerRunning && !solved) setTimerRunning(true);
    playWhoosh();

    if (source.droppableId === "available" && destination.droppableId === "workspace") {
      const block = availableBlocks[source.index];
      const newAvailable = [...availableBlocks];
      newAvailable.splice(source.index, 1);
      const newPlaced = [...placedBlocks];
      newPlaced.splice(destination.index, 0, block);
      setAvailableBlocks(newAvailable);
      setPlacedBlocks(newPlaced);
      checkSolution(newPlaced);
    } else if (source.droppableId === "workspace" && destination.droppableId === "workspace") {
      const newPlaced = [...placedBlocks];
      const [moved] = newPlaced.splice(source.index, 1);
      newPlaced.splice(destination.index, 0, moved);
      setPlacedBlocks(newPlaced);
      checkSolution(newPlaced);
    } else if (source.droppableId === "workspace" && destination.droppableId === "available") {
      const block = placedBlocks[source.index];
      const newPlaced = [...placedBlocks];
      newPlaced.splice(source.index, 1);
      const newAvailable = [...availableBlocks];
      newAvailable.splice(destination.index, 0, block);
      setPlacedBlocks(newPlaced);
      setAvailableBlocks(newAvailable);
    }
  };

  // Mobile tap-to-place: tap available block → add to workspace end
  const handleTapAvailable = (index: number) => {
    if (!isMobile || solved) return;
    if (!timerRunning) setTimerRunning(true);
    playWhoosh();
    const block = availableBlocks[index];
    const newAvailable = [...availableBlocks];
    newAvailable.splice(index, 1);
    const newPlaced = [...placedBlocks, block];
    setAvailableBlocks(newAvailable);
    setPlacedBlocks(newPlaced);
    checkSolution(newPlaced);
  };

  // Mobile tap-to-remove: tap placed block → return to available
  const handleTapPlaced = (index: number) => {
    if (!isMobile || solved) return;
    playWhoosh();
    const block = placedBlocks[index];
    const newPlaced = [...placedBlocks];
    newPlaced.splice(index, 1);
    setPlacedBlocks(newPlaced);
    setAvailableBlocks([...availableBlocks, block]);
  };

  const allSolved = solvedChallenges.size === sessionChallenges.length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground text-sm">AutomationMind Puzzles</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Streak counter */}
          {streak > 0 && (
            <motion.div
              key={streak}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-accent/20 text-accent-foreground px-2.5 py-1 rounded-full text-xs font-display font-bold"
            >
              <Flame className="w-3.5 h-3.5 text-accent" />
              {streak}
            </motion.div>
          )}
          <PuzzleTimer isRunning={timerRunning} onTimeUpdate={setFinalTime} reset={timerResetKey} />
          <div className="flex items-center gap-1.5">
            {sessionChallenges.map((c, i) => {
              const diffColor =
                c.difficulty === "beginner" ? "border-success" :
                c.difficulty === "intermediate" ? "border-accent" : "border-destructive";
              return (
                <button
                  key={i}
                  onClick={() => loadChallenge(i)}
                  className={`w-7 h-7 rounded-md font-display font-bold text-xs transition-all border-2 ${diffColor}
                    ${currentChallenge === i ? "bg-primary text-primary-foreground" :
                      solvedChallenges.has(i) ? "bg-success text-success-foreground" :
                      "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                  title={`Tier ${c.tier} — ${c.difficulty}`}
                >
                  {solvedChallenges.has(i) ? "✓" : i + 1}
                </button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAIChallenges} disabled={isLoadingAI} className="gap-1 text-xs">
            {isLoadingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {isLoadingAI ? "..." : "AI"}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(user ? "/history" : "/auth")} className="text-xs">
            <History className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-border bg-card p-4 flex flex-col gap-3">
          <div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider mb-1
              ${challenge.difficulty === "beginner" ? "bg-success/15 text-success" :
                challenge.difficulty === "intermediate" ? "bg-accent/30 text-accent-foreground" :
                "bg-destructive/15 text-destructive"}`}>
              {challenge.difficulty} — Tier {challenge.tier}
            </span>
            <h2 className="font-display text-lg font-bold text-card-foreground">{challenge.title}</h2>
            <p className="text-xs text-muted-foreground mt-1">{challenge.description}</p>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <p className="text-xs text-muted-foreground leading-relaxed">{challenge.scenario}</p>
          </div>

          {/* Concept chips */}
          <div className="flex flex-wrap gap-1">
            {(() => {
              const tierConcepts: { key: string; label: string; emoji: string }[][] = [
                [{ key: "linear", label: "Linear", emoji: "➡️" }],
                [{ key: "linear", label: "Linear", emoji: "➡️" }, { key: "ifelse", label: "IF/ELSE", emoji: "🔀" }],
                [{ key: "linear", label: "Linear", emoji: "➡️" }, { key: "ifelse", label: "IF/ELSE", emoji: "🔀" }, { key: "foreach", label: "Loop", emoji: "🔁" }],
                [{ key: "linear", label: "Linear", emoji: "➡️" }, { key: "ifelse", label: "IF/ELSE", emoji: "🔀" }, { key: "foreach", label: "Loop", emoji: "🔁" }, { key: "nested", label: "Nested", emoji: "🧩" }],
                [{ key: "linear", label: "Linear", emoji: "➡️" }, { key: "ifelse", label: "IF/ELSE", emoji: "🔀" }, { key: "foreach", label: "Loop", emoji: "🔁" }, { key: "nested", label: "Nested", emoji: "🧩" }, { key: "trycatch", label: "TRY/CATCH", emoji: "🛡️" }],
              ];
              return tierConcepts[Math.min(challenge.tier - 1, 4)].map(c => (
                <button
                  key={c.key}
                  onClick={() => setConceptModal(c.key)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20 text-[10px] font-display font-semibold text-primary transition-colors"
                >
                  {c.emoji} {c.label}
                </button>
              ));
            })()}
          </div>

          {attempts > 0 && !solved && (
            <div className="bg-destructive/10 rounded-lg px-3 py-1.5 text-xs text-destructive font-display font-semibold">
              Attempts: {attempts} 💪
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="gap-1 flex-1 text-xs">
              <Lightbulb className="w-3.5 h-3.5" /> Hint
            </Button>
            <Button variant="outline" size="sm" onClick={resetPuzzle} className="gap-1 flex-1 text-xs">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </Button>
          </div>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-accent/20 rounded-lg p-3 text-xs text-accent-foreground"
              >
                💡 {challenge.hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main workspace */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Available blocks */}
            <div className="bg-card border-b lg:border-b-0 lg:border-r border-border lg:w-64 flex flex-col shrink-0">
              <button
                onClick={() => setBlockLibraryOpen(!blockLibraryOpen)}
                className="lg:hidden flex items-center justify-between p-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Blocks ({availableBlocks.length})
                {blockLibraryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <div className={`${isMobile && !blockLibraryOpen ? "hidden" : ""} p-4 pt-0 lg:pt-4 flex flex-col`}>
                <h3 className="font-display text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 hidden lg:block">
                  Drag blocks →
                </h3>
                {isMobile ? (
                  <div className="flex flex-col gap-2 min-h-[56px]">
                    {availableBlocks.map((block, index) => (
                      <button
                        key={block.id}
                        onClick={() => handleTapAvailable(index)}
                        className={`${blockColorMap[block.type]} rounded-lg px-3 py-2 text-primary-foreground font-display font-semibold text-xs
                          select-none text-left shadow-md hover:shadow-lg active:scale-95 transition-all`}
                      >
                        <span className="mr-1.5">{block.icon}</span>{block.label}
                        <span className="ml-2 text-primary-foreground/60 text-[10px]">tap to add →</span>
                      </button>
                    ))}
                    {availableBlocks.length === 0 && (
                      <div className="text-xs text-muted-foreground italic">All blocks placed!</div>
                    )}
                  </div>
                ) : (
                <Droppable droppableId="available" direction="vertical">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2 min-h-[56px]">
                      {availableBlocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`${blockColorMap[block.type]} rounded-lg px-3 py-2 text-primary-foreground font-display font-semibold text-xs
                                select-none cursor-grab active:cursor-grabbing transition-shadow
                                ${snapshot.isDragging ? "shadow-2xl scale-105" : "shadow-md hover:shadow-lg"}`}
                            >
                              <span className="mr-1.5">{block.icon}</span>{block.label}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {availableBlocks.length === 0 && (
                        <div className="text-xs text-muted-foreground italic">All blocks placed!</div>
                      )}
                    </div>
                  )}
                </Droppable>
                )}

                {/* Code View */}
                <div className="border-t border-border mt-4 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Code2 className="w-3 h-3" /> Code
                    </h3>
                    <Button
                      variant={showCode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCode(!showCode)}
                      className="h-5 px-2 text-[10px]"
                    >
                      {showCode ? "Hide" : "Show"}
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    {(Object.keys(LANGUAGE_META) as CodeLanguage[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setSelectedLanguage(lang); setShowCode(true); }}
                        className={`flex-1 px-2 py-1 rounded-md text-[10px] font-display font-semibold transition-all
                          ${selectedLanguage === lang ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                      >
                        {LANGUAGE_META[lang].icon} {LANGUAGE_META[lang].label}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence>
                  {showCode && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-border pt-2 mt-2"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-display font-semibold text-muted-foreground uppercase">Output</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 px-1.5 text-[10px]"
                          onClick={() => {
                            navigator.clipboard.writeText(getFullCode(placedBlocks, selectedLanguage, currentChallenge + 1));
                            toast.success("Copied!");
                          }}
                        >
                          📋
                        </Button>
                      </div>
                      <pre className="bg-workspace text-workspace-foreground text-[10px] leading-relaxed rounded-md px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap border border-border/30 max-h-40 overflow-y-auto">
                        {getFullCode(placedBlocks, selectedLanguage, currentChallenge + 1)}
                      </pre>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Workspace */}
            <div className="flex-1 bg-workspace workspace-grid p-6 relative overflow-auto">
              {isLoadingAI && (
                <div className="absolute inset-0 flex items-center justify-center bg-workspace/80 backdrop-blur-sm z-20">
                  <div className="bg-card rounded-2xl p-8 text-center shadow-2xl border border-border">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                    <p className="font-display font-bold text-card-foreground">Generating AI Puzzles...</p>
                  </div>
                </div>
              )}

              <WrongAnswerOverlay show={showWrong} message={wrongMessage} onDismiss={() => setShowWrong(false)} />

              {isMobile ? (
                /* Mobile: tap-to-remove placed blocks */
                <motion.div
                  animate={wrongShake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`min-h-[300px] max-w-md mx-auto rounded-xl border-2 border-dashed p-4 transition-colors
                    ${solved ? "border-success/50 bg-success/5" :
                      wrongShake ? "border-destructive/50 bg-destructive/5" : "border-workspace-foreground/20"}`}
                >
                  {placedBlocks.length === 0 && (
                    <div className="flex items-center justify-center h-[280px] text-workspace-foreground/30 font-display text-center text-sm">
                      Tap blocks above to place them here
                    </div>
                  )}
                  {placedBlocks.map((block, index) => {
                    const indent = getBlockIndent(placedBlocks, index);
                    const isStructural = block.structure && block.structure !== "step";
                    const isOpener = block.structure === "if" || block.structure === "loop-start" || block.structure === "try";
                    const isCloser = block.structure === "endif" || block.structure === "loop-end" || block.structure === "end-try";
                    const isBranch = block.structure === "else" || block.structure === "catch";
                    return (
                      <div key={block.id} style={{ marginLeft: `${indent * 24}px` }}>
                        <motion.button
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          onClick={() => handleTapPlaced(index)}
                          className={`w-full text-left
                            ${isStructural ? (
                              isOpener ? "bg-primary/20 border-2 border-primary/40 text-primary" :
                              isCloser ? "bg-muted border-2 border-border text-muted-foreground" :
                              isBranch ? "bg-accent/20 border-2 border-accent/40 text-accent-foreground" :
                              blockColorMap[block.type] + " text-primary-foreground"
                            ) : blockColorMap[block.type] + " text-primary-foreground"}
                            rounded-lg px-4 py-2.5 font-display font-semibold text-xs
                            select-none mb-2 shadow-md active:scale-95 transition-all
                            ${solved ? "ring-2 ring-success/40" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{block.icon}</span>
                            <div>
                              <div className="text-[9px] uppercase tracking-wider opacity-70">
                                {isStructural ? (block.structure ?? block.type) : block.type}
                              </div>
                              <div>{block.label}</div>
                            </div>
                            {solved ? (
                              <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-80" />
                            ) : (
                              <span className="ml-auto text-[10px] opacity-50">✕</span>
                            )}
                          </div>
                        </motion.button>
                        {index < placedBlocks.length - 1 && (
                          <div className="flex my-0.5" style={{ marginLeft: `${Math.min(indent, getBlockIndent(placedBlocks, index + 1)) * 24}px` }}>
                            <div className={`w-0.5 h-3 rounded ${isOpener || isBranch ? "bg-primary/30" : "bg-workspace-foreground/20"}`} style={{ marginLeft: "20px" }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
              <Droppable droppableId="workspace">
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    animate={wrongShake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`min-h-[300px] max-w-md ml-auto rounded-xl border-2 border-dashed p-4 transition-colors
                      ${snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" :
                        solved ? "border-success/50 bg-success/5" :
                        wrongShake ? "border-destructive/50 bg-destructive/5" : "border-workspace-foreground/20"}`}
                  >
                    {placedBlocks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-[280px] text-workspace-foreground/30 font-display text-center text-sm">
                        Drop blocks here in the right order
                      </div>
                    )}

                    {placedBlocks.map((block, index) => {
                      const indent = getBlockIndent(placedBlocks, index);
                      const isStructural = block.structure && block.structure !== "step";
                      const isOpener = block.structure === "if" || block.structure === "loop-start" || block.structure === "try";
                      const isCloser = block.structure === "endif" || block.structure === "loop-end" || block.structure === "end-try";
                      const isBranch = block.structure === "else" || block.structure === "catch";

                      return (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={{ ...provided.draggableProps.style, marginLeft: `${indent * 24}px` }}
                            >
                              <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`
                                  ${isStructural ? (
                                    isOpener ? "bg-primary/20 border-2 border-primary/40 text-primary" :
                                    isCloser ? "bg-muted border-2 border-border text-muted-foreground" :
                                    isBranch ? "bg-accent/20 border-2 border-accent/40 text-accent-foreground" :
                                    blockColorMap[block.type] + " text-primary-foreground"
                                  ) : blockColorMap[block.type] + " text-primary-foreground"}
                                  rounded-lg px-4 py-2.5 font-display font-semibold text-xs
                                  select-none cursor-grab active:cursor-grabbing mb-2 transition-shadow
                                  ${snapshot.isDragging ? "shadow-2xl" : "shadow-md"}
                                  ${solved ? "ring-2 ring-success/40" : ""}`}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{block.icon}</span>
                                  <div>
                                    <div className="text-[9px] uppercase tracking-wider opacity-70">
                                      {isStructural ? (block.structure ?? block.type) : block.type}
                                    </div>
                                    <div>{block.label}</div>
                                  </div>
                                  {solved && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-80" />}
                                </div>
                              </motion.div>
                              {index < placedBlocks.length - 1 && (
                                <div className="flex my-0.5" style={{ marginLeft: `${Math.min(indent, getBlockIndent(placedBlocks, index + 1)) * 24}px` }}>
                                  <div className={`w-0.5 h-3 rounded ${isOpener || isBranch ? "bg-primary/30" : "bg-workspace-foreground/20"}`} style={{ marginLeft: "20px" }} />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </motion.div>
                )}
              </Droppable>
              )}

              {/* Simplified success overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-workspace/80 backdrop-blur-sm z-10"
                  >
                    <div className="bg-card rounded-2xl p-6 max-w-sm text-center shadow-2xl border border-border">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}>
                        <Trophy className="w-12 h-12 text-accent mx-auto mb-3" />
                      </motion.div>
                      <h3 className="font-display text-lg font-bold text-card-foreground mb-1">
                        {allSolved ? "🎉 All Puzzles Complete!" : "Puzzle Solved!"}
                      </h3>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4 font-mono">
                        <span>⏱ {Math.floor(finalTime / 60)}:{String(finalTime % 60).padStart(2, "0")}</span>
                        <span>🔄 {attempts} {attempts === 1 ? "attempt" : "attempts"}</span>
                        {streak > 1 && <span className="text-accent font-bold">🔥 {streak} streak</span>}
                      </div>

                      {/* Why this order - one line */}
                      <p className="text-xs text-muted-foreground mb-4 italic">
                        {challenge.successMessage}
                      </p>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowSuccess(false)} className="flex-1 text-xs">
                          Review
                        </Button>
                        {currentChallenge < sessionChallenges.length - 1 ? (
                          <Button size="sm" onClick={() => loadChallenge(currentChallenge + 1)} className="flex-1 bg-primary text-primary-foreground gap-1 text-xs">
                            Next <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        ) : (
                          <div className="flex flex-col flex-1 gap-2">
                            <Button size="sm" onClick={() => navigate("/speed-challenge")} className="w-full bg-accent text-accent-foreground gap-1 text-xs">
                              <Zap className="w-3.5 h-3.5" /> Speed Challenge
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => navigate("/history")} className="w-full gap-1 text-xs">
                              📊 Progress <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="outline" onClick={() => applyNewChallenges(pickSessionChallenges())} className="flex-1 text-[10px]">
                                🔀 New
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => { setShowSuccess(false); fetchAIChallenges(); }}
                                disabled={isLoadingAI}
                                className="flex-1 bg-success text-success-foreground text-[10px]"
                              >
                                {isLoadingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DragDropContext>
        </div>
      </div>

      <ConceptModal
        open={conceptModal !== null}
        onClose={() => setConceptModal(null)}
        {...(() => {
          const concepts: Record<string, { title: string; emoji: string; description: string; details: string[]; realWorldTool: string }> = {
            linear: { title: "Linear Flow", emoji: "➡️", description: "A linear flow runs steps one after another — no decisions, no loops.", details: ["Each step waits for the previous one to finish.", "Great for: form submitted → save to spreadsheet → send email.", "Think of it like a recipe: step 1, step 2, step 3 — done."], realWorldTool: "In Zapier, a simple Zap with a Trigger and Actions. In Make, modules connected in a straight line." },
            ifelse: { title: "IF / ELSE Branching", emoji: "🔀", description: "IF / ELSE lets your automation make decisions based on conditions.", details: ["IF true → run one set of actions.", "ELSE → run different actions.", "Example: IF order > $500 → manager approval. ELSE → auto-approve."], realWorldTool: "In Zapier: 'Filter' or 'Paths'. In Make: 'Router' with conditions." },
            foreach: { title: "FOR EACH Loop", emoji: "🔁", description: "FOR EACH processes a list of items one at a time.", details: ["Takes a collection and runs the same steps for each item.", "Example: FOR EACH row → send personalized email.", "Repeats until every item is processed."], realWorldTool: "In Zapier: 'Looping by Zapier'. In Make: Iterator modules." },
            nested: { title: "Nested Logic", emoji: "🧩", description: "Conditions or loops inside other conditions or loops.", details: ["FOR EACH order → IF amount > $500 → manager, ELSE → auto-approve.", "Combines iteration with decision-making."], realWorldTool: "In Make: Routers inside Iterator loops. In Zapier: Paths + Looping." },
            trycatch: { title: "TRY / CATCH", emoji: "🛡️", description: "TRY runs steps normally. If something fails, CATCH handles the error.", details: ["TRY: Run the main steps.", "CATCH: If TRY fails, run fallback instead.", "Production automations always have error handling."], realWorldTool: "In Make: 'Error Handler' module. In Zapier: Paths for error checking." },
          };
          return concepts[conceptModal || "linear"];
        })()}
      />
    </div>
  );
};

export default Playground;
