import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { PostBreakdownStep } from "@/data/micro-lessons";

interface PostPuzzleBreakdownProps {
  steps: PostBreakdownStep[];
}

const PostPuzzleBreakdown = ({ steps }: PostPuzzleBreakdownProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-muted/50 border border-border rounded-xl p-4 mb-4 text-left"
    >
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle2 className="w-4 h-4 text-success" />
        <h4 className="font-display font-bold text-sm text-card-foreground">
          Why this order works
        </h4>
      </div>
      <div className="space-y-2.5">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="flex gap-3"
          >
            <div className="flex flex-col items-center shrink-0">
              <div className="w-6 h-6 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold">
                {i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-border mt-1" />
              )}
            </div>
            <div className="pb-2">
              <p className="text-xs font-display font-bold text-card-foreground">
                {step.blockLabel}
              </p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {step.why}
              </p>
              <p className="text-[10px] text-primary/70 mt-0.5">
                🔧 {step.realTool}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PostPuzzleBreakdown;
