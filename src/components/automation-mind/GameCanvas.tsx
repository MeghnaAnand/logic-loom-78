import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDown } from "lucide-react";
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
  /** Which extraction step (0-2) is currently active within a test item */
  currentExtractionStep?: number;
}

/* ---- Email preview with highlighting ---- */
const EmailPreviewWindow = ({
  level,
  currentTestItem,
  currentExtractionStep,
  testingPhase,
}: {
  level: LevelConfig;
  currentTestItem: number;
  currentExtractionStep?: number;
  testingPhase: string;
}) => {
  if (!level.dataPreview || level.dataPreview.length === 0) return null;
  const isRunning = testingPhase === "running";
  const isSuccess = testingPhase === "success";
  const isIdle = testingPhase === "idle";

  // Pick the preview that matches the current test item (cycle through available previews)
  const previewIndex = isRunning ? currentTestItem % level.dataPreview.length : 0;
  const preview = level.dataPreview[previewIndex];
  if (!preview) return null;

  // Build highlighted email text
  const highlightEmail = (text: string, step?: number) => {
    if (step === undefined || step < 0) return <span>{text}</span>;
    const extracted = preview.extracted;
    // Find and highlight the value for the current extraction step
    const highlightValue = extracted[step]?.value;
    if (!highlightValue) return <span>{text}</span>;

    const idx = text.indexOf(highlightValue);
    if (idx === -1) return <span>{text}</span>;

    return (
      <>
        <span>{text.slice(0, idx)}</span>
        <motion.span
          initial={{ backgroundColor: "transparent" }}
          animate={{ backgroundColor: "hsl(48 96% 53% / 0.4)" }}
          className="font-bold text-foreground rounded px-0.5"
          style={{ display: "inline" }}
        >
          {highlightValue}
        </motion.span>
        <span>{text.slice(idx + highlightValue.length)}</span>
      </>
    );
  };

  return (
    <AnimatePresence>
      {(isIdle || isRunning || isSuccess) && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute top-4 right-4 z-30 w-72"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
            <div className="bg-muted px-3 py-1.5 flex items-center gap-1.5 border-b border-border">
              <span className="text-xs">📧</span>
              <span className="text-[10px] font-display font-bold text-foreground uppercase tracking-wider">
                {isRunning ? `Email #${currentTestItem + 1}` : isSuccess ? "Extraction Complete" : "Sample Email"}
              </span>
              {isRunning && currentExtractionStep !== undefined && (
                <motion.span
                  key={currentExtractionStep}
                  initial={{ opacity: 0, x: 5 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-auto text-[9px] font-display font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: "hsl(48 96% 53% / 0.3)", color: "hsl(var(--foreground))" }}
                >
                  Extracting: {preview.extracted[currentExtractionStep]?.label}
                </motion.span>
              )}
            </div>
            <div className="px-3 py-2">
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                {isRunning ? highlightEmail(preview.original, currentExtractionStep) : preview.original}
              </p>
            </div>
            {/* Show extracted fields progressively during running */}
            {isRunning && currentExtractionStep !== undefined && currentExtractionStep >= 0 && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: "auto" }}
                className="border-t border-border px-3 py-2 bg-success/5"
              >
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1 font-display">Extracted:</div>
                {preview.extracted.slice(0, currentExtractionStep + 1).map((item, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1 text-[11px]"
                  >
                    <span className="text-success">✓</span>
                    <span className="text-muted-foreground">{item.label}:</span>
                    <span className="text-foreground font-bold font-display">{item.value}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ---- Connection count helper ---- */
const getConnectionCount = (blockId: string, connections: Connection[]) => {
  return connections.filter((c) => c.from === blockId || c.to === blockId).length;
};

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
  const connCount = getConnectionCount(block.id, connections);

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
        <div className="absolute inset-0 flex flex-col items-center justify-center text-am-condition-foreground z-10 pointer-events-none">
          <span className="text-2xl mb-0.5">{block.icon}</span>
          <div className="text-[10px] uppercase tracking-wider opacity-70 font-display">Condition</div>
          <div className="text-sm font-bold font-display text-center leading-tight px-2">{block.label}</div>
        </div>

        {/* Connection count badge */}
        {connCount > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold font-display px-1.5 py-0.5 rounded-full z-20">
            {connCount} conn.
          </div>
        )}

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

/* ---- Data operation block (smaller, orange) ---- */
const DataBlock = ({
  block,
  isSelected,
  onSelect,
  onRemove,
  isRunning,
  connectionCount,
  extractionLabel,
}: {
  block: GameBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isRunning: boolean;
  connectionCount: number;
  extractionLabel?: string;
}) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    whileHover={{ scale: 1.04, y: -2 }}
    className="relative"
  >
    <div
      onClick={onSelect}
      className={`
        relative flex items-center gap-2.5 px-4 py-3 rounded-xl font-display font-bold text-sm
        bg-am-data text-am-data-foreground shadow-lg cursor-pointer select-none transition-all duration-200
        ${isSelected ? "ring-4 ring-foreground/30 scale-105 shadow-2xl" : "hover:shadow-xl"}
        ${isRunning ? "animate-pulse" : ""}
      `}
    >
      <span className="text-xl">{block.icon}</span>
      <div>
        <div className="text-[9px] uppercase tracking-wider opacity-70">Data Op</div>
        <div className="text-sm">{block.label}</div>
      </div>
      {connectionCount > 0 && (
        <span className="ml-auto text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">
          {connectionCount === 1 ? "1 connection" : `${connectionCount} connections`}
        </span>
      )}
      <motion.button
        whileHover={{ scale: 1.2, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md"
      >
        <X className="w-3 h-3" />
      </motion.button>
    </div>
    {/* Extraction label during testing */}
    <AnimatePresence>
      {extractionLabel && (
        <motion.div
          initial={{ opacity: 0, x: 20, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -20, scale: 0.8 }}
          className="absolute -right-28 top-1/2 -translate-y-1/2 bg-card border border-am-data/30 text-foreground text-[10px] font-display font-bold px-2 py-1 rounded-lg shadow-md z-30 whitespace-nowrap"
        >
          → {extractionLabel}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

/* ---- Regular block (trigger / action) ---- */
const CanvasBlock = ({
  block,
  isSelected,
  onSelect,
  onRemove,
  isRunning,
  highlightColor,
  connectionCount,
}: {
  block: GameBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isRunning: boolean;
  highlightColor?: "yes" | "no";
  connectionCount?: number;
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
        {connectionCount !== undefined && connectionCount > 0 && (
          <span className="ml-1 text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">
            {connectionCount === 1 ? "1 conn." : `${connectionCount} conn.`}
          </span>
        )}
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
      <span className="text-[10px] font-display font-bold -mt-1" style={{ color }}>
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

/* ---- Compact Arrow for chain layout ---- */
const ChainArrow = ({
  connected,
  running,
}: {
  connected: boolean;
  running: boolean;
}) => (
  <div className="flex flex-col items-center">
    <svg width="40" height="36" viewBox="0 0 40 36">
      <motion.path
        d="M20 0 L20 28"
        fill="none"
        stroke={connected ? "hsl(var(--am-data))" : "hsl(var(--border))"}
        strokeWidth={2.5}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4 }}
      />
      <motion.polygon
        points="14,25 20,35 26,25"
        fill={connected ? "hsl(var(--am-data))" : "hsl(var(--border))"}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />
      {running && connected && (
        <motion.circle
          cx="20"
          r="3"
          fill="hsl(var(--am-data))"
          initial={{ cy: 0 }}
          animate={{ cy: [0, 28] }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "easeIn" }}
        />
      )}
    </svg>
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
  const dataBlocks = blocks.filter((b) => b.type === "data");
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

  const layoutType = level.layout || (level.maxConditions === 0 ? "simple" : "branch");

  // For chain layout: build ordered chain from connections
  const buildChain = (): GameBlock[] => {
    if (!triggerBlock) return [];
    const chain: GameBlock[] = [triggerBlock];
    let currentId = triggerBlock.id;
    const visited = new Set<string>([currentId]);
    while (true) {
      const nextConn = connections.find((c) => c.from === currentId && !c.branch);
      if (!nextConn) break;
      const nextBlock = blocks.find((b) => b.id === nextConn.to);
      if (!nextBlock || visited.has(nextBlock.id)) break;
      chain.push(nextBlock);
      visited.add(nextBlock.id);
      currentId = nextBlock.id;
    }
    return chain;
  };

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
      ) : layoutType === "chain" ? (
        /* ---- Level 3: Linear chain flow ---- */
        <div className="flex flex-col items-center">
          {(() => {
            const chain = buildChain();
            const unchainedData = dataBlocks.filter((d) => !chain.some((c) => c.id === d.id));
            const unchainedActions = actionBlocks.filter((a) => !chain.some((c) => c.id === a.id));
            const allChained = chain.length === (level.chainOrder?.length ?? 0);

            return (
              <>
                {/* Render chain */}
                {chain.map((block, i) => {
                  const isLast = i === chain.length - 1;
                  const connCount = getConnectionCount(block.id, connections);
                  const isBlockRunning = isRunning;

                  // Extraction label during testing
                  let extractionLabel: string | undefined;
                  if (isRunning && currentTest?.extractions && block.type === "data") {
                    const dataIndex = chain.filter((b, idx) => idx <= i && b.type === "data").length - 1;
                    extractionLabel = currentTest.extractions[dataIndex];
                  }

                  return (
                    <div key={block.id} className="flex flex-col items-center">
                      {block.type === "data" ? (
                        <DataBlock
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          onRemove={() => onRemoveBlock(block.id)}
                          isRunning={isBlockRunning}
                          connectionCount={connCount}
                          extractionLabel={extractionLabel}
                        />
                      ) : (
                        <CanvasBlock
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          onRemove={() => onRemoveBlock(block.id)}
                          isRunning={isBlockRunning}
                          connectionCount={connCount}
                        />
                      )}
                      {!isLast && (
                        <ChainArrow
                          connected={connections.some((c) => c.from === block.id)}
                          running={isRunning}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Unchained blocks (placed but not yet connected into chain) */}
                {(unchainedData.length > 0 || unchainedActions.length > 0) && (
                  <div className="flex gap-3 mt-6 flex-wrap justify-center">
                    {[...unchainedData, ...unchainedActions].map((block) => (
                      block.type === "data" ? (
                        <DataBlock
                          key={block.id}
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          onRemove={() => onRemoveBlock(block.id)}
                          isRunning={false}
                          connectionCount={0}
                        />
                      ) : (
                        <CanvasBlock
                          key={block.id}
                          block={block}
                          isSelected={selectedBlockId === block.id}
                          onSelect={() => onSelectBlock(block.id)}
                          onRemove={() => onRemoveBlock(block.id)}
                          isRunning={false}
                        />
                      )
                    ))}
                  </div>
                )}

                {/* Connection hint */}
                {!allChained && blocks.length >= 2 && (
                  <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-[11px] text-muted-foreground font-display mt-3"
                  >
                    Click two blocks in sequence to connect them
                  </motion.p>
                )}
                {allChained && (
                  <span className="text-[10px] text-success font-display font-semibold mt-2">
                    Full chain connected ✓
                  </span>
                )}
              </>
            );
          })()}
        </div>
      ) : layoutType === "simple" ? (
        /* ---- Level 1: Simple linear flow ---- */
        <div className="flex flex-col items-center">
          {triggerBlock && (
            <CanvasBlock
              block={triggerBlock}
              isSelected={selectedBlockId === triggerBlock.id}
              onSelect={() => onSelectBlock(triggerBlock.id)}
              onRemove={() => onRemoveBlock(triggerBlock.id)}
              isRunning={isRunning}
              connectionCount={getConnectionCount(triggerBlock.id, connections)}
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
              connectionCount={getConnectionCount(actionBlocks[0].id, connections)}
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
          {triggerBlock && (
            <CanvasBlock
              block={triggerBlock}
              isSelected={selectedBlockId === triggerBlock.id}
              onSelect={() => onSelectBlock(triggerBlock.id)}
              onRemove={() => onRemoveBlock(triggerBlock.id)}
              isRunning={isRunning}
              connectionCount={getConnectionCount(triggerBlock.id, connections)}
            />
          )}

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

          {triggerBlock && conditionBlock && !connections.some((c) => c.from === triggerBlock.id) && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[11px] text-muted-foreground font-display mt-1"
            >
              Click trigger, then condition to connect
            </motion.p>
          )}

          {(yesAction || noAction || (actionBlocks.length > 0 && conditionBlock)) && (
            <div className="flex gap-12 mt-1">
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
                      connectionCount={getConnectionCount(yesAction.id, connections)}
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
                      connectionCount={getConnectionCount(noAction.id, connections)}
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
