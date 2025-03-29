"use client";

import { useState, useEffect } from "react";
import { getJobs, updateJob } from "@/lib/api";
import { Job } from "./types";
import Link from "next/link";
import { Chatbot } from "../Chatbot";
import { useRouter } from "next/navigation";

export const JobList = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const isConfirmed = window.confirm(
        "Are you sure you want to close this job? Closing it will prevent further applications."
      );
      if (!isConfirmed) return;
    }

    const originalJobs = jobs;
    
    // Optimistic update
    setJobs(prev =>
      prev.map(job =>
        job._id === jobId ? { ...job, job_status: newStatus } : job
      )
    );

    try {
      const response = await updateJob(jobId, { job_status: newStatus });
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