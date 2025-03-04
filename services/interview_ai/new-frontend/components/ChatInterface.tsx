'use client';

import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendChatMessage } from "@/lib/api";
import type { ChatMessage } from "@/lib/schema";
import { AnimatePresence, motion } from "framer-motion";

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages: ChatMessage[];
  onComplete: () => void;
  onStart: () => void;
}

export function ChatInterface({
  sessionId,
  initialMessages = [],
  onComplete,
  onStart
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  /**
   * On mount:
   *   1) If there is already some chat history in initialMessages, load it.
   *   2) If no messages exist, fetch the first interview question by sending an empty message.
   */
  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      // No existing messages => ask for the interviewer's first prompt
      (async () => {
        try {
          setIsSending(true);
          const response = await sendChatMessage(sessionId, "");
          setIsSending(false);

          if (response?.success) {
            setMessages([{ text: response.text, role: "interviewer" }]);
            onStart?.();
            if (response.state === "completed") {
              onComplete?.();
            }
          }
        } catch (error) {
          console.error("Error initializing chat:", error);
          setIsSending(false);
        }
      })();
    }
  }, [sessionId, initialMessages, onComplete, onStart]);

  /**
   * Send a new user message, then await the interviewer response.
   */
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      text: message.trim(),
      role: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsSending(true);

    try {
      const response = await sendChatMessage(sessionId, userMsg.text);
      setIsSending(false);

      if (response?.success) {
        const interviewerMsg: ChatMessage = {
          text: response.text,
          role: "interviewer",
        };
        setMessages((prev) => [...prev, interviewerMsg]);

        if (response.state === "completed") {
          onComplete?.();
        } else {
          onStart?.(); // If it's ongoing/welcome, consider that "in progress"
        }
      }
    } catch (error) {
      console.error("Error sending chat:", error);
      setIsSending(false);
      // Optionally display an error or handle fallback
    }
  }

  return (
    <Card className="flex flex-col h-full shadow-lg rounded-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-sky-600 text-white p-4 text-xl font-bold">
        Kifiya
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-2 bg-gray-50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="mb-4"
            >
              <div
                className={`
                  rounded-lg p-3 max-w-[80%]
                  ${
                    msg.role === "user"
                      ? "bg-blue-500 text-white ml-auto text-right"
                      : "bg-gray-100 text-gray-800 mr-auto"
                  }
                `}
              >
                <p className="text-sm whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          {isSending && (
            <motion.div
              key="thinking-bubble"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="mb-4"
            >
              <div className="bg-gray-200 text-gray-700 rounded-lg p-3 max-w-[80%] mr-auto animate-pulse">
                <p className="text-sm">Thinking…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Input + Send Button */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <Input
            placeholder="Type your answer…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
          />
          <Button
            type="submit"
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
}