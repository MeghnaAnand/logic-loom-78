import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, BookOpen, ChevronRight, RotateCcw, Lock, Award, Send, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import FlowDiagram from "@/components/learn/FlowDiagram";
import { chapters, PASS_THRESHOLD, type Chapter, type QuizQuestion } from "@/data/learn-chapters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type View = "list" | "reading" | "quiz" | "results";

const WebhookTester = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleTest = async () => {
    if (!webhookUrl) {
      toast.error("Please enter your Zapier webhook URL");
      return;
    }
    setIsSending(true);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          message: "Hello from AutomationMind!",
          timestamp: new Date().toISOString(),
          source: "AutomationMind Learn Chapter 10",
        }),
      });
      toast.success("Request sent! Check your Zap history to confirm it triggered.");
    } catch {
      toast.error("Failed to send. Check the URL and try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-muted border border-border rounded-xl p-4 my-6">
      <h3 className="font-display font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
        <Send className="w-4 h-4 text-primary" /> Test Your Webhook
      </h3>
      <p className="text-xs text-muted-foreground mb-3">
        Paste your Zapier "Catch Hook" URL below and click Test to trigger your Zap.
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="https://hooks.zapier.com/hooks/catch/..."
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          className="text-xs"
        />
        <Button size="sm" onClick={handleTest} disabled={isSending} className="shrink-0 gap-1.5">
          {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Test
        </Button>
      </div>
    </div>
  );
};

const Learn = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [view, setView] = useState<View>("list");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongConcepts, setWrongConcepts] = useState<string[]>([]);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Load progress from database
  useEffect(() => {
    if (!user) { setLoadingProgress(false); return; }
    const load = async () => {
      const { data } = await supabase
        .from("chapter_progress")
        .select("chapter_id")
        .eq("passed", true);
      if (data) {
        setCompletedChapters(new Set(data.map((r: any) => r.chapter_id)));
      }
      setLoadingProgress(false);
    };
    load();
  }, [user]);

  // Save progress to database
  const saveProgress = useCallback(async (chapterId: string, quizScore: number) => {
    if (!user) return;
    const total = chapters.find(c => c.id === chapterId)?.questions.length ?? 5;
    const didPass = quizScore / total >= PASS_THRESHOLD;
    
    const { data: existing } = await supabase
      .from("chapter_progress")
      .select("id, score")
      .eq("chapter_id", chapterId)
      .maybeSingle();

    if (existing) {
      if (quizScore > (existing.score ?? 0)) {
        await supabase
          .from("chapter_progress")
          .update({ score: quizScore, passed: didPass, completed_at: new Date().toISOString() })
          .eq("id", existing.id);
      }
    } else {
      await supabase
        .from("chapter_progress")
        .insert({ user_id: user.id, chapter_id: chapterId, score: quizScore, passed: didPass });
    }
  }, [user]);

  const isChapterUnlocked = (ch: Chapter) => {
    if (ch.number === 1) return true;
    const prev = chapters.find((c) => c.number === ch.number - 1);
    return prev ? completedChapters.has(prev.id) : true;
  };

  const openChapter = (ch: Chapter) => {
    if (!isChapterUnlocked(ch)) return;
    setActiveChapter(ch);
    setView("reading");
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setWrongConcepts([]);
  };

  const startQuiz = () => {
    setView("quiz");
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
    setWrongConcepts([]);
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const q = activeChapter!.questions[currentQ];
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
    } else {
      setWrongConcepts((prev) => [...prev, q.concept]);
    }
  };

  const nextQuestion = () => {
    if (currentQ < activeChapter!.questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      const total = activeChapter!.questions.length;
      const finalScore = score;
      const passed = finalScore / total >= PASS_THRESHOLD;
      if (passed) {
        setCompletedChapters((prev) => new Set(prev).add(activeChapter!.id));
      }
      saveProgress(activeChapter!.id, finalScore);
      setView("results");
    }
  };

  const q: QuizQuestion | undefined = activeChapter?.questions[currentQ];
  const passed = activeChapter ? score / activeChapter.questions.length >= PASS_THRESHOLD : false;
  const requiredScore = activeChapter ? Math.ceil(activeChapter.questions.length * PASS_THRESHOLD) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => (view === "list" ? navigate("/") : setView("list"))}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="font-display font-bold text-lg">Learn Automation</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Chapter List */}
          {view === "list" && (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {loadingProgress ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
              <>
              <p className="text-sm text-muted-foreground mb-4">
                {chapters.length} chapters · 5 questions each · Score 60% to unlock the next
              </p>
              </p>
              {chapters.map((ch) => {
                const unlocked = isChapterUnlocked(ch);
                const done = completedChapters.has(ch.id);
                return (
                  <Card
                    key={ch.id}
                    className={`transition-colors ${unlocked ? "cursor-pointer hover:border-primary/40" : "opacity-50 cursor-not-allowed"}`}
                    onClick={() => unlocked && openChapter(ch)}
                  >
                    <CardContent className="flex items-center gap-4 p-4">
                      <span className="text-2xl">{ch.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-display text-muted-foreground">Chapter {ch.number}</span>
                          {done && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                          {!unlocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                        </div>
                        <h3 className="font-display font-semibold text-sm text-card-foreground">{ch.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{ch.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}

              {/* All chapters done → certificate CTA */}
              {completedChapters.size === chapters.length ? (
                <div className="pt-4 space-y-3">
                  <Card className="border-primary/30 bg-primary/5">
                    <CardContent className="p-4 text-center">
                      <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                      <h3 className="font-display font-bold text-sm text-foreground mb-1">All chapters complete! 🎉</h3>
                      <p className="text-xs text-muted-foreground mb-3">Finish the puzzles to earn your certificate.</p>
                      <div className="flex flex-col gap-2">
                        <Button className="w-full gap-2" onClick={() => navigate("/build-zap")}>
                          <Zap className="w-4 h-4" /> Build Your First Real Zap
                        </Button>
                        <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/play")}>
                          Start Puzzles <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full gap-2" onClick={() => navigate("/certificate")}>
                          <Award className="w-4 h-4" /> View Certificate
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="pt-4">
                  <Button variant="outline" className="w-full gap-2" onClick={() => navigate("/play")}>
                    Ready to Puzzle? Start Solving <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
              </>
              )}
            </motion.div>
          )}

          {/* Reading View */}
          {view === "reading" && activeChapter && (
            <motion.div key="reading" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{activeChapter.emoji}</span>
                <div>
                  <p className="text-xs font-display text-muted-foreground">Chapter {activeChapter.number}</p>
                  <h2 className="font-display text-xl font-bold text-foreground">{activeChapter.title}</h2>
                </div>
              </div>
              <div className="space-y-4 mb-4">
                {activeChapter.content.map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                ))}
              </div>

              {/* Visual flow diagram */}
              {activeChapter.diagram && (
                <FlowDiagram blocks={activeChapter.diagram} caption={activeChapter.diagramCaption} />
              )}

              {/* Webhook tester for walkthrough chapter */}
              {activeChapter.isWalkthrough && <WebhookTester />}

              <Button onClick={startQuiz} className="w-full gap-2 mt-6">
                Take the Quiz ({activeChapter.questions.length} questions) <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Quiz View */}
          {view === "quiz" && activeChapter && q && (
            <motion.div key={`quiz-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-display text-muted-foreground">
                  {activeChapter.emoji} Chapter {activeChapter.number} · Q{currentQ + 1}/{activeChapter.questions.length}
                </p>
                <span className="text-xs font-display text-primary">{score} correct</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-muted rounded-full mb-6">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${((currentQ + (answered ? 1 : 0)) / activeChapter.questions.length) * 100}%` }}
                />
              </div>

              <h3 className="font-display font-semibold text-base text-foreground mb-5">{q.question}</h3>

              <div className="space-y-2.5 mb-6">
                {q.options.map((opt, i) => {
                  const isCorrect = i === q.correctIndex;
                  const isSelected = i === selected;
                  let borderClass = "border-border";
                  if (answered && isCorrect) borderClass = "border-primary bg-primary/10";
                  else if (answered && isSelected && !isCorrect) borderClass = "border-destructive bg-destructive/10";

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      disabled={answered}
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors ${borderClass} ${!answered ? "hover:border-primary/40 cursor-pointer" : "cursor-default"}`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="font-display font-semibold text-muted-foreground shrink-0 mt-0.5">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span className="text-foreground">{opt}</span>
                        {answered && isCorrect && <CheckCircle className="w-4 h-4 text-primary shrink-0 ml-auto mt-0.5" />}
                        {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-destructive shrink-0 ml-auto mt-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {answered && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">{q.explanation}</p>
                  </div>
                </motion.div>
              )}

              {answered && (
                <Button onClick={nextQuestion} className="w-full gap-2">
                  {currentQ < activeChapter.questions.length - 1 ? "Next Question" : "See Results"} <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}

          {/* Results View */}
          {view === "results" && activeChapter && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="py-8">
              <div className="text-center mb-6">
                <span className="text-5xl mb-4 block">
                  {passed ? (score === activeChapter.questions.length ? "🎉" : "✅") : "📖"}
                </span>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {passed
                    ? score === activeChapter.questions.length
                      ? "Perfect Score!"
                      : "Chapter Passed!"
                    : "Not Quite Yet"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  You got <span className={`font-semibold ${passed ? "text-primary" : "text-destructive"}`}>{score}</span> out of{" "}
                  <span className="font-semibold">{activeChapter.questions.length}</span> correct
                  {!passed && (
                    <span> — you need at least <span className="font-semibold">{requiredScore}</span> to pass</span>
                  )}
                </p>
              </div>

              {/* Concepts to revisit */}
              {!passed && wrongConcepts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                    <h3 className="font-display font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-destructive" />
                      Concepts to revisit
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      Re-read the chapter and focus on these areas before retaking the quiz:
                    </p>
                    <ul className="space-y-2">
                      {[...new Set(wrongConcepts)].map((concept, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                          <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                          <span>{concept}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              {/* Passed feedback with wrong concepts */}
              {passed && wrongConcepts.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                    <h3 className="font-display font-semibold text-sm text-foreground mb-2">
                      💡 Quick review
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      You passed, but consider revisiting:
                    </p>
                    <ul className="space-y-1">
                      {[...new Set(wrongConcepts)].map((concept, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                          <span className="text-primary">•</span> {concept}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {passed && activeChapter.number < chapters.length && (
                  <Button onClick={() => openChapter(chapters[activeChapter.number])} className="gap-2">
                    Next Chapter <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
                {!passed && (
                  <>
                    <Button onClick={() => openChapter(activeChapter)} className="gap-2">
                      <RotateCcw className="w-4 h-4" /> Re-read & Retry
                    </Button>
                    <Button variant="outline" onClick={startQuiz} className="gap-2">
                      Retry Quiz Only <ArrowRight className="w-4 h-4" />
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setView("list")}>
                  Back to Chapters
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Learn;
