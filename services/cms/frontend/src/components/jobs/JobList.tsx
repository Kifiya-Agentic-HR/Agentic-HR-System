"use client";

import { useState, useEffect } from "react";
import { getJobs } from "@/lib/api"; // Using the real API function
import { Job } from "./types";
import { ApplicationList } from "./ApplicationList";

export const JobList = () => {
  // Date formatting function
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);

  useEffect(() => {
    const loadJobs = async () => {
      const data = await getJobs();
      if (data.success && data.jobs) {
        setJobs(data.jobs);
      } else {
        // Handle error (data.error)
        console.error(data.error);
      }
    };
    loadJobs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="ml-2 mt-8 mb-8 text-3xl font-bold text-[#364957] border-b-2 border-orange-500 pb-1">
        Ongoing Job Postings
      </h1>

      <div className="grid gap-8">
        {jobs.map((job) => (
          <div
            key={job._id} // assuming your job object's identifier is _id
            className="bg-[#FFF4E6] rounded-xl p-6 border border-[#364957]/20 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#364957]">
                {job.title}
              </h2>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-[#FF8A00]/10 text-[#FF8A00] rounded-full">
                  {job.job_status} {/* Adjust property name if needed */}
                </span>
                {job.applications && job.applications.length > 0 && (
                  <span className="text-[#364957]/80">
                    {formatDate(job.applications[0]?.appliedDate)} -{" "}
                    {formatDate(
                      job.applications[job.applications.length - 1]?.appliedDate
                    )}
                  </span>
                )}
              </div>
            </div>

            {selectedJob === job._id ? (
              <ApplicationList applications={job.applications} />
            ) : (
              <button
                onClick={() => setSelectedJob(job._id)}
                className="w-full py-3 text-[#364957] hover:bg-[#FF8A00]/10 rounded-xl"
              >
                View {job.applications ? job.applications.length : 0}{" "}
                applications →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
