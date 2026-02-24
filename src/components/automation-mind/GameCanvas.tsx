import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { GameBlock, Connection, LevelConfig, TestItem } from "@/data/automation-levels";

interface GameCanvasProps {
  level: LevelConfig;
  blocks: GameBlock[];
  connections: Connection[];
  selectedBlockId: string | null;
  connectingFrom: { blockId: string; branch?: "yes" | "no" } | null;
  onSelectBlock: (id: string) => void;
  onConnectBranch: (blockId: string, branch: "yes" | "no") => void;
  onRemoveBlock: (id: string) => void;
  testingPhase: "idle" | "loading" | "running" | "success" | "failure";
  currentTestItem: number;
}

/* ---- Diamond shape for condition blocks ---- */
const DiamondBlock = ({
  block,
  isSelected,
  isConnecting,
  connections,
  onSelect,
  onConnectYes,
  onConnectNo,
  onRemove,
  isRunning,
}: {
  block: GameBlock;
  isSelected: boolean;
  isConnecting: boolean;
  connections: Connection[];
  onSelect: () => void;
  onConnectYes: () => void;
  onConnectNo: () => void;
  onRemove: () => void;
  isRunning: boolean;
}) => {
  const hasYes = connections.some((c) => c.from === block.id && c.branch === "yes");
  const hasNo = connections.some((c) => c.from === block.id && c.branch === "no");

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative flex flex-col items-center"
    >
      {/* Diamond shape */}
      <div
        onClick={onSelect}
        className={`
          relative w-44 h-44 cursor-pointer select-none
          ${isSelected ? "scale-105" : ""}
          ${isRunning ? "animate-pulse" : ""}
        `}
      >
        <div
          className={`
            absolute inset-2 bg-am-condition shadow-lg rotate-45 rounded-xl
            transition-all
            ${isSelected ? "ring-4 ring-foreground/30 shadow-2xl" : "hover:shadow-xl"}
          `}
        />
        {/* Content (un-rotated) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-am-condition-foreground z-10 pointer-events-none">
          <span className="text-2xl mb-0.5">{block.icon}</span>
          <div className="text-[10px] uppercase tracking-wider opacity-70 font-display">Condition</div>
          <div className="text-sm font-bold font-display text-center leading-tight px-2">{block.label}</div>
        </div>

        {/* Remove button */}
        <motion.button
          whileHover={{ scale: 1.2, rotate: 90 }}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1 right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md z-20"
        >
          <X className="w-3 h-3" />
        </motion.button>
      </div>

      {/* YES / NO connection buttons */}
      <div className="flex gap-6 -mt-2 z-10">
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onConnectYes(); }}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold font-display shadow-md transition-all
              ${hasYes
                ? "bg-am-yes text-white"
                : isConnecting
                  ? "bg-am-yes/20 text-am-yes ring-2 ring-am-yes animate-pulse"
                  : "bg-am-yes/10 text-am-yes hover:bg-am-yes/30 hover:shadow-[0_0_12px_hsl(var(--am-yes)/0.4)] border border-am-yes/30"
              }
            `}
          >
            ✓ YES {hasYes && "→"}
          </motion.button>
          {!hasYes && !isConnecting && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-foreground text-background text-[10px] font-display px-2 py-1 rounded-md shadow-lg z-30">
              Connect to YES action
            </div>
          )}
        </div>
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onConnectNo(); }}
            className={`
              flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold font-display shadow-md transition-all
              ${hasNo
                ? "bg-am-no text-white"
                : isConnecting
                  ? "bg-am-no/20 text-am-no ring-2 ring-am-no animate-pulse"
                  : "bg-am-no/10 text-am-no hover:bg-am-no/30 hover:shadow-[0_0_12px_hsl(var(--am-no)/0.4)] border border-am-no/30"
              }
            `}
          >
            ✗ NO {hasNo && "→"}
          </motion.button>
          {!hasNo && !isConnecting && (
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap bg-foreground text-background text-[10px] font-display px-2 py-1 rounded-md shadow-lg z-30">
              Connect to NO action
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ---- Regular block (trigger / action) ---- */
const CanvasBlock = ({
  block,
  isSelected,
  onSelect,
  onRemove,
  isRunning,
  highlightColor,
}: {
  block: GameBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isRunning: boolean;
  highlightColor?: "yes" | "no";
}) => {
  const bgClass =
    block.type === "trigger"
      ? "bg-am-trigger text-am-trigger-foreground"
      : "bg-am-action text-am-action-foreground";

  const glowClass =
    highlightColor === "yes"
      ? "ring-4 ring-am-yes/50 shadow-[0_0_20px_hsl(var(--am-yes)/0.4)]"
      : highlightColor === "no"
        ? "ring-4 ring-am-no/50 shadow-[0_0_20px_hsl(var(--am-no)/0.4)]"
        : "";

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
          ${bgClass} shadow-lg cursor-pointer select-none transition-all duration-200
          ${isSelected ? "ring-4 ring-foreground/30 scale-105 shadow-2xl" : "hover:shadow-xl"}
          ${isRunning ? "animate-pulse" : ""}
          ${glowClass}
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
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md"
        >
          <X className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ---- SVG Arrow ---- */
const ArrowLine = ({
  color,
  label,
  running,
  testLabel,
}: {
  color: string;
  label?: string;
  running: boolean;
  vertical?: boolean;
  testLabel?: string;
}) => (
  <div className="flex flex-col items-center relative">
    <svg width="60" height="60" viewBox="0 0 60 60">
      <defs>
        <filter id={`glow-${color}`}>
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <motion.path
        d="M30 0 C30 20, 30 35, 30 48"
        fill="none"
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        filter={`url(#glow-${color})`}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.polygon
        points="23,45 30,58 37,45"
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      />
      {running && (
        <motion.circle
          cx="30"
          r="3.5"
          fill={color}
          initial={{ cy: 0 }}
          animate={{ cy: [0, 48] }}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeIn" }}
        />
      )}
    </svg>
    {label && (
      <span
        className="text-[10px] font-display font-bold -mt-1"
        style={{ color }}
      >
        {label}
      </span>
    )}
    <AnimatePresence>
      {testLabel && running && (
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="absolute -right-20 top-1/2 -translate-y-1/2 text-[9px] font-display font-bold whitespace-nowrap px-1.5 py-0.5 rounded-md bg-card shadow-sm border border-border"
          style={{ color }}
        >
          {testLabel}
        </motion.span>
      )}
    </AnimatePresence>
  </div>
);

