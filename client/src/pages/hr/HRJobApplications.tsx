import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { fetchApplications } from "@/api/jobs";
import { Application } from "@/api/types";
import { Loader2, FileText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ResultModal } from "@/components/ui/ResultModal";

export default function HRJobApplications() {
  const { jobId } = useParams<{ jobId: string }>();
  const trimmedJobId = jobId?.trim();
  const {
    data: applications,
    isLoading,
    error,
  } = useQuery<Application[]>({
    queryKey: [`applications-${trimmedJobId}`],
    queryFn: () => fetchApplications(trimmedJobId),
  });

  const [modalData, setModalData] = useState<{
    title: string;
    status: string;
    reasoning: string;
  } | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center">
        <p className="text-red-500">
          Error loading applications: {error.message}
        </p>
      </div>
    );
  }

  if (!applications || applications.length === 0) {
    return (
      <div className="flex justify-center">
        <p>No applications found for this job.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen dark:bg-background">
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Applications</h1>

        <div className="grid grid-cols-1 gap-4">
          {applications.map((application) => (
            <div
              key={application.id}
              className="bg-card rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap md:flex-nowrap">
                {/* Left Section */}
                <div className="flex items-center gap-4 min-w-[200px] flex-1">
                  <h2 className="font-semibold text-lg truncate">
                    {application.name}
                  </h2>
                </div>

                {/* CV Link */}
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="h-4 w-4 flex-shrink-0" />
                  <a
                    href={application.cv_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-sm truncate"
                  >
                    View CV
                  </a>
                </div>

                {/* Applied Date */}
                <span className="text-sm text-muted-foreground min-w-[140px] text-right">
                  {formatDate(application.applied_date)}
                </span>

                {/* Status Buttons */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() =>
                      setModalData({
                        title: "Screening Result",
                        status: application.screening_result.status,
                        reasoning: application.screening_result.reasoning,
                      })
                    }
                  >
                    <span className="sr-only">Screening:</span>
                    <StatusBadge status={application.screening_result.status} />
                  </Button>

                  <Button
                    variant="outline"
                    className="h-8 px-3"
                    onClick={() =>
                      setModalData({
                        title: "Interview Result",
                        status: application.interview_result.status,
                        reasoning: application.interview_result.reasoning,
                      })
                    }
                  >
                    <span className="sr-only">Interview:</span>
                    <StatusBadge status={application.interview_result.status} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {modalData && (
          <ResultModal {...modalData} onClose={() => setModalData(null)} />
        )}
      </main>
    </div>
  );
}
