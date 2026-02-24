import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { GameBlock } from "./BlockLibrary";

interface GameCanvasProps {
  blocks: GameBlock[];
  connection: { from: string; to: string } | null;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onRemoveBlock: (id: string) => void;
  testingPhase: "idle" | "running" | "success" | "failure";
  currentTestItem: number;
}

const TEST_DATA = [
  { name: "John", email: "john@email.com" },
  { name: "Sarah", email: "sarah@email.com" },
  { name: "Mike", email: "mike@email.com" },
  { name: "Emma", email: "emma@email.com" },
  { name: "David", email: "david@email.com" },
];

const BezierArrow = ({ connected, running }: { connected: boolean; running: boolean }) => {
  const strokeColor = running
    ? "hsl(var(--success))"
    : connected
      ? "hsl(var(--foreground) / 0.4)"
      : "hsl(var(--border))";

  return (
    <svg width="60" height="80" viewBox="0 0 60 80" className="my-1">
      <motion.path
        d="M30 0 C30 30, 30 50, 30 65"
        fill="none"
        stroke={strokeColor}
        strokeWidth={connected ? 3 : 2}
        strokeDasharray={connected ? "none" : "6 4"}
        strokeLinecap="round"
        initial={connected ? { pathLength: 0 } : {}}
        animate={connected ? { pathLength: 1 } : {}}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
      {connected && (
        <motion.polygon
          points="22,62 30,78 38,62"
          fill={strokeColor}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      )}
      {!connected && (
        <polygon points="24,62 30,74 36,62" fill={strokeColor} opacity={0.5} />
      )}
      {running && (
        <motion.circle
          cx="30"
          r="4"
          fill="hsl(var(--success))"
          initial={{ cy: 0 }}
          animate={{ cy: [0, 65] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeIn" }}
        />
      )}
    </svg>
  );
};

const CanvasBlock = ({
  block,
  isSelected,
  onSelect,
  onRemove,
  isRunning,
}: {
  block: GameBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isRunning: boolean;
}) => {
  const bgClass = block.type === "trigger" ? "bg-am-trigger text-am-trigger-foreground" : "bg-am-action text-am-action-foreground";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: block.type === "trigger" ? -20 : 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.04, y: -2 }}
      className="relative"
    >
      <div
        onClick={onSelect}
        className={`
          relative flex items-center gap-3 px-6 py-4 rounded-2xl font-display font-bold text-sm
          ${bgClass} shadow-lg cursor-pointer select-none
          transition-all duration-200
          ${isSelected ? "ring-4 ring-foreground/30 scale-105 shadow-2xl" : "hover:shadow-xl"}
          ${isRunning ? "animate-pulse" : ""}
        `}
      >
        <span className="text-2xl">{block.icon}</span>
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-70">
            {block.type === "trigger" ? "Trigger" : "Action"}
          </div>
          <div className="text-base">{block.label}</div>
        </div>
        <motion.button
          whileHover={{ scale: 1.2, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md hover:shadow-lg transition-shadow"
        >
          <X className="w-3 h-3" />
        </motion.button>
      </div>

      {/* Flowing data particle during test */}
      {isRunning && block.type === "trigger" && (
        <AnimatePresence>
          <motion.div
            key={`particle-${Date.now()}`}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: [1, 1, 0], y: [0, 40, 80] }}
            transition={{ duration: 0.6, ease: "easeIn" }}
            className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-success text-success-foreground text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap z-10 shadow-md"
          >
            📄 Data
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
};

const GameCanvas = ({
  blocks,
  connection,
  selectedBlockId,
  onSelectBlock,
  onRemoveBlock,
  testingPhase,
  currentTestItem,
}: GameCanvasProps) => {
  const triggerBlock = blocks.find((b) => b.type === "trigger");
  const actionBlock = blocks.find((b) => b.type === "action");
  const isConnected = !!connection;

  return (
    <div className="flex-1 bg-am-canvas workspace-grid flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {blocks.length === 0 ? (
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-am-canvas-foreground/40 font-display text-center text-lg"
        >
          Click blocks from the library<br />to add them here
        </motion.div>
      ) : (
        <div className="flex flex-col items-center">
          {triggerBlock && (
            <CanvasBlock
              block={triggerBlock}
              isSelected={selectedBlockId === triggerBlock.id}
              onSelect={() => onSelectBlock(triggerBlock.id)}
              onRemove={() => onRemoveBlock(triggerBlock.id)}
              isRunning={testingPhase === "running"}
            />
          )}

          {/* Bezier curve connection arrow */}
          {triggerBlock && actionBlock && (
            <div className="flex flex-col items-center">
              <BezierArrow connected={isConnected} running={testingPhase === "running"} />
              {!isConnected && (
                <motion.span
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-[11px] text-muted-foreground font-display bg-am-canvas px-2 py-0.5 rounded -mt-1 mb-1"
                >
                  Click both blocks to connect
                </motion.span>
              )}
              {isConnected && (
                <span className="text-[10px] text-success font-display font-semibold -mt-1 mb-1">connected ✓</span>
              )}
            </div>
          )}

          {actionBlock && (
            <CanvasBlock
              block={actionBlock}
              isSelected={selectedBlockId === actionBlock.id}
              onSelect={() => onSelectBlock(actionBlock.id)}
              onRemove={() => onRemoveBlock(actionBlock.id)}
              isRunning={testingPhase === "running"}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
export { TEST_DATA };
