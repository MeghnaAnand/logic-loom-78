import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown } from "lucide-react";
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
        <div className="text-am-canvas-foreground/40 font-display text-center text-lg">
          Click blocks from the library<br />to add them here
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          {/* Trigger block */}
          {triggerBlock && (
            <motion.div
              layout
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div
                onClick={() => onSelectBlock(triggerBlock.id)}
                className={`
                  relative flex items-center gap-3 px-6 py-4 rounded-xl font-display font-bold text-sm
                  bg-am-trigger text-am-trigger-foreground shadow-lg cursor-pointer select-none
                  transition-all
                  ${selectedBlockId === triggerBlock.id ? "ring-4 ring-foreground/30 scale-105" : "hover:shadow-xl"}
                  ${testingPhase === "running" ? "animate-pulse" : ""}
                `}
              >
                <span className="text-2xl">{triggerBlock.icon}</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Trigger</div>
                  <div className="text-base">{triggerBlock.label}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveBlock(triggerBlock.id); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>

              {/* Flowing particle animation */}
              {testingPhase === "running" && isConnected && (
                <motion.div
                  key={currentTestItem}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: [1, 1, 0], y: [0, 60, 120] }}
                  transition={{ duration: 0.8, ease: "easeIn" }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 bg-success text-success-foreground text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap z-10"
                >
                  📄 {TEST_DATA[currentTestItem]?.name}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Connection arrow */}
          {triggerBlock && actionBlock && (
            <div className="flex flex-col items-center my-1">
              {isConnected ? (
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-0.5 h-12 rounded ${testingPhase === "running" ? "bg-success" : "bg-foreground/30"}`} />
                  <ArrowDown className={`w-5 h-5 -mt-1 ${testingPhase === "running" ? "text-success" : "text-foreground/30"}`} />
                  <span className="text-[10px] text-muted-foreground font-display mt-0.5">connected</span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-8 bg-border rounded border-dashed" />
                  <span className="text-[11px] text-muted-foreground font-display bg-am-canvas px-2 py-0.5 rounded">
                    Click both blocks to connect
                  </span>
                  <div className="w-0.5 h-8 bg-border rounded border-dashed" />
                </div>
              )}
            </div>
          )}

          {/* Action block */}
          {actionBlock && (
            <motion.div
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              <div
                onClick={() => onSelectBlock(actionBlock.id)}
                className={`
                  relative flex items-center gap-3 px-6 py-4 rounded-xl font-display font-bold text-sm
                  bg-am-action text-am-action-foreground shadow-lg cursor-pointer select-none
                  transition-all
                  ${selectedBlockId === actionBlock.id ? "ring-4 ring-foreground/30 scale-105" : "hover:shadow-xl"}
                  ${testingPhase === "running" ? "animate-pulse" : ""}
                `}
              >
                <span className="text-2xl">{actionBlock.icon}</span>
                <div>
                  <div className="text-[10px] uppercase tracking-wider opacity-70">Action</div>
                  <div className="text-base">{actionBlock.label}</div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveBlock(actionBlock.id); }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:scale-110 transition-transform"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
export { TEST_DATA };
