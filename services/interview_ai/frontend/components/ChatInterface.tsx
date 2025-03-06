"use client";

import React, { useEffect, useState, FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendChatMessage, ChatResponse } from "@/lib/api";
import type { ChatMessage } from "@/lib/schema";
import { AnimatePresence, motion } from "framer-motion";

interface ChatInterfaceProps {
  sessionId: string;
  initialMessages?: ChatMessage[];
  onComplete?: () => void;
  onStart?: () => void;
}

export function ChatInterface({
  sessionId,
  initialMessages = [],
  onComplete,
  onStart,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function fetchInitialPrompt(): Promise<void> {
    setErrorMessage(null);
    setIsSending(true);
    try {
      const response: ChatResponse = await sendChatMessage(sessionId, "");
      setIsSending(false);

      if (response?.success) {
        const interviewerMsg: ChatMessage = {
          text: response.text,
          role: "interviewer",
        };
        setMessages((prev) => [...prev, interviewerMsg]);
        onStart?.();

        if (response.state === "completed") {
          onComplete?.();
        }
      } else {
        throw new Error("Server responded with an error");
      }
    } catch (error: unknown) {
      setIsSending(false);
      const err = (error as Error)?.message || "Unknown error occurred.";
      setErrorMessage(`Error initializing chat: ${err}`);
      console.error("Error initializing chat:", error);
      // Retry after 3 seconds
      setTimeout(fetchInitialPrompt, 3000);
    }
  }

  useEffect(() => {
    if (initialMessages.length > 0) {
      setMessages(initialMessages);
    } else {
      fetchInitialPrompt();
      console.log("Fetching initial prompt");
    }
  }, [initialMessages]);

  async function handleSend(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    if (!message.trim()) return;

    setErrorMessage(null);
    const userMsg: ChatMessage = {
      text: message.trim(),
      role: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setMessage("");
    setIsSending(true);

    try {
      const response: ChatResponse = await sendChatMessage(sessionId, userMsg.text);
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
          onStart?.();
        }
      } else {
        throw new Error("An unknown server error occurred");
      }
    } catch (error: unknown) {
      setIsSending(false);
      const err = (error as Error)?.message || "Unknown error occurred.";
      setErrorMessage(`Error sending message: ${err}`);
      console.error("Error sending message:", error);
    }
  }

  return (
    <Card className="flex flex-col h-full w-full max-w-2xl mx-auto shadow-xl rounded-xl overflow-hidden border-0">
      {/* Header with improved styling */}
      <div className="bg-[#364957] p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src="https://kifiya.com/wp-content/uploads/2022/12/Logo.svg"
            alt="Kifiya Logo"
            className="h-8 brightness-0 invert" // Makes the logo white
          />
          <div className="h-6 w-px bg-white/30" /> {/* Separator */}
          <span className="text-white text-xl font-semibold">AI Interview</span>
        </div>
      </div>

      {/* Error message with improved styling */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-50 border-l-4 border-red-500 p-4"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages area with improved styling */}
      <ScrollArea className="flex-1 px-6 py-4 bg-gray-50">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="mb-4 w-full flex"
            >
              <div
                className={`
                  rounded-lg p-4 max-w-[80%] shadow-sm
                  ${
                    msg.role === "user"
                      ? "ml-auto bg-[#364957] text-white"
                      : "mr-auto bg-white border border-gray-200 text-[#364957]"
                  }
                `}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{msg.text}</p>
              </div>
            </motion.div>
          ))}

          {isSending && (
            <motion.div
              key="thinking-bubble"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="mb-4 w-full flex"
            >
              <div className="mr-auto bg-white border border-gray-200 text-gray-600 rounded-lg p-4 max-w-[80%] shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce">●</div>
                  <div className="animate-bounce [animation-delay:0.2s]">●</div>
                  <div className="animate-bounce [animation-delay:0.4s]">●</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      {/* Input area with improved styling */}
      <form onSubmit={handleSend} className="p-6 bg-white border-t border-gray-100">
        <div className="flex gap-3">
          <Input
            placeholder="Type your answer…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isSending}
            className="flex-1 bg-gray-50 border-gray-200 focus:border-[#364957] focus:ring-[#364957]"
          />
          <Button
            type="submit"
            disabled={isSending}
            className="bg-[#364957] hover:bg-[#364957]/90 text-white px-6 font-medium"
          >
            Send
          </Button>
        </div>
      </form>
    </Card>
  );
}