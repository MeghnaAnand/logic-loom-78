import { useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";
import BlockLibrary from "@/components/automation-mind/BlockLibrary";
import GameCanvas from "@/components/automation-mind/GameCanvas";
import CodeViewPanel from "@/components/automation-mind/CodeViewPanel";
import InstructionPanel from "@/components/automation-mind/InstructionPanel";
import { playDing, playError, playWhoosh } from "@/lib/sounds";
import { LEVELS, type GameBlock, type Connection } from "@/data/automation-levels";

const AutomationMind = () => {
  const navigate = useNavigate();
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [canvasBlocks, setCanvasBlocks] = useState<GameBlock[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{ blockId: string; branch?: "yes" | "no" } | null>(null);
  const [testingPhase, setTestingPhase] = useState<"idle" | "loading" | "running" | "success" | "failure">("idle");
  const [currentTestItem, setCurrentTestItem] = useState(0);
  const [currentExtractionStep, setCurrentExtractionStep] = useState<number | undefined>(undefined);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [timeTaken, setTimeTaken] = useState<string | undefined>(undefined);
  const [codeView, setCodeView] = useState(false);
  const levelStartRef = useRef<number>(Date.now());

  const level = LEVELS[currentLevelIndex];

  const resetState = useCallback(() => {
    setCanvasBlocks([]);
    setConnections([]);
    setSelectedBlockId(null);
    setConnectingFrom(null);
    setTestingPhase("idle");
    setCurrentTestItem(0);
    setCurrentExtractionStep(undefined);
    setTimeTaken(undefined);
    setCodeView(false);
    levelStartRef.current = Date.now();
  }, []);

  const addBlock = useCallback((block: GameBlock) => {
    setCanvasBlocks((prev) => [...prev, block]);
    setTestingPhase("idle");
  }, []);

  const removeBlock = useCallback((id: string) => {
    setCanvasBlocks((prev) => prev.filter((b) => b.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    setSelectedBlockId(null);
    setConnectingFrom(null);
    setTestingPhase("idle");
  }, []);

  /* ---- Connection logic ---- */
  const selectBlock = useCallback((id: string) => {
    // If we're waiting for a branch target, connect to this block
    if (connectingFrom) {
      const targetBlock = canvasBlocks.find((b) => b.id === id);
      if (targetBlock && targetBlock.type === "action") {
        // Check if this branch already has a connection
        setConnections((prev) => {
          const filtered = prev.filter(
            (c) => !(c.from === connectingFrom.blockId && c.branch === connectingFrom.branch)
          );
          return [...filtered, { from: connectingFrom.blockId, to: id, branch: connectingFrom.branch }];
        });
        playWhoosh();
      }
      setConnectingFrom(null);
      setSelectedBlockId(null);
      setTestingPhase("idle");
      return;
    }

    // Simple connection: first click selects, second click connects
    if (!selectedBlockId) {
      setSelectedBlockId(id);
    } else if (selectedBlockId === id) {
      setSelectedBlockId(null);
    } else {
      const first = canvasBlocks.find((b) => b.id === selectedBlockId);
      const second = canvasBlocks.find((b) => b.id === id);
      if (first && second) {
        // Determine if this is a valid connection pair
        const canConnect = (from: GameBlock, to: GameBlock): boolean => {
          // Chain layout: trigger→data, data→data, data→action, trigger→action
          if (level.layout === "chain") {
            if (from.type === "trigger" && (to.type === "data" || to.type === "action")) return true;
            if (from.type === "data" && (to.type === "data" || to.type === "action")) return true;
            return false;
          }
          // Branch layout
          if (from.type === "trigger" && (to.type === "action" || to.type === "condition")) return true;
          return false;
        };

        if (canConnect(first, second)) {
          setConnections((prev) => {
            // Remove existing connection from this source (non-branch)
            const filtered = prev.filter((c) => c.from !== first.id || c.branch);
            return [...filtered, { from: first.id, to: second.id }];
          });
          playWhoosh();
        } else if (canConnect(second, first)) {
          setConnections((prev) => {
            const filtered = prev.filter((c) => c.from !== second.id || c.branch);
            return [...filtered, { from: second.id, to: first.id }];
          });
          playWhoosh();
        }
      }
      setSelectedBlockId(null);
      setTestingPhase("idle");
    }
  }, [selectedBlockId, connectingFrom, canvasBlocks, level]);

  const connectBranch = useCallback((blockId: string, branch: "yes" | "no") => {
    setConnectingFrom({ blockId, branch });
    setSelectedBlockId(null);
  }, []);

  /* ---- Validation ---- */
  const hasMinBlocks = (() => {
    const t = canvasBlocks.filter((b) => b.type === "trigger").length >= 1;
    const a = canvasBlocks.filter((b) => b.type === "action").length >= level.maxActions;
    const c = level.maxConditions === 0 || canvasBlocks.filter((b) => b.type === "condition").length >= 1;
    const d = (level.maxData ?? 0) === 0 || canvasBlocks.filter((b) => b.type === "data").length >= (level.maxData ?? 0);
    return t && a && c && d;
  })();

  const isFullyConnected = (() => {
    if (level.layout === "chain") {
      // Need exactly chainOrder.length - 1 connections forming the chain
      const expectedCount = (level.chainOrder?.length ?? 1) - 1;
      return connections.filter((c) => !c.branch).length >= expectedCount;
    }
    if (level.maxConditions === 0) {
      return connections.some((c) => !c.branch);
    }
    const hasTriggerConn = connections.some((c) => !c.branch);
    const hasYes = connections.some((c) => c.branch === "yes");
    const hasNo = connections.some((c) => c.branch === "no");
    return hasTriggerConn && hasYes && hasNo;
  })();

  const runTestAnimation = useCallback(() => {
    setTestingPhase("running");
    setCurrentTestItem(0);
    setCurrentExtractionStep(undefined);

    const total = level.testData.length;
    const hasExtractions = level.testData[0]?.extractions && level.testData[0].extractions.length > 0;
    const extractionCount = hasExtractions ? (level.testData[0].extractions?.length ?? 0) : 0;
    const itemDuration = hasExtractions ? (extractionCount * 400 + 300) : 500;

    for (let i = 0; i < total; i++) {
      setTimeout(() => {
        setCurrentTestItem(i);
        setCurrentExtractionStep(undefined);

        // Step through extractions for chain levels
        if (hasExtractions) {
          for (let e = 0; e < extractionCount; e++) {
            setTimeout(() => setCurrentExtractionStep(e), e * 400 + 100);
          }
        }

        if (i === total - 1) {
          setTimeout(() => {
            setTestingPhase("success");
            setCurrentExtractionStep(undefined);
            // Calculate time taken
            const elapsed = Math.floor((Date.now() - levelStartRef.current) / 1000);
            const mins = Math.floor(elapsed / 60);
            const secs = elapsed % 60;
            setTimeTaken(`${mins}:${secs.toString().padStart(2, "0")}`);
            playDing();
            const particleCount = level.id === 2 ? 250 : 150;
            confetti({ particleCount, spread: 100, origin: { y: 0.6 } });
            if (level.id === 2) {
              setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.2, y: 0.7 } }), 300);
              setTimeout(() => confetti({ particleCount: 80, spread: 60, origin: { x: 0.8, y: 0.7 } }), 500);
            }
            setCompletedLevels((prev) => new Set([...prev, currentLevelIndex]));
          }, itemDuration);
        }
      }, i * itemDuration);
    }
  }, [level, currentLevelIndex]);

  const runTest = useCallback(() => {
    if (!isFullyConnected) return;

    setTestingPhase("loading");
    setCurrentTestItem(0);
    setCurrentExtractionStep(undefined);

    setTimeout(() => {
      const isCorrect = level.validate(connections, canvasBlocks);

      if (!isCorrect) {
        setTestingPhase("failure");
        playError();
        return;
      }

      runTestAnimation();
    }, 2000);
  }, [isFullyConnected, connections, canvasBlocks, level, runTestAnimation]);

  const replayTest = useCallback(() => {
    runTestAnimation();
  }, [runTestAnimation]);

  const goToNextLevel = useCallback(() => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(currentLevelIndex + 1);
      resetState();
    }
  }, [currentLevelIndex, resetState]);

  const isBusy = testingPhase === "loading" || testingPhase === "running";

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-2.5 flex items-center gap-3 bg-card shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 hover:scale-105 transition-transform">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <h1 className="font-display font-bold text-foreground">AutomationMind</h1>
        <div className="flex items-center gap-1.5 ml-2">
          {LEVELS.map((l, i) => (
            <button
              key={l.id}
              onClick={() => {
                setCurrentLevelIndex(i);
                resetState();
              }}
              disabled={false}
              className={`
                w-7 h-7 rounded-lg text-xs font-bold font-display transition-all
                ${currentLevelIndex === i
                  ? "bg-primary text-primary-foreground"
                  : completedLevels.has(i)
                    ? "bg-success text-success-foreground"
                    : "bg-muted text-muted-foreground"
                }
              `}
            >
              {completedLevels.has(i) ? "✓" : i + 1}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 flex min-h-0">
        <BlockLibrary level={level} onAddBlock={addBlock} canvasBlocks={canvasBlocks} />
        {codeView && testingPhase === "success" ? (
          <div className="flex-1 p-4 min-h-0 flex">
            <CodeViewPanel levelId={level.id} />
          </div>
        ) : (
          <GameCanvas
            level={level}
            blocks={canvasBlocks}
            connections={connections}
            selectedBlockId={selectedBlockId}
            connectingFrom={connectingFrom}
            onSelectBlock={selectBlock}
            onConnectBranch={connectBranch}
            onRemoveBlock={removeBlock}
            testingPhase={testingPhase}
            currentTestItem={currentTestItem}
            currentExtractionStep={currentExtractionStep}
          />
        )}
        <InstructionPanel
          level={level}
          testingPhase={testingPhase}
          currentTestItem={currentTestItem}
          onTest={runTest}
          onReset={resetState}
          onNextLevel={goToNextLevel}
          onReplay={level.layout === "chain" ? replayTest : undefined}
          hasMinBlocks={hasMinBlocks}
          isFullyConnected={isFullyConnected}
          isBusy={isBusy}
          currentLevelIndex={currentLevelIndex}
          totalLevels={LEVELS.length}
          completedLevels={completedLevels}
          timeTaken={timeTaken}
          codeView={codeView}
          onToggleCodeView={() => setCodeView((v) => !v)}
        />
      </div>
    </div>
  );
};

export default AutomationMind;
