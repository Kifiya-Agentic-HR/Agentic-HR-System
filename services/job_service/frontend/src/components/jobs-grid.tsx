"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { getJobs, Job } from "@/actions/get-api";
import { ArrowUpRight } from "lucide-react";
import { useCustomSearchParams } from "@/components/search-params-provider";

export default function JobsGrid() {
  const { search, type, skills } = useCustomSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Load jobs once on mount.
  useEffect(() => {
    async function loadJobs() {
      try {
        const fetchedJobs = await getJobs();
        setJobs(fetchedJobs);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  // Client-side filtering
  const filteredJobs = jobs.filter((job) => {
    if (job.job_status.toLowerCase() === 'closed') return false;
    const matchesSearch = search
      ? job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.description.summary.toLowerCase().includes(search.toLowerCase())
      : true;

    const matchesType = type
      ? job.description.type.toLowerCase() === type.toLowerCase()
      : true;

    const matchesSkills = skills
      ? skills
          .toLowerCase()
          .split(",")
          .every((skill) =>
            job.skills.map((s) => s.toLowerCase()).includes(skill.trim())
          )
      : true;

    return matchesSearch && matchesType && matchesSkills;
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p>Loading jobs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-2 border-dashed border-red-100 bg-red-50 rounded-xl p-8 text-center">
        <div className="text-2xl text-red-400 mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-red-600 mb-2">
          Failed to load jobs
        </h3>
        <p className="text-red-500/80">{error}</p>
      </div>
    );
  }

  if (!filteredJobs.length) {
    return (
      <div className="border-2 border-dashed border-primary/20 rounded-xl p-8 text-center">
        <div className="text-2xl text-primary/50 mb-4"></div>
        <h3 className="text-xl font-semibold text-primary mb-2">
          No open positions
        </h3>
        <p className="text-primary/60">
          Check back later or subscribe to job alerts
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredJobs.map((job) => (
        <Link
          key={job._id}
          href={`/jobs/${job._id}/apply`}
          className="group transition-all"
        >
          <Card className="h-full p-6 border-2 border-transparent group-hover:border-secondary/20 group-hover:shadow-lg transition-all">
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Job Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Badge
                    variant="outline"
                    className="border-secondary/30 text-[#FF8A00]"
                  >
                    {job.job_status.toUpperCase()}
                  </Badge>
                  <span className="text-sm text-primary/60">
                    {job.description.type}
                  </span>
                </div>

                {/* Job Title */}
                <h3 className="text-xl font-semibold text-primary mb-2">
                  {job.title}
                </h3>

                {/* Job Role Description */}
                <p className="text-primary/60 line-clamp-3 mb-4">
                  {job.description.summary}
                </p>
              </div>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {Object.keys(job.skills)
                  .slice(0, 3)
                  .map((skill, index) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
              </div>

              {/* Post Date & Apply Now */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-primary/50">
                  {formatDate(job.created_at || job.postDate)}
                </span>
                <span className="inline-flex items-center gap-1 text-sm text-[#FF8A00] font-medium">
                  Apply Now
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
