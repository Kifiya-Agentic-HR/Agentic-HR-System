"use client";

import { Application } from "@/components/jobs/types";
import { useState, useEffect } from "react";
import StatusPopup from "@/components/jobs/StatusPopups";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getGeminiRecommendations, getJobApplications, getOpenJobs, Recommendation, updateShortlist } from "@/lib/api";
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
  FiChevronUp,
  FiChevronDown,
  FiClock,
  FiCheckCircle,
  FiMapPin,
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
      const result = await updateShortlist(application._id, {
        shortlisted: isShortlisted,
        shortlist_note: note,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to update shortlist status");
      }
      await refreshApplications();
      onClose();
    } catch (error) {
      console.error("Error updating shortlist status:", error);
      alert("Failed to update shortlist status");
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
  const [showShortlistPopup, setShowShortlistPopup] = useState(false);
  const [popupType, setPopupType] = useState<"screening" | "interview">("screening");
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [genderOpen, setGenderOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [dateSortOrder, setDateSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [scoreSortOrder, setScoreSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);

  const handleRecommend = async (application: Application) => {
    setProcessingAppId(application._id);
    setRecommendationError(null);
    try {
      const jobsResponse = await getOpenJobs();
      if (!jobsResponse.success) throw new Error(jobsResponse.error);

      const candidateSummary = `
        Candidate Profile:
        - Name: ${application.candidate.full_name}
        - Skills: ${application.candidate.skills?.join(", ") || "Not specified"}
        - CV: ${application.screening?.parsed_cv || "Not parsed yet"}
      `;

      const jobs = jobsResponse.jobs.filter((job: { _id: string }) => job._id !== application.job_id)
      console.log("Open jobs:", jobs);
      const recommendations = await getGeminiRecommendations({
        candidateSummary,
        jobs: jobs
      });

      setRecommendations(recommendations);
    } catch (error) {
      setRecommendationError(error instanceof Error ? error.message : "Failed to generate recommendations");
      setRecommendations(null);
    } finally {
      setIsRecommending(false);
      setProcessingAppId(null);
    }
  };

  useEffect(() => {
    const loadApplications = async () => {
      console.log("Reloading applications...");
      try {
        if (!params.jobId) throw new Error("Job ID not found");

        const resp = await getJobApplications(params.jobId as string);
        if (resp.success && resp.applications) {
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

  const toggleSortOrder = (currentOrder: "none" | "asc" | "desc") => {
    if (currentOrder === "none") return "asc";
    if (currentOrder === "asc") return "desc";
    return "none";
  };

  const filteredAndSortedApps = applications
    .filter((app) => {
      const genderMatch =
        filterType === "all" || app.candidate.gender?.toLowerCase() === filterType;
      const statusMatch =
        statusFilter === "all" || app.application_status === statusFilter;
      return genderMatch && statusMatch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      const scoreA = a.screening?.score ?? 0;
      const scoreB = b.screening?.score ?? 0;

      if (dateSortOrder === "asc") return dateA - dateB;
      if (dateSortOrder === "desc") return dateB - dateA;
      if (scoreSortOrder === "asc") return scoreA - scoreB;
      if (scoreSortOrder === "desc") return scoreB - scoreA;
      return 0;
    });

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

          <h1 className="text-3xl font-bold text-primary mb-6 flex items-center">
            <FiUser className="mr-3 w-8 h-8" />
            <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[#FF6A00]">
              Applications Overview
            </span>
          </h1>

          <div className="mb-6 w-full flex justify-end gap-4 relative">
            {/* Gender Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setGenderOpen(!genderOpen)}
                className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl"
              >
                <span className="text-sm text-gray-600 mr-2">Gender: {filterType}</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${genderOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {genderOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white shadow-lg rounded-xl overflow-hidden z-10">
                  <button
                    onClick={() => { setFilterType("all"); setGenderOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === "all" ? "bg-[#FF6A00] text-white" : "bg-white text-gray-600 hover:bg-gray-200"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setFilterType("male"); setGenderOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === "male" ? "bg-[#FF6A00] text-white" : "bg-white text-gray-600 hover:bg-gray-200"}`}
                  >
                    Male
                  </button>
                  <button
                    onClick={() => { setFilterType("female"); setGenderOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === "female" ? "bg-[#FF6A00] text-white" : "bg-white text-gray-600 hover:bg-gray-200"}`}
                  >
                    Female
                  </button>
                </div>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl"
              >
                <span className="text-sm text-gray-600 mr-2">Status: {statusFilter}</span>
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${statusOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {statusOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-xl overflow-hidden z-10">
                  <button
                    onClick={() => { setStatusFilter("all"); setStatusOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "all" ? "bg-[#FF6A00] text-white" : "bg-white text-gray-600 hover:bg-gray-200"}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => { setStatusFilter("pending"); setStatusOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "pending" ? "bg-[#FFB800] text-white" : "bg-white text-gray-600 hover:bg-[#FFB800]/20"}`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => { setStatusFilter("hired"); setStatusOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "hired" ? "bg-[#4CAF50] text-white" : "bg-white text-gray-600 hover:bg-[#4CAF50]/20"}`}
                  >
                    Hired
                  </button>
                  <button
                    onClick={() => { setStatusFilter("rejected"); setStatusOpen(false); }}
                    className={`block w-full text-left px-4 py-2 text-sm ${statusFilter === "rejected" ? "bg-[#F44336] text-white" : "bg-white text-gray-600 hover:bg-[#F44336]/20"}`}
                  >
                    Rejected
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary text-white">
                  <tr className="text-left text-sm font-semibold">
                    <th className="pl-8 pr-6 py-5 rounded-tl-2xl">Candidate</th>
                    <th className="px-6 py-5">
                      <button
                        onClick={() => setDateSortOrder((prev) => toggleSortOrder(prev))}
                        className="flex items-center space-x-2 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
                      >
                        <span>Applied&nbsp;Date</span>
                        {dateSortOrder === "asc" && <FiChevronUp className="w-4 h-4" />}
                        {dateSortOrder === "desc" && <FiChevronDown className="w-4 h-4" />}
                        {dateSortOrder === "none" && <span className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="px-6 py-5">CV</th>
                    <th className="px-6 py-5">Shortlisted</th>
                    <th className="px-6 py-5">
                      <button
                        onClick={() => setScoreSortOrder((prev) => toggleSortOrder(prev))}
                        className="flex items-center space-x-2 text-sm font-semibold hover:text-[#FF6A00] transition-colors"
                      >
                        <span>Screening</span>
                        {scoreSortOrder === "asc" && <FiChevronUp className="w-4 h-4" />}
                        {scoreSortOrder === "desc" && <FiChevronDown className="w-4 h-4" />}
                        {scoreSortOrder === "none" && <span className="w-4 h-4" />}
                      </button>
                    </th>
                    <th className="px-6 py-5">Interview</th>
                    <th className="pr-8 pl-6 py-5 text-center">Status</th>
                    <th className="pr-8 pl-6 py-5 rounded-tr-2xl text-center">Other Roles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAndSortedApps.map((app) => (
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
                          href={app.cv_link.replace("s3-server", window.location.hostname).replace(":9000", ":9002")}
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
                              ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                              : "bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                          }`}
                        >
                          {String(app.shortlisted) === "true"
                            ? "Yes"
                            : String(app.shortlisted) === "false"
                            ? "Pending"
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
                            app.interview?.interview_status === 'flagged'
                              ? "bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                              : app.interview?.hiring_decision
                                ? app.interview.hiring_decision === "Hire"
                                  ? "bg-[#4CAF50]/10 text-[#4CAF50] hover:bg-[#4CAF50]/20"
                                  : app.interview.hiring_decision === "No Hire"
                                    ? "bg-[#F44336]/10 text-[#F44336] hover:bg-[#F44336]/20"
                                    : "bg-primary/10 text-primary hover:bg-primary/20"
                                : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                          }`}
                        >
                          {app.interview?.interview_status === 'flagged' ? 'Flagged' : (app.interview?.hiring_decision || 'Schedule')}
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
                      <td className="pr-8 pl-6 py-4">
                        <button
                          onClick={() => handleRecommend(app)}
                          disabled={processingAppId === app._id}
                          className={`flex items-center px-4 py-2 rounded-xl transition-all 
                            ${
                              processingAppId === app._id
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                                : "bg-white border-2 border-[#FF8A00] text-[#FF8A00] hover:bg-[#FF8A00]/10"
                            }`}
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
          
          {(recommendations !== null || recommendationError) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-primary flex items-center">
                    <FiBriefcase className="mr-3 text-[#FF8A00]" />
                    Recommended Positions
                  </h3>
                  <button
                    onClick={() => {
                      setRecommendations(null);
                      setRecommendationError(null);
                    }}
                    className="text-gray-500 hover:text-primary p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {recommendationError ? (
                  <div className="text-red-500 p-4 bg-red-50 rounded-lg">{recommendationError}</div>
                ) : (
                  <>
                    <div className="space-y-6">
                      {recommendations?.map((rec, index) => (
                        <div key={index} className="bg-[#FFF7F0] rounded-xl p-5 border border-[#FFE8D5]">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-xl font-semibold text-primary mb-2">{rec.title}</h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <div className="flex items-center">
                                  <FiMapPin className="mr-2 text-[#FF8A00]" />
                                  {rec.location}
                                </div>
                                <div className="flex items-center">
                                  <FiClock className="mr-2 text-[#FF8A00]" />
                                  {rec.type.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 text-sm text-primary">
                            <FiCheckCircle className="text-[#FF8A00]" />
                            <span className="font-medium">Reason:</span>
                            <p className="text-gray-600">{rec.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {recommendations?.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No matching positions found based on current profile
                      </div>
                    )}

                    <div className="mt-6 p-4 bg-[#F8F9FA] rounded-lg">
                      <p className="text-sm text-gray-600">
                        Recommendations are generated based on skill matching, location preferences, 
                        and experience requirements. Updated in real-time as new positions open.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

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