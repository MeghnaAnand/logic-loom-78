import type { Block, BlockType } from "@/data/challenges";

export type CodeLanguage = "python" | "javascript" | "pseudocode";

export const LANGUAGE_META: Record<CodeLanguage, { label: string; icon: string; color: string }> = {
  python: { label: "Python", icon: "🐍", color: "text-blue-400" },
  javascript: { label: "JavaScript", icon: "⚡", color: "text-yellow-400" },
  pseudocode: { label: "Pseudocode", icon: "📝", color: "text-muted-foreground" },
};

/** Convert a block label to a clean function/variable name */
function toFuncName(label: string, style: "snake" | "camel"): string {
  const words = label.toLowerCase().replace(/[^a-z0-9\s]/g, "").trim().split(/\s+/);
  if (style === "snake") return words.join("_");
  return words[0] + words.slice(1).map(w => w[0].toUpperCase() + w.slice(1)).join("");
}

/*──────────────────────────────────────────────────────────────────────────────
 * PROGRESSIVE DISCLOSURE LEVELS
 *
 * Level 1 — Simple linear code (just function calls, no branching)
 * Level 2 — Introduces if/else branching for conditions
 * Level 3 — Sequential data operations with variables, transformations
 * Level 4 — Combines concepts: try/except, loops, error handling
 * Level 5 — Full production-style: async/await, logging, retries, classes
 *────────────────────────────────────────────────────────────────────────────*/

type CodeGen = (block: Block, index: number) => string;

/** Level 1: Simple linear calls — no branching, no error handling */
const level1: Record<BlockType, Record<CodeLanguage, CodeGen>> = {
  trigger: {
    python:     (b) => `# Start: ${b.label}\nstart()`,
    javascript: (b) => `// Start: ${b.label}\nstart();`,
    pseudocode: (b) => `WHEN ${b.label.toLowerCase()}`,
  },
  condition: {
    python:     (b) => `check_${toFuncName(b.label, "snake")}()`,
    javascript: (b) => `${toFuncName(b.label, "camel")}();`,
    pseudocode: (b) => `CHECK ${b.label.toLowerCase()}`,
  },
  action: {
    python:     (b) => `${toFuncName(b.label, "snake")}()`,
    javascript: (b) => `${toFuncName(b.label, "camel")}();`,
    pseudocode: (b) => `DO ${b.label.toLowerCase()}`,
  },
  data: {
    python:     (b) => `data = get_${toFuncName(b.label, "snake")}()`,
    javascript: (b) => `const data = ${toFuncName(b.label, "camel")}();`,
    pseudocode: (b) => `GET ${b.label.toLowerCase()}`,
  },
  output: {
    python:     (b) => `${toFuncName(b.label, "snake")}()`,
    javascript: (b) => `${toFuncName(b.label, "camel")}();`,
    pseudocode: (b) => `OUTPUT ${b.label.toLowerCase()}`,
  },
};

/** Level 2: Introduces if/else branching */
const level2: Record<BlockType, Record<CodeLanguage, CodeGen>> = {
  ...level1,
  condition: {
    python:     (b) => `if ${toFuncName(b.label, "snake")}(data):\n    handle_yes(data)\nelse:\n    handle_no(data)`,
    javascript: (b) => `if (${toFuncName(b.label, "camel")}(data)) {\n  handleYes(data);\n} else {\n  handleNo(data);\n}`,
    pseudocode: (b) => `IF ${b.label.toLowerCase()} THEN\n  YES → continue\nELSE\n  NO → alternate path\nEND IF`,
  },
};

/** Level 3: Data operations with variables & transformations */
const level3: Record<BlockType, Record<CodeLanguage, CodeGen>> = {
  ...level2,
  data: {
    python:     (b) => `raw = fetch_${toFuncName(b.label, "snake")}()\ndata = transform(raw)\nvalidate(data)`,
    javascript: (b) => `const raw = ${toFuncName(b.label, "camel")}();\nconst data = transform(raw);\nvalidate(data);`,
    pseudocode: (b) => `FETCH ${b.label.toLowerCase()}\nTRANSFORM raw data → structured data\nVALIDATE data integrity`,
  },
  action: {
    python:     (b) => `result = ${toFuncName(b.label, "snake")}(data)\nlog("Action complete", result)`,
    javascript: (b) => `const result = ${toFuncName(b.label, "camel")}(data);\nconsole.log("Action complete", result);`,
    pseudocode: (b) => `DO ${b.label.toLowerCase()} WITH data\nLOG result`,
  },
};

