"use client";

import { useState, useRef, useEffect } from "react";
import Dashboard from "@/components/admin/admin_dashboard";
import withAuth from "@/utils/with_auth";
import { getMe } from "@/lib/api";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import ProfileDropdown from "@/components/ProfileDropdown";

function DashboardPage() {
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
                window.location.href = "/admin/account-settings";
              }}
            />
          )}
        </div>

        <h2 className="mt-8 text-3xl font-bold text-[#364957] border-b-2 border-orange-500 pb-1">
          Dashboard Overview
        </h2>
        <Dashboard />
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal onCancel={() => setShowLogoutConfirm(false)} />
      )}
    </>
  );
}

const ProtectedAdminDashboard = withAuth(DashboardPage, ["admin"]);
export default ProtectedAdminDashboard;
