import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Trophy, Clock, RotateCcw, Brain, Loader2, LogOut } from "lucide-react";

interface LevelStat {
  level: number;
  difficulty: string;
  attempts: number;
  time: number;
}

interface SessionRecord {
  id: string;
  completed_at: string;
  level_stats: LevelStat[];
  ai_learning_tips: {
    summary: string;
    tips: { emoji: string; title: string; description: string }[];
  } | null;
}

const History = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["session-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_history")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as SessionRecord[];
    },
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  const totalSessions = sessions?.length ?? 0;
  const totalAttempts = sessions?.reduce(
    (sum, s) => sum + (s.level_stats as LevelStat[]).reduce((a, l) => a + l.attempts, 0),
    0
  ) ?? 0;
  const avgTime = totalSessions
    ? Math.round(
        (sessions?.reduce(
          (sum, s) => sum + (s.level_stats as LevelStat[]).reduce((a, l) => a + l.time, 0),
          0
        ) ?? 0) / totalSessions
      )
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="gap-1">
            <ArrowLeft className="w-4 h-4" /> Home
          </Button>
          <div className="h-5 w-px bg-border" />
          <h1 className="font-display font-bold text-foreground">Learning History</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{user.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut} className="gap-1">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: <Trophy className="w-5 h-5 text-accent" />, label: "Sessions", value: totalSessions },
            { icon: <RotateCcw className="w-5 h-5 text-destructive" />, label: "Total Wrong", value: totalAttempts },
            { icon: <Clock className="w-5 h-5 text-primary" />, label: "Avg Time", value: `${Math.floor(avgTime / 60)}m ${avgTime % 60}s` },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <div className="font-display font-bold text-lg text-card-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !sessions?.length ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">No sessions yet. Complete a full puzzle session to see your history!</p>
            <Button onClick={() => navigate("/play")} className="gap-1">
              Start Puzzling <Trophy className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session, idx) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card border border-border rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-display font-bold text-sm text-card-foreground">
                    Session {totalSessions - idx}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(session.completed_at).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                </div>

                {/* Level stats row */}
                <div className="flex gap-2 mb-3">
                  {(session.level_stats as LevelStat[]).map((ls) => (
                    <div
                      key={ls.level}
                      className={`flex-1 rounded-lg p-2 text-center text-[10px] border ${
                        ls.difficulty === "beginner"
                          ? "border-success/30 bg-success/5"
                          : ls.difficulty === "intermediate"
                            ? "border-accent/30 bg-accent/5"
                            : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      <div className="font-display font-bold text-card-foreground">L{ls.level}</div>
                      <div className="text-muted-foreground">{ls.attempts} wrong · {ls.time}s</div>
                    </div>
                  ))}
                </div>

                {/* AI tips */}
                {session.ai_learning_tips && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Brain className="w-3.5 h-3.5 text-primary" />
                      <span className="font-display text-xs font-bold text-card-foreground">AI Insights</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">{session.ai_learning_tips.summary}</p>
                    <div className="flex gap-2">
                      {session.ai_learning_tips.tips.map((tip, i) => (
                        <div key={i} className="flex-1 text-[10px] text-muted-foreground">
                          <span>{tip.emoji}</span> <span className="font-semibold">{tip.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
