"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Settings updated successfully", {
        description: "Your account changes have been saved",
      });
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
          <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
            Account Settings
          </h2>
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
        <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          Account Settings
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00]
                        focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                        transition-all duration-200 hover:border-[#364957]/30 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email"
                      type="email"
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00]
                        focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                        transition-all duration-200 hover:border-[#364957]/30 h-12"
                      {...field}
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
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00]
                        focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                        transition-all duration-200 hover:border-[#364957]/30 h-12"
                      {...field}
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
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00]
                        focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                        transition-all duration-200 hover:border-[#364957]/30 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold
                text-lg py-6 transition-all duration-300 hover:scale-[1.02] shadow-lg
                hover:shadow-xl"
            >
              Update Account
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
