import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle, XCircle, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { chapters, type Chapter, type QuizQuestion } from "@/data/learn-chapters";

type View = "list" | "reading" | "quiz" | "results";

const Learn = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<View>("list");
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<Set<string>>(new Set());

  const openChapter = (ch: Chapter) => {
    setActiveChapter(ch);
    setView("reading");
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const startQuiz = () => {
    setView("quiz");
    setCurrentQ(0);
    setScore(0);
    setSelected(null);
    setAnswered(false);
  };

  const handleSelect = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === activeChapter!.questions[currentQ].correctIndex) {
      setScore((s) => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < activeChapter!.questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setCompletedChapters((prev) => new Set(prev).add(activeChapter!.id));
      setView("results");
    }
  };

  const q: QuizQuestion | undefined = activeChapter?.questions[currentQ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
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
              <p className="text-sm text-muted-foreground mb-4">
                {chapters.length} chapters · One concept per chapter · Quiz at the end of each
              </p>
              {chapters.map((ch) => (
                <Card
                  key={ch.id}
                  className="cursor-pointer hover:border-primary/40 transition-colors"
                  onClick={() => openChapter(ch)}
                >
                  <CardContent className="flex items-center gap-4 p-4">
                    <span className="text-2xl">{ch.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-display text-muted-foreground">Chapter {ch.number}</span>
                        {completedChapters.has(ch.id) && <CheckCircle className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <h3 className="font-display font-semibold text-sm text-card-foreground">{ch.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">{ch.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              ))}

              {/* CTA to puzzles */}
              <div className="pt-4">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => navigate("/play")}
                >
                  Ready to Puzzle? Start Solving <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
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

              <div className="space-y-4 mb-8">
                {activeChapter.content.map((para, i) => (
                  <p key={i} className="text-sm text-muted-foreground leading-relaxed">{para}</p>
                ))}
              </div>

              <Button onClick={startQuiz} className="w-full gap-2">
                Take the Quiz <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* Quiz View */}
          {view === "quiz" && activeChapter && q && (
            <motion.div key={`quiz-${currentQ}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center justify-between mb-6">
                <p className="text-xs font-display text-muted-foreground">
                  {activeChapter.emoji} Chapter {activeChapter.number} · Question {currentQ + 1}/{activeChapter.questions.length}
                </p>
                <span className="text-xs font-display text-primary">{score} correct</span>
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
                      className={`w-full text-left p-3.5 rounded-lg border text-sm transition-colors ${borderClass} ${
                        !answered ? "hover:border-primary/40 cursor-pointer" : "cursor-default"
                      }`}
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
                  {currentQ < activeChapter.questions.length - 1 ? "Next Question" : "See Results"}{" "}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          )}

          {/* Results View */}
          {view === "results" && activeChapter && (
            <motion.div key="results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="text-center py-8">
              <span className="text-5xl mb-4 block">{score === activeChapter.questions.length ? "🎉" : "📝"}</span>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                {score === activeChapter.questions.length ? "Perfect!" : "Chapter Complete!"}
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                You got <span className="text-primary font-semibold">{score}</span> out of{" "}
                <span className="font-semibold">{activeChapter.questions.length}</span> correct
              </p>

              <div className="flex flex-col gap-3 max-w-xs mx-auto">
                {activeChapter.number < chapters.length && (
                  <Button onClick={() => openChapter(chapters[activeChapter.number])} className="gap-2">
                    Next Chapter <ArrowRight className="w-4 h-4" />
                  </Button>
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
