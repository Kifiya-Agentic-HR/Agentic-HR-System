"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Application } from "./types";

type StatusPopupProps = {
  application: Application;
  type: "screening" | "interview";
  onClose: () => void;
  onUpdate: (
    type: "screening" | "interview",
    status: string,
    reasoning?: string
  ) => void;
};

export const StatusPopup = ({
  application,
  type,
  onClose,
  onUpdate,
}: StatusPopupProps) => {
  const currentStatus =
    type === "screening" ? application.screening : application.interview;

  const getStatusDetails = () => {
    switch (currentStatus.status) {
      case "passed":
        return { color: "bg-green-100 text-green-800", label: "Passed" };
      case "rejected":
        return { color: "bg-red-100 text-red-800", label: "Rejected" };
      default:
        return { color: "bg-yellow-100 text-yellow-800", label: "Pending" };
    }
  };

  const statusDetails = getStatusDetails();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#364957]">
            {type.charAt(0).toUpperCase() + type.slice(1)} Details
          </DialogTitle>
          <DialogDescription>
            {/* Optionally include any additional description here */}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div
            className={`${statusDetails.color} px-3 py-1 rounded-full w-fit`}
          >
            {statusDetails.label}
          </div>

          {currentStatus.reasoning && (
            <div className="text-[#364957]/80">
              <h4 className="font-semibold mb-1">Reasoning:</h4>
              <p className="bg-[#FFF4E6] p-3 rounded-lg">
                {currentStatus.reasoning}
              </p>
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
                  onClick={() => onUpdate("screening", "invited")}
                  className="bg-[#FF8A00] text-[#364957] hover:bg-[#FF8A00]/90"
                  variant="default"
                >
                  Invite for Interview
                </Button>
              </>
            ) : type === "interview" ? (
              <>
                <Button
                  onClick={() => onUpdate("interview", "rejected")}
                  className="border border-[#364957] text-[#364957] hover:bg-[#364957]/10"
                  variant="outline"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => onUpdate("interview", "hired")}
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
