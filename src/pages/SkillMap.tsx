import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, LogOut, Radar, Trophy, Zap } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar as RechartsRadar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillData {
  triggers: number;
  conditions: number;
  actions: number;
  data: number;
  outputs: number;
  total_puzzles: number;
}

const SKILL_META: { key: keyof Omit<SkillData, "total_puzzles">; label: string; emoji: string; description: string }[] = [
  { key: "triggers", label: "Triggers", emoji: "⚡", description: "Detecting events that start automations" },
  { key: "conditions", label: "Conditions", emoji: "❓", description: "IF/ELSE branching and decision logic" },
  { key: "actions", label: "Actions", emoji: "⚙️", description: "Performing tasks like sending emails or processing data" },
  { key: "data", label: "Data", emoji: "📊", description: "Extracting, transforming, and validating data" },
  { key: "outputs", label: "Outputs", emoji: "📤", description: "Logging results, notifications, and reports" },
];

const getMasteryLabel = (score: number) => {
  if (score >= 80) return { label: "Master", color: "text-success" };
  if (score >= 60) return { label: "Proficient", color: "text-primary" };
  if (score >= 40) return { label: "Developing", color: "text-accent" };
  if (score >= 20) return { label: "Beginner", color: "text-muted-foreground" };
  return { label: "Unexplored", color: "text-muted-foreground/50" };
};

const SkillMap = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const { data: skills, isLoading } = useQuery({
    queryKey: ["user-skills", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_skills")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data as SkillData | null;
    },
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  const skillValues = skills ?? { triggers: 0, conditions: 0, actions: 0, data: 0, outputs: 0, total_puzzles: 0 };

  const radarData = SKILL_META.map((s) => ({
    skill: s.label,
    value: Math.min(skillValues[s.key], 100),
    fullMark: 100,
  }));

  const overallMastery = Math.round(
    SKILL_META.reduce((sum, s) => sum + Math.min(skillValues[s.key], 100), 0) / SKILL_META.length
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Home
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" /> Skill Map
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Overall stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl p-5 text-center col-span-2 md:col-span-1"
              >
                <Trophy className="w-6 h-6 text-accent mx-auto mb-2" />
                <div className="font-display font-bold text-3xl text-card-foreground">{overallMastery}%</div>
                <div className="text-xs text-muted-foreground">Overall Mastery</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-card border border-border rounded-xl p-5 text-center"
              >
                <Zap className="w-6 h-6 text-primary mx-auto mb-2" />
                <div className="font-display font-bold text-3xl text-card-foreground">{skillValues.total_puzzles}</div>
                <div className="text-xs text-muted-foreground">Puzzles Solved</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-5 text-center"
              >
                <Radar className="w-6 h-6 text-success mx-auto mb-2" />
                <div className="font-display font-bold text-3xl text-card-foreground">
                  {SKILL_META.filter((s) => skillValues[s.key] >= 80).length}/{SKILL_META.length}
                </div>
                <div className="text-xs text-muted-foreground">Skills Mastered</div>
              </motion.div>
            </div>

            {/* Radar chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="bg-card border border-border rounded-2xl p-6 mb-8"
            >
              <h2 className="font-display font-bold text-lg text-card-foreground mb-4 text-center">
                Your Automation Skill Radar
              </h2>
              {skillValues.total_puzzles === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    Complete puzzles to build your skill map! Each puzzle trains different concepts.
                  </p>
                  <Button onClick={() => navigate("/play")} className="gap-1">
                    Start Puzzling <Zap className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="skill"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 13, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 100]}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                    />
                    <RechartsRadar
                      name="Mastery"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Mastery"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            {/* Skill breakdown */}
            <div className="space-y-3">
              <h2 className="font-display font-bold text-lg text-foreground">Concept Breakdown</h2>
              {SKILL_META.map((skill, i) => {
                const value = Math.min(skillValues[skill.key], 100);
                const mastery = getMasteryLabel(value);
                return (
                  <motion.div
                    key={skill.key}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{skill.emoji}</span>
                        <div>
                          <span className="font-display font-bold text-sm text-card-foreground">{skill.label}</span>
                          <p className="text-[11px] text-muted-foreground">{skill.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`font-display font-bold text-sm ${mastery.color}`}>{mastery.label}</span>
                        <div className="text-xs text-muted-foreground">{value}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <motion.div
                        className="h-2.5 rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${value}%` }}
                        transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SkillMap;
