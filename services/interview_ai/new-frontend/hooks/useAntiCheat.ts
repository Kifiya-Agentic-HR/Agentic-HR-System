import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export type ViolationType = "MINOR" | "MAJOR";
export type Violation = {
  type: ViolationType;
  timestamp: number;
  description: string;
  weight: number;
};

export interface ViolationState {
  tabSwitches: number;
  windowMinimized: boolean;
  faceViolations: number;
  copyPaste: number;
  multipleFaces: number;
  violations: Violation[];
  totalWeight: number;
}

const VIOLATION_WEIGHTS = {
  COPY_PASTE: 0.5,
  FACE_AWAY: 0.5,
  TAB_SWITCH: 2,
  WINDOW_MINIMIZE: 2,
  MULTIPLE_FACES: 3
};

export function useAntiCheat(isActive: boolean = false) {
  const { toast } = useToast();
  const [violations, setViolations] = useState<ViolationState>({
    tabSwitches: 0,
    windowMinimized: false,
    faceViolations: 0,
    copyPaste: 0,
    multipleFaces: 0,
    violations: [],
    totalWeight: 0
  });

  const addViolation = (type: ViolationType, description: string, weight: number) => {
    setViolations(prev => ({
      ...prev,
      violations: [...prev.violations, { type, timestamp: Date.now(), description, weight }],
      totalWeight: prev.totalWeight + weight
    }));

    toast({
      variant: "destructive",
      title: type === "MAJOR" ? "Serious Violation Detected" : "Warning",
      description: description
    });
  };

  useEffect(() => {
    if (!isActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => ({ ...prev, tabSwitches: prev.tabSwitches + 1 }));
        addViolation("MAJOR", "Tab switching detected! This will be reported.", VIOLATION_WEIGHTS.TAB_SWITCH);
      }
    };

    const handleWindowBlur = () => {
      setViolations(prev => ({ ...prev, windowMinimized: true }));
      addViolation("MAJOR", "Window minimization detected! This will be reported.", VIOLATION_WEIGHTS.WINDOW_MINIMIZE);
    };

    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setViolations(prev => ({ ...prev, copyPaste: prev.copyPaste + 1 }));
      addViolation("MINOR", "Copy-paste attempt detected!", VIOLATION_WEIGHTS.COPY_PASTE);
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addViolation("MINOR", "Exited full-screen mode! Restoring...", VIOLATION_WEIGHTS.WINDOW_MINIMIZE);
        // Attempt to restore full-screen after a short delay
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(err => {
            console.error("Error attempting to restore full-screen mode:", err);
          });
        }, 1000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Request full screen when anti-cheat is activated
    const requestFullScreen = () => {
      document.documentElement.requestFullscreen().catch(err => {
        console.error("Error attempting to enable full-screen mode:", err);
      });
    };

    requestFullScreen();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => {
          console.error("Error attempting to exit full-screen mode:", err);
        });
      }
    };
  }, [isActive, toast]);

  return violations;
}