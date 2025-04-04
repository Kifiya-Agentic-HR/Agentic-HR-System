"use client";

import { useState, useEffect } from "react";
import { User } from "@/components/jobs/types";
import { FiCheckCircle, FiChevronUp } from "react-icons/fi";
import { toast } from "sonner";
import { fetchAllUsers, getShortlistByJob, createShortList } from "@/lib/api";

interface ReviewSectionProps {
  jobId: string;
}

export default function ReviewSection({ jobId }: ReviewSectionProps) {
  const [availableReviewers, setAvailableReviewers] = useState<User[]>([]);
  const [selectedReviewer, setSelectedReviewer] = useState<string>("");
  const [currentReviewer, setCurrentReviewer] = useState<User | null>(null);
  const [reviewOpen, setReviewOpen] = useState(false);

  const fetchReviewerEmails = async () => {
    try {
      const usersResponse = await fetchAllUsers();
      const filtered = usersResponse.data.filter(
        (user: User) => user.role !== "hr" && user.role !== "admin"
      );
      setAvailableReviewers(filtered);

      const shortlistResponse = await getShortlistByJob(jobId);
      const shortlist = shortlistResponse.short_list.short_list;
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
      await createShortList(reviewerId, jobId);
      const newReviewer = availableReviewers.find((u) => u._id === reviewerId);
      setCurrentReviewer(newReviewer || null);
      toast.success("Reviewer assigned successfully");
      setReviewOpen(false);
    } catch (error) {
      toast.error("Failed to assign reviewer");
    }
  };

  useEffect(() => {
    fetchReviewerEmails();
  }, [jobId]);

  return (
    <div className="relative">
      {currentReviewer ? (
        <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl cursor-default">
          <FiCheckCircle className="text-[#FF6A00]" />
          <span className="text-sm text-gray-600">
            UNDER REVIEW by {currentReviewer.email}
          </span>
        </div>
      ) : (
        <>
          <button
            onClick={() => setReviewOpen(!reviewOpen)}
            className="flex items-center gap-2 bg-gray-100 p-2 rounded-xl"
          >
            <span className="text-sm text-gray-600 mr-2">Assign Review</span>
            <svg
              className={`h-4 w-4 transition-transform ${
                reviewOpen ? "rotate-180" : ""
              }`}
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {reviewOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl z-10 p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-700">Select Reviewer</h3>
                <button onClick={() => setReviewOpen(false)}>
                  <FiChevronUp className="w-5 h-5" />
                </button>
              </div>

              <select
                value={selectedReviewer}
                onChange={(e) => setSelectedReviewer(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select a reviewer...</option>
                {availableReviewers.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.email}
                  </option>
                ))}
              </select>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setReviewOpen(false);
                    setSelectedReviewer("");
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    selectedReviewer && assignReviewer(selectedReviewer)
                  }
                  className={`${
                    selectedReviewer ? "bg-[#FF6A00]" : "bg-gray-300"
                  }`}
                >
                  Assign
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