/** Level 4: Combines concepts — error handling, loops */
const level4: Record<BlockType, Record<CodeLanguage, CodeGen>> = {
  trigger: {
    python:     (b) => `def on_${toFuncName(b.label, "snake")}(event):\n    """Trigger: ${b.label}"""\n    for item in event.items:\n        process(item)`,
    javascript: (b) => `// Trigger: ${b.label}\non${toFuncName(b.label, "camel").replace(/^./, c => c.toUpperCase())}((event) => {\n  event.items.forEach(item => process(item));\n});`,
    pseudocode: (b) => `WHEN ${b.label.toLowerCase()}\n  FOR EACH item IN event\n    PROCESS item`,
  },
  condition: {
    python:     (b) => `if ${toFuncName(b.label, "snake")}(data):\n    handle_yes(data)\nelse:\n    log_skip(data)\n    handle_no(data)`,
    javascript: (b) => `if (${toFuncName(b.label, "camel")}(data)) {\n  handleYes(data);\n} else {\n  logSkip(data);\n  handleNo(data);\n}`,
    pseudocode: (b) => `IF ${b.label.toLowerCase()} THEN\n  YES → continue\nELSE\n  LOG skipped item\n  NO → alternate path\nEND IF`,
  },
  action: {
    python:     (b) => `try:\n    result = ${toFuncName(b.label, "snake")}(data)\nexcept Exception as e:\n    log_error(e)\n    result = fallback(data)`,
    javascript: (b) => `let result;\ntry {\n  result = ${toFuncName(b.label, "camel")}(data);\n} catch (err) {\n  logError(err);\n  result = fallback(data);\n}`,
    pseudocode: (b) => `TRY\n  DO ${b.label.toLowerCase()} WITH data\nON ERROR\n  LOG error\n  USE fallback`,
  },
  data: {
    python:     (b) => `raw = fetch_${toFuncName(b.label, "snake")}()\ndata = [transform(r) for r in raw]\nvalid = [d for d in data if validate(d)]`,
    javascript: (b) => `const raw = ${toFuncName(b.label, "camel")}();\nconst data = raw.map(r => transform(r));\nconst valid = data.filter(d => validate(d));`,
    pseudocode: (b) => `FETCH ${b.label.toLowerCase()}\nFOR EACH record\n  TRANSFORM record\n  IF valid → KEEP\nEND FOR`,
  },
  output: {
    python:     (b) => `try:\n    ${toFuncName(b.label, "snake")}(result)\n    log("Output sent successfully")\nexcept Exception as e:\n    retry(${toFuncName(b.label, "snake")}, result, retries=3)`,
    javascript: (b) => `try {\n  ${toFuncName(b.label, "camel")}(result);\n  console.log("Output sent successfully");\n} catch (err) {\n  retry(() => ${toFuncName(b.label, "camel")}(result), 3);\n}`,
    pseudocode: (b) => `TRY\n  OUTPUT ${b.label.toLowerCase()}\n  LOG success\nON ERROR\n  RETRY up to 3 times`,
  },
};

