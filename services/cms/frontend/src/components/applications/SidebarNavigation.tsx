"use client";

import Link from "next/link";
import { FiList } from "react-icons/fi";

export default function SidebarNavigation({
  active = "applications",
}: {
  active?: string;
}) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-6 min-h-screen">
      <div className="mb-6">
        <img src="/dashboard/logo.svg" alt="Logo" className="h-12" />
      </div>
      <nav className="space-y-4">
        <Link
          href="/applications"
          className={`flex items-center space-x-3 ${
            active === "applications"
              ? "text-[#FF6A00] bg-[#FF6A00]/10"
              : "text-gray-600 hover:bg-gray-100"
          } p-3 rounded-lg`}
        >
          <FiList className="w-5 h-5" />
          <span>Applications</span>
        </Link>
      </nav>
    </div>
  );
}
