import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a friendly automation-learning coach for a puzzle game called "AutoFlow Puzzles".

Given data about a student's performance across 5 levels of increasing difficulty, provide:
1. A short encouraging summary of their performance (1-2 sentences).
2. Exactly 3 personalized tips as next steps — each should be actionable and relate to the coding/automation concepts they struggled with.

Concepts by level:
- Level 1: Sequential execution, function calls
- Level 2: If/else branching, conditionals
- Level 3: Variables, data transformations, validation
- Level 4: Try/catch error handling, loops, retries
- Level 5: Async/await, classes, caching, rate limiting

Use the respond tool to return your answer.`;

interface LevelStats {
  level: number;
  difficulty: string;
  attempts: number;
  timeSec: number;
  solved: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stats } = (await req.json()) as { stats: LevelStats[] };
    if (!stats || !Array.isArray(stats)) throw new Error("Missing stats");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userMessage = stats
      .map(
        (s) =>
          `Level ${s.level} (${s.difficulty}): ${s.solved ? "solved" : "unsolved"}, ${s.attempts} wrong attempts, ${s.timeSec}s`
      )
      .join("\n");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: `Here is the student's session performance:\n${userMessage}` },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "respond",
                description: "Return coaching tips",
                parameters: {
                  type: "object",
                  properties: {
                    summary: { type: "string", description: "1-2 sentence encouraging summary" },
                    tips: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          emoji: { type: "string", description: "Single emoji" },
                          title: { type: "string", description: "Short tip title (3-5 words)" },
                          description: { type: "string", description: "Actionable advice (1-2 sentences)" },
                        },
                        required: ["emoji", "title", "description"],
                      },
                      minItems: 3,
                      maxItems: 3,
                    },
                  },
                  required: ["summary", "tips"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "respond" } },
        }),
      }
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("learning-tips error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
