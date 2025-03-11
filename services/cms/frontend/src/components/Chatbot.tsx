"use client";

import { useState, useEffect } from "react";
import { Job, Application } from "./jobs/types";
import { getJobApplications } from "@/lib/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}

export const Chatbot = ({ jobs }: { jobs: Job[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<
    "selectJob" | "selectApplicant" | "askQuestion"
  >("selectJob");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Format applicant data for Gemini API prompt
  const formatApplicantData = (app: Application): string => {
    const screening = app.screening
      ? `
Screening Status: ${app.screening.status}
Screening Reasoning: ${app.screening.reasoning || "N/A"}
${app.screening.parsed_cv ? `Parsed CV Data:\n${app.screening.parsed_cv}` : ""}
Screening Updated: ${app.screening.updatedAt || "N/A"}
      `
      : "Screening: Pending";

    const interview = app.interview
      ? `
Interview Status: ${app.interview.interview_status}
Hiring Decision: ${app.interview.hiring_decision || "N/A"}
Interview Reasoning: ${app.interview.interview_reasoning || "N/A"}
Interview Updated: ${app.interview.updatedAt || "N/A"}
      `
      : "Interview: Pending";

    return `
Name: ${app.candidate.full_name}
Email: ${app.candidate.email}
Phone: ${app.candidate.phone_number}
Experience: ${app.candidate.experience_years} years
Skills: ${app.candidate.skills.join(", ")}
Disability: ${app.candidate.disability || "None"}
Feedback: ${app.candidate.feedback || "N/A"}
Applied Date: ${new Date(app.created_at).toLocaleDateString()}
CV Link: ${app.cv_link}
${screening}
${interview}
    `;
  };

  // Generate selection message for jobs or applicants
  const getSelectionMessage = (step: string, items: any[]): string => {
    if (step === "selectJob") {
      return (
        "Hello! Please select a job by typing the corresponding number:\n" +
        items
          .map((job, index) => `${index + 1}. ${job.title} (ID: ${job._id})`)
          .join("\n")
      );
    } else if (step === "selectApplicant") {
      return (
        "Please select an applicant by typing the corresponding number:\n" +
        items
          .map((app, index) => `${index + 1}. ${app.candidate.full_name}`)
          .join("\n")
      );
    }
    return "";
  };

  // Initialize chatbot when opened
  useEffect(() => {
    if (isOpen && messages.length === 0 && currentStep === "selectJob") {
      const selectionMessage = getSelectionMessage("selectJob", jobs);
      setMessages([{ role: "bot", content: selectionMessage }]);
    }
  }, [isOpen, currentStep, jobs, messages.length]);

  // Handle user input
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: input }]);
    setIsLoading(true);

    if (currentStep === "selectJob") {
      const selection = parseInt(input) - 1;
      if (selection >= 0 && selection < jobs.length) {
        const job = jobs[selection];
        setSelectedJob(job);
        setCurrentStep("selectApplicant");

        // Fetch applications
        const resp = await getJobApplications(job._id);
        if (resp.success && resp.applications) {
          setApplications(resp.applications);
          const selectionMessage = getSelectionMessage(
            "selectApplicant",
            resp.applications
          );
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: `You selected ${job.title}. ${selectionMessage}`,
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "bot",
              content: "Failed to fetch applications. Please try again.",
            },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Invalid selection. Please try again." },
        ]);
      }
    } else if (currentStep === "selectApplicant") {
      const selection = parseInt(input) - 1;
      if (selection >= 0 && selection < applications.length) {
        const app = applications[selection];
        setSelectedApplication(app);
        setCurrentStep("askQuestion");
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: `You selected ${app.candidate.full_name}. What would you like to know about this applicant?`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", content: "Invalid selection. Please try again." },
        ]);
      }
    } else if (currentStep === "askQuestion" && selectedApplication) {
      const question = input;
      const applicantInfo = formatApplicantData(selectedApplication);
      const promptText = `
You are an HR assistant. Based on the following applicant information, answer the question. If the information is not available in the provided data, respond with "I'm sorry, that information is not available."

Applicant Information:
${applicantInfo}

Question: ${question}
      `;

      // Structure the prompt as required by the Gemini API
      const prompt = {
        contents: [
          {
            parts: [
              {
                text: promptText,
              },
            ],
          },
        ],
      };

      try {
        // Log the prompt for debugging
        console.log("Sending prompt:", JSON.stringify(prompt, null, 2));
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        setMessages((prev) => [...prev, { role: "bot", content: text }]);
      } catch (error: any) {
        // Enhanced error logging
        console.error(
          "Gemini API Error:",
          error.response?.data || error.message
        );
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: `Error: ${
              error.response?.data?.error?.message || error.message
            }`,
          },
        ]);
      }
    }

    setInput("");
    setIsLoading(false);
  };

  return (
    <div>
      {/* Chatbot Icon/Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-[#FF8A00] text-white p-3 rounded-full shadow-lg hover:bg-[#FF8A00]/90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>

      {/* Chatbot Interface */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 w-96 bg-white rounded-lg shadow-xl border border-[#364957]/20">
          <div className="flex justify-between items-center p-4 border-b border-[#364957]/20">
            <h3 className="text-lg font-semibold text-[#364957]">HR Chatbot</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#364957] hover:text-[#FF8A00]"
            >
              ×
            </button>
          </div>
          <div className="h-80 overflow-y-auto p-4 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.role === "user"
                    ? "ml-auto bg-[#FF8A00]/10 text-[#364957]"
                    : "mr-auto bg-[#364957]/10 text-[#364957]"
                } max-w-[80%] p-2 rounded-lg whitespace-pre-wrap`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && <div className="text-[#364957]/60">Typing...</div>}
          </div>
          <div className="p-4 border-t border-[#364957]/20 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 p-2 rounded-lg border border-[#364957]/20 focus:outline-none focus:border-[#FF8A00]"
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              className="bg-[#FF8A00] text-white px-4 py-2 rounded-lg hover:bg-[#FF8A00]/90 disabled:bg-[#FF8A00]/50"
              disabled={isLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
