import { type BlockType } from "@/data/challenges";

interface PuzzleBlockProps {
  type: BlockType;
  label: string;
  icon?: string;
  isDragging?: boolean;
  isPlaced?: boolean;
}

const blockColors: Record<BlockType, string> = {
  trigger: "bg-block-trigger",
  action: "bg-block-action",
  condition: "bg-block-condition",
  data: "bg-block-data",
  output: "bg-block-output",
};

const blockLabels: Record<BlockType, string> = {
  trigger: "TRIGGER",
  action: "ACTION",
  condition: "IF/THEN",
  data: "DATA",
  output: "OUTPUT",
};

const PuzzleBlock = ({ type, label, icon, isDragging, isPlaced }: PuzzleBlockProps) => {
  return (
    <div
      className={`
        ${blockColors[type]} 
        rounded-lg px-4 py-3 
        text-primary-foreground font-display font-semibold text-sm
        select-none cursor-grab active:cursor-grabbing
        transition-all duration-200
        ${isDragging ? "shadow-2xl scale-105 opacity-90" : "shadow-md hover:shadow-lg hover:-translate-y-0.5"}
        ${isPlaced ? "ring-2 ring-success/50" : ""}
      `}
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        <div>
          <div className="text-[10px] uppercase tracking-wider opacity-75">{blockLabels[type]}</div>
          <div className="text-sm">{label}</div>
        </div>
      </div>
      {/* Connector notch */}
      <div className={`absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-3 ${blockColors[type]} rounded-b-md`} />
    </div>
  );
};

export default PuzzleBlock;
