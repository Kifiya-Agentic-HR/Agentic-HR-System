"use client";

import { useState, useEffect } from "react";
import { getJobs, updateJob } from "@/lib/api";
import { Job } from "./types";
import { useRouter } from "next/navigation";
import { Dialog } from "@headlessui/react";

export const JobList = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState<{
    jobId: string;
    newStatus: string;
    originalStatus: string;
  } | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await getJobs();
        if (data.success && data.jobs) {
          setJobs(data.jobs);
        } else {
          setError(data.error || 'Failed to load jobs');
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  const handleStatusChange = async (
    jobId: string,
    newStatus: string,
    originalStatus: string
  ) => {
    if (newStatus === "closed") {
      setPendingUpdate({ jobId, newStatus, originalStatus });
      setShowConfirmation(true);
      return;
    }

    await performStatusUpdate(jobId, newStatus, originalStatus);
  };

  const performStatusUpdate = async (
    jobId: string,
    newStatus: string,
    originalStatus: string
  ) => {
    const originalJobs = [...jobs];
    
    // Optimistic update
    setJobs(prev =>
      prev.map(job =>
        job._id === jobId ? { ...job, job_status: newStatus } : job
      )
    );

    try {
      // Send only the status field with "status" key
      const response = await updateJob(jobId, { status: newStatus });
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update job status');
      }
    } catch (error) {
      // Revert on error
      setJobs(originalJobs);
      setError(
        error instanceof Error
          ? error.message
          : "An error occurred while updating the job status."
      );
    }
  };

  const ConfirmationDialog = () => (
    <Dialog
      open={showConfirmation}
      onClose={() => setShowConfirmation(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <Dialog.Panel className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <Dialog.Title className="text-lg font-bold text-[#364957] mb-4">
          Confirm Job Closure
        </Dialog.Title>
        <Dialog.Description className="text-[#364957]/90 mb-6">
          Are you sure you want to close this job? Closing it will prevent further applications.
        </Dialog.Description>

        <div className="flex justify-end gap-4">
          <button
            onClick={() => setShowConfirmation(false)}
            className="px-4 py-2 text-[#364957] hover:bg-[#364957]/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              if (!pendingUpdate) return;
              setShowConfirmation(false);
              await performStatusUpdate(
                pendingUpdate.jobId,
                pendingUpdate.newStatus,
                pendingUpdate.originalStatus
              );
              setPendingUpdate(null);
            }}
            className="px-4 py-2 bg-[#FF6A00] text-white rounded-lg hover:bg-[#FF6A00]/90 transition-colors"
          >
            Confirm Close
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-[#364957]">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ConfirmationDialog />
      
      <h1 className="text-3xl font-bold text-[#364957] mb-8">
        <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[#FF6A00]">
          Ongoing Jobs
        </span>
      </h1>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#364957]/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#364957]">
              <tr className="text-left text-sm font-semibold text-white">
                <th className="px-6 py-4">Job Title</th>
                <th className="px-6 py-4">Date Posted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Applications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#364957]/20">
              {jobs.map((job) => (
                <tr
                  key={job._id}
                  className="hover:bg-[#FF8A00]/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-[#364957]">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 text-[#364957]/80">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={job.job_status}
                      onChange={(e) =>
                        handleStatusChange(job._id, e.target.value, job.job_status)
                      }
                      className="px-3 py-1 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] text-sm focus:outline-none focus:ring-2 focus:ring-[#FF8A00] cursor-pointer"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/applications/${job._id}`)}
                      className="text-[#FF8A00] hover:text-[#FF8A00]/80 font-medium inline-flex items-center gap-2 ml-auto"
                    >
                      View Applications
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};