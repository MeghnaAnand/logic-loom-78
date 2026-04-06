import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export interface FlowBlock {
  label: string;
  type: "trigger" | "action" | "condition" | "data" | "output" | "error" | "loop";
}

const typeStyles: Record<FlowBlock["type"], string> = {
  trigger: "bg-primary/15 border-primary/40 text-primary",
  action: "bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400",
  condition: "bg-purple-500/15 border-purple-500/40 text-purple-600 dark:text-purple-400",
  data: "bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400",
  output: "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400",
  error: "bg-destructive/15 border-destructive/40 text-destructive",
  loop: "bg-cyan-500/15 border-cyan-500/40 text-cyan-600 dark:text-cyan-400",
};

const typeLabels: Record<FlowBlock["type"], string> = {
  trigger: "TRIGGER",
  action: "ACTION",
  condition: "IF / ELSE",
  data: "DATA",
  output: "OUTPUT",
  error: "CATCH",
  loop: "FOR EACH",
};

interface FlowDiagramProps {
  blocks: FlowBlock[];
  caption?: string;
}

const FlowDiagram = ({ blocks, caption }: FlowDiagramProps) => {
  return (
    <div className="my-6">
      <div className="flex flex-col items-center gap-1">
        {blocks.map((block, i) => (
          <div key={i} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-lg border px-4 py-2.5 text-center min-w-[200px] max-w-[260px] ${typeStyles[block.type]}`}
            >
              <span className="absolute -top-2 left-3 text-[9px] font-display font-bold uppercase tracking-wider bg-background px-1.5 rounded">
                {typeLabels[block.type]}
              </span>
              <span className="text-xs font-semibold">{block.label}</span>
            </motion.div>
            {i < blocks.length - 1 && (
              <ArrowDown className="w-3.5 h-3.5 text-muted-foreground my-0.5" />
            )}
          </div>
        ))}
      </div>
      {caption && (
        <p className="text-[10px] text-muted-foreground text-center mt-3 italic">{caption}</p>
      )}
    </div>
  );
};

export default FlowDiagram;
