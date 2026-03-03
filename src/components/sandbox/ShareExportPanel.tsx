import { useState } from "react";
import { Share2, Download, Copy, Check, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GameBlock, Connection } from "@/data/automation-levels";

interface ShareExportPanelProps {
  blocks: GameBlock[];
  connections: Connection[];
}

const ShareExportPanel = ({ blocks, connections }: ShareExportPanelProps) => {
  const [copied, setCopied] = useState(false);

  const workflowData = { blocks, connections, v: 1 };

  const generateShareUrl = () => {
    const encoded = btoa(JSON.stringify(workflowData));
    return `${window.location.origin}/build?flow=${encoded}`;
  };

  const handleCopyLink = async () => {
    if (blocks.length === 0) {
      toast.error("Add blocks to your canvas first");
      return;
    }
    const url = generateShareUrl();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportJSON = () => {
    if (blocks.length === 0) {
      toast.error("Add blocks to your canvas first");
      return;
    }
    const blob = new Blob([JSON.stringify(workflowData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "automation-workflow.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Workflow exported!");
  };

  const handleCopyJSON = async () => {
    if (blocks.length === 0) {
      toast.error("Add blocks to your canvas first");
      return;
    }
    await navigator.clipboard.writeText(JSON.stringify(workflowData, null, 2));
    toast.success("JSON copied to clipboard!");
  };

  // Build a text summary of the workflow
  const summary = blocks.length === 0 ? null : (() => {
    const triggers = blocks.filter((b) => b.type === "trigger");
    const conditions = blocks.filter((b) => b.type === "condition");
    const dataOps = blocks.filter((b) => b.type === "data");
    const actions = blocks.filter((b) => b.type === "action");
    return { triggers, conditions, dataOps, actions };
  })();

  return (
    <div className="w-72 border-l border-border bg-card p-4 flex flex-col gap-4 overflow-y-auto">
      <div>
        <h2 className="font-display font-bold text-sm text-card-foreground mb-1 flex items-center gap-1.5">
          <Share2 className="w-4 h-4" /> Share & Export
        </h2>
        <p className="text-xs text-muted-foreground">Share your workflow or export it</p>
      </div>

      {/* Workflow summary */}
      {summary && (
        <div className="bg-muted rounded-lg p-3 space-y-1.5">
          <h3 className="text-xs font-display font-semibold text-foreground">Workflow Summary</h3>
          {summary.triggers.length > 0 && (
            <div className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-am-trigger-foreground">⚡ {summary.triggers.length}</span> trigger{summary.triggers.length > 1 ? "s" : ""}
            </div>
          )}
          {summary.conditions.length > 0 && (
            <div className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-am-condition-foreground">🔀 {summary.conditions.length}</span> condition{summary.conditions.length > 1 ? "s" : ""}
            </div>
          )}
          {summary.dataOps.length > 0 && (
            <div className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-am-data-foreground">🔬 {summary.dataOps.length}</span> data op{summary.dataOps.length > 1 ? "s" : ""}
            </div>
          )}
          {summary.actions.length > 0 && (
            <div className="text-[11px] text-muted-foreground">
              <span className="font-semibold text-am-action-foreground">🔧 {summary.actions.length}</span> action{summary.actions.length > 1 ? "s" : ""}
            </div>
          )}
          <div className="text-[11px] text-muted-foreground pt-1 border-t border-border">
            {connections.length} connection{connections.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* Share actions */}
      <div className="space-y-2">
        <Button
          variant="default"
          size="sm"
          className="w-full gap-2 font-display"
          onClick={handleCopyLink}
          disabled={blocks.length === 0}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Link className="w-3.5 h-3.5" />}
          {copied ? "Link Copied!" : "Copy Share Link"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 font-display"
          onClick={handleExportJSON}
          disabled={blocks.length === 0}
        >
          <Download className="w-3.5 h-3.5" />
          Export JSON
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-2 font-display"
          onClick={handleCopyJSON}
          disabled={blocks.length === 0}
        >
          <Copy className="w-3.5 h-3.5" />
          Copy JSON
        </Button>
      </div>

      {/* Tips */}
      <div className="mt-auto bg-primary/5 rounded-lg p-3 border border-primary/10">
        <h3 className="text-xs font-display font-semibold text-primary mb-1">💡 Building Tips</h3>
        <ul className="text-[11px] text-muted-foreground space-y-1">
          <li>• Start with a <strong>trigger</strong> (what starts the workflow)</li>
          <li>• Add <strong>conditions</strong> for branching logic</li>
          <li>• Use <strong>data ops</strong> to transform data</li>
          <li>• End with <strong>actions</strong> (what happens)</li>
          <li>• Click two blocks to connect them</li>
        </ul>
      </div>
    </div>
  );
};

export default ShareExportPanel;
