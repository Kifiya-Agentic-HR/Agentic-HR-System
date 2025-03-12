"use client"

// app/hr/jobs/page.tsx
import { JobList } from "@/components/jobs/JobList";
import withAuth from "@/utils/with_auth";

 function JobsPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <JobList />
    </div>
  );
}


const ProtectedHRDashboard = withAuth(JobsPage, ["hr"]);
export default ProtectedHRDashboard;