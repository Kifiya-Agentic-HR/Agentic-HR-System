"use client";

import { useState, useRef, useEffect } from "react";
import Dashboard from "@/components/admin/admin_dashboard";
import withAuth from "@/utils/with_auth";
import { getMe } from "@/lib/api";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import ProfileDropdown from "@/components/ProfileDropdown";

function DashboardPage() {
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchEmail() {
      const result = await getMe();
      if (result?.success !== false && result.email) {
        setEmail(result.email);
        setName(result.name);
      }
    }

    fetchEmail();
  }, []);

  const firstLetter = name
    ? name.charAt(0).toUpperCase()
    : email
    ? email.charAt(0).toUpperCase()
    : "?";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
            <span className="text-lg font-semibold text-[#364957]">
              {firstLetter}
            </span>
          </button>

          {showProfileDropdown && (
            <ProfileDropdown
              email={email}
              name={name}
              onLogoutClick={() => {
                setShowProfileDropdown(false);
                setShowLogoutConfirm(true);
              }}
              onSettingsClick={() => {
                setShowProfileDropdown(false);
                window.location.href = "/dashboard/admin/account-settings";
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
