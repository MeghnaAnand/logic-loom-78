import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Zap, Play, ChevronRight, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { WORKFLOWS, type Workflow, type SimStep } from "@/data/zap-workflows";

const typeColors = {
  trigger: "border-red-400 bg-red-50 text-red-700",
  action: "border-green-400 bg-green-50 text-green-700",
  filter: "border-orange-400 bg-orange-50 text-orange-700",
};

const BuildZap = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showDataFlow, setShowDataFlow] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [webhookSent, setWebhookSent] = useState(false);
  const [completedWorkflows, setCompletedWorkflows] = useState<string[]>([]);

  const steps = selectedWorkflow?.steps ?? [];
  const isSimComplete = selectedWorkflow ? completedSteps.length === steps.length : false;
  const step: SimStep | undefined = steps[currentStep];

  const resetSim = () => {
    setCurrentStep(0);
    setCompletedSteps([]);
    setShowDataFlow(false);
    setWebhookSent(false);
  };

  const selectWorkflow = (wf: Workflow) => {
    setSelectedWorkflow(wf);
    resetSim();
  };

  const backToList = () => {
    if (selectedWorkflow && isSimComplete && !completedWorkflows.includes(selectedWorkflow.id)) {
      setCompletedWorkflows((prev) => [...prev, selectedWorkflow.id]);
    }
    setSelectedWorkflow(null);
    resetSim();
  };

  const handleConfirmStep = () => {
    setShowDataFlow(true);
    setTimeout(() => {
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
    }, 1200);
  };

  const handleNext = () => {
    setShowDataFlow(false);
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleTriggerWebhook = async () => {
    if (!webhookUrl.trim()) {
      toast({ title: "Enter a webhook URL", description: "Paste your Zapier webhook URL first.", variant: "destructive" });
      return;
    }
    setIsSending(true);
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "no-cors",
        body: JSON.stringify({
          source: "AutomationMind",
          workflow: selectedWorkflow?.id,
          event: "walkthrough_completed",
          timestamp: new Date().toISOString(),
          triggered_from: window.location.origin,
        }),
      });
      setWebhookSent(true);
      toast({ title: "🎉 Webhook fired!", description: "Check your Zap history in Zapier to confirm it ran." });
    } catch {
      toast({ title: "Error", description: "Failed to trigger webhook. Check the URL and try again.", variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={selectedWorkflow ? backToList : () => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Zap className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold text-foreground">
            {selectedWorkflow ? selectedWorkflow.title : "Build a Real Zap"}
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {/* Workflow picker */}
          {!selectedWorkflow && (
            <motion.div key="picker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-display font-bold text-foreground mb-1">Choose a Workflow</h2>
                <p className="text-sm text-muted-foreground">Walk through building a real automation step-by-step, then fire a live webhook.</p>
              </div>
              {WORKFLOWS.map((wf) => {
                const done = completedWorkflows.includes(wf.id);
                return (
                  <Card
                    key={wf.id}
                    className="cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={() => selectWorkflow(wf)}
                  >
                    <CardContent className="flex items-center gap-4 p-5">
                      <span className="text-3xl">{wf.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{wf.title}</h3>
                          {done && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground">{wf.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{wf.steps.length} steps</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                    </CardContent>
                  </Card>
                );
              })}
            </motion.div>
          )}

          {/* Active walkthrough */}
          {selectedWorkflow && (
            <motion.div key={selectedWorkflow.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Progress bar */}
              <div className="flex items-center gap-1 mb-8">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                      completedSteps.includes(i)
                        ? "bg-primary text-primary-foreground"
                        : i === currentStep && !isSimComplete
                        ? "bg-primary/20 text-primary border-2 border-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {completedSteps.includes(i) ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`h-1 flex-1 mx-1 rounded ${completedSteps.includes(i) ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
                <div className="flex items-center">
                  <div className={`h-1 w-4 mx-1 rounded ${isSimComplete ? "bg-primary" : "bg-muted"}`} />
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    webhookSent ? "bg-primary text-primary-foreground" : isSimComplete ? "bg-primary/20 text-primary border-2 border-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {webhookSent ? <Check className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!isSimComplete && step ? (
                  <motion.div
                    key={`step-${currentStep}`}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-xl ${step.appColor} text-white flex items-center justify-center`}>
                          {step.appIcon}
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground font-medium">Step {currentStep + 1} — {step.appName}</p>
                          <h2 className="text-xl font-display font-bold text-foreground">{step.title}</h2>
                        </div>
                      </div>
                      <p className="text-muted-foreground">{step.description}</p>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                      <p className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ChevronRight className="w-4 h-4 text-primary" />
                        {step.instruction}
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Configuration</p>
                      {step.fields.map((f, i) => (
                        <div key={i} className={`flex items-center justify-between border rounded-lg px-3 py-2 text-sm ${typeColors[f.type]}`}>
                          <span className="font-medium">{f.label}</span>
                          <span className="font-mono text-xs text-right max-w-[50%]">{f.value}</span>
                        </div>
                      ))}
                    </div>

                    {!showDataFlow ? (
                      <Button onClick={handleConfirmStep} className="w-full" size="lg">
                        <Play className="w-4 h-4 mr-2" /> Run This Step
                      </Button>
                    ) : (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="bg-card border border-primary/30 rounded-xl p-4 mb-4">
                          <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1">
                            <Zap className="w-3 h-3" /> Live Data Preview
                          </p>
                          <div className="space-y-2">
                            {step.dataPreview.map((d, i) => (
                              <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex items-start gap-3 text-sm"
                              >
                                <span className="text-muted-foreground font-medium min-w-[80px] shrink-0">{d.label}</span>
                                <span className="text-foreground font-mono text-xs bg-muted px-2 py-1 rounded">{d.value}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                        {currentStep < steps.length - 1 ? (
                          <Button onClick={handleNext} className="w-full" size="lg">
                            Next Step <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        ) : (
                          <Button onClick={() => setShowDataFlow(false)} className="w-full" size="lg">
                            Complete Simulation <Check className="w-4 h-4 ml-2" />
                          </Button>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="webhook" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                    <div className="mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 mx-auto flex items-center justify-center mb-4">
                        <Zap className="w-8 h-8 text-primary" />
                      </div>
                      <h2 className="text-2xl font-display font-bold text-foreground mb-2">Now Fire a Real Zap! 🎉</h2>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        You've walked through "{selectedWorkflow.title}". Now trigger a real Zapier webhook.
                      </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6 max-w-lg mx-auto mb-6 text-left space-y-4">
                      <h3 className="font-display font-bold text-foreground">How to get your webhook URL:</h3>
                      <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                        <li>Go to <a href="https://zapier.com/app/zaps" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">zapier.com <ExternalLink className="w-3 h-3" /></a> and create a new Zap</li>
                        <li>Choose <strong>"Webhooks by Zapier"</strong> as the trigger</li>
                        <li>Select <strong>"Catch Hook"</strong> as the event</li>
                        <li>Copy the webhook URL Zapier gives you</li>
                        <li>Add any action (e.g. send yourself an email or Slack message)</li>
                        <li>Turn on your Zap, then paste the URL below!</li>
                      </ol>

                      <div className="space-y-3 pt-2">
                        <Input
                          placeholder="https://hooks.zapier.com/hooks/catch/..."
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          className="font-mono text-xs"
                        />
                        <Button onClick={handleTriggerWebhook} disabled={isSending || webhookSent} className="w-full" size="lg">
                          {isSending ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...</>
                          ) : webhookSent ? (
                            <><Check className="w-4 h-4 mr-2" /> Webhook Fired!</>
                          ) : (
                            <><Zap className="w-4 h-4 mr-2" /> Fire Webhook</>
                          )}
                        </Button>
                      </div>
                    </div>

                    {webhookSent && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <p className="text-sm text-muted-foreground">Check your Zap history to verify it ran. Congrats — you just automated! 🚀</p>
                        <Button variant="outline" onClick={backToList}>
                          <ArrowLeft className="w-4 h-4 mr-2" /> Try Another Workflow
                        </Button>
                      </motion.div>
                    )}

                    {!webhookSent && (
                      <div className="flex gap-2 justify-center mt-4">
                        <Button variant="ghost" size="sm" onClick={backToList} className="text-muted-foreground">
                          Try another workflow
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => navigate("/learn")} className="text-muted-foreground">
                          Back to Learn
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BuildZap;
