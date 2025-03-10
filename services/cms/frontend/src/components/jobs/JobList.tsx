"use client";

import { useState, useEffect } from "react";
import { getJobs, getJobApplications } from "@/lib/api";
import { Job } from "./types";
import { ApplicationList } from "./ApplicationList";
import { Chatbot } from "../Chatbot";
export const JobList = () => {
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
  const [selectedApps, setSelectedApps] = useState<any[]>([]);

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

  const handleViewApplications = async (jobId: string) => {
    setSelectedJob(jobId);
    const resp = await getJobApplications(jobId);
    if (resp.success && resp.applications) {
      setSelectedApps(resp.applications);
    } else {
      console.error(resp.error);
      setSelectedApps([]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="ml-2 mt-8 mb-8 text-3xl font-bold text-[#364957] border-b-2 border-orange-500 pb-1">
        Ongoing Job Postings
      </h1>

      <div className="grid gap-8">
        {jobs.map((job) => (
          <div
            key={job._id}
            className="bg-[#FFF4E6] rounded-xl p-6 border border-[#364957]/20 transition-all hover:shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-[#364957]">
                {job.title}
              </h2>
              <div className="flex items-center gap-4">
                <span className="px-4 py-2 bg-[#FF8A00]/10 text-[#FF8A00] rounded-full">
                  {job.job_status}
                </span>
              </div>
            </div>

            {selectedJob === job._id ? (
              <ApplicationList applications={selectedApps} />
            ) : (
              <button
                onClick={() => handleViewApplications(job._id)}
                className="w-full py-3 text-[#364957] hover:bg-[#FF8A00]/10 rounded-xl"
              >
                View applications →
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add the Chatbot component */}
      <Chatbot jobs={jobs} />
    </div>
  );
};
