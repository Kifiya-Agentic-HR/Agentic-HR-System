"use client";

import { Application } from "../jobs/types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  FileText,
  MessageSquareText,
  Zap,
  Pencil,
} from "lucide-react";
import { motion } from "framer-motion";
import ProgressBar from "@/components/ui/progress-bar";
import {
  acceptApplication,
  rejectApplication,
  scheduleInterview,
  updateScreeningScore,
} from "@/lib/api";
import { useState } from "react";

const StatusPopup = ({
  application,
  type,
  onClose,
  refreshApplications,
}: {
  application: Application;
  type: "screening" | "interview";
  onClose: () => void;
  refreshApplications: () => Promise<void>;
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<
    "hire" | "reject" | "schedule" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editableScore, setEditableScore] = useState(
    application.screening?.score
      ? Number(application.screening.score)
      : ""
  );

  const [screeningComment, setScreeningComment] = useState(
    application.screening?.comment || ""
  );

  const isActionable = application.application_status === "pending";
  const hasInterviewScheduled =
    application.interview &&
    ["scheduled", "completed", "flagged"].includes(
      application.interview.interview_status
    );

  const handleScheduleInterview = async () => {
    try {
      setIsProcessing(true);
      setCurrentAction("schedule");
      setError(null);

      const result = await scheduleInterview(application._id);
      if (!result.success)
        throw new Error(result.error || "Failed to schedule interview");

      await refreshApplications();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to schedule interview");
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const handleHire = async () => {
    try {
      setIsProcessing(true);
      setCurrentAction("hire");
      setError(null);

      const result = await acceptApplication(application._id);
      if (!result.success)
        throw new Error(result.error || "Failed to accept application");

      await refreshApplications();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to accept application");
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      setCurrentAction("reject");
      setError(null);

      const result = await rejectApplication(application._id);
      if (!result.success)
        throw new Error(result.error || "Failed to reject application");

      await refreshApplications();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to reject application");
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const renderScreeningContent = () => (
    <div className="space-y-6">
      <div className="p-4 bg-[#364957]/5 rounded-lg">
        <div className="flex items-center gap-2 text-lg font-semibold text-[#364957] mb-2">
          <FileText className="w-5 h-5 text-[#FF8A00]" />
          <h3>Screening Results</h3>
        </div>
        <div className="items-baseline gap-4 justify-between">
          {editMode ? (
            <div className="w-full p-5 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div>
                <label
                  htmlFor="score"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Screening Score
                  <span className="text-xs text-gray-400 ml-1">
                    (0-100 scale)
                  </span>
                </label>
                <div className="relative w-32">
                  <input
                    id="score"
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={editableScore}
                    onChange={(e) => setEditableScore(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-md text-gray-800 font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
                    onKeyDown={(e) => {
                      if (["e", "E", "+", "-"].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                  {error && (
                    <p className="absolute -bottom-5 text-xs text-red-500">
                      {error}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-600 mb-1"
                >
                  Reason for Change
                </label>
                <textarea
                  id="comment"
                  rows={3}
                  value={screeningComment}
                  onChange={(e) => setScreeningComment(e.target.value)}
                  placeholder="Add constructive feedback for the candidate or internal notes..."
                  className="w-full px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => {
                    setEditMode(false);
                    setError("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    const parsedScore = parseFloat(editableScore);
                    if (
                      isNaN(parsedScore) ||
                      parsedScore < 0 ||
                      parsedScore > 100
                    ) {
                      setError("Please enter a valid score between 0 and 100");
                      return;
                    }
                    setIsProcessing(true);
                    setError("");

                    const result = await updateScreeningScore(
                      application._id,
                      parsedScore,
                      screeningComment
                    );

                    if (result.success) {
                      setEditMode(false);
                      await refreshApplications();
                    } else {
                      setError(result.error || "Failed to update score");
                    }

                    setIsProcessing(false);
                  }}
                  className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center min-w-20"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : null}
                  {isProcessing ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div>
                <div className="text-3xl font-bold text-[#364957]">
                  {application.screening?.score &&
                  !isNaN(Number(application.screening.score))
                    ? Number(application.screening.score)
                    : "N/A"}
                </div>

                <span className="text-[#364957]/80">Overall Score</span>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="text-[#364957]/50 hover:text-[#364957]"
                aria-label="Edit score"
              >
                <Pencil className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {!editMode &&
        application.screening?.reasoning?.map((criterion, index) => (
          <div
            key={index}
            className="p-4 bg-white rounded-lg border border-[#364957]/20"
          >
            <div className="flex items-center gap-2 text-[#364957] mb-3">
              <span className="font-medium">{criterion.criterion}</span>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
                <CheckCircle className="w-4 h-4" />
                <span>Supporting Evidence</span>
              </div>
              {criterion.evidence.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {criterion.evidence.map((item, i) => (
                    <li key={i} className="text-[#364957]/80">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#364957]/60 italic">
                  No supporting evidence found
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-red-600 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Missing Elements</span>
              </div>
              {criterion.missing_elements.length > 0 ? (
                <ul className="list-disc pl-5 space-y-1">
                  {criterion.missing_elements.map((item, i) => (
                    <li key={i} className="text-[#364957]/80">
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#364957]/60 italic">
                  All required elements present
                </p>
              )}
            </div>
          </div>
        ))}
    </div>
  );

  const renderInterviewContent = () => {
    if (!application.interview)
      return (
        <div className="p-4 bg-[#364957]/5 rounded-lg text-center text-[#364957]/80">
          <Clock className="w-8 h-8 mx-auto mb-2 text-[#364957]/50" />
          Interview not scheduled yet
        </div>
      );

    return (
      <div className="space-y-6">
        {application.interview.interview_status === "completed" &&
          application.interview.score && (
            <div className="p-4 bg-[#364957]/5 rounded-lg">
              <div className="flex items-center gap-2 text-lg font-semibold text-[#364957] mb-2">
                <FileText className="w-5 h-5 text-[#FF8A00]" />
                <h3>Interview Results</h3>
              </div>
              <div className="flex items-baseline gap-4">
                <div className="text-3xl font-bold text-[#364957]">
                  {application.screening?.score &&
                  !isNaN(Number(application.screening.score))
                    ? Number(application.screening.score)
                    : "N/A"}
                </div>

                <span className="text-[#364957]/80">Overall Score</span>
              </div>
            </div>
          )}

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[#364957]/5 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {application.interview.interview_status === "completed" ? (
                <>
                  {application.interview.hiring_decision === "Hire" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className="font-semibold text-[#364957]">
                    {application.interview.hiring_decision}
                  </span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-[#FF8A00]" />
                  <span className="font-semibold text-[#364957] capitalize">
                    {application.interview.interview_status.replace(/_/g, " ")}
                  </span>
                </>
              )}
            </div>
            {application.interview.interview_date && (
              <p className="text-sm text-[#364957]/80">
                {new Date(
                  application.interview.interview_date
                ).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>

          {application.interview.interview_status === "flagged" &&
            application.interview.violations && (
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-semibold">Violations Detected</span>
                </div>
                <div className="space-y-2">
                  {application.interview.violations
                    .split("\n")
                    .map((violation, i) => {
                      const isMajor = violation.startsWith("MAJOR");
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-2 text-sm ${
                            isMajor ? "text-red-600" : "text-[#364957]/80"
                          }`}
                        >
                          <span
                            className={`inline-block w-2 h-2 rounded-full mt-1 ${
                              isMajor ? "bg-red-500" : "bg-[#364957]/50"
                            }`}
                          />
                          {violation
                            .replace("MAJOR: ", "")
                            .replace("MINOR: ", "")}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
        </div>

        {application.interview.interview_status === "completed" &&
          application.interview.skill_assessment && (
            <div className="p-4 bg-[#364957]/5 rounded-lg">
              <div className="flex items-center gap-2 text-[#364957] mb-4">
                <FileText className="w-5 h-5 text-[#FF8A00]" />
                <span className="font-medium">Skill Assessment</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(application.interview.skill_assessment).map(
                  ([skill, data]) => (
                    <div
                      key={skill}
                      className="p-4 bg-white rounded-lg border border-[#364957]/20"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-[#364957] capitalize">
                          {skill}
                        </span>
                        <span className="text-sm text-[#364957]/80">
                          {data.rating ?? data.score ?? "N/A"}/10
                        </span>
                      </div>
                      <ProgressBar
                        value={((data.rating ?? data.score) / 10) * 100}
                        color="#FF8A00"
                        className="h-2 rounded-full"
                      />
                      <div className="mt-2 text-sm text-[#364957]/80">
                        <div>Required: {data.required_level}</div>
                        <div className="mt-1">Evidence: {data.evidence}</div>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {application.interview.interview_reasoning && (
          <div className="p-4 bg-[#364957]/5 rounded-lg">
            <div className="flex items-center gap-2 text-[#364957] mb-2">
              <MessageSquareText className="w-5 h-5 text-[#FF8A00]" />
              <span className="font-medium">Evaluation Reasoning</span>
            </div>
            <div className="space-y-4">
              {application.interview.interview_reasoning
                .split(/\d+\)\s+/)
                .slice(1)
                .map((section, index) => {
                  const [title, ...contentParts] = section.split(": ");
                  const content = contentParts.join(": ");

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2 h-2 rounded-full bg-[#FF8A00] mt-1" />
                        <div className="w-px h-full bg-[#364957]/20" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#364957] mb-1">
                          {title.replace(/^\d+\)\s*/, "")}
                        </h4>
                        <p className="text-[#364957]/80 leading-relaxed">
                          {content}
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActionButtons = () => {
    if (!isActionable) {
      return (
        <div className="mt-6 p-4 bg-[#364957]/5 rounded-lg text-center text-[#364957]/80">
          Application {application.application_status}
        </div>
      );
    }

    const isScheduling = currentAction === "schedule" && isProcessing;
    const isHiring = currentAction === "hire" && isProcessing;
    const isRejecting = currentAction === "reject" && isProcessing;

    return (
      <div className="mt-6 flex gap-4">
        <button
          onClick={handleReject}
          disabled={isProcessing}
          className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {isRejecting ? "Processing..." : "Reject Candidate"}
        </button>

        {type === "screening" && !hasInterviewScheduled && (
          <button
            onClick={handleScheduleInterview}
            disabled={isProcessing}
            className="flex-1 px-6 py-3 bg-[#364957] text-white rounded-lg hover:bg-[#2a3844] transition-colors disabled:opacity-50"
          >
            {isScheduling ? (
              "Processing..."
            ) : (
              <>
                <Zap className="w-4 h-4 inline-block mr-2" />
                Invite to Interview
              </>
            )}
          </button>
        )}

        {type === "interview" &&
          application.interview?.interview_status === "completed" && (
            <button
              onClick={handleHire}
              disabled={isProcessing}
              className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            >
              {isHiring ? "Processing..." : "Hire Candidate"}
            </button>
          )}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-[#364957]">
              {type === "screening" ? "Screening Details" : "Interview Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-[#364957]/50 hover:text-[#364957] transition-colors"
            >
              ✕
            </button>
          </div>

          {type === "screening"
            ? renderScreeningContent()
            : renderInterviewContent()}
          {renderActionButtons()}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg border border-red-100">
              {error}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatusPopup;
