import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ConceptModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  emoji: string;
  description: string;
  details: string[];
  realWorldTool: string;
}

const ConceptModal = ({ open, onClose, title, emoji, description, details, realWorldTool }: ConceptModalProps) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card border border-border rounded-xl shadow-xl max-w-md w-full p-6"
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{emoji}</span>
              <h2 className="font-display text-xl font-bold text-card-foreground">{title}</h2>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>

            <div className="space-y-2 mb-4">
              {details.map((detail, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs font-display font-semibold text-muted-foreground uppercase tracking-wider mb-1">In Real Tools</p>
              <p className="text-xs text-foreground leading-relaxed">{realWorldTool}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConceptModal;
