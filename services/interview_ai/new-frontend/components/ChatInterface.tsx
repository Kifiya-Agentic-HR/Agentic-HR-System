// components/ChatInterface.tsx
'use client';

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { useFaceDetection } from "@/hooks/useFaceDetection";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/schema";

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: ChatMessage[];
  onComplete: () => void;
  onStart: () => void;
}

export function ChatInterface({ 
  sessionId,
  initialMessages,
  onComplete,
  onStart
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { lookingAway, multipleFaces, confidenceScore } = useFaceDetection(videoRef);

  const chatMutation = useMutation({
    mutationFn: (message: string) => sendChatMessage(sessionId, message),
    onSuccess: (response) => {
      if (response.success) {
        setMessages(prev => [
          ...prev,
          { text: response.text, role: 'user' },
          { text: response.text, role: 'interviewer' }
        ]);
        
        if (response.state === 'completed') {
          onComplete();
        }
        
        if (!messages.length) onStart();
      }
    }
  });

  useEffect(() => {
    if (!messages.length && initialMessages.length === 0) {
      chatMutation.mutate("");
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

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
                <span>Multiple faces detected! Please ensure you are alone in the room.</span>
              </div>
            ) : lookingAway ? (
              <span>Please face the camera to continue</span>
            ) : (
              <span>Please ensure proper lighting conditions</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ScrollArea className="flex-1 p-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-4">
            <div className={`${
              msg.role === 'user' ? 'bg-blue-100' : 'bg-primary/10'
            } rounded-lg p-3`}>
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="mb-4 animate-pulse">
            <div className="bg-gray-100 rounded-lg p-3 w-3/4 h-12" />
          </div>
        )}
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="You: "
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