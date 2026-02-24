import { useState, useEffect, useRef } from "react";
import { Timer } from "lucide-react";

interface PuzzleTimerProps {
  isRunning: boolean;
  onTimeUpdate?: (seconds: number) => void;
  reset: number; // increment to reset
}

const PuzzleTimer = ({ isRunning, onTimeUpdate, reset }: PuzzleTimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setElapsed(0);
  }, [reset]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          onTimeUpdate?.(next);
          return next;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTimeUpdate]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;

  const getTimerColor = () => {
    if (elapsed < 30) return "text-success";
    if (elapsed < 60) return "text-accent-foreground";
    return "text-destructive";
  };

  return (
    <div className={`flex items-center gap-1.5 font-mono text-sm font-bold ${getTimerColor()}`}>
      <Timer className="w-4 h-4" />
      <span>{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</span>
    </div>
  );
};

export default PuzzleTimer;
