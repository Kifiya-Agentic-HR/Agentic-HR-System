"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { updateOwnAccount } from "@/lib/api"; // Import the API function

import {
  FormField,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

// Logout Function
const logout = () => {

  localStorage.removeItem("accessToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userRole");

  
  setTimeout(() => {
    window.location.href = "/";
  }, 50);
};

// Validation Schema
const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }).optional(),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }).optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters." }),
  newPassword: z.string().min(8, { message: "New password must be at least 8 characters." }).optional(),
});

export default function AccountSettingsForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      console.log("🔵 [Frontend] Submitting Account Update:", values);

      const response = await updateOwnAccount(values);

      if (response.success) {
        toast.success("Settings updated successfully", {
          description: "Your account changes have been saved",
        });
        form.reset();
      } else {
        toast.error("Update failed", {
          description: response.error || "There was an error saving your changes",
        });
    
      }
    } catch (error) {
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
            <h2 className="text-3xl font-bold text-[#364957]">Account Settings</h2>
            {/* Logout Button */}
            <Button
              onClick={logout}
              className="bg-[#364957] text-white text-sm font-medium px-4 py-2"
            >
              Logout
            </Button>
          </div>
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
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
          <h2 className="text-3xl font-bold text-[#364957]">Account Settings</h2>
          {/* Logout Button */}
          <Button
            onClick={logout}
            className="bg-[#364957]  text-white text-sm font-medium px-4 py-2"
          >
            Logout
          </Button>
        </div>

        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name Field (Optional) */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name Field (Optional) */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your email" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Current Password Field */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">Current Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter current password" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* New Password Field (Optional) */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter new password (optional)" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold
                text-lg py-6 transition-all duration-300 hover:scale-[1.02] shadow-lg hover:shadow-xl"
            >
              Update Account
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}