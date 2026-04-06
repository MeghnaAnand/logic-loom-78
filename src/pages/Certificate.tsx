import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Share2, Loader2, Lock } from "lucide-react";
import { chapters } from "@/data/learn-chapters";

const Certificate = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["session-history", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("session_history")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: chapterProgress, isLoading: chaptersLoading } = useQuery({
    queryKey: ["chapter-progress", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_progress")
        .select("chapter_id")
        .eq("passed", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (authLoading) return null;
  if (!user) {
    navigate("/auth?redirect=/certificate");
    return null;
  }

  const hasCompletedPuzzles = (sessions?.length ?? 0) > 0;
  const completedChapterCount = chapterProgress?.length ?? 0;
  const allChaptersCompleted = completedChapterCount === chapters.length;
  const isEligible = hasCompletedPuzzles && allChaptersCompleted;
  const loading = sessionsLoading || chaptersLoading;

  const userName = user.email?.split("@")[0] || "Learner";
  const completionDate = sessions?.[0]?.completed_at
    ? new Date(sessions[0].completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const handleDownload = async () => {
    if (!certRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(certRef.current, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `AutomationMind-Certificate-${userName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      // Fallback: open print dialog
      window.print();
    }
  };

  const shareUrl = "https://logic-loom-78.lovable.app";
  const shareText = `🎓 I just earned my AutomationMind Certificate! Completed 9 chapters and 5 puzzles on automation fundamentals. #Automation #NoCode #CareerSkills`;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-3xl mx-auto flex items-center gap-3 px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/learn")}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="font-display font-bold text-lg text-foreground">Certificate</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : !isEligible ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <Lock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Certificate Locked</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Complete all 9 learning chapters and finish a puzzle session to earn your certificate.
            </p>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              <Button onClick={() => navigate("/learn")}>Continue Learning</Button>
              <Button variant="outline" onClick={() => navigate("/play")}>Go to Puzzles</Button>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Certificate */}
            <div
              ref={certRef}
              className="bg-card border-2 border-primary/20 rounded-2xl p-8 md:p-12 text-center relative overflow-hidden mb-6"
            >
              {/* Corner decorations */}
              <div className="absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 border-primary/20 rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 border-primary/20 rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 border-primary/20 rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 border-primary/20 rounded-br-2xl" />

              <div className="relative z-10">
                <p className="text-xs font-display uppercase tracking-[0.3em] text-muted-foreground mb-1">
                  Certificate of Completion
                </p>
                <div className="text-4xl mb-2">🎓</div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary mb-1">
                  AutomationMind
                </h2>
                <p className="text-xs text-muted-foreground mb-6">Automation Fundamentals</p>

                <p className="text-sm text-muted-foreground mb-1">This certifies that</p>
                <h3 className="font-display text-xl md:text-2xl font-bold text-card-foreground mb-4 capitalize">
                  {userName}
                </h3>

                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6 leading-relaxed">
                  has successfully completed {chapters.length} chapters on automation fundamentals
                  and demonstrated proficiency through interactive puzzle assessments covering
                  triggers, actions, conditions, data mapping, loops, error handling, webhooks,
                  and scheduling.
                </p>

                <div className="flex justify-center gap-8 text-xs text-muted-foreground mb-4">
                  <div>
                    <p className="font-display font-semibold text-card-foreground">{completionDate}</p>
                    <p>Date</p>
                  </div>
                  <div className="w-px bg-border" />
                  <div>
                    <p className="font-display font-semibold text-card-foreground">{chapters.length} Chapters + 5 Puzzles</p>
                    <p>Curriculum</p>
                  </div>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] text-muted-foreground">
                    Issued by AutomationMind · logic-loom-78.lovable.app
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" /> Download Certificate
              </Button>

              <div className="flex gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    💼 Share on LinkedIn
                  </Button>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    𝕏 Post
                  </Button>
                </a>
              </div>

              <Button variant="ghost" size="sm" onClick={() => navigate("/history")} className="text-xs">
                View Full Progress →
              </Button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Certificate;
