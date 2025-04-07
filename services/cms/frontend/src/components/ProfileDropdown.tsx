import { useState, useEffect, useRef } from "react";
import { FiLogOut, FiSettings } from "react-icons/fi";
import { getMe } from "@/lib/api";


interface ProfileDropdownProps {
  onLogoutClick: () => void;
  onSettingsClick: () => void;
}

export default function ProfileDropdown({
  onLogoutClick,
  onSettingsClick,
}: ProfileDropdownProps) {
  const [email, setEmail] = useState<string>("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch email logic
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

  // Handle click outside
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
    <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-50" ref={containerRef}>
      {/* User info */}
      <div className="px-4 py-2 border-b border-gray-200">
        <p className="text-sm text-gray-700">Signed in as</p>
        <p className="text-sm font-medium text-[#FF8A00] truncate">{email}</p>
      </div>

      {/* Account settings */}
      <button
        onClick={onSettingsClick}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <FiSettings className="mr-2 text-[#FF8A00]" />
        Account Settings
      </button>

      {/* Logout */}
      <button
        onClick={onLogoutClick}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      >
        <FiLogOut className="mr-2 text-[#FF8A00]" />
        Logout
      </button>
    </div>
  );
}
