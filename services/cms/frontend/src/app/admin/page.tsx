"use client";

import { useState, useRef, useEffect } from "react";
import Dashboard from "@/components/admin/admin_dashboard";
import withAuth from "@/utils/with_auth";
import { Button } from "@/components/ui/button";
import { getMe } from "@/lib/api";
import ProfileDropdown from "@/components/ProfileDropdown";

function DashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch email on mount
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

  // Close dropdown when clicking outside
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
        {/* Profile button + dropdown container */}
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
                window.location.href = "/admin/account-settings";
              }}
            />
          )}
        </div>

        {/* Dashboard heading */}
        <h2 className="mt-8 text-3xl font-bold text-[#364957] border-b-2 border-orange-500 pb-1">
          Dashboard Overview
        </h2>

        <Dashboard />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold text-[#364957]">Confirm Logout</h3>
            <p className="text-[#364957]/80">Are you sure you want to log out?</p>
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

const ProtectedAdminDashboard = withAuth(DashboardPage, ["admin"]);
export default ProtectedAdminDashboard;
