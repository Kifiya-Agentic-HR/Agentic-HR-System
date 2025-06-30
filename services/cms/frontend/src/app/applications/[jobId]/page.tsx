"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Application,
  RecommendationResponse,
  User,
  Recommendation,
} from "@/components/jobs/types";
import {
  getGeminiRecommendations,
  getJobApplications,
  getOpenJobs,
  updateShortlist,
  fetchAllUsers,
  createShortList,
  getShortlistByJob,
  createRecommendation,
  getRecommendationByJob,
  getMe,
} from "@/lib/api";
import { toast } from "sonner";
import { FileWarning } from "lucide-react";

import Link from "next/link";
import { FiChevronLeft, FiUser, FiList, FiRefreshCw } from "react-icons/fi";
import StatusPopup from "@/components/applications/StatusPopups";
import ShortlistPopup from "@/components/applications/ShortlistPopup";
import ApplicationsTable from "@/components/applications/ApplicationsTable";
import ReviewSection from "@/components/applications/ReviewSection";
import FilterDropdown from "@/components/applications/FilterDropdown";
import RecommendationModal from "@/components/applications/RecommendationModal";
import RecommendationTable from "@/components/applications/RecommendationTable";

let currentUser = await getMe();
currentUser = currentUser && currentUser.name ? currentUser.name : "Guest"; // Fallback to "Guest" if no name is found

