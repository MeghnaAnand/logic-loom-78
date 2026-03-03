import { useState, useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playWhoosh } from "@/lib/sounds";
import SandboxBlockLibrary from "@/components/sandbox/SandboxBlockLibrary";
import SandboxCanvas from "@/components/sandbox/SandboxCanvas";
import ShareExportPanel from "@/components/sandbox/ShareExportPanel";
import type { GameBlock, Connection } from "@/data/automation-levels";

const BuildMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [canvasBlocks, setCanvasBlocks] = useState<GameBlock[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<{ blockId: string; branch?: "yes" | "no" } | null>(null);

  // Load shared workflow from URL
  useEffect(() => {
    const flow = searchParams.get("flow");
    if (flow) {
      try {
        const data = JSON.parse(atob(flow));
        if (data.blocks && data.connections) {
          setCanvasBlocks(data.blocks);
          setConnections(data.connections);
        }
      } catch {
        // Invalid flow data, ignore
      }
    }
  }, [searchParams]);

  const addBlock = useCallback((block: GameBlock) => {
    setCanvasBlocks((prev) => [...prev, block]);
  }, []);

  const removeBlock = useCallback((id: string) => {
    setCanvasBlocks((prev) => prev.filter((b) => b.id !== id));
    setConnections((prev) => prev.filter((c) => c.from !== id && c.to !== id));
    setSelectedBlockId(null);
    setConnectingFrom(null);
  }, []);

  const clearAll = useCallback(() => {
    setCanvasBlocks([]);
    setConnections([]);
    setSelectedBlockId(null);
    setConnectingFrom(null);
  }, []);

  /* ---- Connection logic (same as AutomationMind but without level constraints) ---- */
  const selectBlock = useCallback((id: string) => {
    if (connectingFrom) {
      const targetBlock = canvasBlocks.find((b) => b.id === id);
      if (targetBlock && targetBlock.id !== connectingFrom.blockId) {
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
      return;
    }

    if (!selectedBlockId) {
      setSelectedBlockId(id);
    } else if (selectedBlockId === id) {
      setSelectedBlockId(null);
    } else {
      const first = canvasBlocks.find((b) => b.id === selectedBlockId);
      const second = canvasBlocks.find((b) => b.id === id);
      if (first && second) {
        // Allow any connection in sandbox mode
        const canConnect = (from: GameBlock, to: GameBlock): boolean => {
          if (from.type === "trigger" && to.type !== "trigger") return true;
          if (from.type === "data" && (to.type === "data" || to.type === "action")) return true;
          if (from.type === "condition" && to.type !== "trigger") return true;
          return false;
        };

        if (canConnect(first, second)) {
          setConnections((prev) => {
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
    }
  }, [selectedBlockId, connectingFrom, canvasBlocks]);

  const connectBranch = useCallback((blockId: string, branch: "yes" | "no") => {
    setConnectingFrom({ blockId, branch });
    setSelectedBlockId(null);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-2.5 flex items-center gap-3 bg-card shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1 hover:scale-105 transition-transform">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="h-5 w-px bg-border" />
        <h1 className="font-display font-bold text-foreground">🏗️ Build Mode</h1>
        <span className="text-xs text-muted-foreground font-display">Free-form workflow builder</span>
        {canvasBlocks.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="ml-auto gap-1 text-muted-foreground hover:text-destructive text-xs">
            <Trash2 className="w-3.5 h-3.5" /> Clear All
          </Button>
        )}
      </header>

      <div className="flex-1 flex min-h-0">
        <SandboxBlockLibrary canvasBlocks={canvasBlocks} onAddBlock={addBlock} />
        <SandboxCanvas
          blocks={canvasBlocks}
          connections={connections}
          selectedBlockId={selectedBlockId}
          connectingFrom={connectingFrom}
          onSelectBlock={selectBlock}
          onConnectBranch={connectBranch}
          onRemoveBlock={removeBlock}
        />
        <ShareExportPanel blocks={canvasBlocks} connections={connections} />
      </div>
    </div>
  );
};

export default BuildMode;
