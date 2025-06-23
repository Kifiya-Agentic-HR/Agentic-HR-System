"use client";

import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Cookies from "js-cookie";

type Props = {
  onCancel: () => void;
};

export default function LogoutConfirmModal({ onCancel }: Props) {
  const logoutConfirmed = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    Cookies.remove("accessToken");
    Cookies.remove("userRole");

    
    setTimeout(() => {
      window.location.href = "/";
    }, 50);
  };

  // Optional: prevent scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
        <h3 className="text-xl font-bold text-[#364957]">Confirm Logout</h3>
        <p className="text-[#364957]/80">Are you sure you want to log out?</p>
        <div className="flex justify-end space-x-3 pt-2">
          <Button
            variant="ghost"
            onClick={onCancel}
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
  );
}
