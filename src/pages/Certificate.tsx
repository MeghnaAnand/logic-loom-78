import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Loader2, Lock, ShieldCheck, Copy, CheckCircle } from "lucide-react";
import { chapters } from "@/data/learn-chapters";
import { toast } from "sonner";

const Certificate = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);
  const [certNumber, setCertNumber] = useState<string | null>(null);
  const [issuing, setIssuing] = useState(false);
  const [copied, setCopied] = useState(false);

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

  // Check if certificate already exists
  const { data: existingCert, isLoading: certLoading } = useQuery({
    queryKey: ["certificate", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (existingCert?.certificate_number) {
      setCertNumber(existingCert.certificate_number);
    }
  }, [existingCert]);

  if (authLoading) return null;
  if (!user) {
    navigate("/auth?redirect=/certificate");
    return null;
  }

  const hasCompletedPuzzles = (sessions?.length ?? 0) > 0;
  const completedChapterCount = chapterProgress?.length ?? 0;
  const allChaptersCompleted = completedChapterCount === chapters.length;
  const isEligible = hasCompletedPuzzles && allChaptersCompleted;
  const loading = sessionsLoading || chaptersLoading || certLoading;

  const userName = user.email?.split("@")[0] || "Learner";
  const completionDate = sessions?.[0]?.completed_at
    ? new Date(sessions[0].completed_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const issueCertificate = async () => {
    if (!user || certNumber) return;
    setIssuing(true);
    try {
      const { data, error } = await supabase
        .from("certificates")
        .insert({
          user_id: user.id,
          holder_name: userName,
          holder_email: user.email ?? undefined,
          chapters_completed: completedChapterCount,
          puzzles_completed: sessions?.length ?? 0,
        })
        .select("certificate_number")
        .single();
      if (error) throw error;
      setCertNumber(data.certificate_number);
      toast.success("Certificate issued! 🎓");
    } catch (e: any) {
      if (e?.code === "23505") {
        // Already exists, refetch
        const { data } = await supabase
          .from("certificates")
          .select("certificate_number")
          .eq("user_id", user.id)
          .single();
        if (data) setCertNumber(data.certificate_number);
      } else {
        toast.error("Failed to issue certificate");
      }
    } finally {
      setIssuing(false);
    }
  };

  // Auto-issue if eligible and no cert yet
  useEffect(() => {
    if (isEligible && !certNumber && !loading && !issuing && !existingCert) {
      issueCertificate();
    }
  }, [isEligible, certNumber, loading, existingCert]);

  const verifyUrl = certNumber ? `https://logic-loom-78.lovable.app/verify/${certNumber}` : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopied(true);
    toast.success("Verification link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

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
      window.print();
    }
  };

  const shareText = `🎓 I just earned my AutomationMind Certificate! Completed ${chapters.length} chapters and puzzles on automation fundamentals. Verify: ${verifyUrl} #Automation #NoCode #CareerSkills`;

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
              Complete all {chapters.length} learning chapters and finish a puzzle session to earn your certificate.
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
                    <p className="font-display font-semibold text-card-foreground">{chapters.length} Chapters + Puzzles</p>
                    <p>Curriculum</p>
                  </div>
                </div>

                {/* Verification ID on the certificate itself */}
                {certNumber && (
                  <div className="border-t border-border pt-3 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    <p className="text-[10px] text-muted-foreground">
                      Verified · <span className="font-mono font-semibold text-primary">{certNumber}</span> · logic-loom-78.lovable.app/verify/{certNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Verification banner */}
            {certNumber && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  <h3 className="font-display font-semibold text-sm text-foreground">Verifiable Certificate</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Employers and schools can verify your certificate using this unique link:
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-lg px-3 py-2 text-xs font-mono text-foreground truncate">
                    {verifyUrl}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 shrink-0">
                    {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 max-w-sm mx-auto">
              <Button onClick={handleDownload} className="gap-2">
                <Download className="w-4 h-4" /> Download Certificate
              </Button>

              <div className="flex gap-2">
                <a
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl || "https://logic-loom-78.lovable.app")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs">
                    💼 Share on LinkedIn
                  </Button>
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
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
