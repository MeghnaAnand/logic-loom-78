import { motion } from "framer-motion";
import { playWhoosh } from "@/lib/sounds";
import type { GameBlock, LevelConfig } from "@/data/automation-levels";

interface BlockLibraryProps {
  level: LevelConfig;
  onAddBlock: (block: GameBlock) => void;
  canvasBlocks: GameBlock[];
}

const BlockLibrary = ({ level, onAddBlock, canvasBlocks }: BlockLibraryProps) => {
  const triggerCount = canvasBlocks.filter((b) => b.type === "trigger").length;
  const actionCount = canvasBlocks.filter((b) => b.type === "action").length;
  const conditionCount = canvasBlocks.filter((b) => b.type === "condition").length;
  const dataCount = canvasBlocks.filter((b) => b.type === "data").length;

  const triggers = level.blocks.filter((b) => b.type === "trigger");
  const conditions = level.blocks.filter((b) => b.type === "condition");
  const dataOps = level.blocks.filter((b) => b.type === "data");
  const actions = level.blocks.filter((b) => b.type === "action");

  const isOnCanvas = (id: string) => canvasBlocks.some((b) => b.id === id);

  const handleClick = (block: GameBlock) => {
    const alreadyPlaced = isOnCanvas(block.id);
    if (alreadyPlaced) return;

    if (block.type === "trigger" && triggerCount >= level.maxTriggers) return;
    if (block.type === "action" && actionCount >= level.maxActions) return;
    if (block.type === "condition" && conditionCount >= level.maxConditions) return;
    if (block.type === "data" && dataCount >= (level.maxData ?? 0)) return;

    playWhoosh();
    onAddBlock(block);
  };

  const bgMap: Record<string, string> = {
    trigger: "bg-am-trigger text-am-trigger-foreground",
    action: "bg-am-action text-am-action-foreground",
    condition: "bg-am-condition text-am-condition-foreground",
    data: "bg-am-data text-am-data-foreground",
  };

  const renderSection = (
    title: string,
    emoji: string,
    blocks: GameBlock[],
    maxCount: number,
    currentCount: number
  ) => {
    if (blocks.length === 0) return null;
    return (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          {emoji} {title}
        </h3>
        <div className="flex flex-col gap-2">
          {blocks.map((block) => {
            const placed = isOnCanvas(block.id);
            const maxReached = currentCount >= maxCount;
            const disabled = placed || maxReached;
            const isData = block.type === "data";
            return (
              <motion.button
                key={block.id}
                whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
                whileTap={disabled ? {} : { scale: 0.95 }}
                onClick={() => handleClick(block)}
                disabled={disabled}
                className={`
                  flex items-center gap-2.5 ${isData ? "px-2.5 py-2" : "px-3 py-2.5"} rounded-xl text-left ${isData ? "text-xs" : "text-sm"} font-semibold font-display
                  transition-all select-none ${bgMap[block.type]}
                  ${disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer shadow-md hover:shadow-xl hover:brightness-105"
                  }
                `}
              >
                <span className={isData ? "text-base" : "text-lg"}>{block.icon}</span>
                {block.label}
                {placed && <span className="ml-auto text-[10px] opacity-60">on canvas</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  };

  // Compute guidance message
  const getGuidanceMessage = () => {
    if (canvasBlocks.length === 0) return null;
    const needsData = (level.maxData ?? 0) > 0;
    if (needsData) {
      const totalNeeded = 1 + (level.maxData ?? 0) + level.maxActions;
      const totalPlaced = canvasBlocks.length;
      if (totalPlaced >= totalNeeded) return "All blocks placed! Connect them in sequence.";
      if (triggerCount === 0) return "Start by adding a trigger!";
      if (dataCount < (level.maxData ?? 0)) return `Add ${(level.maxData ?? 0) - dataCount} more data op${(level.maxData ?? 0) - dataCount > 1 ? "s" : ""}!`;
      if (actionCount < level.maxActions) return "Now add the final action block!";
    }
    if (triggerCount > 0 && level.maxConditions > 0 && conditionCount === 0) return "Now add a condition block!";
    if (triggerCount > 0 && conditionCount > 0 && actionCount >= level.maxActions) return "All needed blocks placed! Connect them now.";
    if (actionCount < level.maxActions) return `Add ${level.maxActions - actionCount} more action${level.maxActions - actionCount > 1 ? "s" : ""}!`;
    return "Click blocks on canvas to connect them.";
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4 flex flex-col gap-5 overflow-y-auto">
      <div>
        <h2 className="font-display font-bold text-sm text-card-foreground mb-1">🧩 Block Library</h2>
        <p className="text-xs text-muted-foreground">Click a block to add it to the canvas</p>
      </div>

      {renderSection("Triggers", "⚡", triggers, level.maxTriggers, triggerCount)}
      {renderSection("Data Operations", "🔬", dataOps, level.maxData ?? 0, dataCount)}
      {renderSection("Conditions", "🔀", conditions, level.maxConditions, conditionCount)}
      {renderSection("Actions", "🔧", actions, level.maxActions, actionCount)}

      {canvasBlocks.length > 0 && (
        <p className="text-[11px] text-muted-foreground italic">
          {getGuidanceMessage()}
        </p>
      )}
    </div>
  );
};

export default BlockLibrary;
