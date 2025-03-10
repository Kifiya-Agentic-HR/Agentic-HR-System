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
  COPY_PASTE: 0.5,
  FACE_AWAY: 0.01,
  TAB_SWITCH: 0.5,
  WINDOW_MINIMIZE: 1.0,
  MULTIPLE_FACES: 2.0,
  FOCUS_LOSS: 0.05,
  FULLSCREEN_EXIT: 0.05,
  BROWSER_BACK: 1.0,
  KEYBOARD_SHORTCUT: 0.5,
  LONG_INACTIVITY: 0.5,
  SUSPICIOUS_MOVEMENT: 0.5
} as const;

const THRESHOLDS = {
  INACTIVITY: 40000, // 10 seconds
  WARNING: 3,        // Total violations before warning
  CRITICAL: 5,       // Total violations before critical warning
  MAX_WARNINGS: 5    // Maximum number of warnings before automatic termination
} as const;

export function useAntiCheat(isActive: boolean = false) {
  const { toast } = useToast();
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastViolationRef = useRef<number>(0);
  const fullscreenRetryRef = useRef<number>(0);
  const fullscreenIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle violation notifications
  useEffect(() => {
    const lastViolation = violations.violations[violations.violations.length - 1];
    if (lastViolation && lastViolation.timestamp !== lastViolationRef.current) {
      lastViolationRef.current = lastViolation.timestamp;

      const severity = 
        violations.totalWeight >= THRESHOLDS.CRITICAL ? "destructive" :
        violations.totalWeight >= THRESHOLDS.WARNING ? "destructive" : 
        "default";

      const title = 
        violations.totalWeight >= THRESHOLDS.CRITICAL ? "Critical Security Violation" :
        violations.totalWeight >= THRESHOLDS.WARNING ? "Security Warning" :
        "Notice";

      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }

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
      const newWarningsIssued = 
        newTotalWeight >= THRESHOLDS.WARNING ? 
        prev.warningsIssued + 1 : 
        prev.warningsIssued;

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
        `Attempted to use: ${e.ctrlKey ? 'Ctrl' : 'Cmd'}+${e.key.toUpperCase()}`
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
        // Initial security measures
        document.body.style.userSelect = 'none';
        window.history.pushState(null, '', window.location.href);

        // Request fullscreen with retry mechanism
        const requestFullscreen = async (retries = 3) => {
          try {
            if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
              fullscreenRetryRef.current = 0;
            }
          } catch (error) {
            console.error('Fullscreen request failed:', error);
            if (retries > 0) {
              setTimeout(() => requestFullscreen(retries - 1), 2000);
            } else {
              addViolation(
                "CRITICAL",
                "Fullscreen enforcement failed",
                VIOLATION_WEIGHTS.FULLSCREEN_EXIT * 2,
                "System unable to maintain fullscreen mode"
              );
            }
          }
        };

        await requestFullscreen();

        // Set up monitoring intervals
        inactivityInterval = setInterval(() => {
          const now = Date.now();
          if (now - violations.lastActiveTimestamp > THRESHOLDS.INACTIVITY) {
            addViolation(
              "MAJOR",
              "Inactivity detected",
              VIOLATION_WEIGHTS.LONG_INACTIVITY,
              `No activity for ${THRESHOLDS.INACTIVITY / 1000} seconds`
            );
          }
        }, THRESHOLDS.INACTIVITY);

        focusCheckInterval = setInterval(() => {
          if (!document.hasFocus()) {
            setViolations(prev => ({
              ...prev,
              focusTime: prev.focusTime + 1
            }));
          }
        }, 1000);

      } catch (error) {
        console.error('Anti-cheat initialization failed:', error);
        setTimeout(() => {
          toast({
            variant: "destructive",
            title: "Security System Error",
            description: "Failed to initialize security measures. Please refresh and try again.",
          });
        }, 0);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        applyBackgroundBlur(true);
        if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
        
        blurTimeoutRef.current = setTimeout(() => {
          addViolation(
            "MAJOR",
            "Tab switching detected",
            VIOLATION_WEIGHTS.TAB_SWITCH,
            "Extended period away from interview tab"
          );
        }, THRESHOLDS.INACTIVITY);
      } else {
        applyBackgroundBlur(false);
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = null;
        }
      }
    };

    const handleWindowBlur = () => {
      applyBackgroundBlur(true);
      addViolation(
        "MAJOR",
        "Window focus lost",
        VIOLATION_WEIGHTS.WINDOW_MINIMIZE,
        "Interview window was minimized or lost focus"
      );
    };

    const handleWindowFocus = () => {
      applyBackgroundBlur(false);
    };

    const handleCopyPaste = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      addViolation(
        "MINOR",
        "Copy/paste attempted",
        VIOLATION_WEIGHTS.COPY_PASTE,
        "Copying and pasting is not allowed during the interview"
      );
    };

    // Updated handleFullscreenChange function
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        addViolation(
          "MINOR",
          "Fullscreen exited",
          VIOLATION_WEIGHTS.FULLSCREEN_EXIT,
          "Interview must remain in fullscreen mode"
        );
        
        // Only create a new interval if one isn’t already running
        if (!fullscreenIntervalRef.current) {
          fullscreenIntervalRef.current = setInterval(() => {
            // Check if fullscreen has been achieved
            if (document.fullscreenElement) {
              clearInterval(fullscreenIntervalRef.current!);
              fullscreenIntervalRef.current = null;
              fullscreenRetryRef.current = 0;
            } else if (fullscreenRetryRef.current < 3) {
              document.documentElement.requestFullscreen().catch(() => {
                fullscreenRetryRef.current++;
              });
            } else {
              clearInterval(fullscreenIntervalRef.current!);
              fullscreenIntervalRef.current = null;
              fullscreenRetryRef.current = 0;
            }
          }, 1000);
        }
      } else if (fullscreenIntervalRef.current) {
        // If fullscreen is active but an interval exists, clear it
        clearInterval(fullscreenIntervalRef.current);
        fullscreenIntervalRef.current = null;
        fullscreenRetryRef.current = 0;
      }
    };

  // Update requestFullscreen function
  const requestFullscreen = async (retries = 3) => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        fullscreenRetryRef.current = 0;
      }
    } catch (error) {
      console.error('Fullscreen request failed:', error);
      if (retries > 0) {
        setTimeout(() => requestFullscreen(retries - 1), 2000);
      } else {
        addViolation(
          "CRITICAL",
          "Fullscreen enforcement failed",
          VIOLATION_WEIGHTS.FULLSCREEN_EXIT * 2,
          "System unable to maintain fullscreen mode"
        );
      }
    }
  };

    const handlePopState = () => {
      addViolation(
        "MAJOR",
        "Navigation attempted",
        VIOLATION_WEIGHTS.BROWSER_BACK,
        "Browser navigation is not allowed during the interview"
      );
      window.history.pushState(null, '', window.location.href);
    };


    const handleRightClick = (e: MouseEvent) => {
        e.preventDefault();
        addViolation(
          "MINOR",
          "Right-click attempted",
          VIOLATION_WEIGHTS.COPY_PASTE,
          "Context menu access is restricted"
        );
      }

    // Set up all event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("copy", handleCopyPaste);
    document.addEventListener("paste", handleCopyPaste);
    document.addEventListener("cut", handleCopyPaste);
    document.addEventListener("keydown", handleKeyboardShortcuts);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("popstate", handlePopState);
    document.addEventListener('contextmenu', handleRightClick);
    
    // Activity monitoring
    ["mousemove", "keydown", "click", "scroll"].forEach(event => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize the anti-cheat document
    setupAntiCheat();

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("copy", handleCopyPaste);
      document.removeEventListener("paste", handleCopyPaste);
      document.removeEventListener("cut", handleCopyPaste);
      document.removeEventListener("keydown", handleKeyboardShortcuts);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("popstate", handlePopState);
      
      ["mousemove", "keydown", "click", "scroll"].forEach(event => {
        document.removeEventListener(event, handleActivity);
      });

      clearInterval(inactivityInterval);
      clearInterval(focusCheckInterval);
      
      if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      
      document.body.style.userSelect = 'none';
      document.body.style.filter = 'none';
      
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, [
    isActive,
    addViolation,
    applyBackgroundBlur,
    handleActivity,
    handleKeyboardShortcuts,
    violations.lastActiveTimestamp,
    toast
  ]);

  return violations;
}