/** Level 5: Production-grade — async, classes, comprehensive */
const level5: Record<BlockType, Record<CodeLanguage, CodeGen>> = {
  trigger: {
    python:     (b) => `class ${toFuncName(b.label, "camel").replace(/^./, c => c.toUpperCase())}Trigger:\n    async def handle(self, event):\n        """${b.label}"""\n        async for item in event.stream():\n            await self.pipeline.process(item)`,
    javascript: (b) => `class ${toFuncName(b.label, "camel").replace(/^./, c => c.toUpperCase())}Trigger {\n  async handle(event) {\n    for await (const item of event.stream()) {\n      await this.pipeline.process(item);\n    }\n  }\n}`,
    pseudocode: (b) => `CLASS ${b.label} Trigger\n  ASYNC WHEN event received\n    FOR EACH item IN event stream\n      AWAIT process(item)\n    END FOR`,
  },
  condition: {
    python:     (b) => `async def evaluate_${toFuncName(b.label, "snake")}(data, context):\n    score = await compute_score(data)\n    if score > context.threshold:\n        await handle_yes(data, score)\n    else:\n        await handle_no(data, reason=f"score={score}")`,
    javascript: (b) => `async function evaluate${toFuncName(b.label, "camel").replace(/^./, c => c.toUpperCase())}(data, ctx) {\n  const score = await computeScore(data);\n  if (score > ctx.threshold) {\n    await handleYes(data, score);\n  } else {\n    await handleNo(data, \`score=\${score}\`);\n  }\n}`,
    pseudocode: (b) => `ASYNC EVALUATE ${b.label.toLowerCase()}\n  score ← AWAIT compute_score(data)\n  IF score > threshold THEN\n    AWAIT handle_yes(data, score)\n  ELSE\n    AWAIT handle_no(data, reason)\n  END IF`,
  },
  action: {
    python:     (b) => `async def ${toFuncName(b.label, "snake")}(data, retries=3):\n    for attempt in range(retries):\n        try:\n            result = await execute(data)\n            logger.info(f"${b.label} OK", extra=result)\n            return result\n        except TransientError:\n            await asyncio.sleep(2 ** attempt)\n    raise MaxRetriesExceeded("${b.label}")`,
    javascript: (b) => `async function ${toFuncName(b.label, "camel")}(data, retries = 3) {\n  for (let i = 0; i < retries; i++) {\n    try {\n      const result = await execute(data);\n      logger.info(\`${b.label} OK\`, result);\n      return result;\n    } catch (err) {\n      if (!isTransient(err)) throw err;\n      await sleep(2 ** i * 1000);\n    }\n  }\n  throw new MaxRetriesError("${b.label}");\n}`,
    pseudocode: (b) => `ASYNC ${b.label.toLowerCase()} (with retries)\n  FOR attempt 1..3\n    TRY\n      result ← AWAIT execute(data)\n      LOG success\n      RETURN result\n    ON TRANSIENT ERROR\n      WAIT 2^attempt seconds\n  END FOR\n  RAISE max retries exceeded`,
  },
  data: {
    python:     (b) => `async def fetch_${toFuncName(b.label, "snake")}(query, cache=None):\n    if cache and (hit := cache.get(query)):\n        return hit\n    raw = await api.fetch(query)\n    data = [transform(r) for r in raw]\n    valid = [d for d in data if d.is_valid]\n    if cache:\n        cache.set(query, valid, ttl=300)\n    return valid`,
    javascript: (b) => `async function ${toFuncName(b.label, "camel")}(query, cache) {\n  if (cache) {\n    const hit = cache.get(query);\n    if (hit) return hit;\n  }\n  const raw = await api.fetch(query);\n  const data = raw.map(transform);\n  const valid = data.filter(d => d.isValid);\n  cache?.set(query, valid, { ttl: 300 });\n  return valid;\n}`,
    pseudocode: (b) => `ASYNC FETCH ${b.label.toLowerCase()}\n  IF cached → RETURN cached\n  raw ← AWAIT api.fetch(query)\n  data ← TRANSFORM each record\n  valid ← FILTER valid records\n  CACHE result (TTL 5 min)\n  RETURN valid`,
  },
  output: {
    python:     (b) => `async def ${toFuncName(b.label, "snake")}(result, config):\n    formatted = format_output(result, config.template)\n    async with rate_limiter:\n        response = await deliver(formatted)\n    logger.info("Delivered", extra={"id": response.id})\n    await metrics.track("output_sent", tags=["${b.label}"])`,
    javascript: (b) => `async function ${toFuncName(b.label, "camel")}(result, config) {\n  const formatted = formatOutput(result, config.template);\n  await rateLimiter.acquire();\n  const response = await deliver(formatted);\n  logger.info("Delivered", { id: response.id });\n  await metrics.track("output_sent", ["${b.label}"]);\n}`,
    pseudocode: (b) => `ASYNC OUTPUT ${b.label.toLowerCase()}\n  FORMAT result with template\n  ACQUIRE rate limiter\n  DELIVER formatted output\n  LOG delivery id\n  TRACK metric "output_sent"`,
  },
};

/** All level templates indexed 1-5 */
const LEVEL_TEMPLATES = [level1, level2, level3, level4, level5];

function getTemplateForLevel(level: number) {
  const idx = Math.max(0, Math.min(level - 1, LEVEL_TEMPLATES.length - 1));
  return LEVEL_TEMPLATES[idx];
}

/** Get a code snippet for a single block, with complexity based on level (1-5) */
export function getBlockCode(block: Block, language: CodeLanguage, index: number, level: number = 1): string {
  const templates = getTemplateForLevel(level);
  return templates[block.type]?.[language]?.(block, index) ?? `// ${block.label}`;
}

/** Generate the full automation code for an ordered list of blocks */
export function getFullCode(blocks: Block[], language: CodeLanguage, level: number = 1): string {
  const levelLabel = ["Simple Linear", "Branching", "Data Operations", "Error Handling", "Production-Grade"][Math.min(level - 1, 4)];

  const header: Record<CodeLanguage, string> = {
    python: `# Automation Flow — ${levelLabel}\n# Generated from AutoFlow Puzzles\n`,
    javascript: `// Automation Flow — ${levelLabel}\n// Generated from AutoFlow Puzzles\n`,
    pseudocode: `// Automation Flow — ${levelLabel} (Pseudocode)\n`,
  };

  const snippets = blocks.map((b, i) => getBlockCode(b, language, i, level));

  if (language === "pseudocode") {
    return `${header[language]}${snippets.join("\n")}`;
  }

  return `${header[language]}\n${snippets.join("\n\n")}`;
}
