import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a quiz designer for "AutomationMind", a game that teaches automation thinking.

Given a difficulty level and context about puzzles the user solved, generate exactly 3 fill-in-the-blank automation questions.

Each question describes a real-world automation scenario with ONE blank (marked as ___) that the user must fill in.

DIFFICULTY LEVELS:
- Level 1 (Beginner): Simple trigger-action pairs. Blanks are obvious (e.g., "When a new ___ arrives, send a notification")
- Level 2 (Intermediate): Multi-step workflows with conditions. Blanks require understanding of flow logic.
- Level 3 (Advanced): Complex scenarios involving error handling, data transformation, or branching logic.

RULES:
- Each question must have exactly ONE blank (___) 
- Provide the correct answer (1-4 words)
- Provide 2 acceptable alternative answers
- Include a brief explanation of why the answer is correct
- Make scenarios realistic (business, productivity, tech)
- Questions should build on automation concepts from the puzzles

Use the respond tool to return results.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { level, puzzleContext } = await req.json();
    if (!level) throw new Error("Missing level");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

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
            {
              role: "user",
              content: `Generate 3 fill-in-the-blank questions for Level ${level} (${
                level === 1 ? "Beginner" : level === 2 ? "Intermediate" : "Advanced"
              }).\n\nPuzzle context the user completed: ${puzzleContext || "Various automation workflows including email processing, data filtering, and report generation."}`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "respond",
                description: "Return fill-in-the-blank questions",
                parameters: {
                  type: "object",
                  properties: {
                    questions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Unique question id" },
                          scenario: {
                            type: "string",
                            description: "The automation scenario with exactly one ___ blank",
                          },
                          correctAnswer: {
                            type: "string",
                            description: "The correct answer (1-4 words)",
                          },
                          acceptableAnswers: {
                            type: "array",
                            items: { type: "string" },
                            description: "2 alternative acceptable answers",
                          },
                          explanation: {
                            type: "string",
                            description: "Brief explanation of why this is correct (1-2 sentences)",
                          },
                          hint: {
                            type: "string",
                            description: "A subtle hint (1 sentence)",
                          },
                        },
                        required: ["id", "scenario", "correctAnswer", "acceptableAnswers", "explanation", "hint"],
                      },
                    },
                  },
                  required: ["questions"],
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
    console.error("generate-questions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
