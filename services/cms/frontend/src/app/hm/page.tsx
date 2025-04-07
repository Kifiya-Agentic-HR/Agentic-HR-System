"use client";

import { useState, useRef, useEffect } from "react";
import { JobList } from "@/components/hm/JobList";
import withAuth from "@/utils/with_auth";
import { Button } from "@/components/ui/button";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { getMe } from "@/lib/api";


function JobsPage() {
  const [email, setEmail] = useState<string>("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchEmail() {
      const result = await getMe();
      if (result?.success !== false && result.email) {
        setEmail(result.email);
      }
    }

    fetchEmail();
  }, []);

  const firstLetter = email ? email.charAt(0).toUpperCase() : "?";

  const logoutConfirmed = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    setTimeout(() => {
      window.location.href = "/";
    }, 50);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    if (showProfileDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileDropdown]);


  return (
    <>
      <div className="w-full px-4 relative">
        {/* Profile icon and dropdown */}
        <div className="flex justify-end mt-8 relative" ref={containerRef}>
          <button
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
          >
            <span className="text-lg font-semibold text-[#364957]">{firstLetter}</span>
          </button>

          {/* Dropdown menu */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-200">
                <p className="text-sm  text-gray-700">Signed in as</p>
                <p className="text-sm font-medium text-[#FF8A00] truncate">{email}</p>
              </div>

              <a
                href="/hm/account-settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowProfileDropdown(false)}
              >
                <FiSettings className="mr-2 text-[#FF8A00]" /> Account Settings
              </a>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  setShowLogoutConfirm(true);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2 text-[#FF8A00]" /> Logout
              </button>
            </div>
          )}
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
