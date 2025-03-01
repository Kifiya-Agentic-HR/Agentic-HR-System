import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ViolationState } from "@/hooks/useAntiCheat";

interface CompletionProps {
  violations: ViolationState;
  completed: boolean;
}

export default function Completion({ violations, completed }: CompletionProps) {
  const [, setLocation] = useLocation();

  const handleFinish = () => {
    setLocation("/");
  };

  const hasMajorViolations = violations.totalWeight >= 5;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card>
          <CardHeader className="text-center">
            <img 
              src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg" 
              alt="Kifiya Logo" 
              className="h-12 mb-6 mx-auto"
            />
            {completed && !hasMajorViolations ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-green-700">Interview Completed Successfully</h2>
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-red-700">Interview Flagged</h2>
              </motion.div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {violations.violations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Detected Violations:</h3>
                <div className="space-y-2">
                  {violations.violations.map((violation, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg ${
                        violation.type === "MAJOR" ? "bg-red-100" : "bg-yellow-100"
                      }`}
                    >
                      <p className="text-sm">
                        <span className="font-medium">
                          {violation.type === "MAJOR" ? "Major Violation" : "Minor Violation"}:
                        </span>{" "}
                        {violation.description}
                      </p>
                    </motion.div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Total Violation Weight: {violations.totalWeight.toFixed(1)}
                </p>
              </div>
            )}

            <div className="flex justify-center pt-4">
              <Button
                onClick={handleFinish}
                className="px-8"
                variant={completed && !hasMajorViolations ? "default" : "destructive"}
              >
                Return to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
