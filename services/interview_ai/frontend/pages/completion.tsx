// components/Completion.tsx
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { flagInterview, getSessionId, clearSessionId } from "@/lib/api";
import { Violation } from "@/hooks/useAntiCheat";

interface CompletionProps {
  completed: boolean;
  violations: Violation[];
  interviewId: string;
}

export default function Completion({ completed, violations, interviewId }: CompletionProps) {
  // Prevent server-side errors by not rendering the component on the server.
  if (typeof window === "undefined") {
    return null;
  }

  const hasFlagged = useRef(false);

  const [, setLocation] = useLocation();

  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(console.error);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!completed && !hasFlagged.current) {
      hasFlagged.current = true;

      const formattedViolations = violations
        .map((v) => `${v.type}: ${v.description}`)
        .join("\n");

      flagInterview(interviewId, formattedViolations).catch((error) => {
        console.error("Failed to flag interview:", error);
        hasFlagged.current = false;
      });
    }
  }, [completed, violations]);

  const handleFinish = () => {
    clearSessionId();
    try {
      window.close();
    } catch (e) {
      setLocation("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="rounded-xl shadow-lg">
          <CardHeader className="text-center space-y-4">
            <img
              src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
              alt="Kifiya Logo"
              className="h-12 mb-6 mx-auto"
            />

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
              {completed ? (
                <>
                  <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-green-700 mb-2">
                    Interview Completed
                  </h2>
                  <p className="text-muted-foreground">
                    Thank you for participating in the interview
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                  <h2 className="text-3xl font-bold text-red-700 mb-2">
                    Session Flagged
                  </h2>
                  <p className="text-muted-foreground">
                    Our team will review the session details
                  </p>
                </>
              )}
            </motion.div>
          </CardHeader>

          <CardContent>
            <div className="flex justify-center pt-6">
              <Button
                onClick={handleFinish}
                className="px-8 py-6 text-lg rounded-full transition-transform hover:scale-105 text-white"
                variant={completed ? "default" : "destructive"}
              >
                {completed ? "Finish Session" : "Close Window"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