export default function ApplicationList() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [showShortlistPopup, setShowShortlistPopup] = useState(false);
  const [popupType, setPopupType] = useState<"screening" | "interview">(
    "screening"
  );
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateSortOrder, setDateSortOrder] = useState<"none" | "asc" | "desc">(
    "none"
  );
  const [scoreSortOrder, setScoreSortOrder] = useState<"none" | "asc" | "desc">(
    "none"
  );
  const [recommendations, setRecommendations] = useState<
    Recommendation[] | null
  >(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendationError, setRecommendationError] = useState<string | null>(
    null
  );
  const [processingAppId, setProcessingAppId] = useState<string | null>(null);
  const [availableReviewers, setAvailableReviewers] = useState<User[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [currentReviewer, setCurrentReviewer] = useState<User | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [recommendedApplicants, setRecommendedApplicants] = useState<
    RecommendationResponse[]
  >([]);
  const [isFetchingRecommendations, setIsFetchingRecommendations] =
    useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const fromHM = searchParams.get("fromhm");
  const fromHR = searchParams.get("fromhr");

  const fetchReviewerEmails = async () => {
    try {
      const usersResponse = await fetchAllUsers();
      const filtered = usersResponse.data.filter(
        (user: User) => user.role !== "hr" && user.role !== "admin"
      );
      setAvailableReviewers(filtered);

      const shortlistResponse = await getShortlistByJob(jobId);
      if (!shortlistResponse.success) return;

      const shortlist = shortlistResponse.short_list?.short_list;
      if (!shortlist) return;

      const existingReviewer = filtered.find(
        (user: User) =>
          String(user._id).trim() === String(shortlist.hiring_manager_id).trim()
      );
      setCurrentReviewer(existingReviewer || null);
    } catch (error) {
      toast.error("Failed to load review data", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const assignReviewer = async (reviewerId: string) => {
    try {
      const response = await createShortList(reviewerId, jobId);
      if (!response.success) throw new Error(response.error);

      const newReviewer = availableReviewers.find((u) => u._id === reviewerId);
      setCurrentReviewer(newReviewer || null);
      toast.success("Reviewer assigned successfully");
      setReviewOpen(false);
    } catch (error) {
      toast.error("Failed to assign reviewer", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

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

      const jobs = jobsResponse.jobs.filter(
        (job: { _id: string }) => job._id !== application.job_id
      );
      const recommendations = await getGeminiRecommendations({
        candidateSummary,
        jobs,
      });
      setRecommendations(recommendations);
    } catch (error) {
      setRecommendationError(
        error instanceof Error
          ? error.message
          : "Failed to generate recommendations"
      );
    } finally {
      setProcessingAppId(null);
    }
  };

  const [showEmptyState, setShowEmptyState] = useState(false);

  const checkRecommendationStatus = async () => {
    try {
      setShowEmptyState(false); // Reset empty state on new check
      const response = await getRecommendationByJob(jobId);

      if (response.success) {
        const status = response.recommendations?.status;

        if (status === "processed") {
          const hasRecommendations =
            response.recommendations.recommend_applications?.length > 0;
          setShowEmptyState(!hasRecommendations);
          setShowRecommendations(hasRecommendations);
          setRecommendedApplicants(
            response.recommendations.recommend_applications || []
          );
          setIsFetchingRecommendations(false);
        } else if (status === "not_processed") {
          console.log("Initiating recommendation creation");
          const createResp = await createRecommendation(jobId);
          if (createResp.success) {
            setIsFetchingRecommendations(true);
            startRecommendationPolling();
          } else {
            // Handle specific "no recommendations" error
            if (createResp.error?.includes("no recommended applications")) {
              setShowEmptyState(true);
              setShowRecommendations(false);
            } else {
              toast.error("Error creating recommendation", {
                description: createResp.error || "Unknown error",
              });
            }
            setIsFetchingRecommendations(false);
          }
        } else if (status === "processing") {
          startRecommendationPolling();
        }
      } else {
        throw new Error(
          response.error || "Error checking recommendation status"
        );
      }
    } catch (error) {
      setShowEmptyState(true);
      setIsFetchingRecommendations(false);
      toast.error("Error checking recommendation status", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const startRecommendationPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await getRecommendationByJob(jobId);
        if (response.success) {
          const status = response.recommendations?.status;
          if (status === "processed") {
            clearInterval(interval);
            const hasRecommendations =
              response.recommendations.recommend_applications?.length > 0;
            setShowEmptyState(!hasRecommendations);
            setShowRecommendations(hasRecommendations);
            setRecommendedApplicants(
              response.recommendations.recommend_applications || []
            );
            setIsFetchingRecommendations(false);
          } else if (status === "failed") {
            clearInterval(interval);
            setShowEmptyState(true);
            setIsFetchingRecommendations(false);
            toast.error("Recommendation process failed");
          }
        }
      } catch (error) {
        clearInterval(interval);
        setShowEmptyState(true);
        setIsFetchingRecommendations(false);
        toast.error("Polling error", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  };

  useEffect(() => {
    const loadApplications = async () => {
      try {
        const resp = await getJobApplications(jobId);
        if (resp.success) setApplications(resp.applications);
      } catch (error) {
        console.error("Failed to load applications:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
    const intervalId = setInterval(loadApplications, 30000);
    return () => clearInterval(intervalId);
  }, [jobId, router]);

  useEffect(() => {
    fetchReviewerEmails();
  }, [jobId]);

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
      const genderMatch = fromHM
        ? true
        : filterType === "all" ||
          app.candidate.gender?.toLowerCase() === filterType;
      const statusMatch = fromHM
        ? app.application_status === "pending"
        : statusFilter === "all" || app.application_status === statusFilter;
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
          <img src="/dashboard/logo.svg" alt="Logo" className="h-12" />
        </div>
        <nav className="space-y-4">
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

          {!fromHM && (
            <div className="mb-6 w-full flex justify-between items-center">
              <div className="flex gap-4">
                <ReviewSection jobId={jobId} />
                <FilterDropdown
                  label="Gender"
                  options={[
                    { label: "All", value: "all" },
                    { label: "Male", value: "male" },
                    { label: "Female", value: "female" },
                  ]}
                  selected={filterType}
                  onSelect={setFilterType}
                />
                <FilterDropdown
                  label="Status"
                  options={[
                    { label: "All", value: "all" },
                    { label: "Pending", value: "pending" },
                    { label: "Hired", value: "hired" },
                    { label: "Rejected", value: "rejected" },
                  ]}
                  selected={statusFilter}
                  onSelect={setStatusFilter}
                />
              </div>
              <button
                onClick={checkRecommendationStatus}
                disabled={isFetchingRecommendations}
                className="flex items-center gap-2 bg-[#FF6A00] text-white px-4 py-2 rounded-lg hover:bg-[#FF6A00]/90 transition-colors disabled:opacity-50"
              >
                {isFetchingRecommendations ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Recommend Applicants"
                )}
              </button>
            </div>
          )}

          {showRecommendations ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Recommended Applicants
              </h2>
              <RecommendationTable
                recommendations={recommendedApplicants}
                jobId={jobId}
              />
              <button
                onClick={() => setShowRecommendations(false)}
                className="mt-4 text-[#FF6A00] hover:underline"
              >
                Show all applicants
              </button>
            </div>
          ) : (
            <ApplicationsTable
              applications={filteredAndSortedApps}
              fromHM={!!fromHM}
              handleRecommend={handleRecommend}
              processingAppId={processingAppId}
              setSelectedApp={setSelectedApp}
              setShowShortlistPopup={setShowShortlistPopup}
              setPopupType={setPopupType}
              dateSortOrder={dateSortOrder}
              scoreSortOrder={scoreSortOrder}
              setDateSortOrder={setDateSortOrder}
              setScoreSortOrder={setScoreSortOrder}
            />
          )}
          {showEmptyState && (
            <div className="empty-state">
              <div className="empty-state-content">
                <FileWarning className="empty-state-icon" />
                <h3 className="empty-state-title">No Recommended Applicants</h3>
                <p className="empty-state-description">
                  There are no recommended applicants for this position at this
                  time.
                </p>
              </div>
            </div>
          )}

          {(recommendations || recommendationError) && (
            <RecommendationModal
              recommendations={recommendations}
              recommendationError={recommendationError}
              onClose={() => {
                setRecommendations(null);
                setRecommendationError(null);
              }}
            />
          )}

          {selectedApp && !showShortlistPopup && (
            <StatusPopup
              application={selectedApp}
              type={popupType}
              onClose={() => setSelectedApp(null)}
              refreshApplications={async () => {
                const resp = await getJobApplications(jobId);
                if (resp.success) setApplications(resp.applications);
              }}
            />
          )}

          {showShortlistPopup && selectedApp && (
            <ShortlistPopup
              currentUser={currentUser}
              application={selectedApp}
              onClose={() => {
                setShowShortlistPopup(false);
                setSelectedApp(null);
              }}
              refreshApplications={async () => {
                const resp = await getJobApplications(jobId);
                if (resp.success) setApplications(resp.applications);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
