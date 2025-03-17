"use client";

import { Application } from "@/components/jobs/types";
import { useState, useEffect } from "react";
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
} from "react-icons/fi";

export default function ApplicationList() {
  const router = useRouter();
  const params = useParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [popupType, setPopupType] = useState<"screening" | "interview">(
    "screening"
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApplications = async () => {
      console.log("Reloading applications...");
      try {
        if (!params.jobId) {
          throw new Error("Job ID not found");
        }
        // Optionally, you can add a timestamp if your API cares about cache
        // const timestamp = new Date().getTime();
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

    // Initial load of applications
    loadApplications();

    // Set up automatic reload every 30 seconds
    const intervalId = setInterval(() => {
      loadApplications();
    }, 30000);

    // Cleanup interval on component unmount
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

          {selectedApp && (
            <StatusPopup
              application={selectedApp}
              type={popupType}
              onClose={() => setSelectedApp(null)}
              refreshApplications={async () =>
                console.log("Applications Refreshed")
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
