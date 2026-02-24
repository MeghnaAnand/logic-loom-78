import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Block } from "@/data/challenges";
import { getBlockCode, type CodeLanguage } from "@/data/puzzle-code-translations";

interface BlockCodeSnippetProps {
  block: Block;
  language: CodeLanguage;
  index: number;
  show: boolean;
  level?: number;
}

const BlockCodeSnippet = memo(({ block, language, index, show, level = 1 }: BlockCodeSnippetProps) => {
  const code = getBlockCode(block, language, index, level);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-1 mb-1"
        >
          <pre className="bg-[#1e1e1e] text-[#d4d4d4] text-[10px] leading-relaxed rounded-md px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap border border-border/30">
            {code}
          </pre>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

BlockCodeSnippet.displayName = "BlockCodeSnippet";

export default BlockCodeSnippet;
