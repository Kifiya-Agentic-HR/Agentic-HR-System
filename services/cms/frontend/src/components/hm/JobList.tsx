"use client";

import { useState, useEffect } from "react";
import { getJobs } from "@/lib/api";
import { Job } from "@/components/jobs/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const JobList = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const loadJobs = async () => {
      const data = await getJobs();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      } else {
        console.error(data.error);
      }
    };
    loadJobs();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
                    <span className="px-3 py-1 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] text-sm">
                      {job.job_status}
                    </span>
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
