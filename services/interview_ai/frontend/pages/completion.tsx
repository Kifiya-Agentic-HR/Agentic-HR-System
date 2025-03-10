// components/Completion.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Loader2, XCircle } from "lucide-react";
import { flagInterview, getSessionId, clearSessionId } from "@/lib/api";
import { Violation } from "@/hooks/useAntiCheat";
import { cn } from "@/lib/utils";
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

interface CompletionProps {
  completed: boolean;
  violations: Violation[];
  interviewId: string;
}

const MotionCard = motion(Card);

export default function Completion({ completed, violations, interviewId }: CompletionProps) {
  const { toast } = useToast();
  const [isFlagging, setIsFlagging] = useState(false);
  const [flagError, setFlagError] = useState<string | null>(null);
  const [showViolations, setShowViolations] = useState(false);
  const hasFlagged = useRef(false);
  const [, setLocation] = useLocation();

  // Server-side guard
  if (typeof window === "undefined") return null;

  // Fullscreen cleanup
  useEffect(() => {
    const cleanupFullscreen = () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
    
    return cleanupFullscreen;
  }, []);

  // Flagging effect
  useEffect(() => {
    if (!completed && !hasFlagged.current) {
      setIsFlagging(true);
      hasFlagged.current = true;

      const formattedViolations = violations
        .map((v) => `${v.type}: ${v.description}`)
        .join("\n");

      flagInterview(interviewId, formattedViolations)
        .then(() => {
          toast({
            title: "Session Flagged",
            description: "Our team has been notified for review",
          });
        })
        .catch((error) => {
          console.error("Flagging error:", error);
          setFlagError(error.message || "Failed to flag session");
          toast({
            variant: "destructive",
            title: "Flagging Error",
            description: "Could not report session violations",
            action: (
              <ToastAction altText="Retry" onClick={() => window.location.reload()}>
                Retry
              </ToastAction>
            ),
          });
          hasFlagged.current = false;
        })
        .finally(() => setIsFlagging(false));
    }
  }, [completed, violations, interviewId, toast]);

  const handleFinish = () => {
    clearSessionId();
    setLocation("/");
  };

  const StatusIcon = completed ? CheckCircle2 : AlertCircle;
  const statusColor = completed ? "text-green-500" : "text-red-500";
  const statusTitle = completed ? "Interview Completed" : "Session Flagged";
  const statusDescription = completed
    ? "Thank you for participating in the interview"
    : "Our team will review the session details";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <MotionCard
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-background to-muted/10" />
        
        <CardHeader className="text-center space-y-4 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
          >
            <img
              src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
              alt="Kifiya Logo"
              className="h-12 mb-6 mx-auto"
              aria-hidden="true"
            />
          </motion.div>

          <motion.div
            initial={{ rotate: -10, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            className="flex justify-center"
          >
            <StatusIcon
              className={cn("h-20 w-20 mx-auto mb-4", statusColor)}
              aria-label={completed ? "Success" : "Warning"}
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold mb-2"
          >
            {statusTitle}
          </motion.h2>
          <p className="text-muted-foreground">{statusDescription}</p>
        </CardHeader>

        <CardContent className="relative z-10">
          {!completed && violations.length > 0 && (
            <div className="mb-6">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => setShowViolations(!showViolations)}
              >
                {showViolations ? "Hide Details" : "View Violations"}
                <span className="ml-2 text-muted-foreground">
                  ({violations.length})
                </span>
              </Button>

              <AnimatePresence>
                {showViolations && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 text-sm"
                  >
                    {violations.map((violation, index) => (
                      <li
                        key={index}
                        className="p-3 bg-muted/10 rounded-lg flex items-start"
                      >
                        <XCircle className="h-4 w-4 mt-1 mr-2 text-red-500 flex-shrink-0" />
                        <div>
                          <p className="font-medium">{violation.type}</p>
                          <p className="text-muted-foreground">
                            {violation.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <Button
              onClick={handleFinish}
              className="px-8 py-6 text-lg rounded-full transition-transform hover:scale-105"
              variant={completed ? "default" : "destructive"}
              disabled={isFlagging}
              aria-busy={isFlagging}
            >
              {isFlagging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : completed ? (
                "Session Completed"
              ) : (
                "Close Window"
              )}
            </Button>

            {!completed && (
              <p className="text-sm text-muted-foreground text-center">
                If the window doesn't close automatically, please close this tab
              </p>
            )}
          </div>
        </CardContent>

        {flagError && (
          <CardFooter className="relative z-10">
            <div className="w-full text-center text-red-500 text-sm">
              <AlertCircle className="inline-block h-4 w-4 mr-2" />
              {flagError}
            </div>
          </CardFooter>
        )}
      </MotionCard>
    </div>
  );
}