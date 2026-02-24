import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw, CheckCircle2, Trophy, Sparkles, Loader2, Code2, Brain, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickSessionChallenges, type Block, type Challenge } from "@/data/challenges";
import { LANGUAGE_META, type CodeLanguage, getFullCode } from "@/data/puzzle-code-translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { playDing, playError, playWhoosh } from "@/lib/sounds";
import JumpingCharacter from "@/components/puzzle/JumpingCharacter";
import PuzzleTimer from "@/components/puzzle/PuzzleTimer";
import WrongAnswerOverlay from "@/components/puzzle/WrongAnswerOverlay";
import BlockCodeSnippet from "@/components/puzzle/BlockCodeSnippet";

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
  const [sessionChallenges, setSessionChallenges] = useState<Challenge[]>(() => pickSessionChallenges());
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>(sessionChallenges[0].availableBlocks);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<number>>(new Set());
  const [characterState, setCharacterState] = useState<"idle" | "jumping" | "celebrating" | "falling">("idle");
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

  // Struggle tracking per level
  const [levelStats, setLevelStats] = useState<{ attempts: number; time: number }[]>(
    () => sessionChallenges.map(() => ({ attempts: 0, time: 0 }))
  );

  // AI learning tips
  const [learningTips, setLearningTips] = useState<{
    summary: string;
    tips: { emoji: string; title: string; description: string }[];
  } | null>(null);
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
    setCharacterState("idle");
    setShowWrong(false);
    setTimerResetKey((k) => k + 1);
    setTimerRunning(false);
    setAttempts(0);
    setLevelStats(newChallenges.map(() => ({ attempts: 0, time: 0 })));
    setLearningTips(null);
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
      // Validate structure
      for (const c of challenges) {
        if (!c.id || !c.availableBlocks || !c.correctOrder || c.availableBlocks.length === 0) {
          throw new Error("Malformed challenge from AI");
        }
      }
      // Sort AI challenges by difficulty progression
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
    setCharacterState("idle");
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
    setCharacterState("idle");
    setShowWrong(false);
    setTimerResetKey((k) => k + 1);
    setTimerRunning(false);
    setAttempts(0);
  };

  const triggerWrongAnswer = useCallback(() => {
    setAttempts((a) => a + 1);
    const msg = WRONG_MESSAGES[Math.floor(Math.random() * WRONG_MESSAGES.length)];
    setWrongMessage(msg);
    setShowWrong(true);
    playError();
    setCharacterState("falling");
    setWrongShake(true);
    setTimeout(() => {
      setWrongShake(false);
      setCharacterState("idle");
    }, 1000);
  }, []);

  const fetchLearningTips = useCallback(async (allStats: { attempts: number; time: number }[]) => {
    setIsLoadingTips(true);
    let tipsData: typeof learningTips = null;
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
      if (data?.summary && data?.tips) {
        setLearningTips(data);
        tipsData = data;
      }
    } catch (e) {
      console.error("Learning tips failed:", e);
    } finally {
      setIsLoadingTips(false);
    }

    // Save session to history if user is logged in
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
      playDing();
      setShowWrong(false);
      setTimerRunning(false);
      setCharacterState("celebrating");

      // Record stats for this level
      const updatedStats = [...levelStats];
      updatedStats[currentChallenge] = { attempts, time: finalTime };
      setLevelStats(updatedStats);

      const newSolved = new Set([...solvedChallenges, currentChallenge]);
      setSolvedChallenges(newSolved);

      // If all levels done, fetch AI tips
      if (newSolved.size === sessionChallenges.length) {
        fetchLearningTips(updatedStats);
      }
    } else {
      triggerWrongAnswer();
    }
  }, [challenge, currentChallenge, triggerWrongAnswer, levelStats, attempts, finalTime, solvedChallenges, sessionChallenges, fetchLearningTips]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    // Start timer on first interaction
    if (!timerRunning && !solved) {
      setTimerRunning(true);
    }
    setCharacterState("jumping");
    playWhoosh();
    setTimeout(() => {
      if (!solved) setCharacterState("idle");
    }, 500);

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

  const allSolved = solvedChallenges.size === sessionChallenges.length;

  const startNewSession = () => {
    applyNewChallenges(pickSessionChallenges());
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground">AutoFlow Puzzles</h1>
          <Button variant="ghost" size="sm" onClick={() => navigate(user ? "/history" : "/auth")} className="gap-1 text-xs">
            <History className="w-3.5 h-3.5" /> {user ? "History" : "Sign In"}
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAIChallenges}
            disabled={isLoadingAI}
            className="gap-1.5 text-xs"
          >
            {isLoadingAI ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isLoadingAI ? "Generating..." : "AI Puzzles"}
          </Button>
          <PuzzleTimer
            isRunning={timerRunning}
            onTimeUpdate={setFinalTime}
            reset={timerResetKey}
          />
          <div className="flex items-center gap-2">
            {sessionChallenges.map((c, i) => {
              const diffColor =
                c.difficulty === "beginner"
                  ? "border-success"
                  : c.difficulty === "intermediate"
                    ? "border-accent"
                    : "border-destructive";
              return (
                <button
                  key={i}
                  onClick={() => loadChallenge(i)}
                  className={`
                    w-8 h-8 rounded-lg font-display font-bold text-sm transition-all border-2
                    ${diffColor}
                    ${currentChallenge === i
                      ? "bg-primary text-primary-foreground"
                      : solvedChallenges.has(i)
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                  title={`Level ${i + 1} — ${c.difficulty}`}
                >
                  {solvedChallenges.has(i) ? "✓" : i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar: Challenge info */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-border bg-card p-6 flex flex-col gap-4">
          <div>
            <span className={`
              inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider mb-2
              ${challenge.difficulty === "beginner" ? "bg-success/15 text-success" : "bg-accent/30 text-accent-foreground"}
            `}>
              {challenge.difficulty}
            </span>
            <h2 className="font-display text-xl font-bold text-card-foreground">{challenge.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-display font-semibold text-sm text-foreground mb-1">📋 Scenario</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.scenario}</p>
          </div>

          {/* Level concepts info panel */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <h3 className="font-display font-semibold text-xs text-primary mb-1.5 uppercase tracking-wider">
              🧠 Level {currentChallenge + 1} Concepts
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {[
                "Simple linear code — function calls in sequence, no branching.",
                "If/else branching — conditional logic to choose different paths.",
                "Data operations — variables, transformations & validation steps.",
                "Error handling — try/catch blocks, loops & retry logic.",
                "Production-grade — async/await, classes, caching & rate limiting.",
              ][Math.min(currentChallenge, 4)]}
            </p>
            {currentChallenge > 0 && (
              <p className="text-[10px] text-primary/70 mt-1.5 font-display font-semibold">
                ✨ New: {[
                  "",
                  "if/else conditionals",
                  "variables & transform()",
                  "try/except, for loops",
                  "async/await, classes, caching",
                ][Math.min(currentChallenge, 4)]}
              </p>
            )}
          </div>

          {/* Attempt counter */}
          {attempts > 0 && !solved && (
            <div className="bg-destructive/10 rounded-lg px-3 py-2 text-sm text-destructive font-display font-semibold">
              Attempts: {attempts} — Keep trying! 💪
            </div>
          )}

          <div className="flex gap-2 mt-auto">
            <Button variant="outline" size="sm" onClick={() => setShowHint(!showHint)} className="gap-1 flex-1">
              <Lightbulb className="w-4 h-4" /> {showHint ? "Hide Hint" : "Show Hint"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetPuzzle} className="gap-1 flex-1">
              <RotateCcw className="w-4 h-4" /> Reset
            </Button>
          </div>

          {/* Language selector */}
          <div className="border-t border-border pt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5" /> Code View
              </h3>
              <Button
                variant={showCode ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCode(!showCode)}
                className="h-6 px-2 text-[10px]"
              >
                {showCode ? "Hide Code" : "Show Code"}
              </Button>
            </div>
            <div className="flex gap-1">
              {(Object.keys(LANGUAGE_META) as CodeLanguage[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setSelectedLanguage(lang); setShowCode(true); }}
                  className={`
                    flex-1 px-2 py-1.5 rounded-md text-[10px] font-display font-semibold transition-all
                    ${selectedLanguage === lang
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                  `}
                >
                  <span className="block">{LANGUAGE_META[lang].icon}</span>
                  <span className="block mt-0.5">{LANGUAGE_META[lang].label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Full code preview when solved */}
          <AnimatePresence>
            {showCode && solved && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-border pt-2"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-display font-semibold text-muted-foreground uppercase">Full Code</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 px-1.5 text-[10px]"
                    onClick={() => {
                      navigator.clipboard.writeText(getFullCode(placedBlocks, selectedLanguage, currentChallenge + 1));
                      toast.success("Code copied!");
                    }}
                  >
                    📋 Copy
                  </Button>
                </div>
                <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[10px] leading-relaxed rounded-md px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap border border-border/30 max-h-48 overflow-y-auto">
                  {getFullCode(placedBlocks, selectedLanguage, currentChallenge + 1)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-accent/20 rounded-lg p-3 text-sm text-accent-foreground"
              >
                💡 {challenge.hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Main workspace area */}
        <div className="flex-1 flex flex-col lg:flex-row">
          <DragDropContext onDragEnd={onDragEnd}>
            {/* Available blocks - left side */}
            <div className="bg-card border-b lg:border-b-0 lg:border-r border-border p-4 lg:w-72 flex flex-col shrink-0">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Available Blocks — Drag to workspace →
              </h3>
              <Droppable droppableId="available" direction="vertical">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex flex-col gap-3 min-h-[56px]"
                  >
                    {availableBlocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`
                              ${blockColorMap[block.type]}
                              rounded-lg px-4 py-2.5 text-primary-foreground font-display font-semibold text-sm
                              select-none cursor-grab active:cursor-grabbing transition-shadow
                              ${snapshot.isDragging ? "shadow-2xl scale-105" : "shadow-md hover:shadow-lg"}
                            `}
                          >
                            <span className="mr-1.5">{block.icon}</span>
                            {block.label}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    {availableBlocks.length === 0 && (
                      <div className="text-sm text-muted-foreground italic">All blocks placed!</div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>

            {/* Drop workspace - right side */}
            <div className="flex-1 bg-workspace workspace-grid p-6 relative overflow-auto">
              {/* AI loading overlay */}
              {isLoadingAI && (
                <div className="absolute inset-0 flex items-center justify-center bg-workspace/80 backdrop-blur-sm z-20">
                  <div className="bg-card rounded-2xl p-8 text-center shadow-2xl border border-border">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
                    <p className="font-display font-bold text-card-foreground">Generating AI Puzzles...</p>
                    <p className="text-xs text-muted-foreground mt-1">Creating unique scenarios just for you</p>
                  </div>
                </div>
              )}

              {/* Wrong answer overlay */}
              <WrongAnswerOverlay
                show={showWrong}
                message={wrongMessage}
                onDismiss={() => setShowWrong(false)}
              />


              <Droppable droppableId="workspace">
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    animate={wrongShake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`
                      min-h-[300px] max-w-md ml-auto rounded-xl border-2 border-dashed p-4 transition-colors mb-4
                      ${snapshot.isDraggingOver
                        ? "border-primary/50 bg-primary/5"
                        : solved
                          ? "border-success/50 bg-success/5"
                          : wrongShake
                            ? "border-destructive/50 bg-destructive/5"
                            : "border-workspace-foreground/20"
                      }
                    `}
                  >
                    {placedBlocks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="flex items-center justify-center h-[280px] text-workspace-foreground/30 font-display text-center">
                        Drop blocks here in the right order<br />to build your automation flow
                      </div>
                    )}

                    {placedBlocks.map((block, index) => (
                      <Draggable key={block.id} draggableId={block.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <motion.div
                              layout
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`
                                ${blockColorMap[block.type]}
                                rounded-lg px-5 py-3 text-primary-foreground font-display font-semibold text-sm
                                select-none cursor-grab active:cursor-grabbing mb-2 transition-shadow
                                ${snapshot.isDragging ? "shadow-2xl" : "shadow-md"}
                                ${solved ? "ring-2 ring-success/40" : ""}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{block.icon}</span>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                                    {block.type}
                                  </div>
                                  <div>{block.label}</div>
                                </div>
                                {solved && (
                                  <CheckCircle2 className="w-4 h-4 ml-auto opacity-80" />
                                )}
                              </div>
                            </motion.div>
                            <BlockCodeSnippet
                              block={block}
                              language={selectedLanguage}
                              index={index}
                              show={showCode}
                              level={currentChallenge + 1}
                            />
                            {index < placedBlocks.length - 1 && (
                              <div className="flex justify-center my-1">
                                <div className="w-0.5 h-4 bg-workspace-foreground/20 rounded" />
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </motion.div>
                )}
              </Droppable>

              {/* Success overlay */}
              <AnimatePresence>
                {showSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-workspace/80 backdrop-blur-sm z-10"
                  >
                    <div className="bg-card rounded-2xl p-8 max-w-md text-center shadow-2xl border border-border overflow-y-auto max-h-[90vh]">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
                      </motion.div>
                      <h3 className="font-display text-xl font-bold text-card-foreground mb-2">
                        Puzzle Solved!
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        {challenge.successMessage}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4 font-mono">
                        <span>⏱ {Math.floor(finalTime / 60)}:{String(finalTime % 60).padStart(2, "0")}</span>
                        <span>🔄 {attempts} wrong {attempts === 1 ? "attempt" : "attempts"}</span>
                      </div>

                      {/* AI Learning Tips */}
                      {allSolved && (isLoadingTips || learningTips) && (
                        <div className="mb-4 text-left">
                          {isLoadingTips ? (
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
                              <Loader2 className="w-5 h-5 animate-spin text-primary shrink-0" />
                              <p className="text-sm text-muted-foreground">Analyzing your performance…</p>
                            </div>
                          ) : learningTips && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-4 h-4 text-primary" />
                                <h4 className="font-display font-bold text-sm text-card-foreground">Your Learning Path</h4>
                              </div>
                              <p className="text-xs text-muted-foreground mb-3">{learningTips.summary}</p>
                              <div className="space-y-2">
                                {learningTips.tips.map((tip, i) => (
                                  <div key={i} className="bg-card rounded-lg p-2.5 border border-border/50 flex gap-2">
                                    <span className="text-lg shrink-0">{tip.emoji}</span>
                                    <div>
                                      <p className="text-xs font-display font-bold text-card-foreground">{tip.title}</p>
                                      <p className="text-[10px] text-muted-foreground leading-relaxed">{tip.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setShowSuccess(false)}
                          className="flex-1"
                        >
                          Review
                        </Button>
                        {currentChallenge < sessionChallenges.length - 1 ? (
                          <Button
                            onClick={() => loadChallenge(currentChallenge + 1)}
                            className="flex-1 bg-primary text-primary-foreground gap-1"
                          >
                            Next Puzzle <ArrowRight className="w-4 h-4" />
                          </Button>
                        ) : (
                          <div className="flex flex-1 gap-2">
                            <Button
                              onClick={startNewSession}
                              variant="outline"
                              className="flex-1 gap-1"
                            >
                              🔀 Random
                            </Button>
                            <Button
                              onClick={() => { setShowSuccess(false); fetchAIChallenges(); }}
                              disabled={isLoadingAI}
                              className="flex-1 bg-success text-success-foreground gap-1"
                            >
                              {isLoadingAI ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                              AI Puzzles
                            </Button>
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
    </div>
  );
};

export default Playground;
