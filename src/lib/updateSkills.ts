import { supabase } from "@/integrations/supabase/client";
import type { BlockType } from "@/data/challenges";

/**
 * After a puzzle is solved, update the user's skill scores.
 * Each block type in the solved puzzle contributes points.
 * Points scale with difficulty and perfect solves (0 wrong attempts).
 */
export async function updateUserSkills(
  userId: string,
  blockTypes: BlockType[],
  difficulty: "beginner" | "intermediate" | "advanced",
  wrongAttempts: number
) {
  const diffMultiplier = difficulty === "beginner" ? 1 : difficulty === "intermediate" ? 1.5 : 2;
  const perfectBonus = wrongAttempts === 0 ? 1.5 : 1;
  const basePoints = Math.round(5 * diffMultiplier * perfectBonus);

  // Count how many of each type appear in this puzzle
  const typeCounts: Record<string, number> = {};
  for (const t of blockTypes) {
    typeCounts[t] = (typeCounts[t] || 0) + 1;
  }

  // Fetch current skills
  const { data: existing } = await supabase
    .from("user_skills")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const current = existing ?? {
    triggers: 0,
    conditions: 0,
    actions: 0,
    data: 0,
    outputs: 0,
    total_puzzles: 0,
  };

  const updated = {
    user_id: userId,
    triggers: Math.min(100, (current.triggers as number) + (typeCounts["trigger"] ? basePoints : 0)),
    conditions: Math.min(100, (current.conditions as number) + (typeCounts["condition"] ? basePoints : 0)),
    actions: Math.min(100, (current.actions as number) + (typeCounts["action"] ? basePoints : 0)),
    data: Math.min(100, (current.data as number) + (typeCounts["data"] ? basePoints : 0)),
    outputs: Math.min(100, (current.outputs as number) + (typeCounts["output"] ? basePoints : 0)),
    total_puzzles: (current.total_puzzles as number) + 1,
    updated_at: new Date().toISOString(),
  };

  if (existing) {
    await supabase.from("user_skills").update(updated).eq("user_id", userId);
  } else {
    await supabase.from("user_skills").insert(updated);
  }
}
