import { FiLogOut, FiSettings } from "react-icons/fi";

interface ProfileDropdownProps {
  email: string;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
}

export default function ProfileDropdown({
  email,
  onLogoutClick,
  onSettingsClick,
}: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md py-2 z-50">
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