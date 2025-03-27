"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiUsers, FiUserPlus } from "react-icons/fi";
import { fetchAllUsers, deleteUser } from "@/lib/api";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";

type User = {
  id: string;
  _id: string;
  role: "hr" | "hm";
  firstName: string;
  lastName: string;
  email: string;
};

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const getUsers = async () => {
      const result = await fetchAllUsers();
      if (result.success) {
        const filtered = result.data.filter(
          (user: { role: string }) => user.role !== "admin"
        );
        setUsers(filtered);
      } else {
        toast.error("Failed to fetch users", { description: result.error });
      }
      setLoading(false);
    };

    getUsers();
    const interval = setInterval(getUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = (role: "hr" | "hm") => {
    router.push(`/users/create/${role}`);
    setDropdownOpen(false);
  };

  const confirmRemove = (user: User) => {
    setSelectedUser(user);
    setShowConfirmDialog(true);
  };

  const handleConfirmedRemove = async () => {
    if (!selectedUser) return;
    const result = await deleteUser(selectedUser._id, selectedUser.role);
    if (result.success) {
      toast.success("Account deleted successfully");
      setUsers((prev) => prev.filter((user) => user._id !== selectedUser._id));
    } else {
      toast.error("Error deleting account", {
        description: result.error,
      });
    }
    setShowConfirmDialog(false);
    setSelectedUser(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  

  const hrUsers = users.filter((u) => u.role === "hr");
  const hmUsers = users.filter((u) => u.role === "hm");

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Top Bar */}
      <div className="mb-10 pb-4 border-b-2 border-orange-200 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-[#364957]">User Management</h1>
        <div className="relative" ref={dropdownRef}>
          <Button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="bg-[#364957] text-white flex items-center gap-2"
          >
            <FiUserPlus />
            Create New Account
          </Button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md z-10 w-48 border border-gray-200">
              <button
                onClick={() => handleCreate("hr")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Create HR Account
              </button>
              <button
                onClick={() => handleCreate("hm")}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
              >
                Create Hiring Manager
              </button>
            </div>
          )}
        </div>
      </div>

      {/* HR Users */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-[#364957] mb-4">HR Accounts</h2>
        {hrUsers.length === 0 ? (
          <p className="text-gray-500">No HR accounts found.</p>
        ) : (
          <div className="space-y-4">
            {hrUsers.map((user) => (
              <Card
                key={user._id}
                className="p-4 shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-[#364957]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Button
                  onClick={() => confirmRemove(user)}
                  className="bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* HM Users */}
      <div>
        <h2 className="text-xl font-semibold text-[#364957] mb-4">Hiring Manager Accounts</h2>
        {hmUsers.length === 0 ? (
          <p className="text-gray-500">No Hiring Manager accounts found.</p>
        ) : (
          <div className="space-y-4">
            {hmUsers.map((user) => (
              <Card
                key={user._id}
                className="p-4 shadow-sm border border-gray-100 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-[#364957]">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <Button
                  onClick={() => confirmRemove(user)}
                  className="bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white px-4 py-2 rounded-lg"
                >
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Delete Dialog */}
      {showConfirmDialog && selectedUser && (
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <h2 className="text-lg font-semibold text-[#364957] mb-4">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>
                  {selectedUser.firstName} {selectedUser.lastName}
                </strong>
                ’s account?
              </p>
              <div className="flex justify-end gap-4">
                <Button
                  variant="ghost"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmedRemove}
                  className="bg-[#FF8A00] text-white hover:bg-[#FF8A00]/90"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
