import { useState } from "react";
import { motion } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LEVEL_CODE_TRANSLATIONS } from "@/data/code-translations";

interface CodeViewPanelProps {
  levelId: number;
}

const TAB_CONFIG = [
  { key: "python", label: "Python", lang: "python", icon: "🐍" },
  { key: "javascript", label: "JavaScript", lang: "javascript", icon: "📜" },
  { key: "n8n", label: "n8n Workflow", lang: "json", icon: "⚡" },
  { key: "pseudocode", label: "Pseudocode", lang: "text", icon: "📝" },
] as const;

const CodeViewPanel = ({ levelId }: CodeViewPanelProps) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("python");

  const translations = LEVEL_CODE_TRANSLATIONS[levelId];
  if (!translations) return null;

  const handleCopy = () => {
    const code = translations[activeTab as keyof typeof translations];
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-xs font-display transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {TAB_CONFIG.map((tab) => (
          <TabsContent key={tab.key} value={tab.key} className="flex-1 m-0 overflow-auto">
            <SyntaxHighlighter
              language={tab.lang}
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
              {translations[tab.key as keyof typeof translations]}
            </SyntaxHighlighter>
          </TabsContent>
        ))}
      </Tabs>
    </motion.div>
  );
};

export default CodeViewPanel;
