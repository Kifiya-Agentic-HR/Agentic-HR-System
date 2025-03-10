import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export type ViolationType = "MINOR" | "MAJOR" | "CRITICAL";

export type Violation = {
  type: ViolationType;
  timestamp: number;
  description: string;
  weight: number;
  details?: string;
};

export interface ViolationState {
  tabSwitches: number;
  windowMinimized: boolean;
  faceViolations: number;
  copyPaste: number;
  multipleFaces: number;
  focusTime: number;
  violations: Violation[];
  totalWeight: number;
  lastActiveTimestamp: number;
  warningsIssued: number;
}

const VIOLATION_WEIGHTS = {
  COPY_PASTE: 1.0,
  FACE_AWAY: 0.5,
  TAB_SWITCH: 3.0,
  WINDOW_MINIMIZE: 2.0,
  MULTIPLE_FACES: 2.0,
  FOCUS_LOSS: 2,
  BROWSER_BACK: 1.0,
  KEYBOARD_SHORTCUT: 1,
  LONG_INACTIVITY: 0.5,
  SUSPICIOUS_MOVEMENT: 0.5
} as const;

const THRESHOLDS = {
  INACTIVITY: 30000,
  WARNING: 3,
  CRITICAL: 5,
  MAX_WARNINGS: 5
} as const;

export function useAntiCheat(isActive: boolean = false) {
  const { toast } = useToast();
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastViolationRef = useRef<number>(0);

  const [violations, setViolations] = useState<ViolationState>({
    tabSwitches: 0,
    windowMinimized: false,
    faceViolations: 0,
    copyPaste: 0,
    multipleFaces: 0,
    focusTime: 0,
    violations: [],
    totalWeight: 0,
    lastActiveTimestamp: Date.now(),
    warningsIssued: 0
  });

  useEffect(() => {
    const lastViolation = violations.violations[violations.violations.length - 1];
    if (lastViolation && lastViolation.timestamp !== lastViolationRef.current) {
      lastViolationRef.current = lastViolation.timestamp;

      const severity = violations.totalWeight >= THRESHOLDS.CRITICAL ? "destructive" :
        violations.totalWeight >= THRESHOLDS.WARNING ? "warning" : "default";

      const title = violations.totalWeight >= THRESHOLDS.CRITICAL ? "Critical Violation" :
        violations.totalWeight >= THRESHOLDS.WARNING ? "Warning" : "Notice";

      toastTimeoutRef.current = setTimeout(() => {
        toast({
          variant: severity,
          title,
          description: `${lastViolation.description}${lastViolation.details ? `\n${lastViolation.details}` : ''}`,
          duration: 6000,
        });
      }, 0);
    }
  }, [violations, toast]);

  const addViolation = useCallback((
    type: ViolationType,
    description: string,
    weight: number,
    details?: string
  ) => {
    setViolations(prev => {
      const newViolation = {
        type,
        timestamp: Date.now(),
        description,
        weight,
        details
      };

      const newTotalWeight = prev.totalWeight + weight;
      const newWarningsIssued = newTotalWeight >= THRESHOLDS.WARNING ?
        prev.warningsIssued + 1 : prev.warningsIssued;

      return {
        ...prev,
        violations: [...prev.violations, newViolation],
        totalWeight: newTotalWeight,
        warningsIssued: newWarningsIssued
      };
    });
  }, []);

  const applyBackgroundBlur = useCallback((blur: boolean) => {
    document.body.style.filter = blur ? 'blur(8px)' : 'none';
    document.body.style.transition = 'filter 0.3s ease-in-out';
  }, []);

  const handleKeyboardShortcuts = useCallback((e: KeyboardEvent) => {
    const blockedKeys = ['c', 'v', 'p', 'a', 'f', 'r', 's'];
    if ((e.ctrlKey || e.metaKey) && blockedKeys.includes(e.key.toLowerCase())) {
      e.preventDefault();
      e.stopPropagation();
      addViolation(
        "MINOR",
        "Keyboard shortcut blocked",
        VIOLATION_WEIGHTS.KEYBOARD_SHORTCUT,
        `Attempted: ${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()}`
      );
    }
  }, [addViolation]);

  const handleActivity = useCallback(() => {
    setViolations(prev => ({
      ...prev,
      lastActiveTimestamp: Date.now()
    }));
  }, []);

  useEffect(() => {
    if (!isActive) return;

    let inactivityInterval: NodeJS.Timeout;
    let focusCheckInterval: NodeJS.Timeout;

    const setupAntiCheat = async () => {
      try {
        document.body.style.userSelect = 'none';
        window.history.pushState(null, '', window.location.href);

        inactivityInterval = setInterval(() => {
          const now = Date.now();
          if (now - violations.lastActiveTimestamp > THRESHOLDS.INACTIVITY) {
            addViolation(
              "MAJOR",
              "Extended Inactivity detected",
              VIOLATION_WEIGHTS.LONG_INACTIVITY,
              `${THRESHOLDS.INACTIVITY / 1000}s inactivity`
            );
          }
        }, THRESHOLDS.INACTIVITY);

        focusCheckInterval = setInterval(() => {
          if (!document.hasFocus()) {
            setViolations(prev => ({ ...prev, focusTime: prev.focusTime + 1 }));
          }
        }, 1000);

      } catch (error) {
        console.error('Anti-cheat init failed:', error);
        toast({
          variant: "destructive",
          title: "Security Error",
          description: "Failed to initialize security measures",
        });
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        applyBackgroundBlur(true);
        blurTimeoutRef.current = setTimeout(() => {
          addViolation(
            "MAJOR",
            "Tab switched",
            VIOLATION_WEIGHTS.TAB_SWITCH,
            "Left interview tab"
          );
        }, THRESHOLDS.INACTIVITY);
      } else {
        applyBackgroundBlur(false);
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      }
    };

    const handleWindowBlur = () => {
      applyBackgroundBlur(true);
      addViolation(
        "MAJOR",
        "Window focus lost",
        VIOLATION_WEIGHTS.WINDOW_MINIMIZE,
        "Window minimized"
      );
    };

    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
      addViolation(
        "MINOR",
        "Copy/paste blocked",
        VIOLATION_WEIGHTS.COPY_PASTE,
        "Restricted action"
      );
    };

    const handlePopState = () => {
      addViolation(
        "MAJOR",
        "Navigation blocked",
        VIOLATION_WEIGHTS.BROWSER_BACK,
        "Browser navigation restricted"
      );
      window.history.pushState(null, '', window.location.href);
    };

    const handleRightClick = (e: MouseEvent) => {
      e.preventDefault();
      addViolation(
        "MINOR",
        "Right-click blocked",
        VIOLATION_WEIGHTS.COPY_PASTE,
        "Context menu restricted"
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", () => applyBackgroundBlur(false));
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("keydown", handleKeyboardShortcuts);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener("contextmenu", handleRightClick);
    
    ["mousemove", "keydown", "click", "scroll"].forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    setupAntiCheat();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", () => applyBackgroundBlur(false));
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("keydown", handleKeyboardShortcuts);
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("contextmenu", handleRightClick);
      
      ["mousemove", "keydown", "click", "scroll"].forEach(event => {
        document.removeEventListener(event, handleActivity);
      });

      clearInterval(inactivityInterval);
      clearInterval(focusCheckInterval);
      
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      
      document.body.style.userSelect = '';
      document.body.style.filter = '';
    };
  }, [isActive, addViolation, applyBackgroundBlur, handleActivity, handleKeyboardShortcuts, violations.lastActiveTimestamp, toast]);

  return { violations };
}