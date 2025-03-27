"use client";

import { Application } from "@/components/jobs/types";
import { useState } from "react";
import StatusPopup from "@/components/jobs/StatusPopups"; // Fixed import
import Link from "next/link";

export const ApplicationList = ({ applications }: { applications: Application[] }) => {
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [popupType, setPopupType] = useState<"screening" | "interview">("screening");

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  // Filter out non-pending applications
  const pendingApplications = applications.filter(app => app.application_status === "pending");

  return (
    <>
      <div className="w-full overflow-x-auto">
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-7 gap-4 px-4 py-2 text-sm font-semibold text-[#364957] bg-gray-100 border-b">
            <div>Candidate</div>
            <div>Applied Date</div>
            <div>CV</div>
            <div>Screening Status</div>
            <div>Interview Status</div>
            <div className="text-center">Application Status</div>
          </div>

          {pendingApplications.map((app) => (
            <div
              key={app._id}
              className="grid grid-cols-7 gap-4 items-center bg-white border-b p-4 hover:bg-gray-50 transition-all"
            >
              <div className="font-medium text-[#364957]">{app.candidate.full_name}</div>
              <div className="text-[#364957]/80">{formatDate(app.created_at)}</div>
              <div>
                <Link
                  href={app.cv_link.replace("s3-server", window.location.hostname).replace(":9000", ":9002")}
                  className="text-[#FF8A00] hover:text-[#FF8A00]/80 underline"
                  target="_blank"
                >
                  View CV
                </Link>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setPopupType("screening");
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#364957]/20 hover:bg-[#FF8A00]/10 text-[#364957]"
                >
                  {app.screening?.score?.toFixed(1) || "Pending"}
                </button>
              </div>
              <div>
                <button
                  onClick={() => {
                    setSelectedApp(app);
                    setPopupType("interview");
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-[#364957]/20 hover:bg-[#FF8A00]/10 text-[#364957] text-left"
                >
                  <span className="capitalize">
                    {app.interview
                      ? app.interview.interview_status === "completed"
                        ? app.interview.hiring_decision || "Completed"
                        : app.interview.interview_status.replace(/[-_]/g, " ")
                      : "Pending"}
                  </span>
                </button>
              </div>
              <div className="text-center font-medium text-[#364957]">
                {app.application_status.charAt(0).toUpperCase() + app.application_status.slice(1)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedApp && (
        <StatusPopup
          application={selectedApp}
          type={popupType}
          onClose={() => setSelectedApp(null)}
          refreshApplications={async () => console.log("Applications Refreshed")} // Properly pass the function
        />
      )}
    </>
  );
};
