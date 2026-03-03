import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";
import { playWhoosh } from "@/lib/sounds";
import { SANDBOX_BLOCKS, type SandboxBlock } from "@/data/sandbox-blocks";
import type { GameBlock } from "@/data/automation-levels";

interface SandboxBlockLibraryProps {
  canvasBlocks: GameBlock[];
  onAddBlock: (block: GameBlock) => void;
}

const bgMap: Record<string, string> = {
  trigger: "bg-am-trigger text-am-trigger-foreground",
  action: "bg-am-action text-am-action-foreground",
  condition: "bg-am-condition text-am-condition-foreground",
  data: "bg-am-data text-am-data-foreground",
};

const categoryEmojis: Record<string, string> = {
  Triggers: "⚡",
  Conditions: "🔀",
  "Data Ops": "🔬",
  Actions: "🔧",
};

const SandboxBlockLibrary = ({ canvasBlocks, onAddBlock }: SandboxBlockLibraryProps) => {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return SANDBOX_BLOCKS;
    const q = search.toLowerCase();
    return SANDBOX_BLOCKS.filter(
      (b) => b.label.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups: Record<string, SandboxBlock[]> = {};
    filtered.forEach((b) => {
      if (!groups[b.category]) groups[b.category] = [];
      groups[b.category].push(b);
    });
    return groups;
  }, [filtered]);

  const isOnCanvas = (id: string) => canvasBlocks.some((b) => b.id === id);

  const handleClick = (block: SandboxBlock) => {
    if (isOnCanvas(block.id)) return;
    playWhoosh();
    onAddBlock({ id: block.id, type: block.type, label: block.label, icon: block.icon });
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="font-display font-bold text-sm text-card-foreground mb-1">🧩 Block Library</h2>
        <p className="text-xs text-muted-foreground mb-3">Click to add to canvas</p>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search blocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {Object.entries(grouped).map(([category, blocks]) => (
        <div key={category}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {categoryEmojis[category] || "📦"} {category}
          </h3>
          <div className="flex flex-col gap-1.5">
            {blocks.map((block) => {
              const placed = isOnCanvas(block.id);
              return (
                <motion.button
                  key={block.id}
                  whileHover={placed ? {} : { scale: 1.03, y: -1 }}
                  whileTap={placed ? {} : { scale: 0.97 }}
                  onClick={() => handleClick(block)}
                  disabled={placed}
                  className={`
                    flex items-center gap-2 px-2.5 py-2 rounded-lg text-left text-xs font-semibold font-display
                    transition-all select-none ${bgMap[block.type]}
                    ${placed
                      ? "opacity-35 cursor-not-allowed"
                      : "cursor-pointer shadow-sm hover:shadow-md hover:brightness-105"
                    }
                  `}
                >
                  <span className="text-base">{block.icon}</span>
                  <span className="truncate">{block.label}</span>
                  {placed && <span className="ml-auto text-[9px] opacity-60">✓</span>}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}

      <p className="text-[10px] text-muted-foreground italic mt-auto">
        {canvasBlocks.length} block{canvasBlocks.length !== 1 ? "s" : ""} on canvas
      </p>
    </div>
  );
};

export default SandboxBlockLibrary;
