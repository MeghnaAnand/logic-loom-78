import { motion } from "framer-motion";
import { playWhoosh } from "@/lib/sounds";

export interface GameBlock {
  id: string;
  type: "trigger" | "action";
  label: string;
  icon: string;
}

export const AVAILABLE_BLOCKS: GameBlock[] = [
  { id: "form-submitted", type: "trigger", label: "Form Submitted", icon: "📝" },
  { id: "email-received", type: "trigger", label: "Email Received", icon: "📧" },
  { id: "schedule-daily", type: "trigger", label: "Schedule: Daily", icon: "⏰" },
  { id: "save-spreadsheet", type: "action", label: "Save to Spreadsheet", icon: "📊" },
  { id: "save-database", type: "action", label: "Save to Database", icon: "💾" },
  { id: "send-email", type: "action", label: "Send Email", icon: "📤" },
];

interface BlockLibraryProps {
  onDragBlock: (block: GameBlock) => void;
  canvasBlocks: GameBlock[];
}

const BlockLibrary = ({ onDragBlock, canvasBlocks }: BlockLibraryProps) => {
  const hasTrigger = canvasBlocks.some((b) => b.type === "trigger");
  const hasAction = canvasBlocks.some((b) => b.type === "action");

  const triggers = AVAILABLE_BLOCKS.filter((b) => b.type === "trigger");
  const actions = AVAILABLE_BLOCKS.filter((b) => b.type === "action");

  const handleClick = (block: GameBlock, disabled: boolean) => {
    if (disabled) return;
    playWhoosh();
    onDragBlock(block);
  };

  return (
    <div className="w-64 border-r border-border bg-card p-4 flex flex-col gap-5 overflow-y-auto">
      <div>
        <h2 className="font-display font-bold text-sm text-card-foreground mb-1">🧩 Block Library</h2>
        <p className="text-xs text-muted-foreground">Click a block to add it to the canvas</p>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          ⚡ Triggers
        </h3>
        <div className="flex flex-col gap-2">
          {triggers.map((block) => {
            const disabled = hasTrigger;
            return (
              <motion.button
                key={block.id}
                whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
                whileTap={disabled ? {} : { scale: 0.95 }}
                onClick={() => handleClick(block, disabled)}
                disabled={disabled}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold font-display
                  transition-all select-none
                  bg-am-trigger text-am-trigger-foreground
                  ${disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer shadow-md hover:shadow-xl hover:brightness-105"
                  }
                `}
              >
                <span className="text-lg">{block.icon}</span>
                {block.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          🔧 Actions
        </h3>
        <div className="flex flex-col gap-2">
          {actions.map((block) => {
            const disabled = hasAction;
            return (
              <motion.button
                key={block.id}
                whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
                whileTap={disabled ? {} : { scale: 0.95 }}
                onClick={() => handleClick(block, disabled)}
                disabled={disabled}
                className={`
                  flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm font-semibold font-display
                  transition-all select-none
                  bg-am-action text-am-action-foreground
                  ${disabled
                    ? "opacity-40 cursor-not-allowed"
                    : "cursor-pointer shadow-md hover:shadow-xl hover:brightness-105"
                  }
                `}
              >
                <span className="text-lg">{block.icon}</span>
                {block.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {(hasTrigger || hasAction) && (
        <p className="text-[11px] text-muted-foreground italic">
          {hasTrigger && hasAction
            ? "Max blocks placed. Remove one to swap."
            : hasTrigger
              ? "Now add an action block!"
              : "Now add a trigger block!"}
        </p>
      )}
    </div>
  );
};

export default BlockLibrary;
