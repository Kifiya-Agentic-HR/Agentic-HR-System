"use client";

import { Suspense } from "react";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobsGrid from "@/components/jobs-grid";
import LoadingSkeleton from "@/components/loading-skeleton";
import SiteFooter from "@/components/site-footer";
import SearchParamsProvider from "@/components/search-params-provider";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary/5 via-white to-white">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="bg-[#364957] text-[#FF8A00] py-20">
          <div className="container text-center">
            <h1 className="text-5xl font-bold mb-6">Build the Future of Finance</h1>
            <p className="text-xl text-primary-foreground/90 mb-8">
              Join Kifiya's team shaping Africa's financial technology landscape
            </p>

            <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <form
                action="/"
                method="get"
                className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-4 px-4 py-2"
              >
                <input
                  type="text"
                  name="search"
                  placeholder="Title"
                  className="text-white bg-transparent border-b border-white/20 focus:outline-none focus:ring-0 focus:bg-transparent w-full sm:w-auto"
                />
                <input
                  type="text"
                  name="skills"
                  placeholder="Skills (comma-separated)"
                  className="text-white bg-transparent border-b border-white/20 focus:outline-none focus:ring-0 focus:bg-transparent w-full sm:w-auto"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  className="text-white hover:bg-white/70 p-2 flex items-center"
                >
                  Search <ArrowUpRight className="w-5 h-5" />
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Featured Jobs */}
        <div className="container py-16">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-6 h-6 text-secondary" />
            <h2 className="text-3xl font-bold text-primary">Career Opportunities</h2>
          </div>

          {/* Wrap SearchParamsProvider and JobsGrid in a Suspense boundary */}
          <Suspense fallback={<LoadingSkeleton />}>
            <SearchParamsProvider>
              <JobsGrid />
            </SearchParamsProvider>
          </Suspense>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
