"use client";

import { useState } from "react";
import { JobList } from "@/components/hm/JobList";
import withAuth from "@/utils/with_auth";
import { Button } from "@/components/ui/button";
import { FiLogOut } from "react-icons/fi";

function JobsPage() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logoutConfirmed = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");

    setTimeout(() => {
      window.location.href = "/";
    }, 50);
  };

  return (
    <>
      <div className="relative bg-gray-50 min-h-screen p-8">
        {/* Logout Icon on the top-right */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FiLogOut size={24} className="text-[#FF8A00]" />
          </button>
        </div>

        {/* Main Jobs content */}
        <JobList />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold text-[#364957]">
              Confirm Logout
            </h3>
            <p className="text-[#364957]/80">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowLogoutConfirm(false)}
                className="border border-[#364957]/20 hover:border-[#364957]/40"
              >
                No
              </Button>
              <Button
                className="bg-[#FF8A00] text-[#364957] hover:bg-[#FF8A00]/90"
                onClick={logoutConfirmed}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const ProtectedHMDashboard = withAuth(JobsPage, ["hm"]);
export default ProtectedHMDashboard;
