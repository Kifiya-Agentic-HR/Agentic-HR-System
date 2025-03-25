"use client";

import { Application } from "@/components/jobs/types";
import { useState, useEffect, useRef } from "react";
import StatusPopup from "@/components/jobs/StatusPopups";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getJobApplications } from "@/lib/api";
import {
  FiChevronLeft,
  FiFileText,
  FiStar,
  FiCalendar,
  FiUser,
  FiBriefcase,
  FiList,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";

function ShortlistPopup({
  application,
  onClose,
  refreshApplications,
}: {
  application: Application;
  onClose: () => void;
  refreshApplications: () => Promise<void>;
}) {
  const [note, setNote] = useState(application.shortlist_note || "");
  const [isShortlisted, setIsShortlisted] = useState(
    application.shortlisted ?? false
  );
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/applications/${application._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shortlisted: isShortlisted,
          shortlist_note: note,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update shortlist status");
      }
      await refreshApplications();
      onClose();
    } catch (error) {
      console.error("Error updating shortlist status:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center">
          <FiThumbsUp className="mr-2" />
          Shortlist Candidate
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setIsShortlisted(true)}
              className={`flex-1 py-2 rounded-xl ${
                isShortlisted
                  ? "bg-[#4CAF50] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Yes
            </button>
            <button
              onClick={() => setIsShortlisted(false)}
              className={`flex-1 py-2 rounded-xl ${
                !isShortlisted
                  ? "bg-[#F44336] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              No
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6A00] focus:border-transparent"
            rows={4}
            placeholder="Add shortlist notes..."
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#FF6A00] text-white rounded-lg hover:bg-[#FF8A00]"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationList() {
  const router = useRouter();
  const params = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [popupType, setPopupType] = useState<"screening" | "interview">(
    "screening"
  );
  const [showShortlistPopup, setShowShortlistPopup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      console.log("Reloading applications...");
      try {
        if (!params.jobId) {
          throw new Error("Job ID not found");
        }
        const resp = await getJobApplications(params.jobId as string);
        if (resp.success && resp.applications) {
          console.log("Applications fetched:", resp.applications);
          setApplications(resp.applications);
        } else {
          console.error("API error:", resp.error);
        }
      } catch (error) {
        console.error("Failed to load applications:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
    const intervalId = setInterval(() => loadApplications(), 30000);
    return () => clearInterval(intervalId);
  }, [params.jobId, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <div className="w-64 bg-white border-r border-gray-200 p-6 min-h-screen">
        <div className="mb-6">
          <img src="/logo.svg" alt="Logo" className="h-12" />
        </div>
        <nav className="space-y-4">
          <Link
            href="/hr"
            className="flex items-center space-x-3 text-gray-600 hover:text-[#FF6A00] transition-colors p-3 rounded-lg hover:bg-[#FF6A00]/10"
          >
            <FiBriefcase className="w-5 h-5" />
            <span>Job Postings</span>
          </Link>
          <Link
            href="/applications"
            className="flex items-center space-x-3 text-[#FF6A00] bg-[#FF6A00]/10 p-3 rounded-lg"
          >
            <FiList className="w-5 h-5" />
            <span>Applications</span>
          </Link>
        </nav>
      </div>
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-secondary hover:text-[#FF6A00] transition-colors font-medium"
          >
            <FiChevronLeft className="mr-2 h-5 w-5" />
            Back to Jobs
          </button>

          <h1 className="text-3xl font-bold text-primary mb-8 flex items-center">
            <FiUser className="mr-3 w-8 h-8" />
            <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[#FF6A00]">
              Applications Overview
            </span>
          </h1>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr className="text-left text-sm font-semibold">
                    <th className="pl-8 pr-6 py-5 rounded-tl-2xl">Candidate</th>
                    <th className="px-6 py-5">Applied Date</th>
                    <th className="px-6 py-5">CV</th>
                    <th className="px-6 py-5">Shortlisted</th>
                    <th className="px-6 py-5">Screening</th>
                    <th className="px-6 py-5">Interview</th>
                    <th className="pr-8 pl-6 py-5 rounded-tr-2xl text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {applications.map((app) => (
                    <tr
                      key={app._id}
                      className="hover:bg-[#364957]/5 transition-colors group"
                    >
                      <td className="pl-8 pr-6 py-4 font-medium text-primary text-lg">
                        {app.candidate.full_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        <div className="flex items-center">
                          <FiCalendar className="mr-2 text-secondary" />
                          {formatDate(app.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={app.cv_link}
                          className="flex items-center text-secondary hover:text-[#FF6A00] transition-colors"
                          target="_blank"
                        >
                          <FiFileText className="mr-2" />
                          View CV
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setShowShortlistPopup(true);
                          }}
                          className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                            app.shortlisted === true
                              ? "bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20"
                              : app.shortlisted === false
                              ? "bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {String(app.shortlisted) === "true"
                            ? "Yes"
                            : String(app.shortlisted) === "false"
                            ? "No"
                            : "Set Status"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setPopupType("screening");
                          }}
                          className={`flex items-center px-4 py-2 rounded-xl transition-all ${
                            app.screening?.score
                              ? "bg-[#FF8A00]/10 text-[#FF8A00] hover:bg-[#FF8A00]/20"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          <FiStar className="mr-2" />
                          {app.screening?.score?.toFixed(1) || "Add Score"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setPopupType("interview");
                          }}
                          className={`px-4 py-2 rounded-xl transition-colors ${
                            app.interview?.hiring_decision
                              ? app.interview.hiring_decision === "Hire"
                                ? "bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20"
                                : app.interview.hiring_decision === "No Hire"
                                ? "bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                                : "bg-primary/10 text-primary hover:bg-primary/20"
                              : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          }`}
                        >
                          {app.interview?.hiring_decision || "Schedule"}
                        </button>
                      </td>
                      <td className="pr-8 pl-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                            app.application_status === "hired"
                              ? "bg-[#4CAF50]/10 text-[#4CAF50]"
                              : app.application_status === "rejected"
                              ? "bg-[#F44336]/10 text-[#F44336]"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {app.application_status.charAt(0).toUpperCase() +
                            app.application_status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {selectedApp && !showShortlistPopup && (
            <StatusPopup
              application={selectedApp}
              type={popupType}
              onClose={() => setSelectedApp(null)}
              refreshApplications={async () => {
                const resp = await getJobApplications(params.jobId as string);
                if (resp.success && resp.applications) {
                  setApplications(resp.applications);
                }
              }}
            />
          )}

          {showShortlistPopup && selectedApp && (
            <ShortlistPopup
              application={selectedApp}
              onClose={() => {
                setShowShortlistPopup(false);
                setSelectedApp(null);
              }}
              refreshApplications={async () => {
                const resp = await getJobApplications(params.jobId as string);
                if (resp.success && resp.applications) {
                  setApplications(resp.applications);
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
