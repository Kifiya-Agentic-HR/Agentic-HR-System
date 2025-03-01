'use client';

import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { VideoFeed } from "@/components/VideoFeed";
import { ChatInterface } from "@/components/ChatInterface";
import { PreInterviewCheck } from "@/components/PreInterviewCheck";
import { useAntiCheat } from "@/hooks/useAntiCheat";
import Completion from "@/pages/completion";

export default function Interview() {
  const { id } = useParams<{ id: string }>();
  const [isCheckComplete, setIsCheckComplete] = useState(false);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);

  // Activate anti-cheat only when interview starts
  const violations = useAntiCheat(isInterviewStarted);

  useEffect(() => {
    if (violations.totalWeight >= 10) {
      setIsInterviewComplete(true);
    }
  }, [violations.totalWeight]);

  if (!isCheckComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <PreInterviewCheck onComplete={() => setIsCheckComplete(true)} />
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <Completion
        violations={violations}
        completed={violations.totalWeight < 8}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 h-screen">
        <div className="h-full">
          <ChatInterface
            sessionId={id}
            onComplete={() => setIsInterviewComplete(true)}
            onStart={() => setIsInterviewStarted(true)}
          />
        </div>
        {/* Only show VideoFeed when interview starts */}
        {isInterviewStarted && <VideoFeed />}
      </div>
    </div>
  );
}
