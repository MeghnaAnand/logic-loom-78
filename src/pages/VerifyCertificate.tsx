import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, ShieldCheck } from "lucide-react";
import { chapters } from "@/data/learn-chapters";

const VerifyCertificate = () => {
  const { certId } = useParams<{ certId: string }>();

  const { data: cert, isLoading, error } = useQuery({
    queryKey: ["verify-certificate", certId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .eq("certificate_number", certId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!certId,
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <ShieldCheck className="w-10 h-10 text-primary mx-auto mb-2" />
          <h1 className="font-display text-xl font-bold text-foreground">Certificate Verification</h1>
          <p className="text-xs text-muted-foreground">AutomationMind</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : error || !cert ? (
          <div className="bg-card border border-destructive/30 rounded-2xl p-8 text-center">
            <XCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h2 className="font-display text-lg font-bold text-foreground mb-2">Certificate Not Found</h2>
            <p className="text-sm text-muted-foreground">
              No certificate with ID <span className="font-mono font-semibold">{certId}</span> exists.
              Please check the ID and try again.
            </p>
          </div>
        ) : (
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-primary/20 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-primary/20 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-primary/20 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-primary/20 rounded-br-2xl" />

            <div className="relative z-10">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle className="w-6 h-6 text-primary" />
                <span className="text-sm font-display font-bold text-primary uppercase tracking-wider">Verified</span>
              </div>

              <div className="text-3xl mb-2">🎓</div>
              <h2 className="font-display text-xl font-bold text-primary mb-1">AutomationMind</h2>
              <p className="text-[10px] text-muted-foreground mb-4">Certificate of Completion</p>

              <p className="text-xs text-muted-foreground mb-1">Awarded to</p>
              <h3 className="font-display text-lg font-bold text-card-foreground mb-3 capitalize">
                {cert.holder_name}
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground mb-4">
                <div className="bg-muted rounded-lg p-2.5">
                  <p className="font-display font-semibold text-card-foreground">{cert.chapters_completed}/{chapters.length}</p>
                  <p>Chapters</p>
                </div>
                <div className="bg-muted rounded-lg p-2.5">
                  <p className="font-display font-semibold text-card-foreground">{cert.puzzles_completed}</p>
                  <p>Puzzles</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-muted-foreground border-t border-border pt-3">
                <span>Issued: {new Date(cert.issued_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                <span className="font-mono font-semibold text-primary">{cert.certificate_number}</span>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] text-muted-foreground mt-4">
          Verify any certificate at <span className="font-mono">logic-loom-78.lovable.app/verify/[ID]</span>
        </p>
      </div>
    </div>
  );
};

export default VerifyCertificate;
