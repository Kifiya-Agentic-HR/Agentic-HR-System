"use client";

import { Application } from "./types";
import { useState } from "react";
import { StatusPopup } from "./StatusPopups";
import Link from "next/link";

export const ApplicationList = ({
  applications,
}: {
  applications: Application[];
}) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [popupType, setPopupType] = useState<"screening" | "interview">(
    "screening"
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const handleStatusUpdate = async (
    type: "screening" | "interview",
    status: string,
    reasoning?: string
  ) => {
    if (!selectedApp) return;
    let updates: any = {};
    if (type === "screening") {
      const score =
        status === "completed"
          ? 80
          : status === "pending"
          ? 0
          : parseInt(status, 10);
      updates.screening = {
        score: isNaN(score) ? null : score,
        reasoning: reasoning || "",
      };
    } else if (type === "interview") {
      updates.interview = {
        interview_status: status,
        interview_reasoning: reasoning || "",
      };
    }
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header Row */}
          <div className="grid grid-cols-15 gap-4 px-4 py-2 text-sm font-semibold text-[#364957]">
            <div className="col-span-3">Candidate</div>
            <div className="col-span-2">Applied Date</div>
            <div className="col-span-2">CV</div>
            <div className="col-span-3">Screening Status</div>
            <div className="col-span-3">Interview Status</div>
            <div className="col-span-2 text-center">Application Status</div>
          </div>

          {/* Application Rows */}
          {applications.map((app) => {
            const applicationStatus =
              app.interview && app.interview.interview_status === "completed"
                ? app.interview.hiring_decision?.toLowerCase() === "hire"
                  ? "Passed"
                  : "Failed"
                : "Pending";

            return (
              <div
                key={app._id}
                className="grid grid-cols-15 gap-4 items-center bg-white rounded-lg p-4 border border-[#364957]/20 hover:shadow transition-all"
              >
                <div className="col-span-3 font-medium text-[#364957]">
                  {app.candidate.full_name}
                </div>
                <div className="col-span-2 text-[#364957]/80">
                  {formatDate(app.created_at)}
                </div>
                <div className="col-span-2">
                  <Link
                    href={app.cv_link
                      .replace("s3-server", window.location.hostname)
                      .replace(":9000", ":9002")}
                    className="text-[#FF8A00] hover:text-[#FF8A00]/80 underline"
                    target="_blank"
                  >
                    View CV
                  </Link>
                </div>
                <div className="col-span-3">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setPopupType("screening");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg border border-[#364957]/20 hover:bg-[#FF8A00]/10 text-[#364957]"
                  >
                    {app.screening ? app.screening.score : "Pending"}
                  </button>
                </div>
                <div className="col-span-3">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setPopupType("interview");
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg border border-[#364957]/20 hover:bg-[#FF8A00]/10 text-[#364957]"
                  >
                    <span className="capitalize">
                      {app.interview
                        ? app.interview.interview_status === "completed"
                          ? app.interview.hiring_decision
                          : app.interview.interview_status.replace("-", " ")
                        : "Pending"}
                    </span>
                    {app.interview?.reasoning && (
                      <div className="text-sm text-[#364957]/60 mt-1">
                        {app.interview.interview_reasoning}
                      </div>
                    )}
                  </button>
                </div>
                <div className="col-span-2 text-center font-medium text-[#364957]">
                  {applicationStatus}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Render the popup outside of the list */}
      {selectedApp && (
        <StatusPopup
          application={selectedApp}
          type={popupType}
          onClose={() => setSelectedApp(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
};
