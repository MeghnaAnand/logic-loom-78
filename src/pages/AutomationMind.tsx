import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import BlockLibrary, { type GameBlock } from "@/components/automation-mind/BlockLibrary";
import GameCanvas from "@/components/automation-mind/GameCanvas";
import InstructionPanel from "@/components/automation-mind/InstructionPanel";

const AutomationMind = () => {
  const navigate = useNavigate();
  const [canvasBlocks, setCanvasBlocks] = useState<GameBlock[]>([]);
  const [connection, setConnection] = useState<{ from: string; to: string } | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [testingPhase, setTestingPhase] = useState<"idle" | "running" | "success" | "failure">("idle");
  const [currentTestItem, setCurrentTestItem] = useState(0);

  const addBlock = useCallback((block: GameBlock) => {
    setCanvasBlocks((prev) => {
      if (block.type === "trigger" && prev.some((b) => b.type === "trigger")) return prev;
      if (block.type === "action" && prev.some((b) => b.type === "action")) return prev;
      return [...prev, block];
    });
    setTestingPhase("idle");
  }, []);

  const removeBlock = useCallback((id: string) => {
    setCanvasBlocks((prev) => prev.filter((b) => b.id !== id));
    setConnection(null);
    setSelectedBlockId(null);
    setTestingPhase("idle");
  }, []);

  const selectBlock = useCallback((id: string) => {
    if (!selectedBlockId) {
      setSelectedBlockId(id);
    } else if (selectedBlockId === id) {
      setSelectedBlockId(null);
    } else {
      // Connect the two blocks (trigger → action order)
      const blocks = canvasBlocks;
      const first = blocks.find((b) => b.id === selectedBlockId);
      const second = blocks.find((b) => b.id === id);
      if (first && second && first.type !== second.type) {
        const trigger = first.type === "trigger" ? first : second;
        const action = first.type === "action" ? first : second;
        setConnection({ from: trigger.id, to: action.id });
      }
      setSelectedBlockId(null);
    }
  }, [selectedBlockId, canvasBlocks]);

  const runTest = useCallback(() => {
    if (!connection) return;
    const trigger = canvasBlocks.find((b) => b.id === connection.from);
    const action = canvasBlocks.find((b) => b.id === connection.to);

    const isCorrect = trigger?.id === "form-submitted" && action?.id === "save-spreadsheet";

    if (!isCorrect) {
      setTestingPhase("failure");
      return;
    }

    setTestingPhase("running");
    setCurrentTestItem(0);

    // Animate through 5 test items
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        setCurrentTestItem(i);
        if (i === 4) {
          setTimeout(() => {
            setTestingPhase("success");
            confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
          }, 800);
        }
      }, i * 600);
    }
  }, [connection, canvasBlocks]);

  const reset = useCallback(() => {
    setCanvasBlocks([]);
    setConnection(null);
    setSelectedBlockId(null);
    setTestingPhase("idle");
    setCurrentTestItem(0);
  }, []);

  const hasBothBlocks = canvasBlocks.some((b) => b.type === "trigger") && canvasBlocks.some((b) => b.type === "action");

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-4 py-2.5 flex items-center gap-3 bg-card shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <h1 className="font-display font-bold text-foreground">AutomationMind</h1>
        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full font-display">
          Level 1
        </span>
      </header>

      {/* Main game area */}
      <div className="flex-1 flex min-h-0">
        <BlockLibrary onDragBlock={addBlock} canvasBlocks={canvasBlocks} />
        <GameCanvas
          blocks={canvasBlocks}
          connection={connection}
          selectedBlockId={selectedBlockId}
          onSelectBlock={selectBlock}
          onRemoveBlock={removeBlock}
          testingPhase={testingPhase}
          currentTestItem={currentTestItem}
        />
        <InstructionPanel
          testingPhase={testingPhase}
          currentTestItem={currentTestItem}
          onTest={runTest}
          onReset={reset}
          onNextLevel={() => navigate("/play")}
          hasBlocks={hasBothBlocks}
          isConnected={!!connection}
        />
      </div>
    </div>
  );
};

export default AutomationMind;
