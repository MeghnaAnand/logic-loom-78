import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { GameBlock, Connection } from "@/data/automation-levels";

interface SandboxCanvasProps {
  blocks: GameBlock[];
  connections: Connection[];
  selectedBlockId: string | null;
  connectingFrom: { blockId: string; branch?: "yes" | "no" } | null;
  onSelectBlock: (id: string) => void;
  onConnectBranch: (blockId: string, branch: "yes" | "no") => void;
  onRemoveBlock: (id: string) => void;
}

const bgMap: Record<string, string> = {
  trigger: "bg-am-trigger text-am-trigger-foreground",
  action: "bg-am-action text-am-action-foreground",
  condition: "bg-am-condition text-am-condition-foreground",
  data: "bg-am-data text-am-data-foreground",
};

const typeLabels: Record<string, string> = {
  trigger: "Trigger",
  action: "Action",
  condition: "Condition",
  data: "Data Op",
};

const getConnectionCount = (blockId: string, connections: Connection[]) =>
  connections.filter((c) => c.from === blockId || c.to === blockId).length;

/* ---- Block component ---- */
const SandboxBlock = ({
  block,
  isSelected,
  onSelect,
  onRemove,
  connectionCount,
  isCondition,
  connections,
  connectingFrom,
  onConnectYes,
  onConnectNo,
}: {
  block: GameBlock;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  connectionCount: number;
  isCondition?: boolean;
  connections?: Connection[];
  connectingFrom?: { blockId: string; branch?: "yes" | "no" } | null;
  onConnectYes?: () => void;
  onConnectNo?: () => void;
}) => {
  const hasYes = connections?.some((c) => c.from === block.id && c.branch === "yes");
  const hasNo = connections?.some((c) => c.from === block.id && c.branch === "no");

  if (isCondition) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative flex flex-col items-center"
      >
        <div
          onClick={onSelect}
          className={`relative w-36 h-36 cursor-pointer select-none ${isSelected ? "scale-105" : ""}`}
        >
          <div className={`absolute inset-2 bg-am-condition shadow-lg rotate-45 rounded-xl transition-all ${isSelected ? "ring-4 ring-foreground/30 shadow-2xl" : "hover:shadow-xl"}`} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-am-condition-foreground z-10 pointer-events-none">
            <span className="text-xl mb-0.5">{block.icon}</span>
            <div className="text-[9px] uppercase tracking-wider opacity-70 font-display">Condition</div>
            <div className="text-xs font-bold font-display text-center leading-tight px-2">{block.label}</div>
          </div>
          {connectionCount > 0 && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-bold font-display px-1.5 py-0.5 rounded-full z-20">
              {connectionCount}
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.2, rotate: 90 }}
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="absolute -top-1 right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md z-20"
          >
            <X className="w-3 h-3" />
          </motion.button>
        </div>
        <div className="flex gap-4 -mt-1 z-10">
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={(e) => { e.stopPropagation(); onConnectYes?.(); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-display shadow-sm transition-all ${hasYes ? "bg-am-yes text-white" : "bg-am-yes/10 text-am-yes hover:bg-am-yes/30 border border-am-yes/30"}`}
          >
            ✓ YES {hasYes && "→"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            onClick={(e) => { e.stopPropagation(); onConnectNo?.(); }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold font-display shadow-sm transition-all ${hasNo ? "bg-am-no text-white" : "bg-am-no/10 text-am-no hover:bg-am-no/30 border border-am-no/30"}`}
          >
            ✗ NO {hasNo && "→"}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
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
          ${bgMap[block.type]} shadow-lg cursor-pointer select-none transition-all duration-200
          ${isSelected ? "ring-4 ring-foreground/30 scale-105 shadow-2xl" : "hover:shadow-xl"}
        `}
      >
        <span className="text-xl">{block.icon}</span>
        <div>
          <div className="text-[9px] uppercase tracking-wider opacity-70">{typeLabels[block.type]}</div>
          <div className="text-sm">{block.label}</div>
        </div>
        {connectionCount > 0 && (
          <span className="ml-auto text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full">
            {connectionCount}
          </span>
        )}
        <motion.button
          whileHover={{ scale: 1.2, rotate: 90 }}
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs shadow-md"
        >
          <X className="w-3 h-3" />
        </motion.button>
      </div>
    </motion.div>
  );
};

/* ---- Arrow ---- */
const Arrow = ({ color }: { color: string }) => (
  <svg width="40" height="36" viewBox="0 0 40 36">
    <motion.path
      d="M20 0 L20 28"
      fill="none"
      stroke={color}
      strokeWidth={2.5}
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ duration: 0.4 }}
    />
    <motion.polygon
      points="14,25 20,35 26,25"
      fill={color}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    />
  </svg>
);

/* ---- Main Canvas ---- */
const SandboxCanvas = ({
  blocks,
  connections,
  selectedBlockId,
  connectingFrom,
  onSelectBlock,
  onConnectBranch,
  onRemoveBlock,
}: SandboxCanvasProps) => {
  // Build a visual flow: group blocks by type, render connected chains
  const buildChain = (): GameBlock[] => {
    const trigger = blocks.find((b) => b.type === "trigger");
    if (!trigger) return [];
    const chain: GameBlock[] = [trigger];
    let currentId = trigger.id;
    const visited = new Set<string>([currentId]);
    while (true) {
      const next = connections.find((c) => c.from === currentId && !c.branch);
      if (!next) break;
      const nextBlock = blocks.find((b) => b.id === next.to);
      if (!nextBlock || visited.has(nextBlock.id)) break;
      chain.push(nextBlock);
      visited.add(nextBlock.id);
      currentId = nextBlock.id;
    }
    return chain;
  };

  const chain = buildChain();
  const chainIds = new Set(chain.map((b) => b.id));
  const unchained = blocks.filter((b) => !chainIds.has(b.id));

  // Find branch connections
  const yesConns = connections.filter((c) => c.branch === "yes");
  const noConns = connections.filter((c) => c.branch === "no");
  const branchTargetIds = new Set([...yesConns.map((c) => c.to), ...noConns.map((c) => c.to)]);

  return (
    <div className="flex-1 bg-am-canvas workspace-grid flex flex-col items-center justify-center p-8 relative overflow-auto">
      {/* Connecting banner */}
      <AnimatePresence>
        {connectingFrom && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full font-display font-bold text-sm shadow-lg text-white"
            style={{
              backgroundColor: connectingFrom.branch === "yes" ? "hsl(var(--am-yes))" : connectingFrom.branch === "no" ? "hsl(var(--am-no))" : "hsl(var(--foreground) / 0.6)",
            }}
          >
            {connectingFrom.branch === "yes" ? "🟢 Click a block for YES path" : connectingFrom.branch === "no" ? "🔴 Click a block for NO path" : "Click a block to connect"}
          </motion.div>
        )}
      </AnimatePresence>

      {blocks.length === 0 ? (
        <motion.div
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-am-canvas-foreground/40 font-display text-center"
        >
          <div className="text-4xl mb-3">🏗️</div>
          <div className="text-lg font-bold">Your canvas is empty</div>
          <div className="text-sm mt-1">Click blocks from the library to start building</div>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center gap-1">
          {/* Render chain */}
          {chain.map((block, i) => {
            const isLast = i === chain.length - 1;
            const connCount = getConnectionCount(block.id, connections);
            const isCondition = block.type === "condition";

            // For conditions, render branch targets below
            const yesConn = yesConns.find((c) => c.from === block.id);
            const noConn = noConns.find((c) => c.from === block.id);
            const yesTarget = yesConn ? blocks.find((b) => b.id === yesConn.to) : null;
            const noTarget = noConn ? blocks.find((b) => b.id === noConn.to) : null;

            return (
              <div key={block.id} className="flex flex-col items-center">
                <SandboxBlock
                  block={block}
                  isSelected={selectedBlockId === block.id}
                  onSelect={() => onSelectBlock(block.id)}
                  onRemove={() => onRemoveBlock(block.id)}
                  connectionCount={connCount}
                  isCondition={isCondition}
                  connections={connections}
                  connectingFrom={connectingFrom}
                  onConnectYes={() => onConnectBranch(block.id, "yes")}
                  onConnectNo={() => onConnectBranch(block.id, "no")}
                />
                {/* Branch targets */}
                {isCondition && (yesTarget || noTarget) && (
                  <div className="flex gap-8 mt-1">
                    {yesTarget && (
                      <div className="flex flex-col items-center">
                        <Arrow color="hsl(var(--am-yes))" />
                        <SandboxBlock
                          block={yesTarget}
                          isSelected={selectedBlockId === yesTarget.id}
                          onSelect={() => onSelectBlock(yesTarget.id)}
                          onRemove={() => onRemoveBlock(yesTarget.id)}
                          connectionCount={getConnectionCount(yesTarget.id, connections)}
                        />
                      </div>
                    )}
                    {noTarget && (
                      <div className="flex flex-col items-center">
                        <Arrow color="hsl(var(--am-no))" />
                        <SandboxBlock
                          block={noTarget}
                          isSelected={selectedBlockId === noTarget.id}
                          onSelect={() => onSelectBlock(noTarget.id)}
                          onRemove={() => onRemoveBlock(noTarget.id)}
                          connectionCount={getConnectionCount(noTarget.id, connections)}
                        />
                      </div>
                    )}
                  </div>
                )}
                {!isLast && !isCondition && (
                  <Arrow color={connections.some((c) => c.from === block.id && c.to === chain[i + 1]?.id) ? "hsl(var(--foreground) / 0.3)" : "hsl(var(--border))"} />
                )}
              </div>
            );
          })}

          {/* Unchained blocks */}
          {unchained.filter((b) => !branchTargetIds.has(b.id)).length > 0 && (
            <div className="flex gap-3 mt-6 flex-wrap justify-center">
              {unchained
                .filter((b) => !branchTargetIds.has(b.id))
                .map((block) => (
                  <SandboxBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    onSelect={() => onSelectBlock(block.id)}
                    onRemove={() => onRemoveBlock(block.id)}
                    connectionCount={getConnectionCount(block.id, connections)}
                    isCondition={block.type === "condition"}
                    connections={connections}
                    connectingFrom={connectingFrom}
                    onConnectYes={() => onConnectBranch(block.id, "yes")}
                    onConnectNo={() => onConnectBranch(block.id, "no")}
                  />
                ))}
            </div>
          )}

          {/* Hint */}
          {blocks.length >= 2 && connections.length === 0 && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[11px] text-muted-foreground font-display mt-3"
            >
              Click two blocks in sequence to connect them
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
};

export default SandboxCanvas;
