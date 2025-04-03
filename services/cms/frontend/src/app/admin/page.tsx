"use client";

import { useState } from "react";
import Dashboard from "@/components/admin/admin_dashboard";
import withAuth from "@/utils/with_auth";
import { Button } from "@/components/ui/button";
import { FiLogOut } from "react-icons/fi";

function DashboardPage() {
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
      <div className="w-full px-4 relative">
        {/* Top row with Logout icon aligned to the right */}
        <div className="flex justify-end mt-8">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FiLogOut size={24} className="text-[#FF8A00]" />
          </button>
        </div>

        {/* Dashboard header with orange bottom border */}
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
