// app/hr/jobs/page.tsx
import { JobList } from "@/components/jobs/JobList";

export default function JobsPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <JobList />
    </div>
  );
}
