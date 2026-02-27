import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MicroLesson } from "@/data/micro-lessons";

interface MicroLessonCardProps {
  lessonNumber: number;
  totalLessons: number;
  primaryConcept: MicroLesson;
  secondaryConcepts: MicroLesson[];
  challengeTitle: string;
  onReady: () => void;
}

const MicroLessonCard = ({
  lessonNumber,
  totalLessons,
  primaryConcept,
  secondaryConcepts,
  challengeTitle,
  onReady,
}: MicroLessonCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 flex items-center justify-center bg-workspace/90 backdrop-blur-sm z-20"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-card rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl border border-border"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-4 h-4 text-primary" />
          <span className="text-xs font-display font-semibold text-primary uppercase tracking-wider">
            Lesson {lessonNumber}/{totalLessons}
          </span>
        </div>
        <h3 className="font-display text-lg font-bold text-card-foreground mb-1">
          {challengeTitle}
        </h3>
        <p className="text-xs text-muted-foreground mb-5">Here's what you'll learn in this puzzle:</p>

        {/* Primary concept */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{primaryConcept.emoji}</span>
            <h4 className="font-display font-bold text-card-foreground">{primaryConcept.concept}</h4>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">
            {primaryConcept.explanation}
          </p>
          <p className="text-xs text-primary/80 font-medium">
            🔧 {primaryConcept.realWorldTool}
          </p>
        </motion.div>

        {/* Secondary concepts (compact) */}
        {secondaryConcepts.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {secondaryConcepts.map((c, i) => (
              <motion.span
                key={c.concept}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs font-display font-semibold text-muted-foreground"
              >
                {c.emoji} {c.concept}
              </motion.span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={onReady}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display gap-2"
          size="lg"
        >
          Got it, let's go! <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default MicroLessonCard;
