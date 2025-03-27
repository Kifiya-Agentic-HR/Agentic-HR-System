"use client"

// app/hm/jobs/page.tsx
import { JobList } from "@/components/jobs/JobList";
import withAuth from "@/utils/with_auth";

 function JobsPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <JobList />
    </div>
  );
}


const ProtectedHMDashboard = withAuth(JobsPage, ["hm"]);
export default ProtectedHMDashboard;