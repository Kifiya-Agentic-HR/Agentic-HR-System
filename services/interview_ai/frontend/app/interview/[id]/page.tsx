'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoFeed } from "@/components/VideoFeed";
import { ChatInterface } from "@/components/ChatInterface";
import { PreInterviewCheck } from "@/components/PreInterviewCheck";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import Completion from "@/pages/completion";
import { createSession, clearSessionId } from "@/lib/api";
import type { ChatMessage } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";

export default function Interview() {
  const params = useParams();
  const interviewId = params?.id as string;
  const { toast } = useToast();
  if (!interviewId) {
    const router = useRouter();
    router.push("/");
    return null;
  }
  const [isCheckComplete, setIsCheckComplete] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Expose toggleFullScreen from the anti-cheat hook (if needed later)
  const { violations } = useAntiCheat(isInterviewStarted);

  // This function is invoked directly via the PreInterviewCheck button click.
  // Calling requestFullscreen() synchronously here ensures it counts as a user gesture.
  const handleStartInterview = () => {
    setIsInterviewStarted(true);
    setIsCheckComplete(true);
  };

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const sessionResponse = await createSession(interviewId);
        if (sessionResponse.success && sessionResponse.sessionId) {
          setSessionId(sessionResponse.sessionId);
          setChatHistory(sessionResponse.chatHistory);
        }
      } catch (error) {
        console.error("Session initialization failed:", error);
        window.location.href = `/${interviewId}`;
      }
    };

    if (isCheckComplete) initializeSession();
  }, [isCheckComplete, interviewId]);

  useEffect(() => {
    if (violations.totalWeight >= 18) {
      setIsInterviewComplete(true);
      setIsInterviewStarted(false);
    }
  }, [violations.totalWeight]);

  useEffect(() => {
    const majorViolation = violations.violations.find(
      (v) => v.type === "MAJOR" || v.type === "CRITICAL" || v.type === "MINOR"
    );

    if (majorViolation) {
      toast({
        variant: "destructive",
        title: "Security Violation Detected",
        description: `${majorViolation.description} - ${new Date(
          majorViolation.timestamp
        ).toLocaleTimeString()}`,
        duration: 5000,
      });
    }
  }, [violations.violations]);

  if (!isCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <PreInterviewCheck onComplete={handleStartInterview} />
      </div>
    );
  }

  if (isInterviewComplete) {
    clearSessionId();

    return (
      <Completion
        violations={violations.violations}
        completed={violations.totalWeight < 18}
        interviewId={interviewId}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 h-screen">
        <div className="h-full">
          {sessionId && (
            <ChatInterface
              sessionId={sessionId}
              initialMessages={chatHistory}
              onComplete={() => {
                setIsInterviewComplete(true);
                setIsInterviewStarted(false);
              }}
              onStart={() => setIsInterviewStarted(true)}
            />
          )}
        </div>
        {isInterviewStarted && <VideoFeed />}
      </div>
    </div>
  );
}