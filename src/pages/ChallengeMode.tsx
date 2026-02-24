import { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, CheckCircle2, XCircle, Lightbulb, Trophy, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { playDing, playError } from "@/lib/sounds";

interface Question {
  id: string;
  scenario: string;
  correctAnswer: string;
  acceptableAnswers: string[];
  explanation: string;
  hint: string;
}

interface GradeResult {
  isCorrect: boolean;
  feedback: string;
  score: number;
}

const LEVEL_META = [
  { label: "Beginner", description: "Simple trigger-action pairs", color: "text-success", borderColor: "border-success" },
  { label: "Intermediate", description: "Multi-step workflows with conditions", color: "text-accent", borderColor: "border-accent" },
  { label: "Advanced", description: "Error handling, data transforms & branching", color: "text-destructive", borderColor: "border-destructive" },
];

const ChallengeMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const puzzleContext = searchParams.get("context") || "";

  const [currentLevel, setCurrentLevel] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [levelScores, setLevelScores] = useState<number[]>([]);
  const [questionScores, setQuestionScores] = useState<number[]>([]);
  const [allComplete, setAllComplete] = useState(false);

  const fetchQuestions = useCallback(async (level: number) => {
    setIsLoadingQuestions(true);
    setQuestions([]);
    setCurrentQ(0);
    setUserAnswer("");
    setGradeResult(null);
    setShowHint(false);
    setQuestionScores([]);
    try {
      const { data, error } = await supabase.functions.invoke("generate-questions", {
        body: { level: level + 1, puzzleContext },
      });
      if (error) throw error;
      if (!data?.questions || data.questions.length < 3) throw new Error("Invalid response");
      setQuestions(data.questions);
    } catch (e) {
      console.error("Failed to generate questions:", e);
      toast.error("Failed to generate questions. Try again!");
    } finally {
      setIsLoadingQuestions(false);
    }
  }, [puzzleContext]);

  const startLevel = (level: number) => {
    setCurrentLevel(level);
    fetchQuestions(level);
  };

  const submitAnswer = async () => {
    if (!userAnswer.trim() || !questions[currentQ]) return;
    setIsGrading(true);
    try {
      const q = questions[currentQ];
      const { data, error } = await supabase.functions.invoke("grade-answer", {
        body: {
          scenario: q.scenario,
          correctAnswer: q.correctAnswer,
          acceptableAnswers: q.acceptableAnswers,
          userAnswer: userAnswer.trim(),
        },
      });
      if (error) throw error;
      setGradeResult(data);
      setQuestionScores((prev) => [...prev, data.score]);
      if (data.isCorrect) {
        playDing();
      } else {
        playError();
      }
    } catch (e) {
      console.error("Grading failed:", e);
      toast.error("Grading failed. Try again!");
    } finally {
      setIsGrading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setUserAnswer("");
      setGradeResult(null);
      setShowHint(false);
    } else {
      // Level complete
      const levelScore = questionScores.reduce((a, b) => a + b, 0) / questionScores.length;
      const newLevelScores = [...levelScores, levelScore];
      setLevelScores(newLevelScores);

      if (currentLevel < 2) {
        // Next level
        if (levelScore >= 0.5) {
          toast.success(`Level ${currentLevel + 1} complete! Moving to next level.`);
          startLevel(currentLevel + 1);
        } else {
          toast.error("You need at least 50% to advance. Try this level again!");
          fetchQuestions(currentLevel);
        }
      } else {
        // All done
        setAllComplete(true);
        playDing();
      }
    }
  };

  const q = questions[currentQ];
  const totalScore = allComplete ? levelScores.reduce((a, b) => a + b, 0) / levelScores.length : 0;

  // Initial state — no questions loaded yet
  if (questions.length === 0 && !isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
          <Button variant="ghost" size="sm" onClick={() => navigate("/play")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Puzzles
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground">Challenge Mode</h1>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg text-center"
          >
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Automation Challenge
            </h2>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Test your automation knowledge with fill-in-the-blank challenges. 
              Complete 3 questions per level across 3 difficulty levels to prove your skills!
            </p>

            <div className="grid gap-3 mb-8">
              {LEVEL_META.map((meta, i) => (
                <div
                  key={i}
                  className={`border-2 ${meta.borderColor} rounded-xl p-4 flex items-center gap-4 text-left`}
                >
                  <div className={`font-display font-bold text-2xl ${meta.color} w-10`}>
                    {i + 1}
                  </div>
                  <div>
                    <div className={`font-display font-bold ${meta.color}`}>{meta.label}</div>
                    <div className="text-xs text-muted-foreground">{meta.description}</div>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">3 questions</div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              onClick={() => startLevel(0)}
              className="bg-primary text-primary-foreground gap-2 font-display px-8"
            >
              Start Level 1 <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  // All complete
  if (allComplete) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border px-4 py-3 flex items-center gap-3 bg-card">
          <Button variant="ghost" size="sm" onClick={() => navigate("/play")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Puzzles
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground">Challenge Complete!</h1>
        </header>

        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md text-center"
          >
            <Trophy className="w-20 h-20 text-accent mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              🎉 All Challenges Completed!
            </h2>
            <p className="text-muted-foreground mb-6">
              You've proven your automation knowledge across all 3 difficulty levels.
            </p>

            <div className="bg-card border border-border rounded-xl p-6 mb-6">
              <div className="text-4xl font-display font-bold text-primary mb-1">
                {Math.round(totalScore * 100)}%
              </div>
              <div className="text-sm text-muted-foreground mb-4">Overall Score</div>
              <div className="flex gap-3">
                {levelScores.map((score, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-lg p-3 border ${LEVEL_META[i].borderColor} bg-card`}
                  >
                    <div className={`font-display font-bold text-sm ${LEVEL_META[i].color}`}>
                      Level {i + 1}
                    </div>
                    <div className="text-lg font-display font-bold text-card-foreground">
                      {Math.round(score * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/play")} className="flex-1">
                Back to Puzzles
              </Button>
              <Button
                onClick={() => {
                  setAllComplete(false);
                  setLevelScores([]);
                  startLevel(0);
                }}
                className="flex-1 bg-primary text-primary-foreground gap-1"
              >
                <Sparkles className="w-4 h-4" /> Play Again
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const meta = LEVEL_META[currentLevel];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/play")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Back
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground">Challenge Mode</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Level indicators */}
          {LEVEL_META.map((m, i) => (
            <div
              key={i}
              className={`
                w-8 h-8 rounded-lg font-display font-bold text-sm flex items-center justify-center border-2
                ${m.borderColor}
                ${i < currentLevel
                  ? "bg-success text-success-foreground"
                  : i === currentLevel
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {i < currentLevel ? "✓" : i + 1}
            </div>
          ))}
          <div className="h-5 w-px bg-border mx-1" />
          <span className="text-xs text-muted-foreground font-mono">
            Q{currentQ + 1}/3
          </span>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        {isLoadingQuestions ? (
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-3" />
            <p className="font-display font-bold text-card-foreground">Generating questions...</p>
            <p className="text-xs text-muted-foreground mt-1">
              Creating {meta.label.toLowerCase()} challenges for you
            </p>
          </div>
        ) : q ? (
          <motion.div
            key={`${currentLevel}-${currentQ}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-xl w-full"
          >
            {/* Level badge */}
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider mb-4 border ${meta.borderColor} ${meta.color}`}>
              Level {currentLevel + 1} — {meta.label}
            </div>

            {/* Question card */}
            <div className="bg-card border border-border rounded-2xl p-8 shadow-lg mb-4">
              <div className="text-xs text-muted-foreground font-display font-semibold uppercase tracking-wider mb-3">
                Question {currentQ + 1} of 3
              </div>

              {/* Scenario with blank */}
              <p className="text-lg text-card-foreground leading-relaxed mb-6 font-display">
                {q.scenario.split("___").map((part, i, arr) =>
                  i < arr.length - 1 ? (
                    <span key={i}>
                      {part}
                      <span className="inline-block min-w-[120px] border-b-2 border-primary mx-1 text-primary font-bold">
                        {gradeResult ? (
                          <span className={gradeResult.isCorrect ? "text-success" : "text-destructive"}>
                            {userAnswer}
                          </span>
                        ) : (
                          " ___ "
                        )}
                      </span>
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </p>

              {/* Answer input */}
              {!gradeResult ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your answer..."
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
                    disabled={isGrading}
                    className="flex-1 font-display"
                    autoFocus
                  />
                  <Button
                    onClick={submitAnswer}
                    disabled={!userAnswer.trim() || isGrading}
                    className="gap-1"
                  >
                    {isGrading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Submit
                  </Button>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {/* Grade result */}
                    <div
                      className={`rounded-xl p-4 mb-3 flex items-start gap-3 ${
                        gradeResult.isCorrect
                          ? "bg-success/10 border border-success/30"
                          : "bg-destructive/10 border border-destructive/30"
                      }`}
                    >
                      {gradeResult.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-display font-bold text-sm ${
                          gradeResult.isCorrect ? "text-success" : "text-destructive"
                        }`}>
                          {gradeResult.isCorrect ? "Correct!" : "Not quite right"}
                          {gradeResult.score === 0.5 && " (Partially correct)"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{gradeResult.feedback}</p>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-muted rounded-lg p-3 mb-4">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-display font-semibold text-card-foreground">Correct answer: </span>
                        {q.correctAnswer}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                    </div>

                    <Button onClick={nextQuestion} className="w-full gap-1">
                      {currentQ < questions.length - 1 ? (
                        <>Next Question <ArrowRight className="w-4 h-4" /></>
                      ) : currentLevel < 2 ? (
                        <>Complete Level <ArrowRight className="w-4 h-4" /></>
                      ) : (
                        <>Finish Challenge <Trophy className="w-4 h-4" /></>
                      )}
                    </Button>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Hint toggle */}
            {!gradeResult && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(!showHint)}
                  className="gap-1 text-xs text-muted-foreground"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  {showHint ? "Hide Hint" : "Need a hint?"}
                </Button>
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-accent/20 rounded-lg p-3 mt-2 text-sm text-accent-foreground"
                    >
                      💡 {q.hint}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    i < currentQ
                      ? questionScores[i] >= 0.5
                        ? "bg-success"
                        : "bg-destructive"
                      : i === currentQ
                        ? "bg-primary"
                        : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default ChallengeMode;
