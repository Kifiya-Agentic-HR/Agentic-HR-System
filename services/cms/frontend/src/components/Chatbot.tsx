"use client";

import { useState, useEffect } from "react";
import { Job, Application } from "./jobs/types";
import { getJobApplications } from "@/lib/api";
import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
    "AIzaSyBOZfZH8sLc61pMRJlFB4Yt40eKqhucPCA                                                "
);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

interface ChatMessage {
  role: "user" | "bot";
  content: string;
}


const sanitizeResponse = (text: string): string => {
  return text.replace(/\*{3,}/g, "");
};

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
Screening Status: ${app.screening.score ? "Completed" : "Pending"}
Screening Score: ${app.screening.score || "N/A"}
Screening Reasoning: ${app.screening.reasoning || "N/A"}
${app.screening.parsed_cv ? `Parsed CV Data:\n${app.screening.parsed_cv}` : ""}
Screening Updated: ${app.screening.created_at || "N/A"}
      `
      : "Screening: Pending";

    const interview = app.interview
      ? `
Interview Status: ${app.interview.interview_status}
Interview Score: ${app.interview.score || "N/A"}
Hiring Decision: ${app.interview.hiring_decision || "N/A"}
Interview Reasoning: ${app.interview.interview_reasoning || "N/A"}
Skill Assessment: ${app.interview.skill_assessment || "N/A"}
Interview Updated: ${app.interview.created_at || "N/A"}
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

  const getSelectionMessage = (step: string, items: any[]): string => {
    if (step === "selectJob") {
      return (
        "Hello, I hope you're having a great day. Please select a job by typing the corresponding number:\n" +
        items.map((job, index) => `${index + 1}. ${job.title}`).join("\n")
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


  const detectIntent = (message: string): string => {
    const lowerMsg = message.toLowerCase().trim();
    const changeJobCmds = ["change job", "switch job", "select new job"];
    const changeApplicantCmds = [
      "change applicant",
      "switch applicant",
      "select new applicant",
    ];
    // Only trigger greeting when the message exactly equals one of these words
    const greetings = ["hello", "hi", "hey", "good morning", "good afternoon"];
    const goodbyes = ["bye", "goodbye", "see you", "exit", "quit"];

    if (changeJobCmds.some((c) => lowerMsg.includes(c))) return "changeJob";
    if (changeApplicantCmds.some((c) => lowerMsg.includes(c)))
      return "changeApplicant";
    if (greetings.includes(lowerMsg)) return "greeting";
    if (goodbyes.some((g) => lowerMsg.includes(g))) return "goodbye";
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

    // Detect and handle intents first
    const intent = detectIntent(input);
    if (intent) {
      let botResponse = "";
      switch (intent) {
        case "greeting":
          botResponse = "Hello! How I hope you're having a great day.";
          setMessages((prev) => [
            ...prev,
            { role: "bot", content: botResponse },
          ]);
          if (currentStep === "selectJob") {
            const jobPrompt = getSelectionMessage("selectJob", jobs);
            setMessages((prev) => [
              ...prev,
              { role: "bot", content: jobPrompt },
            ]);
          } else if (
            currentStep === "selectApplicant" &&
            applications.length > 0
          ) {
            const applicantPrompt = getSelectionMessage(
              "selectApplicant",
              applications
            );
            setMessages((prev) => [
              ...prev,
              { role: "bot", content: applicantPrompt },
            ]);
          }
          break;
        case "goodbye":
          botResponse = "Goodbye! Have a great day!";
          break;
        case "changeJob":
          setSelectedJob(null);
          setSelectedApplication(null);
          setApplications([]);
          setCurrentStep("selectJob");
          botResponse = `Changing job. ${getSelectionMessage(
            "selectJob",
            jobs
          )}`;
          break;
        case "changeApplicant":
          if (!selectedJob) {
            botResponse = "Please select a job first.";
          } else {
            try {
              const resp = await getJobApplications(selectedJob._id);
              if (resp.success && resp.applications) {
                setApplications(resp.applications);
                setCurrentStep("selectApplicant");
                setSelectedApplication(null);
                botResponse = `Changing applicant. ${getSelectionMessage(
                  "selectApplicant",
                  resp.applications
                )}`;
              } else {
                botResponse = "Failed to fetch applicants.";
              }
            } catch (error) {
              botResponse = "Error fetching applicants.";
            }
          }
          break;
        // ... handle other intents if needed ...
        default:
          break;
      }
      if (intent !== "greeting") {
        setMessages((prev) => [...prev, { role: "bot", content: botResponse }]);
      }
      setInput("");
      setIsLoading(false);
      return;
    }

    // Handle normal conversation flow
    if (currentStep === "selectJob") {
      const selection = parseInt(input) - 1;
      if (selection >= 0 && selection < jobs.length) {
        const job = jobs[selection];
        setSelectedJob(job);
        setCurrentStep("selectApplicant");

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
      RETURN TYPE: TEXT (NO MARKDOWN)
You are an HR assistant. Based on the following applicant information, answer the question. If the information is not available in the provided data, respond with "I'm sorry, that information is not available. \n\nNOTICE: Do NOT return markdowns."

Applicant Information:
${applicantInfo}

Question: ${question}
      `;

      try {
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: promptText }] }],
        });
        const response = await result.response;
        let text = response.text();
        // Sanitize to remove unwanted markdown formatting
        text = sanitizeResponse(text);
        setMessages((prev) => [...prev, { role: "bot", content: text }]);
      } catch (error: any) {
        console.error("API Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            content: "Sorry, I encountered an error. Please try again.",
          },
        ]);
      }
    }

    setInput("");
    setIsLoading(false);
  };

  return (
    <div>

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
