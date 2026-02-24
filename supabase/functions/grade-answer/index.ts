import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a grading assistant for an automation learning game. 

Given:
- The fill-in-the-blank scenario
- The correct answer and acceptable alternatives
- The user's submitted answer

Determine if the user's answer is correct, partially correct, or incorrect.
Be lenient with:
- Spelling variations
- Synonyms that convey the same meaning
- Minor grammatical differences (plural/singular, articles)

Use the respond tool to return the grade.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { scenario, correctAnswer, acceptableAnswers, userAnswer } = await req.json();
    if (!scenario || !correctAnswer || !userAnswer) throw new Error("Missing fields");

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
              content: `Scenario: "${scenario}"\nCorrect answer: "${correctAnswer}"\nAcceptable alternatives: ${JSON.stringify(acceptableAnswers)}\nUser's answer: "${userAnswer}"\n\nGrade this answer.`,
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "respond",
                description: "Return the grading result",
                parameters: {
                  type: "object",
                  properties: {
                    isCorrect: { type: "boolean", description: "True if answer is correct or close enough" },
                    feedback: { type: "string", description: "1-2 sentence feedback for the user" },
                    score: {
                      type: "number",
                      description: "0 = wrong, 0.5 = partially correct, 1 = correct",
                    },
                  },
                  required: ["isCorrect", "feedback", "score"],
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
    console.error("grade-answer error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
