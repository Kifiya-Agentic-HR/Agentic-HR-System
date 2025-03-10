"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { scheduleInterview, acceptApplication, rejectApplication} from "@/lib/api";

type StatusPopupProps = any;

export const StatusPopup = ({
  application,
  type,
  onClose,
  onUpdate,
}: StatusPopupProps) => {
  // Provide defaults with the extra fields (score/reasoning)
  const defaultScreening = { status: "pending", score: null, reasoning: "" };
  const defaultInterview = {
    interview_status: "pending",
    hiring_decision: "",
    interview_reasoning: "",
  };

  const currentStatus =
    type === "screening"
      ? application?.screening || defaultScreening
      : application?.interview || defaultInterview;

  const statusValue =
    type === "screening"
      ? currentStatus.status
      : currentStatus.interview_status;

  const getStatusDetails = () => {
    switch (statusValue) {
      case "passed":
      case "hired":
        return {
          color: "bg-green-100 text-green-800",
          label: type === "screening" ? "Passed" : "Hired",
        };
      case "completed":
        return { color: "bg-yellow-100 text-yellow-800", label: "Completed" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", label: "Rejected" };
      case "flagged":
        return { color: "bg-red-100 text-red-800", label: "Flagged" };
      case "scheduled":
        return { color: "bg-blue-100 text-blue-800", label: "Scheduled" };
      default:
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
    }
  };

  const statusDetails = getStatusDetails();

  // Function to handle inviting for an interview
  const handleInvite = async () => {
    try {
      await scheduleInterview(application._id);
      onUpdate("screening", "invited");
    } catch (error) {
      console.error("Failed to schedule interview:", error);
    }
  };

  const hireHandler = async () => {
    console.log("Hire candidate");
    return await acceptApplication(application._id);
  }
  
  const rejectHandler = async () => {
    console.log("Reject candidate");
    return await rejectApplication(application._id);
  }

  
  // Determine which label/value to show based on type
  const decisionLabel =
    type === "screening" ? "Score:" : "Hiring Decision:";
  const decisionValue =
    type === "screening"
      ? currentStatus.score
      : currentStatus.hiring_decision;
  const reasoningValue =
    type === "screening"
      ? currentStatus.reasoning
      : currentStatus.interview_reasoning;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-[#364957]">
            {type.charAt(0).toUpperCase() + type.slice(1)} Details
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className={`${statusDetails.color} px-3 py-1 rounded-full w-fit`}>
            {statusDetails.label}
          </div>

          <div className="text-[#364957]/80">
            <h4 className="font-semibold">{decisionLabel}</h4>
            <p>{decisionValue}</p>
          </div>

          {reasoningValue && (
            <div className="text-[#364957]/80">
              <h4 className="font-semibold mb-1">Reasoning:</h4>
              <div className="bg-[#FFF4E6] p-3 rounded-lg space-y-2">
                {reasoningValue.split(/\d\)\s/).map((section, index) =>
                  section.trim() ? (
                    <p key={index}>
                      <span className="font-semibold">{index}) </span>
                      {section}
                    </p>
                  ) : null
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4 justify-end">
            {type === "screening" ? (
              <>
                <Button
                  onClick={() => onUpdate("screening", "rejected")}
                  className="border border-[#364957] text-[#364957] hover:bg-[#364957]/10"
                  variant="outline"
                >
                  Reject
                </Button>
                <Button
                  onClick={handleInvite}
                  className="bg-[#FF8A00] text-[#364957] hover:bg-[#FF8A00]/90"
                  variant="default"
                >
                  Invite for Interview
                </Button>
              </>
            ) : type === "interview" ? (
              <>
                <Button
                  onClick={rejectHandler}
                  className="border border-[#364957] text-[#364957] hover:bg-[#364957]/10"
                  variant="outline"
                >
                  Reject
                </Button>
                <Button
                  onClick={hireHandler}
                  className="bg-[#FF8A00] text-[#364957] hover:bg-[#FF8A00]/90"
                  variant="default"
                >
                  Hire
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
