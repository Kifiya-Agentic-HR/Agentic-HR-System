"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, User, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FormSchemaType } from "@/app/hr/job-post/page";

type ChatMessage = {
  role: "user" | "assistant" | "error";
  content: string;
};

export const Chatbot = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { setValue, getValues } = useFormContext<FormSchemaType>();
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const handleAutoFillSuggestions = useCallback(
    (reply: string) => {
      try {
        const summaryMatch = reply.match(
          /Suggested Summary:\s*(.+?)(?=\n\*\*|\n$)/i
        );
        if (summaryMatch) {
          setValue("description.summary", summaryMatch[1].trim());
        }

        const skillsMatch = reply.match(
          /Suggested Skills:\s*(.+?)(?=\n\*\*|\n$)/i
        );
        if (skillsMatch) {
          const skills = skillsMatch[1]
            .split(",")
            .map((skill) => ({
              skill: skill.trim().replace(/[-•]/g, "").trim(),
              level: "intermediate",
            }))
            .filter((skill) => skill.skill.length > 0);

          if (skills.length > 0) {
            setValue("skills", skills);
          }
        }
      } catch (error) {
        console.error("Auto-fill error:", error);
      }
    },
    [setValue]
  );

  const handleSendMessage = useCallback(async () => {
    if (!chatInput.trim()) return;
    const newMessage = chatInput;
    setChatMessages((prev) => [...prev, { role: "user", content: newMessage }]);
    setChatInput("");
    setIsLoadingResponse(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      if (!apiKey) throw new Error("Gemini API key not configured");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

      const context = JSON.stringify(getValues(), null, 2);
      const prompt = `You are a job posting assistant. NOTICE: Respond in plain text format without using **asterisks** or any markdown formatting. Use normal punctuation instead of special characters for emphasis. Help the user with their job post based on:
- Current form data: ${context}
- User request: ${newMessage}

Format responses with clear section headers:
~Suggested Summary: [text] 
~Suggested Skills: [comma-separated list]
~Other Advice: [text]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: text },
      ]);
      handleAutoFillSuggestions(text);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: "Error processing request. Please try again.",
        },
      ]);
    } finally {
      setIsLoadingResponse(false);
    }
  }, [chatInput, getValues, handleAutoFillSuggestions]);

  const ChatMessageBubble = useCallback(
    ({ role, content }: ChatMessage) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${
          role === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-4 ${
            role === "user"
              ? "bg-[#FF8A00] text-white"
              : role === "error"
              ? "bg-red-100 text-red-700"
              : "bg-[#364957]/10 text-[#364957]"
          }`}
        >
          <div className="flex items-start gap-2">
            {role === "assistant" && (
              <Wand2 className="h-5 w-5 mt-1 text-[#FF8A00]" />
            )}
            <div className="whitespace-pre-wrap">{content}</div>
            {role === "user" && <User className="h-5 w-5 mt-1" />}
          </div>
        </div>
      </motion.div>
    ),
    []
  );

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      className="fixed bottom-24 right-8 z-50 w-full max-w-md h-[60vh] flex flex-col bg-white shadow-2xl rounded-xl overflow-hidden"
    >
      <div className="bg-[#364957] p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-[#FF8A00]" />
          <h3 className="text-white font-semibold">Job Posting Assistant</h3>
        </div>
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-white hover:bg-white/10 p-2 h-auto"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        <div className="text-center text-sm text-[#364957]/80">
          Ask me to help with job descriptions, suggest skills, or improve your
          post!
        </div>
        {chatMessages.map((msg, idx) => (
          <ChatMessageBubble key={`${msg.role}-${idx}`} {...msg} />
        ))}
        {isLoadingResponse && (
          <div className="flex items-center justify-start gap-2 text-[#364957]/80">
            <div className="animate-pulse">⏳</div>
            <div>Generating response...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t p-4 bg-[#f8f9fa]">
        <div className="flex gap-2">
          <Input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Ask for help with your job post..."
            className="flex-1 rounded-lg border-[#364957]/20"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoadingResponse}
            className="bg-[#FF8A00] hover:bg-[#FF8A00]/90"
          >
            Send
          </Button>
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {[
            "Suggest skills",
            "Improve summary",
            "Generate responsibilities",
          ].map((prompt) => (
            <Button
              key={prompt}
              variant="outline"
              className="text-xs h-8 rounded-full border-[#364957]/20 text-[#364957]"
              onClick={() => setChatInput(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