/* ---- Floating test particle ---- */
const TestParticle = ({
  item,
  color,
}: {
  item: TestItem;
  color: string;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.5, y: -10 }}
    animate={{ opacity: [0, 1, 1, 0], y: [-10, 0, 10, 30], scale: [0.5, 1, 1, 0.8] }}
    transition={{ duration: 1.2 }}
    className="absolute left-1/2 -translate-x-1/2 -top-8 z-30 pointer-events-none"
  >
    <div
      className="px-2.5 py-1 rounded-full text-xs font-bold font-display text-white shadow-lg whitespace-nowrap"
      style={{ backgroundColor: color }}
    >
      {item.label}
    </div>
  </motion.div>
);

/* ---- Main Canvas ---- */
const GameCanvas = ({
  level,
  blocks,
  connections,
  selectedBlockId,
  connectingFrom,
  onSelectBlock,
  onConnectBranch,
  onRemoveBlock,
  testingPhase,
  currentTestItem,
}: GameCanvasProps) => {
  const triggerBlock = blocks.find((b) => b.type === "trigger");
  const conditionBlock = blocks.find((b) => b.type === "condition");
  const actionBlocks = blocks.filter((b) => b.type === "action");
  const isRunning = testingPhase === "running";

  // Find which action is connected via YES / NO
  const yesConn = connections.find((c) => c.branch === "yes");
  const noConn = connections.find((c) => c.branch === "no");
  const directConn = connections.find((c) => !c.branch);
  const yesAction = actionBlocks.find((b) => b.id === yesConn?.to);
  const noAction = actionBlocks.find((b) => b.id === noConn?.to);

  // Current test item for particle color
  const currentTest = level.testData[currentTestItem];
  const currentPath = currentTest?.path;

  // For Level 1 simple layout
  const isSimple = level.maxConditions === 0;

  return (
    <div className="flex-1 bg-am-canvas workspace-grid flex flex-col items-center justify-center p-8 relative overflow-auto">
      {/* Connecting tooltip banner */}
      <AnimatePresence>
        {connectingFrom && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full font-display font-bold text-sm shadow-lg"
            style={{
              backgroundColor: connectingFrom.branch === "yes" ? "hsl(var(--am-yes))" : "hsl(var(--am-no))",
              color: "white",
            }}
          >
            {connectingFrom.branch === "yes" ? "🟢 Connect to YES action" : "🔴 Connect to NO action"} — click an action block
          </motion.div>
        )}
      </AnimatePresence>
      {blocks.length === 0 ? (
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-am-canvas-foreground/40 font-display text-center text-lg"
        >
          Click blocks from the library<br />to add them here
        </motion.div>
      ) : isSimple ? (
        /* ---- Level 1: Simple linear flow ---- */
        <div className="flex flex-col items-center">
          {triggerBlock && (
            <CanvasBlock
              block={triggerBlock}
              isSelected={selectedBlockId === triggerBlock.id}
              onSelect={() => onSelectBlock(triggerBlock.id)}
              onRemove={() => onRemoveBlock(triggerBlock.id)}
              isRunning={isRunning}
            />
          )}
          {triggerBlock && actionBlocks[0] && (
            <ArrowLine
              color={directConn ? "hsl(var(--foreground) / 0.4)" : "hsl(var(--border))"}
              running={isRunning && !!directConn}
            />
          )}
          {actionBlocks[0] && (
            <CanvasBlock
              block={actionBlocks[0]}
              isSelected={selectedBlockId === actionBlocks[0].id}
              onSelect={() => onSelectBlock(actionBlocks[0].id)}
              onRemove={() => onRemoveBlock(actionBlocks[0].id)}
              isRunning={isRunning}
            />
          )}
          {!directConn && triggerBlock && actionBlocks[0] && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[11px] text-muted-foreground font-display mt-2"
            >
              Click both blocks to connect
            </motion.p>
          )}
          {directConn && (
            <span className="text-[10px] text-success font-display font-semibold mt-1">connected ✓</span>
          )}
        </div>
      ) : (
        /* ---- Level 2+: Branching flow ---- */
        <div className="flex flex-col items-center relative">
          {/* Trigger */}
          {triggerBlock && (
            <CanvasBlock
              block={triggerBlock}
              isSelected={selectedBlockId === triggerBlock.id}
              onSelect={() => onSelectBlock(triggerBlock.id)}
              onRemove={() => onRemoveBlock(triggerBlock.id)}
              isRunning={isRunning}
            />
          )}

          {/* Arrow: Trigger → Condition */}
          {triggerBlock && conditionBlock && (
            <div className="relative">
              <ArrowLine
                color={
                  connections.some((c) => c.from === triggerBlock.id && c.to === conditionBlock.id)
                    ? "hsl(var(--foreground) / 0.4)"
                    : "hsl(var(--border))"
                }
                running={isRunning}
              />
              {isRunning && currentTest && (
                <TestParticle
                  item={currentTest}
                  color={currentPath === "yes" ? "hsl(var(--am-yes))" : "hsl(var(--am-no))"}
                />
              )}
            </div>
          )}

          {/* Condition diamond */}
          {conditionBlock && (
            <DiamondBlock
              block={conditionBlock}
              isSelected={selectedBlockId === conditionBlock.id}
              isConnecting={connectingFrom?.blockId === conditionBlock.id}
              connections={connections}
              onSelect={() => onSelectBlock(conditionBlock.id)}
              onConnectYes={() => onConnectBranch(conditionBlock.id, "yes")}
              onConnectNo={() => onConnectBranch(conditionBlock.id, "no")}
              onRemove={() => onRemoveBlock(conditionBlock.id)}
              isRunning={isRunning}
            />
          )}

          {/* Not connected hint */}
          {triggerBlock && conditionBlock && !connections.some((c) => c.from === triggerBlock.id) && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[11px] text-muted-foreground font-display mt-1"
            >
              Click trigger, then condition to connect
            </motion.p>
          )}

          {/* Branching actions */}
          {(yesAction || noAction || (actionBlocks.length > 0 && conditionBlock)) && (
            <div className="flex gap-12 mt-1">
              {/* YES path */}
              <div className="flex flex-col items-center">
                {yesAction ? (
                  <>
                    <ArrowLine
                      color="hsl(var(--am-yes))"
                      label="YES"
                      running={isRunning && currentPath === "yes"}
                      testLabel={isRunning && currentPath === "yes" ? "Large orders →" : undefined}
                    />
                    <CanvasBlock
                      block={yesAction}
                      isSelected={selectedBlockId === yesAction.id}
                      onSelect={() => onSelectBlock(yesAction.id)}
                      onRemove={() => onRemoveBlock(yesAction.id)}
                      isRunning={isRunning && currentPath === "yes"}
                      highlightColor={isRunning && currentPath === "yes" ? "yes" : undefined}
                    />
                  </>
                ) : (
                  connectingFrom?.branch === "yes" && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-36 h-16 border-2 border-dashed border-am-yes/40 rounded-xl flex items-center justify-center text-am-yes/60 text-xs font-display mt-4"
                    >
                      Click an action block
                    </motion.div>
                  )
                )}
              </div>

              {/* NO path */}
              <div className="flex flex-col items-center">
                {noAction ? (
                  <>
                    <ArrowLine
                      color="hsl(var(--am-no))"
                      label="NO"
                      running={isRunning && currentPath === "no"}
                      testLabel={isRunning && currentPath === "no" ? "Small orders →" : undefined}
                    />
                    <CanvasBlock
                      block={noAction}
                      isSelected={selectedBlockId === noAction.id}
                      onSelect={() => onSelectBlock(noAction.id)}
                      onRemove={() => onRemoveBlock(noAction.id)}
                      isRunning={isRunning && currentPath === "no"}
                      highlightColor={isRunning && currentPath === "no" ? "no" : undefined}
                    />
                  </>
                ) : (
                  connectingFrom?.branch === "no" && (
                    <motion.div
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-36 h-16 border-2 border-dashed border-am-no/40 rounded-xl flex items-center justify-center text-am-no/60 text-xs font-display mt-4"
                    >
                      Click an action block
                    </motion.div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Unconnected actions (placed but not yet routed) */}
          {actionBlocks.filter((a) => !yesConn || a.id !== yesConn.to).filter((a) => !noConn || a.id !== noConn.to).length > 0 && conditionBlock && (
            <div className="flex gap-4 mt-6">
              {actionBlocks
                .filter((a) => a.id !== yesConn?.to && a.id !== noConn?.to)
                .map((a) => (
                  <CanvasBlock
                    key={a.id}
                    block={a}
                    isSelected={selectedBlockId === a.id}
                    onSelect={() => onSelectBlock(a.id)}
                    onRemove={() => onRemoveBlock(a.id)}
                    isRunning={false}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
