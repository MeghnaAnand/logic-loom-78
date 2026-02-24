import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";

interface WrongAnswerOverlayProps {
  show: boolean;
  message: string;
  onDismiss: () => void;
}

const WrongAnswerOverlay = ({ show, message, onDismiss }: WrongAnswerOverlayProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            x: [0, -8, 8, -6, 6, -3, 3, 0],
          }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ 
            duration: 0.5,
            x: { duration: 0.5, ease: "easeInOut" }
          }}
          className="absolute top-6 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="relative bg-destructive text-destructive-foreground px-6 py-4 rounded-xl shadow-2xl border-2 border-destructive/50 max-w-sm text-center">
            <button
              onClick={onDismiss}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive-foreground/20 hover:bg-destructive-foreground/40 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="text-4xl mb-2"
            >
              😵
            </motion.div>
            <p className="font-display font-bold text-base">{message}</p>
            <p className="text-sm opacity-80 mt-1">Try a different order!</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WrongAnswerOverlay;
