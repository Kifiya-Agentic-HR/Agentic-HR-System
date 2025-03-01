'use client';

import { useState, useRef, forwardRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import type { ChatMessage } from "@/lib/schema";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { VideoComponent } from "./VideoComponent";


interface ChatInterfaceProps {
  sessionId: string;
  onComplete: () => void;
}

export function ChatInterface({ sessionId, onComplete }: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const { lookingAway, multipleFaces, confidenceScore } = useFaceDetection(videoRef);

  const { data: initialMessage } = useQuery({
    queryKey: ["/api/chat", sessionId],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/chat", {
        session_id: sessionId,
        user_answer: ""
      });
      return res.json();
    }
  });

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiRequest("POST", "/api/chat", {
        session_id: sessionId,
        user_answer: message
      });
      return res.json();
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (message.trim().toUpperCase() === "END") {
      onComplete();
      return;
    }

    chatMutation.mutate(message);
    setMessage("");
  };

  return (
    <Card className="flex flex-col h-full relative">
      <AnimatePresence>
        {(lookingAway || multipleFaces || confidenceScore < 0.6) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`absolute top-0 left-0 right-0 z-10 p-2 text-center text-sm ${
              multipleFaces ? "bg-red-500" : "bg-[#FF8A00]"
            } text-white`}
          >
            {multipleFaces ? (
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Multiple faces detected! This will be reported.</span>
              </div>
            ) : lookingAway ? (
              <span>Please face the camera to continue</span>
            ) : (
              <span>Please ensure proper lighting conditions</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <VideoComponent ref={videoRef} />

      <ScrollArea className="flex-1 p-4">
        {initialMessage && (
          <div className="mb-4">
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm">{initialMessage.text}</p>
            </div>
          </div>
        )}
        {chatMutation.data && (
          <div className="mb-4">
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm">{chatMutation.data.text}</p>
            </div>
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your response... (type 'END' to finish)"
            disabled={chatMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={chatMutation.isPending}
            className="bg-[#364957] hover:bg-[#364957]/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
