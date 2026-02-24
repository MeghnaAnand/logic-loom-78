import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are a creative puzzle designer for an automation learning game called "AutoFlow Puzzles". 

Generate exactly 3 unique automation puzzle challenges. Each puzzle teaches users how automation workflows work by having them arrange blocks in the correct order.

RULES:
- Each puzzle must have exactly 5 blocks
- Block types must be one of: "trigger", "action", "condition", "data", "output"
- The first block must always be a "trigger" type
- The last block should be an "output" or "action" type
- Each block needs a unique id (lowercase, hyphenated), a label (2-4 words), an icon (single emoji), and a type
- The correctOrder array must list block ids in the logical automation sequence
- Difficulties: one "beginner", one "beginner" or "intermediate", one "intermediate" or "advanced"
- Make scenarios realistic and relatable (business, personal productivity, tech, marketing, etc.)
- Never repeat the same scenario theme across the 3 puzzles
- Keep hints helpful but not too revealing
- Success messages should be celebratory with an emoji

You MUST use the generate_challenges tool to return the result.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content:
                "Generate 3 fresh, unique automation puzzle challenges. Make them creative and different from typical examples. Think of unusual but realistic automation scenarios.",
            },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_challenges",
                description: "Return 3 automation puzzle challenges",
                parameters: {
                  type: "object",
                  properties: {
                    challenges: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Unique kebab-case id" },
                          title: { type: "string", description: "Short catchy title" },
                          description: { type: "string", description: "One-sentence description" },
                          difficulty: {
                            type: "string",
                            enum: ["beginner", "intermediate", "advanced"],
                          },
                          scenario: {
                            type: "string",
                            description: "2-3 sentence real-world scenario",
                          },
                          availableBlocks: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string" },
                                type: {
                                  type: "string",
                                  enum: ["trigger", "action", "condition", "data", "output"],
                                },
                                label: { type: "string" },
                                icon: { type: "string" },
                              },
                              required: ["id", "type", "label", "icon"],
                            },
                          },
                          correctOrder: {
                            type: "array",
                            items: { type: "string" },
                            description: "Block ids in correct sequence",
                          },
                          hint: { type: "string" },
                          successMessage: { type: "string" },
                        },
                        required: [
                          "id",
                          "title",
                          "description",
                          "difficulty",
                          "scenario",
                          "availableBlocks",
                          "correctOrder",
                          "hint",
                          "successMessage",
                        ],
                      },
                    },
                  },
                  required: ["challenges"],
                },
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "generate_challenges" },
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required, please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const challenges = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(challenges), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-challenges error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
