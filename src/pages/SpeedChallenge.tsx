import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Flame, Zap, CheckCircle2, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { pickSessionChallenges, type Block, type Challenge, getBlockIndent } from "@/data/challenges";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { playDing, playError, playWhoosh, playCelebration } from "@/lib/sounds";
import confetti from "canvas-confetti";

const blockColorMap: Record<string, string> = {
  trigger: "bg-block-trigger",
  action: "bg-block-action",
  condition: "bg-block-condition",
  data: "bg-block-data",
  output: "bg-block-output",
};

type Phase = "countdown" | "playing" | "finished";

interface LeaderboardEntry {
  id: string;
  display_name: string;
  total_time_sec: number;
  completed_at: string;
}

const SpeedChallenge = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>("countdown");
  const [countdownNum, setCountdownNum] = useState(3);
  const [challenges] = useState<Challenge[]>(() => pickSessionChallenges());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [availableBlocks, setAvailableBlocks] = useState<Block[]>([]);
  const [placedBlocks, setPlacedBlocks] = useState<Block[]>([]);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [wrongShake, setWrongShake] = useState(false);
  const [solved, setSolved] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    supabase
      .from("speed_leaderboard")
      .select("*")
      .order("total_time_sec", { ascending: true })
      .limit(20)
      .then(({ data }) => { if (data) setLeaderboard(data); });
  }, [submitted]);

  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdownNum <= 0) {
      setPhase("playing");
      setAvailableBlocks([...challenges[0].availableBlocks]);
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSec(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
      return;
    }
    const t = setTimeout(() => setCountdownNum((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, countdownNum, challenges]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const challenge = challenges[currentIdx];

  const advanceOrFinish = useCallback(() => {
    playDing();
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.65 }, colors: ["#FFD700", "#4ECDC4"] });
    if (currentIdx < challenges.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setAvailableBlocks([...challenges[nextIdx].availableBlocks]);
      setPlacedBlocks([]);
      setSolved(false);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSec(finalTime);
      setPhase("finished");
      playCelebration();
      confetti({ particleCount: 100, spread: 100, origin: { y: 0.5 }, colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#96E6A1"] });
    }
  }, [currentIdx, challenges]);

  const checkSolution = useCallback((placed: Block[]) => {
    const correct = challenge.correctOrder;
    if (placed.length !== correct.length) return;
    if (placed.every((b, i) => b.id === correct[i])) {
      setSolved(true);
      setTimeout(() => advanceOrFinish(), 400);
    } else {
      playError();
      setWrongShake(true);
      setTimeout(() => setWrongShake(false), 600);
    }
  }, [challenge, advanceOrFinish]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || phase !== "playing" || solved) return;
    const { source, destination } = result;
    playWhoosh();

    if (source.droppableId === "available" && destination.droppableId === "workspace") {
      const block = availableBlocks[source.index];
      const newAvail = [...availableBlocks];
      newAvail.splice(source.index, 1);
      const newPlaced = [...placedBlocks];
      newPlaced.splice(destination.index, 0, block);
      setAvailableBlocks(newAvail);
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
      const newAvail = [...availableBlocks];
      newAvail.splice(destination.index, 0, block);
      setPlacedBlocks(newPlaced);
      setAvailableBlocks(newAvail);
    }
  };

  const submitScore = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase.from("speed_leaderboard").insert({
      user_id: user.id,
      display_name: displayName.trim(),
      total_time_sec: elapsedSec,
    });
    if (error) {
      toast.error("Failed to submit score");
    } else {
      toast.success("Score submitted! 🏆");
      setSubmitted(true);
    }
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (phase === "countdown") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Speed Challenge</h1>
          <p className="text-sm text-muted-foreground mb-8">Solve all 5 puzzles as fast as you can!</p>
          <motion.div
            key={countdownNum}
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-7xl font-display font-bold text-primary"
          >
            {countdownNum}
          </motion.div>
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
          <Button variant="ghost" size="sm" onClick={() => navigate("/play")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Puzzles
          </Button>
          <h1 className="font-display font-bold text-foreground text-sm">Speed Challenge</h1>
        </header>
        <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-4xl mx-auto w-full">
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <Trophy className="w-16 h-16 text-accent mb-4" />
            <h2 className="font-display text-2xl font-bold text-foreground mb-1">Challenge Complete!</h2>
            <div className="text-4xl font-display font-bold text-primary mb-4">{formatTime(elapsedSec)}</div>
            {user && !submitted ? (
              <div className="w-full max-w-xs space-y-3">
                <input
                  type="text"
                  placeholder="Your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={20}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-display focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button onClick={submitScore} disabled={!displayName.trim()} className="w-full bg-primary text-primary-foreground">
                  Submit to Leaderboard
                </Button>
              </div>
            ) : !user ? (
              <p className="text-xs text-muted-foreground">
                <button onClick={() => navigate("/auth")} className="text-primary underline">Sign in</button> to submit your score
              </p>
            ) : (
              <p className="text-sm text-success font-display font-semibold">✓ Score submitted!</p>
            )}
            <div className="flex gap-2 mt-6">
              <Button variant="outline" size="sm" onClick={() => navigate("/play")}>Back to Puzzles</Button>
              <Button size="sm" onClick={() => window.location.reload()} className="bg-accent text-accent-foreground gap-1">
                <Flame className="w-3.5 h-3.5" /> Try Again
              </Button>
            </div>
          </div>
          <div className="flex-1 max-w-sm">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Medal className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-foreground text-sm">Leaderboard</h3>
              </div>
              {leaderboard.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No scores yet — be the first!</p>
              ) : (
                <div className="space-y-1.5">
                  {leaderboard.map((entry, i) => (
                    <div key={entry.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
                      i === 0 ? "bg-accent/15 text-accent-foreground font-bold" :
                      i === 1 ? "bg-muted/80 font-semibold" :
                      i === 2 ? "bg-muted/50 font-semibold" : "text-muted-foreground"}`}>
                      <span className="w-5 text-center font-display font-bold">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                      </span>
                      <span className="flex-1 truncate font-display">{entry.display_name}</span>
                      <span className="font-mono font-bold">{formatTime(entry.total_time_sec)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Playing phase — single DragDropContext wrapping both panels
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/play")} className="gap-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Zap className="w-4 h-4 text-accent" />
          <h1 className="font-display font-bold text-foreground text-sm">Speed Challenge</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-destructive/15 text-destructive px-3 py-1 rounded-full font-mono font-bold text-sm">
            ⏱ {formatTime(elapsedSec)}
          </div>
          <div className="flex items-center gap-1">
            {challenges.map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-md font-display font-bold text-[10px] flex items-center justify-center
                ${i < currentIdx ? "bg-success text-success-foreground" :
                  i === currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < currentIdx ? "✓" : i + 1}
              </div>
            ))}
          </div>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Sidebar: info + available blocks */}
          <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-card p-4">
            <h2 className="font-display text-sm font-bold text-card-foreground mb-1">{challenge.title}</h2>
            <p className="text-[10px] text-muted-foreground mb-3">{challenge.scenario}</p>
            <Droppable droppableId="available" direction="vertical">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-col gap-2">
                  {availableBlocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps}
                          className={`${blockColorMap[block.type]} rounded-lg px-3 py-2 text-primary-foreground font-display font-semibold text-xs
                            select-none cursor-grab active:cursor-grabbing transition-shadow
                            ${snap.isDragging ? "shadow-2xl scale-105" : "shadow-md hover:shadow-lg"}`}>
                          <span className="mr-1.5">{block.icon}</span>{block.label}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {availableBlocks.length === 0 && (
                    <div className="text-xs text-muted-foreground italic">All placed!</div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* Workspace */}
          <div className="flex-1 bg-workspace workspace-grid p-6">
            <Droppable droppableId="workspace">
              {(provided, snapshot) => (
                <motion.div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  animate={wrongShake ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`min-h-[180px] lg:min-h-[300px] max-w-md mx-auto rounded-xl border-2 border-dashed p-4 transition-colors
                    ${snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" :
                      solved ? "border-success/50 bg-success/5" : "border-workspace-foreground/20"}`}
                >
                  {placedBlocks.length === 0 && !snapshot.isDraggingOver && (
                    <div className="flex items-center justify-center h-[140px] lg:h-[280px] text-workspace-foreground/30 font-display text-center text-sm">
                      Drop blocks here — fast! ⚡
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
                        {(prov, snap) => (
                          <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} style={{ ...prov.draggableProps.style, marginLeft: `${indent * 24}px` }}>
                            <motion.div layout initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className={`
                              ${isStructural ? (isOpener ? "bg-primary/20 border-2 border-primary/40 text-primary" : isCloser ? "bg-muted border-2 border-border text-muted-foreground" : isBranch ? "bg-accent/20 border-2 border-accent/40 text-accent-foreground" : blockColorMap[block.type] + " text-primary-foreground") : blockColorMap[block.type] + " text-primary-foreground"}
                              rounded-lg px-4 py-2.5 font-display font-semibold text-xs select-none cursor-grab mb-2
                              ${snap.isDragging ? "shadow-2xl" : "shadow-md"} ${solved ? "ring-2 ring-success/40" : ""}`}>
                              <div className="flex items-center gap-2">
                                <span>{block.icon}</span>
                                <div>
                                  <div className="text-[9px] uppercase tracking-wider opacity-70">{isStructural ? (block.structure ?? block.type) : block.type}</div>
                                  <div>{block.label}</div>
                                </div>
                                {solved && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-80" />}
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </Draggable>
                    );
                  })}
                  {provided.placeholder}
                </motion.div>
              )}
            </Droppable>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default SpeedChallenge;
