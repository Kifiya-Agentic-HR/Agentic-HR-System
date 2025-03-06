"use client";

import { Application } from "./types";
import { useState } from "react";
import { StatusPopup } from "./StatusPopups";
import Link from "next/link";
import { updateApplicationStatus } from "./mockApi";

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
    await updateApplicationStatus(selectedApp.id, type, status, reasoning);
    setSelectedApp(null);
  };

  return (
    <div className="space-y-2">
      {/* Header Row */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-[#364957]">
        <div className="col-span-3">Candidate</div>
        <div className="col-span-2">Applied Date</div>
        <div className="col-span-2">CV</div>
        <div className="col-span-3">Screening Status</div>
        <div className="col-span-2">Interview Status</div>
      </div>

      {applications.map((app) => (
        <div
          key={app.id}
          className="grid grid-cols-12 gap-4 items-center bg-white rounded-lg p-4 border border-[#364957]/20 hover:shadow transition-all"
        >
          <div className="col-span-3 font-medium text-[#364957]">
            {app.candidateName}
          </div>

          <div className="col-span-2 text-[#364957]/80">
            {formatDate(app.appliedDate)}
          </div>

          <div className="col-span-2">
            <Link
              href={app.cvLink}
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
              <span className="capitalize">{app.screening.status}</span>
              {app.screening.reasoning && (
                <div className="text-sm text-[#364957]/60 mt-1">
                  {app.screening.reasoning}
                </div>
              )}
            </button>
          </div>

          <div className="col-span-2">
            <button
              onClick={() => {
                setSelectedApp(app);
                setPopupType("interview");
              }}
              className="w-full text-left px-3 py-2 rounded-lg border border-[#364957]/20 hover:bg-[#FF8A00]/10 text-[#364957]"
            >
              <span className="capitalize">
                {app.interview.status.replace("-", " ")}
              </span>
              {app.interview.reasoning && (
                <div className="text-sm text-[#364957]/60 mt-1">
                  {app.interview.reasoning}
                </div>
              )}
            </button>
          </div>

          {selectedApp?.id === app.id && (
            <StatusPopup
              application={selectedApp}
              type={popupType}
              onClose={() => setSelectedApp(null)}
              onUpdate={handleStatusUpdate}
            />
          )}
        </div>
      ))}
    </div>
  );
};
