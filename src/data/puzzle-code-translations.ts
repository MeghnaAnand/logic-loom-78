import type { Block, BlockType } from "@/data/challenges";

export type CodeLanguage = "python" | "javascript" | "n8n" | "pseudocode";

export const LANGUAGE_META: Record<CodeLanguage, { label: string; icon: string; color: string }> = {
  python: { label: "Python", icon: "🐍", color: "text-blue-400" },
  javascript: { label: "JavaScript", icon: "⚡", color: "text-yellow-400" },
  n8n: { label: "n8n", icon: "🔗", color: "text-purple-400" },
  pseudocode: { label: "Pseudocode", icon: "📝", color: "text-muted-foreground" },
};

/** Convert a kebab-case id to snake_case */
function toSnake(id: string): string {
  return id.replace(/-/g, "_");
}

/** Convert a kebab-case id to camelCase */
function toCamel(id: string): string {
  return id.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** Convert a block label to a clean function/variable name */
function toFuncName(label: string, style: "snake" | "camel"): string {
  const words = label.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/);
  if (style === "snake") return words.join("_");
  return words[0] + words.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join("");
}

const typeTemplates: Record<BlockType, Record<CodeLanguage, (block: Block, index: number) => string>> = {
  trigger: {
    python: (b) => `def on_${toFuncName(b.label, "snake")}(data):\n    """Trigger: ${b.label}"""\n    process(data)`,
    javascript: (b) => `// Trigger: ${b.label}\non${toCamel("on-" + b.label.replace(/\s/g, "-").toLowerCase())}((data) => {\n  process(data);\n});`,
    n8n: (b) => `{ "name": "${b.label}", "type": "n8n-nodes-base.trigger" }`,
    pseudocode: (b) => `WHEN ${b.label.toLowerCase()}`,
  },
  condition: {
    python: (b) => `if ${toFuncName(b.label, "snake")}(data):\n    # YES path\n    handle_yes(data)\nelse:\n    # NO path\n    handle_no(data)`,
    javascript: (b) => `if (${toCamel(toFuncName(b.label, "camel"))}(data)) {\n  // YES path\n  handleYes(data);\n} else {\n  // NO path\n  handleNo(data);\n}`,
    n8n: (b) => `{ "name": "IF", "type": "n8n-nodes-base.if",\n  "parameters": { "conditions": { "check": "${b.label}" } } }`,
    pseudocode: (b) => `IF ${b.label.toLowerCase()} THEN\n  ...\nELSE\n  ...\nEND IF`,
  },
  action: {
    python: (b) => `${toFuncName(b.label, "snake")}(data)`,
    javascript: (b) => `${toCamel(toFuncName(b.label, "camel"))}(data);`,
    n8n: (b) => `{ "name": "${b.label}", "type": "n8n-nodes-base.action" }`,
    pseudocode: (b) => `DO ${b.label.toLowerCase()}`,
  },
  data: {
    python: (b) => `extracted = extract_${toFuncName(b.label, "snake")}(data)`,
    javascript: (b) => `const extracted = ${toCamel("extract-" + toFuncName(b.label, "camel"))}(data);`,
    n8n: (b) => `{ "name": "${b.label}", "type": "n8n-nodes-base.set" }`,
    pseudocode: (b) => `EXTRACT ${b.label.toLowerCase()} FROM data`,
  },
  output: {
    python: (b) => `${toFuncName(b.label, "snake")}(result)`,
    javascript: (b) => `${toCamel(toFuncName(b.label, "camel"))}(result);`,
    n8n: (b) => `{ "name": "${b.label}", "type": "n8n-nodes-base.output" }`,
    pseudocode: (b) => `OUTPUT ${b.label.toLowerCase()}`,
  },
};

/** Get a code snippet for a single block in the selected language */
export function getBlockCode(block: Block, language: CodeLanguage, index: number): string {
  return typeTemplates[block.type]?.[language]?.(block, index) ?? `// ${block.label}`;
}

/** Generate the full automation code for an ordered list of blocks */
export function getFullCode(blocks: Block[], language: CodeLanguage): string {
  const header: Record<CodeLanguage, string> = {
    python: `# Automation Flow\n# Generated from AutoFlow Puzzles\n`,
    javascript: `// Automation Flow\n// Generated from AutoFlow Puzzles\n`,
    n8n: `// n8n Workflow JSON\n`,
    pseudocode: `// Automation Flow — Pseudocode\n`,
  };

  const snippets = blocks.map((b, i) => getBlockCode(b, language, i));

  if (language === "n8n") {
    return `${header[language]}{\n  "nodes": [\n    ${snippets.join(",\n    ")}\n  ]\n}`;
  }

  if (language === "pseudocode") {
    return `${header[language]}${snippets.join("\n")}`;
  }

  return `${header[language]}\n${snippets.join("\n\n")}`;
}
