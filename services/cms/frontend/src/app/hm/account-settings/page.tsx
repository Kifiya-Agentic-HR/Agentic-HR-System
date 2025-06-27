"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { updateOwnAccount } from "@/lib/api";
import Cookies from "js-cookie";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Validation Schema
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  currentPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z
    .string()
    .min(8, {
      message: "New password must be at least 8 characters.",
    })
    .optional(),
});

export default function AccountSettingsForm() {
  const [loading, setLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const logoutConfirmed = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    Cookies.remove("accessToken");
    Cookies.remove("userRole");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 50);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    console.log(" [Frontend] Submitting Account Update:", values);

    try {
      const response = await updateOwnAccount(values);
      console.log(" [Frontend] API Response:", response);

      if (response.success) {
        toast.success("Settings updated successfully", {
          description: "Your account changes have been saved",
        });
        form.reset();
      } else {
        toast.error("Update failed", {
          description:
            response.error || "There was an error saving your changes",
        });
      }
    } catch (error) {
      console.error(" [Frontend] API Error:", error);
      toast.error("Update failed", {
        description: "There was an error saving your changes",
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex justify-between items-center mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
            <h2 className="text-3xl font-bold text-[#364957]">
              Account Settings
            </h2>
            <Button
              onClick={() => setShowLogoutConfirm(true)}
              className="bg-[#364957] hover:bg-[#2b3b46] text-white text-sm font-medium px-4 py-2"
            >
              Logout
            </Button>
          </div>
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-[30%] bg-[#364957]/20" />
                <Skeleton className="h-10 bg-[#364957]/10" />
              </div>
            ))}
            <Skeleton className="h-12 w-full bg-[#FF8A00]/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <div className="flex justify-between items-center mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          <h2 className="text-3xl font-bold text-[#364957]">
            Account Settings
          </h2>
          <Button
            onClick={() => setShowLogoutConfirm(true)}
            className="bg-[#364957] text-white text-sm font-medium px-4 py-2"
          >
            Logout
          </Button>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter email address"
                      type="email"
                      {...field}
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50 transition-all duration-200 hover:border-[#364957]/30 h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Current Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter current password"
                      type="password"
                      {...field}
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50 transition-all duration-200 hover:border-[#364957]/30 h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    New Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter new password (optional)"
                      type="password"
                      {...field}
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00] focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50 transition-all duration-200 hover:border-[#364957]/30 h-12"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white text-lg py-6 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Update Account
            </Button>
          </form>
        </Form>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm space-y-4">
            <h3 className="text-xl font-bold text-[#364957]">Confirm Logout</h3>
            <p className="text-[#364957]/80">
              Are you sure you want to log out?
            </p>
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
    </div>
  );
}
