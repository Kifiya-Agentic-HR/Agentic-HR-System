// src/app/page.tsx
import { Suspense } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobsGrid from "@/components/jobs-grid";
import LoadingSkeleton from "@/components/loading-skeleton";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 via-white to-white">
      {/* <SiteHeader /> */}

      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#364957] text-[#FF8A00] py-20">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-6">
              Build the Future of Finance
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join Kifiya&apos;s team shaping Africa&apos;s financial technology
              landscape
            </p>
            <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm text-white/80">
                  Search roles (Coming Soon)
                </span>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Jobs */}
        <div className="container py-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-secondary" />
            <h2 className="text-3xl font-bold text-primary">
              Career Opportunities
            </h2>
          </div>

          <Suspense fallback={<LoadingSkeleton />}>
            <JobsGrid />
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
