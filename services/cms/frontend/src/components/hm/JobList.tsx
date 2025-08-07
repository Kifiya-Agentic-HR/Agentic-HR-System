"use client";

import { useState, useEffect } from "react";
import { getShortlist, getJobById } from "@/lib/api";
import { Job, ShortList, ShortlistResponse } from "@/components/jobs/types";
import { useRouter } from "next/navigation";
import { FaSort } from "react-icons/fa";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FiSearch } from "react-icons/fi";

export const JobList = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("date"); 
  const [selectedFilter, setSelectedFilter] = useState<string | null>("date"); 
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");


  useEffect(() => {
    const loadJobs = async () => {
      try {
        const result: ShortlistResponse = await getShortlist();
        
        if (!result?.success) {
          setError(result?.error || "Failed to load shortlist");
          return;
        }

        const jobIds = result.data?.short_list?.map(item => item.job_id) || [];

        const jobPromises = jobIds.map(id => getJobById(id));
        const jobResults = await Promise.all(jobPromises);

        const validJobs = jobResults
          .filter(result => result?.success)
          .map(result => result.job)
          .filter((job): job is Job => !!job);

        setJobs(validJobs);

      } catch (err) {
        console.error("Fetch error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);


  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime()) 
      ? "Invalid date" 
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-[#364957]">Loading jobs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-red-500 text-center">{error}</div>
        <div className="text-center mt-4">
          <button
            onClick={() => window.location.reload()}
            className="text-[#FF8A00] hover:text-[#FF8A00]/80 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
 // Filter jobs based on search query
 const filteredJobs = jobs.filter((job) =>
  job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
 job.created_at.toLowerCase().includes(searchQuery.toLowerCase()) ||
  job.status.toLowerCase().includes(searchQuery.toLowerCase())

);

// Sorting logic

const sortedJobs = [...filteredJobs].sort((a, b) => {
  let compare = 0;
  if (sortField === "date") {
    compare = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  } else if (sortField === "name") {
    compare = a.title.localeCompare(b.title);
  } else if (sortField === "status") {
    compare = a.status.localeCompare(b.status);
  }
  return sortDirection === "asc" ? compare : -compare;
});

// Pagination logic
const indexOfLastJob = currentPage * jobsPerPage;
const indexOfFirstJob = indexOfLastJob - jobsPerPage;
const currentJobs = sortedJobs.slice(indexOfFirstJob, indexOfLastJob);
const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

const handlePageChange = (page: number) => {
  setCurrentPage(page);
};

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#364957] mb-8">
        <span className="relative after:content-[''] after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[#FF6A00]">
          Ongoing Jobs
        </span>
      </h1>

       {/* Search Bar */}
       <div className="mb-6 flex justify-between items-center">
        <div>
         {/* Sorting Dropdown */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"> 
                {selectedFilter === "date" ? "Sort by Date" : selectedFilter === "name" ? "Sort by Job Title" : "Sort by Status"}
                <FaSort className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuItem onClick={() => {
                setSortField("date");
                setSelectedFilter("date");
              }}
              >
                Sort by Date
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setSortField("name");
                setSelectedFilter("name");
              }}>
                Sort by Job Title
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
              setSortField("status");
              setSelectedFilter("status");
              }}>
                Sort by Status
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
        <div className="relative w-1/3">
          <Input
            type="text"
            placeholder="Search by job title, date or status"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 border border-gray-300 rounded-md"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

        </div>

      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-[#364957]/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#364957]">
              <tr className="text-left text-sm font-semibold text-white">
                <th className="px-6 py-4">Job Title
      <button
        className="ml-2"
        onClick={() => {
          setSortField("name");
          setSortDirection(sortField === "name" && sortDirection === "asc" ? "desc" : "asc");
        }}
        aria-label="Sort Job Title"
      >
        {sortField === "name" && sortDirection === "asc" ? "▲" : "▼"}
      </button>

                </th>
                <th className="px-6 py-4">Date Posted       <button
        className="ml-2"
        onClick={() => {
          setSortField("date");
          setSortDirection(sortField === "date" && sortDirection === "asc" ? "desc" : "asc");
        }}
        aria-label="Sort Date"
      >
        {sortField === "date" && sortDirection === "asc" ? "▲" : "▼"}
      </button></th>
                <th className="px-6 py-4">Status       <button
        className="ml-2"
        onClick={() => {
          setSortField("status");
          setSortDirection(sortField === "status" && sortDirection === "asc" ? "desc" : "asc");
        }}
        aria-label="Sort Status"
      >
        {sortField === "status" && sortDirection === "asc" ? "▲" : "▼"}
      </button></th>
                <th className="px-6 py-4">Applications</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#364957]/20">
            {currentJobs
              .map((job) => (
                <tr
                  key={job._id}
                  className="hover:bg-[#FF8A00]/5 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-[#364957]">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 text-[#364957]/80">
                    {formatDate(job.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-[#FF8A00]/10 text-[#FF8A00] text-sm">
                      {job.status || "Unknown status"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => router.push(`/applications/${job._id}?fromhm=true`)}
                      className="text-[#FF8A00] hover:text-[#FF8A00]/80 font-medium inline-flex items-center gap-2 ml-auto"
                    >
                      View Applications
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              
              {jobs.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-[#364957]/80">
                    No ongoing jobs found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={() => handlePageChange(i + 1)}
                    className={currentPage === i + 1 ? "font-bold text-[#FF8A00]" : ""}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};