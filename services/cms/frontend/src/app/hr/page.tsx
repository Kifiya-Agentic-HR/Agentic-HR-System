"use client";

import { useState, useRef, useEffect } from "react";
import { JobList } from "@/components/jobs/JobList";
import withAuth from "@/utils/with_auth";
import { getMe } from "@/lib/api";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import ProfileDropdown from "@/components/ProfileDropdown";


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
        <div className="flex justify-end mt-8 relative" ref={containerRef}>
          <button
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
          >
            <span className="text-lg font-semibold text-[#364957]">{firstLetter}</span>
          </button>

          {showProfileDropdown && (
            <ProfileDropdown
              email={email}
              onLogoutClick={() => {
                setShowProfileDropdown(false);
                setShowLogoutConfirm(true);
              }}
              onSettingsClick={() => {
                setShowProfileDropdown(false);
                window.location.href = "/hr/account-settings";
              }}
            />
          )}
        </div>
        <JobList />
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal onCancel={() => setShowLogoutConfirm(false)} />
      )}
    </>
  );
}

const ProtectedHRDashboard = withAuth(JobsPage, ["hr"]);
export default ProtectedHRDashboard;