import { useAccessibility } from "@/hooks/useAccessibility";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Accessibility } from "lucide-react";

const options = [
  {
    key: "reducedMotion" as const,
    label: "Reduce animations",
    description: "Minimise moving elements for less distraction",
    emoji: "🎯",
  },
  {
    key: "focusMode" as const,
    label: "Focus mode",
    description: "Dim surrounding content, highlight current task",
    emoji: "🧘",
  },
  {
    key: "dyslexiaFont" as const,
    label: "Dyslexia-friendly font",
    description: "Use OpenDyslexic for easier reading",
    emoji: "📖",
  },
  {
    key: "largeText" as const,
    label: "Larger text",
    description: "Increase font size across the app",
    emoji: "🔤",
  },
  {
    key: "highContrast" as const,
    label: "High contrast",
    description: "Stronger borders and bolder text",
    emoji: "🌗",
  },
];

const AccessibilityPanel = () => {
  const { settings, updateSetting } = useAccessibility();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 rounded-full w-10 h-10 bg-card border border-border shadow-lg hover:bg-accent"
          aria-label="Accessibility settings"
        >
          <Accessibility className="w-5 h-5 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[340px]">
        <SheetHeader>
          <SheetTitle className="font-display flex items-center gap-2">
            <Accessibility className="w-5 h-5 text-primary" />
            Accessibility
          </SheetTitle>
        </SheetHeader>
        <p className="text-xs text-muted-foreground mt-1 mb-4">
          Customise your learning experience. Settings are saved locally.
        </p>
        <div className="space-y-4">
          {options.map((opt) => (
            <div key={opt.key} className="flex items-start gap-3">
              <span className="text-lg mt-0.5">{opt.emoji}</span>
              <div className="flex-1 min-w-0">
                <label className="text-sm font-medium text-foreground block" htmlFor={opt.key}>
                  {opt.label}
                </label>
                <p className="text-xs text-muted-foreground">{opt.description}</p>
              </div>
              <Switch
                id={opt.key}
                checked={settings[opt.key]}
                onCheckedChange={(v) => updateSetting(opt.key, v)}
              />
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AccessibilityPanel;
