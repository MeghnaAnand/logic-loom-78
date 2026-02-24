import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Download, LayoutGrid, ArrowLeft } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LEVEL_CODE_TRANSLATIONS } from "@/data/code-translations";

interface CodeViewPanelProps {
  levelId: number;
}

const TAB_CONFIG = [
  { key: "python", label: "Python", lang: "python", icon: "🐍", ext: ".py" },
  { key: "javascript", label: "JavaScript", lang: "javascript", icon: "📜", ext: ".js" },
  { key: "n8n", label: "n8n Workflow", lang: "json", icon: "⚡", ext: ".json" },
  { key: "pseudocode", label: "Pseudocode", lang: "text", icon: "📝", ext: ".txt" },
] as const;

const CONCEPT_TOOLTIPS: Record<string, string> = {
  TRIGGER: "This is how you detect when something happens — the starting point of every automation",
  CONDITION: "This is how you make decisions in code — routing data down different paths",
  ACTION: "This is how you execute a task — the end result of your automation",
  "DATA EXTRACTION": "This is how you pull structured data from messy input — turning chaos into order",
};

const CodeBlock = ({ code, lang }: { code: string; lang: string }) => (
  <SyntaxHighlighter
    language={lang}
    style={oneDark}
    customStyle={{
      margin: 0,
      padding: "1.25rem",
      background: "transparent",
      fontSize: "0.8rem",
      lineHeight: "1.6",
      minHeight: "100%",
    }}
    showLineNumbers
    lineNumberStyle={{ color: "rgba(255,255,255,0.15)", fontSize: "0.7rem" }}
    wrapLongLines
  >
    {code}
  </SyntaxHighlighter>
);

const CodeViewPanel = ({ levelId }: CodeViewPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("python");
  const [compareMode, setCompareMode] = useState(false);

  const translations = LEVEL_CODE_TRANSLATIONS[levelId];
  if (!translations) return null;

  const handleCopy = () => {
    const code = translations[activeTab as keyof typeof translations];
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const tab = TAB_CONFIG.find((t) => t.key === activeTab);
    if (!tab) return;
    const code = translations[activeTab as keyof typeof translations];
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `automation-level-${levelId}${tab.ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Tooltip annotations for concept keywords
  const renderConceptTooltips = () => {
    const activeCode = translations[activeTab as keyof typeof translations];
    const concepts = Object.keys(CONCEPT_TOOLTIPS).filter((c) =>
      activeCode.toUpperCase().includes(c)
    );
    if (concepts.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 px-4 py-2 border-t border-white/5">
        {concepts.map((concept) => (
          <TooltipProvider key={concept} delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold bg-white/5 text-white/60 hover:text-white/90 px-2 py-0.5 rounded-md cursor-help transition-colors">
                  💡 {concept}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[250px] text-xs">
                {CONCEPT_TOOLTIPS[concept]}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    );
  };

  if (compareMode) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col bg-[#282c34] rounded-2xl overflow-hidden border border-border shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-white/5">
          <span className="text-xs font-display font-bold text-white/70">Compare All Languages</span>
          <button
            onClick={() => setCompareMode(false)}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs font-display transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tabs
          </button>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-px bg-white/5 overflow-auto">
          {TAB_CONFIG.map((tab) => (
            <div key={tab.key} className="bg-[#282c34] flex flex-col min-h-0">
              <div className="px-3 py-1.5 bg-[#21252b] text-[10px] font-display font-bold text-white/50 border-b border-white/5 flex items-center gap-1.5">
                <span>{tab.icon}</span> {tab.label}
              </div>
              <div className="flex-1 overflow-auto">
                <SyntaxHighlighter
                  language={tab.lang}
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    padding: "0.75rem",
                    background: "transparent",
                    fontSize: "0.65rem",
                    lineHeight: "1.5",
                  }}
                  wrapLongLines
                >
                  {translations[tab.key as keyof typeof translations]}
                </SyntaxHighlighter>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col bg-[#282c34] rounded-2xl overflow-hidden border border-border shadow-2xl"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-white/5">
          <TabsList className="bg-transparent gap-1 h-auto p-0">
            {TAB_CONFIG.map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50 hover:text-white/80 rounded-lg px-3 py-1.5 text-xs font-display font-bold transition-all gap-1.5"
              >
                <span>{tab.icon}</span>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="flex items-center gap-1">
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setCompareMode(true)}
                    className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs font-display transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Compare all languages</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs font-display transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Download file</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs font-display transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="flex-1 m-0 overflow-auto">
            <CodeBlock code={translations[tab.key as keyof typeof translations]} lang={tab.lang} />
          </TabsContent>
        ))}

        {renderConceptTooltips()}
      </Tabs>
    </motion.div>
  );
};

export default CodeViewPanel;
