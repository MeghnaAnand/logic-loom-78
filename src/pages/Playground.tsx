import { useState, useCallback, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Lightbulb, RotateCcw, CheckCircle2, Trophy, Sparkles, Loader2, Code2, Brain, History, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickSessionChallenges, type Block, type Challenge, getBlockIndent } from "@/data/challenges";
import { LANGUAGE_META, type CodeLanguage, getFullCode } from "@/data/puzzle-code-translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { playDing, playError, playWhoosh, playCelebration } from "@/lib/sounds";
import confetti from "canvas-confetti";
import { updateUserSkills } from "@/lib/updateSkills";
import JumpingCharacter from "@/components/puzzle/JumpingCharacter";
import PuzzleTimer from "@/components/puzzle/PuzzleTimer";
import WrongAnswerOverlay from "@/components/puzzle/WrongAnswerOverlay";
import BlockCodeSnippet from "@/components/puzzle/BlockCodeSnippet";
import MicroLessonCard from "@/components/puzzle/MicroLessonCard";
import PostPuzzleBreakdown from "@/components/puzzle/PostPuzzleBreakdown";
import ConceptModal from "@/components/puzzle/ConceptModal";
import { getChallengeLesson, getBreakdownSteps } from "@/data/micro-lessons";

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
  const [isFirstPuzzleSolve, setIsFirstPuzzleSolve] = useState(false);
  const hasEverSolved = useRef(false);
  const [showMicroLesson, setShowMicroLesson] = useState(true); // show before first puzzle
  const [conceptModal, setConceptModal] = useState<string | null>(null);

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
    setShowMicroLesson(true);
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
    if (!solvedChallenges.has(index)) {
      setShowMicroLesson(true);
    }
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
      setShowWrong(false);
      setTimerRunning(false);
      setCharacterState("celebrating");

      // First puzzle ever solved — big celebration!
      const isFirst = !hasEverSolved.current;
      if (isFirst) {
        hasEverSolved.current = true;
        setIsFirstPuzzleSolve(true);
        playCelebration();
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'],
        });
        setTimeout(() => {
          confetti({ particleCount: 80, spread: 100, origin: { y: 0.5, x: 0.3 } });
          confetti({ particleCount: 80, spread: 100, origin: { y: 0.5, x: 0.7 } });
        }, 300);
      } else {
        setIsFirstPuzzleSolve(false);
        playDing();
        // Subtle confetti for subsequent solves
        confetti({
          particleCount: 40,
          spread: 55,
          origin: { y: 0.65 },
          colors: ['#FFD700', '#4ECDC4', '#96E6A1'],
          gravity: 1.2,
        });
      }

      // Record stats for this level
      const updatedStats = [...levelStats];
      updatedStats[currentChallenge] = { attempts, time: finalTime };
      setLevelStats(updatedStats);

      // Update skill map
      if (user) {
        const blockTypes = challenge.availableBlocks
          .filter((b) => challenge.correctOrder.includes(b.id))
          .map((b) => b.type);
        updateUserSkills(user.id, blockTypes, challenge.difficulty, attempts).catch(console.error);
      }

      const newSolved = new Set([...solvedChallenges, currentChallenge]);
      setSolvedChallenges(newSolved);

      // If all levels done — MASSIVE FINALE
      if (newSolved.size === sessionChallenges.length) {
        fetchLearningTips(updatedStats);
        playCelebration();
        // Rapid-fire confetti barrage
        const duration = 2000;
        const end = Date.now() + duration;
        const interval = setInterval(() => {
          if (Date.now() > end) { clearInterval(interval); return; }
          confetti({
            particleCount: 30,
            spread: 120,
            startVelocity: 35,
            origin: { x: Math.random(), y: Math.random() * 0.4 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1', '#FF69B4', '#FFA500'],
          });
        }, 100);
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
          <h1 className="font-display font-bold text-foreground">AutomationMind Puzzles</h1>
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
                  title={`Tier ${c.tier} — ${c.difficulty}`}
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
              ${challenge.difficulty === "beginner" ? "bg-success/15 text-success" : 
                challenge.difficulty === "intermediate" ? "bg-accent/30 text-accent-foreground" :
                "bg-destructive/15 text-destructive"}
            `}>
              {challenge.difficulty} — Tier {challenge.tier}
            </span>
            <h2 className="font-display text-xl font-bold text-card-foreground">{challenge.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
          </div>

          <div className="bg-muted rounded-lg p-4">
            <h3 className="font-display font-semibold text-sm text-foreground mb-1">📋 Scenario</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{challenge.scenario}</p>
          </div>

          {/* Level concepts as clickable buttons */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <h3 className="font-display font-semibold text-xs text-primary mb-2 uppercase tracking-wider">
              🧠 Tier {challenge.tier} Concepts
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {(() => {
                const tierConcepts: { key: string; label: string; emoji: string }[] = [
                  [{ key: "linear", label: "Linear Flow", emoji: "➡️" }],
                  [{ key: "linear", label: "Linear Flow", emoji: "➡️" }, { key: "ifelse", label: "IF / ELSE", emoji: "🔀" }],
                  [{ key: "linear", label: "Linear Flow", emoji: "➡️" }, { key: "ifelse", label: "IF / ELSE", emoji: "🔀" }, { key: "foreach", label: "FOR EACH", emoji: "🔁" }],
                  [{ key: "linear", label: "Linear Flow", emoji: "➡️" }, { key: "ifelse", label: "IF / ELSE", emoji: "🔀" }, { key: "foreach", label: "FOR EACH", emoji: "🔁" }, { key: "nested", label: "Nested Logic", emoji: "🧩" }],
                  [{ key: "linear", label: "Linear Flow", emoji: "➡️" }, { key: "ifelse", label: "IF / ELSE", emoji: "🔀" }, { key: "foreach", label: "FOR EACH", emoji: "🔁" }, { key: "nested", label: "Nested Logic", emoji: "🧩" }, { key: "trycatch", label: "TRY / CATCH", emoji: "🛡️" }],
                ][Math.min(challenge.tier - 1, 4)];
                return tierConcepts.map(c => (
                  <button
                    key={c.key}
                    onClick={() => setConceptModal(c.key)}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-xs font-display font-semibold text-primary transition-colors cursor-pointer"
                  >
                    {c.emoji} {c.label}
                  </button>
                ));
              })()}
            </div>
            {challenge.newConcept && (
              <p className="text-[10px] text-primary/70 mt-2 font-display font-semibold">
                ✨ New concept: {challenge.newConcept}
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
            <div className="bg-card border-b lg:border-b-0 lg:border-r border-border lg:w-72 flex flex-col shrink-0">
              <button
                onClick={() => setBlockLibraryOpen(!blockLibraryOpen)}
                className="lg:hidden flex items-center justify-between p-4 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Available Blocks ({availableBlocks.length})
                {blockLibraryOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <div className={`${isMobile && !blockLibraryOpen ? "hidden" : ""} p-4 pt-0 lg:pt-4 flex flex-col`}>
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 hidden lg:block">
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

              {/* Code View - integrated in block library */}
              <div className="border-t border-border mt-4 pt-3">
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
                    {showCode ? "Hide" : "Show"}
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
                {showCode && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-border pt-2 mt-2"
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
                    <pre className="bg-workspace text-workspace-foreground text-[10px] leading-relaxed rounded-md px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap border border-border/30 max-h-48 overflow-y-auto">
                      {getFullCode(placedBlocks, selectedLanguage, currentChallenge + 1)}
                    </pre>
                  </motion.div>
                )}
              </AnimatePresence>
              </div>
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
                            style={{
                              ...provided.draggableProps.style,
                              marginLeft: `${indent * 24}px`,
                            }}
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
                                rounded-lg px-5 py-3 font-display font-semibold text-sm
                                select-none cursor-grab active:cursor-grabbing mb-2 transition-shadow
                                ${snapshot.isDragging ? "shadow-2xl" : "shadow-md"}
                                ${solved ? "ring-2 ring-success/40" : ""}
                              `}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{block.icon}</span>
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider opacity-70">
                                    {isStructural ? (block.structure ?? block.type) : block.type}
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
                              <div className="flex my-1" style={{ marginLeft: `${Math.min(indent, getBlockIndent(placedBlocks, index + 1)) * 24}px` }}>
                                <div className={`w-0.5 h-4 rounded ${
                                  isOpener || isBranch ? "bg-primary/30" : "bg-workspace-foreground/20"
                                }`} style={{ marginLeft: "20px" }} />
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

              {/* Pre-puzzle micro-lesson */}
              <AnimatePresence>
                {showMicroLesson && !solved && (() => {
                  const blockTypes = challenge.availableBlocks.map(b => b.type);
                  const { primaryConcept, secondaryConcepts } = getChallengeLesson(blockTypes);
                  return (
                    <MicroLessonCard
                      lessonNumber={currentChallenge + 1}
                      totalLessons={sessionChallenges.length}
                      primaryConcept={primaryConcept}
                      secondaryConcepts={secondaryConcepts}
                      challengeTitle={challenge.title}
                      onReady={() => setShowMicroLesson(false)}
                    />
                  );
                })()}
              </AnimatePresence>

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
                        {isFirstPuzzleSolve ? "🎉 You just built your first automation!" : "Puzzle Solved!"}
                      </h3>
                      {isFirstPuzzleSolve && (
                        <motion.p
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="text-sm font-display font-semibold text-primary mb-2"
                        >
                          You're thinking like an automator already. Keep going! 🚀
                        </motion.p>
                      )}
                      <p className="text-sm text-muted-foreground mb-2">
                        {challenge.successMessage}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground mb-4 font-mono">
                        <span>⏱ {Math.floor(finalTime / 60)}:{String(finalTime % 60).padStart(2, "0")}</span>
                        <span>🔄 {attempts} wrong {attempts === 1 ? "attempt" : "attempts"}</span>
                      </div>

                      {/* Post-puzzle breakdown */}
                      <PostPuzzleBreakdown
                        steps={getBreakdownSteps(
                          challenge.correctOrder.map(id =>
                            challenge.availableBlocks.find(b => b.id === id)!
                          )
                        )}
                      />

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
                          <div className="flex flex-col flex-1 gap-2">
                            {/* Social Sharing */}
                            <div className="flex gap-2 mb-1">
                              {(() => {
                                const shareText = `🧩 I just completed all 5 AutomationMind puzzles! Think you can beat my time? Try it out!`;
                                const shareUrl = "https://logic-loom-78.lovable.app";
                                return (
                                  <>
                                    <a
                                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1"
                                    >
                                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                                        𝕏 Post
                                      </Button>
                                    </a>
                                    <a
                                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1"
                                    >
                                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                                        💼 LinkedIn
                                      </Button>
                                    </a>
                                    <a
                                      href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1"
                                    >
                                      <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                                        💬 WhatsApp
                                      </Button>
                                    </a>
                                  </>
                                );
                              })()}
                            </div>
                            <Button
                              onClick={() => navigate("/history")}
                              className="w-full bg-accent text-accent-foreground gap-1 font-display"
                            >
                              📊 View Progress <ArrowRight className="w-4 h-4" />
                            </Button>
                            <div className="flex gap-2">
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
            ifelse: { title: "IF / ELSE Branching", emoji: "🔀", description: "IF / ELSE lets your automation make decisions based on conditions.", details: ["IF true → run one set of actions.", "ELSE → run different actions.", "Example: IF order > $500 → manager approval. ELSE → auto-approve.", "You can nest multiple IF/ELSE for complex decision trees."], realWorldTool: "In Zapier: 'Filter' or 'Paths'. In Make: 'Router' with conditions." },
            foreach: { title: "FOR EACH Loop", emoji: "🔁", description: "FOR EACH processes a list of items one at a time — iteration.", details: ["Takes a collection and runs the same steps for each item.", "Example: FOR EACH spreadsheet row → send personalized email.", "Repeats until every item is processed.", "Handle 1,000 tasks with zero extra effort."], realWorldTool: "In Zapier: 'Looping by Zapier'. In Make: scenarios naturally iterate over arrays." },
            nested: { title: "Nested Logic", emoji: "🧩", description: "Conditions or loops inside other conditions or loops — multi-layered logic.", details: ["FOR EACH order → IF amount > $500 → manager, ELSE → auto-approve.", "Combines iteration with decision-making.", "This is how real-world automations handle complex business rules."], realWorldTool: "In Make: Routers inside Iterator loops. In Zapier: Paths + Looping actions." },
            trycatch: { title: "TRY / CATCH Error Handling", emoji: "🛡️", description: "TRY runs steps normally. If something fails, CATCH runs a fallback.", details: ["TRY: Run the main steps.", "CATCH: If TRY fails, run fallback steps instead.", "Example: TRY save to DB → CATCH: log error + send alert.", "Production-grade automations always have error handling."], realWorldTool: "In Make: 'Error Handler' module. In Zapier: Paths for error checking or Code steps." },
          };
          return concepts[conceptModal || "linear"];
        })()}
      />
    </div>
  );
};

export default Playground;
