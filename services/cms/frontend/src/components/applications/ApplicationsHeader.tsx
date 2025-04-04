"use client";

import { useRouter } from "next/navigation";
import { FiChevronLeft, FiUser } from "react-icons/fi";

export default function ApplicationsHeader() {
  const router = useRouter();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center text-secondary hover:text-[#FF6A00] font-medium"
      >
        <FiChevronLeft className="mr-2 h-5 w-5" />
        Back to Jobs
      </button>

      <h1 className="text-3xl font-bold text-primary mb-6 flex items-center">
        <FiUser className="mr-3 w-8 h-8" />
        <span className="relative after:absolute after:left-0 after:-bottom-2 after:w-full after:h-0.5 after:bg-[#FF6A00]">
          Applications Overview
        </span>
      </h1>
    </div>
  );
}
