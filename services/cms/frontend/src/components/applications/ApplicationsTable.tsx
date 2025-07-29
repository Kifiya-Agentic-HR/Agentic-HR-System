//applicationTable

"use client";

import { Application } from "@/components/jobs/types";
import {
  FiCalendar,
  FiFileText,
  FiStar,
  FiBriefcase,
  FiChevronUp,
  FiChevronDown,
  FiCheckCircle,
  FiDownload,
  FiX,
  FiRefreshCw,
} from "react-icons/fi";
import { useState } from "react";
import StatusBadge from "./StatusBadge";
import { toast } from "sonner";
import { reQueue } from "@/lib/api";

interface ApplicationsTableProps {
  applications: Application[];
  fromHM: boolean;
  handleRecommend: (app: Application) => void;
  processingAppId: string | null;
  setSelectedApp: (app: Application | null) => void;
  setShowShortlistPopup: (show: boolean) => void;
  setPopupType: (type: "screening" | "interview") => void;
  dateSortOrder: "none" | "asc" | "desc";
  scoreSortOrder: "none" | "asc" | "desc";
  setDateSortOrder: (order: "none" | "asc" | "desc") => void;
  setScoreSortOrder: (order: "none" | "asc" | "desc") => void;
}

export default function ApplicationsTable({
  applications,
  fromHM,
  handleRecommend,
  processingAppId,
  setSelectedApp,
  setShowShortlistPopup,
  setPopupType,
  dateSortOrder,
  scoreSortOrder,
  setDateSortOrder,
  setScoreSortOrder,
}: ApplicationsTableProps) {
  const [showCvPopup, setShowCvPopup] = useState(false);
  const [selectedCvLink, setSelectedCvLink] = useState("");
  const [isPdfLoading, setIsPdfLoading] = useState(true);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const toggleSort = (current: "none" | "asc" | "desc") =>
    current === "none" ? "asc" : current === "asc" ? "desc" : "none";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {showCvPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 relative max-w-4xl w-full h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Candidate CV</h3>
              <button
                onClick={() => setShowCvPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {isPdfLoading && (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            <div className={`flex-1 ${isPdfLoading ? "hidden" : "block"}`}>
              <iframe
                src={selectedCvLink}
                onLoad={() => setIsPdfLoading(false)}
                className="w-full h-full rounded-lg border border-gray-200"
                title="CV Preview"
              />
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <a
                href={selectedCvLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
              >
                <FiDownload className="mr-2" />
                Download CV
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-primary text-white">
            <tr className="text-left text-sm font-semibold">
              <th className="pl-8 pr-6 py-5 rounded-tl-2xl">Candidate</th>
              <th className="px-6 py-5">
                <button
                  onClick={() => setDateSortOrder(toggleSort(dateSortOrder))}
                  className="flex items-center space-x-2 hover:text-[#FF6A00]"
                >
                  <span>Applied Date</span>
                  {dateSortOrder !== "none" &&
                    (dateSortOrder === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </button>
              </th>
              <th className="px-6 py-5">CV</th>
              <th className="px-6 py-5">Shortlisted</th>
              <th className="px-6 py-5">
                <button
                  onClick={() => setScoreSortOrder(toggleSort(scoreSortOrder))}
                  className="flex items-center space-x-2 hover:text-[#FF6A00]"
                >
                  <span>Screening</span>
                  {scoreSortOrder !== "none" &&
                    (scoreSortOrder === "asc" ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    ))}
                </button>
              </th>
              <th className="px-6 py-5">Interview</th>
              <th className="pr-8 pl-6 py-5 text-center">Status</th>
              <th className="pr-8 pl-6 py-5 rounded-tr-2xl text-center">
                Other Roles
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {applications.map((app) => (
              <tr key={app._id} className="hover:bg-[#364957]/5">
                <td className="pl-8 pr-6 py-4 font-medium text-primary text-lg">
                  {app.candidate.full_name}
                </td>
                <td className="px-6 py-4 text-gray-600">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2" />
                    {formatDate(app.created_at)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedCvLink(app.cv_link);
                      setShowCvPopup(true);
                      setIsPdfLoading(true); // Reset loading state for new PDF
                    }}
                    className="flex items-center text-secondary hover:text-[#FF6A00] transition-colors"
                  >
                    <FiFileText className="mr-2" />
                    View CV
                  </button>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setShowShortlistPopup(true);
                    }}
                    className={`flex items-center px-4 py-2 rounded-xl ${
                      app.shortlisted === true
                        ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                        : app.shortlisted === false
                        ? "bg-gray-100"
                        : "bg-[#F44336]/10 text-[#F44336]"
                    }`}
                  >
                    {app.shortlisted ? "Yes" : "Pending"}
                  </button>
                </td>

                <td className="px-6 py-4">
                  {!app.screening ? (
                    <span className="text-gray-500">On Queue</span>
                  ) : app.screening.status === "failed" ? (
                    <button
                      onClick={async () => {
                        try {
                          const response = await reQueue({
                            applicationId: app._id,
                            screening: app.screening,
                          });

                          if (response.success) {
                            toast.success("Requeued successfully!");
                          } else {
                            toast.error(
                              `Failed to requeue: ${
                                response.error || "Unknown error"
                              }`
                            );
                          }
                        } catch (error) {
                          toast.error("An error occurred while requeuing.");
                        }
                      }}
                      className="flex items-center px-4 py-2 rounded-xl bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                    >
                      <FiRefreshCw className="mr-2" />
                      Reload
                    </button>
                  ) : app.screening.status === "completed" ? (
                    <button
                      onClick={() => {
                        setSelectedApp(app);
                        setPopupType("screening");
                      }}
                      className="flex items-center px-4 py-2 rounded-xl bg-[#FF8A00]/10"
                    >
                      <FiStar className="mr-2" />
                      {app.screening?.score || "Add Score"}
                    </button>
                  ) : (
                    <span className="text-gray-500">Processing...</span>
                  )}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => {
                      setSelectedApp(app);
                      setPopupType("interview");
                    }}
                    className={`px-4 py-2 rounded-xl ${
                      app.interview?.interview_status === "flagged"
                        ? "bg-[#F44336]/10"
                        : app.interview?.hiring_decision
                        ? "bg-[#4CAF50]/10"
                        : "bg-secondary/10"
                    }`}
                  >
                    {app.interview?.hiring_decision || "Schedule"}
                  </button>
                </td>
                <td className="pr-8 pl-6 py-4 text-center">
                  <StatusBadge status={app.application_status} />
                </td>
                <td className="pr-8 pl-6 py-4">
                  <button
                    onClick={() => handleRecommend(app)}
                    disabled={processingAppId === app._id}
                    className="flex items-center px-4 py-2 rounded-xl border-2 border-[#FF8A00]"
                  >
                    <FiBriefcase className="mr-2" />
                    {processingAppId === app._id ? "Analyzing..." : "Recommend"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
