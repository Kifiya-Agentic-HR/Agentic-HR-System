import { FiLogOut, FiSettings } from "react-icons/fi";
import { motion } from "framer-motion";

interface ProfileDropdownProps {
  email: string;
  name: string;
  onLogoutClick: () => void;
  onSettingsClick: () => void;
}

export default function ProfileDropdown({
  email,
  name,
  onLogoutClick,
  onSettingsClick,
}: ProfileDropdownProps) {

  // if "undefined" in name string just name it Admin
  if (name === "undefined undefined") {
    name = "Admin";
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="absolute right-0 mt-2 w-64 bg-white shadow-xl rounded-xl py-3 z-50 border border-orange-50/30"
    >
      {/* User info */}
      <div className="px-4 py-3 space-y-1 border-b border-orange-100">
        <p className="text-xs font-medium text-gray-500">Welcome back</p>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
          <p className="text-xs font-medium text-orange-600 truncate">{email}</p>
        </div>
      </div>

      {/* Menu Items */}
      <div className="px-2 py-2 space-y-1">
        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onSettingsClick}
          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-orange-50/50 transition-colors"
        >
          <FiSettings className="mr-3 text-orange-600 w-4 h-4" />
          Account Settings
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={onLogoutClick}
          className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 rounded-lg hover:bg-orange-50/50 transition-colors"
        >
          <FiLogOut className="mr-3 text-orange-600 w-4 h-4" />
          Sign Out
        </motion.button>
      </div>
    </motion.div>
  );
}