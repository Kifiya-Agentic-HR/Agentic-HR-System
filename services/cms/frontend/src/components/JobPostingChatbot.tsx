"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2, User, X, CheckCircle } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { FormSchemaType } from "@/app/hr/job-post/page";

type ChatMessage = {
  role: "user" | "assistant" | "error";
  content: string;
};

type ParsedData = {
  title?: string;
  description?: {
    summary?: string;
    responsibilities?: string;
    location?: string;
  };
  skills?: Array<{ skill: string; level: string }>;
};

export const Chatbot = ({
  isOpen,
  onClose,
  form,
}: {
  isOpen: boolean;
  onClose: () => void;
  form: any;
}) => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [autoFillData, setAutoFillData] = useState<ParsedData | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  const parseAssistantReply = (reply: string): ParsedData => {
    const parsedData: ParsedData = {
      title: "",
      description: {
        summary: "",
        responsibilities: "",
        location: "Addis Ababa, Ethiopia",
      },
      skills: [],
    };

    try {
      const sanitizedReply = reply.replace(/\*/g, '');

      const titleMatch = sanitizedReply.match(/Suggested Title:\s*(.+?)(?=\n|$)/i);
      if (titleMatch) parsedData.title = titleMatch[1].trim();

      const summaryMatch = sanitizedReply.match(
        /Suggested Summary:\s*(.+?)(?=\n|$)/i
      );
      if (summaryMatch) parsedData.description!.summary = summaryMatch[1].trim();

      const responsibilitiesMatch = sanitizedReply.match(
        /Suggested Responsibilities:\s*([\s\S]+?)(?=\nSuggested|\n$)/i
      );
      if (responsibilitiesMatch) {
        parsedData.description!.responsibilities = responsibilitiesMatch[1]
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[-•]\s*/, '').trim()) // remove bullets
          .join('\n'); // join with new lines for textarea
      }

      const locationMatch = sanitizedReply.match(
        /Suggested Location:\s*(.+?)(?=\n|$)/i
      );
      if (locationMatch) {
        parsedData.description!.location = locationMatch[1].trim();
      }

      const skillsMatch = sanitizedReply.match(
        /Suggested Skills:\s*([\s\S]+?)(?=\nSuggested|\n$)/i
      );
      if (skillsMatch) {
        parsedData.skills = skillsMatch[1]
          .split("\n")
          .map((skill) => {
            const match = skill.match(/(.+?)\s*-\s*(beginner|intermediate|expert)/i);
            return match ? {
              skill: match[1].trim(),
              level: match[2].toLowerCase()
            } : {
              skill: skill.replace(/[-•]/g, '').trim(),
              level: "intermediate"
            };
          })
          .filter(skill => skill.skill.length > 0);
      }

      return parsedData;
    } catch (error) {
      console.error("Parsing error:", error);
      return parsedData;
    }
  };

  const handleAutoFill = useCallback(() => {
    if (!autoFillData) return;
  
    form.setValue("title", autoFillData.title || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  
    form.setValue("description.summary", autoFillData.description?.summary || "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  
    form.setValue(
      "description.responsibilities",
      autoFillData.description?.responsibilities || "",
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  
    form.setValue(
      "description.location",
      autoFillData.description?.location || "Addis Ababa, Ethiopia",
      {
        shouldValidate: true,
        shouldDirty: true,
      }
    );
  
    form.setValue("skills", autoFillData.skills || [], {
      shouldValidate: true,
      shouldDirty: true,
    });
  
    toast.success("Form fields auto-filled successfully!");
  }, [autoFillData, form]);
  

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

      const context = JSON.stringify(form.getValues(), null, 2);
      const prompt = `You are a job posting assistant. NOTICE:make sure each responsibilities are in new line.
      Respond in this EXACT format:
Suggested Title: [Job Title]

Suggested Summary: [2-3 sentence summary]

Suggested Responsibilities:
[Bullet point 1]
[Bullet point 2]
[Bullet point 3]

Suggested Location: Addis Ababa, Ethiopia

Suggested Skills:
[Skill 1] - [Level]
[Skill 2] - [Level]

Help the user with their job post based on:
- Current form data: ${context}
- User request: ${newMessage}
- Always use Addis Ababa, Ethiopia as default location unless specified otherwise`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = await response.text();

      const parsedData = parseAssistantReply(text);
      setAutoFillData(parsedData);

      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: text.replace(/\*/g, '') },
      ]);
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
  }, [chatInput, form]);

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
          {role === "assistant" && autoFillData && (
            <Button
              onClick={handleAutoFill}
              className="mt-2 bg-[#364957] hover:bg-[#364957]/90 text-xs h-8 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Autofill Form
            </Button>
          )}
        </div>
      </motion.div>
    ),
    [autoFillData, handleAutoFill]
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
