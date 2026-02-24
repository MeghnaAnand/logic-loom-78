import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface JumpingCharacterProps {
  /** Index of the block the character is on (0-based), or -1 if not on any */
  blockIndex: number;
  /** Total blocks placed */
  totalBlocks: number;
  /** "idle" | "jumping" | "celebrating" | "falling" */
  state: "idle" | "jumping" | "celebrating" | "falling";
}

const JumpingCharacter = ({ blockIndex, totalBlocks, state }: JumpingCharacterProps) => {
  const [showSplat, setShowSplat] = useState(false);

  useEffect(() => {
    if (state === "falling") {
      const timer = setTimeout(() => setShowSplat(true), 600);
      return () => clearTimeout(timer);
    }
    setShowSplat(false);
  }, [state]);

  if (totalBlocks === 0 && state === "idle") return null;

  const emoji = state === "celebrating" ? "🏆" : state === "falling" ? "😵" : "🏃";

  return (
    <div className="relative flex flex-col items-center">
      <AnimatePresence mode="wait">
        {state === "falling" ? (
          <motion.div
            key="falling"
            initial={{ y: 0, rotate: 0, opacity: 1 }}
            animate={{ 
              y: [0, -30, 200], 
              rotate: [0, -15, 360],
              opacity: [1, 1, 0],
            }}
            transition={{ duration: 0.8, ease: "easeIn" }}
            className="text-3xl select-none z-20"
          >
            {emoji}
          </motion.div>
        ) : state === "celebrating" ? (
          <motion.div
            key="celebrating"
            initial={{ scale: 0.5, y: 0 }}
            animate={{ 
              scale: [0.5, 1.3, 1],
              y: [0, -20, 0],
            }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
            className="text-3xl select-none z-20"
          >
            {emoji}
          </motion.div>
        ) : state === "jumping" ? (
          <motion.div
            key="jumping"
            animate={{ 
              y: [0, -18, 0],
            }}
            transition={{ 
              duration: 0.4, 
              repeat: Infinity, 
              repeatDelay: 0.3,
              ease: "easeInOut" 
            }}
            className="text-3xl select-none z-20"
          >
            {emoji}
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            animate={{ 
              y: [0, -6, 0],
            }}
            transition={{ 
              duration: 1.2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
            className="text-3xl select-none z-20"
          >
            {emoji}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Splat effect on fall */}
      <AnimatePresence>
        {showSplat && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-2xl select-none mt-1"
          >
            💥
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JumpingCharacter;
