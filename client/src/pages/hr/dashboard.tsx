import { useQuery } from "@tanstack/react-query";
import RoleNav from "@/components/ui/role-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Job } from "@shared/schema";
import { Link } from "wouter";
import { Loader2 } from "lucide-react";

export default function HRDashboard() {
  const { data: jobs, isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  return (
    <div className="flex min-h-screen">
      <RoleNav />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Job Listings</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs?.map((job) => (
              <Link key={job.id} href={`/hr/jobs/${job.id}`}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle>{job.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{job.summary}</p>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        {job.status}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        {job.type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
