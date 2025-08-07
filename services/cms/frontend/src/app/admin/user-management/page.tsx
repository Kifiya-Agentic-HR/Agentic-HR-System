"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FiUsers, FiUserPlus, FiFilter, FiSearch } from "react-icons/fi";
import { fetchAllUsers, deleteUser } from "@/lib/api";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input";


export type User = {
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
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "hr" | "hm">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  const fetchUsers = async () => {
    const result = await fetchAllUsers();
    if (result.success) {
      const filtered = result.data.filter(
        (user: { role: string }) => user.role !== "admin");
      setUsers(filtered);
    } else {
      toast.error("Failed to fetch users", { description: result.error });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 20000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUsers();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const handleCreate = (role: "hr" | "hm") => {
    router.push(`${role}-accounts`);
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
  // Handle search
  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(lowercasedQuery) ||
        user.lastName.toLowerCase().includes(lowercasedQuery) ||
        user.email.toLowerCase().includes(lowercasedQuery) ||
        user.role.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };


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

      {/* Search Bar */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"> {selectedFilter === "all"
                ? "All Roles"
                : selectedFilter === "hr"
                  ? "HR"
                  : "Hiring Manager"}
                <FiFilter className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
              <DropdownMenuItem onClick={() => {
                setFilteredUsers(users);
                setCurrentPage(1);
                setSelectedFilter("all");
              }}
              >
                All Roles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFilteredUsers(users.filter((user) => user.role === "hr"));
                setCurrentPage(1);
                setSelectedFilter("hr");
              }}>
                HR
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                setFilteredUsers(users.filter((user) => user.role === "hm"));
                setCurrentPage(1);
                setSelectedFilter("hm");
              }}>
                Hiring Manager
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="relative w-1/3">
          <Input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 border border-gray-300 rounded-md"
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />

        </div>

      </div>


      {/* User Table */}
      <div className="flex flex-col">

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.role === "hr" ? "HR" : "Hiring Manager"}</TableCell>
                  <TableCell>{user.email}</TableCell>

                  <TableCell>
                    <Button
                      onClick={() => confirmRemove(user)}
                      className="bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white px-4 py-2 rounded-lg"
                    >
                      Remove
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-gray-500">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPage > 1 ? currentPage - 1 : 1)}
                />
              </PaginationItem>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    onClick={() => handlePageChange(i + 1)}
                    className={currentPage === i + 1 ? "font-bold text-[#FF8A00]" : ""}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() =>
                    handlePageChange(currentPage < totalPages ? currentPage + 1 : totalPages)
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
                's account?
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
