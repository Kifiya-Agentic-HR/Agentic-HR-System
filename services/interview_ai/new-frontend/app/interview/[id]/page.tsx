'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { VideoFeed } from "@/components/VideoFeed";
import { ChatInterface } from "@/components/ChatInterface";
import { PreInterviewCheck } from "@/components/PreInterviewCheck";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import Completion from "@/pages/completion";
import { createSession, getSessionId, saveSessionId } from "@/lib/api";
import type { ChatMessage } from "@/lib/schema";
import { useToast } from "@/hooks/use-toast";

export default function Interview() {
  const params = useParams();
  const interviewId = params?.id as string;
  const [isCheckComplete, setIsCheckComplete] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  const violations = useAntiCheat(isInterviewStarted);

  useEffect(() => {
    const initializeSession = async () => {
      
      const existingSessionId = getSessionId();
      if (existingSessionId) {
        setSessionId(existingSessionId);
        return;
      }

      try {
        const sessionResponse = await createSession(interviewId);
        if (sessionResponse.success && sessionResponse.sessionId) {
          saveSessionId(sessionResponse.sessionId);
          setSessionId(sessionResponse.sessionId);
          setChatHistory(sessionResponse.chatHistory);
        }
      } catch (error) {
        console.error('Session initialization failed:', error);
        window.location.href = `/${interviewId}`;
      }
    };

    if (isCheckComplete) initializeSession();
  }, [isCheckComplete, interviewId]);

  useEffect(() => {
    if (violations.totalWeight >= 10) {
      setIsInterviewComplete(true);
      setIsInterviewStarted(false);
    }
  }, [violations.totalWeight]);

  if (!isCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <PreInterviewCheck 
          onComplete={() => setIsCheckComplete(true)}
          interviewId={interviewId}
        />
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <Completion
        violations={violations.violations}
        completed={violations.totalWeight < 8}
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
              onComplete={() => setIsInterviewComplete(true)}
              onStart={() => setIsInterviewStarted(true)}
            />
          )}
        </div>
        {isInterviewStarted && <VideoFeed />}
      </div>
    </div>
  );
}