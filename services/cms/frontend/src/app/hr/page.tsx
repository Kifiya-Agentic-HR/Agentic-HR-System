"use client";

import { useState } from "react";
import { JobList } from "@/components/hm/JobList";
import withAuth from "@/utils/with_auth";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import ProfileDropdown from "@/components/ProfileDropdown";

function JobsPage() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  return (
    <>
      <div className="w-full px-4 relative">
        <div className="flex justify-end mt-8 relative">
          <button
            onClick={() => setShowProfileDropdown((prev) => !prev)}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center"
          >
            <span className="text-lg font-semibold text-[#364957]">?</span>
          </button>

          {showProfileDropdown && (
            <ProfileDropdown
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
