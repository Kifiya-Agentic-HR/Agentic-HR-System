"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createHRAccount, fetchAllUsers, deleteUser } from "@/lib/api";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

export default function CreateHrAccountForm() {
  const [loading, setLoading] = useState(false);
  const [hrAccounts, setHrAccounts] = useState<any[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const result = await fetchAllUsers();
      if (result.success) {
        setHrAccounts(result.data.filter((user: { role: string; }) => user.role !== "admin"));
      } else {
        console.error("Error fetching users:", result.error);
      }
    };
    getUsers();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const response = await createHRAccount({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: "hr",
      });

      toast.success("Account created successfully", {
        description: `HR ${values.firstName} ${values.lastName} has been registered`,
      });
      setHrAccounts((prev) => [...prev, response.data]);
      form.reset();
    } catch (error: any) {
      toast.error("Creation failed", {
        description: error || "There was an error creating the account",
      });
    } finally {
      setLoading(false);
    }
  }

  
  const removeAccount = async (userId: string, userRole: string) => {
    const result = await deleteUser(userId, userRole);
    if (result.success) {
      toast.success("Account deleted successfully");
  
      // Update state without refreshing
      setHrAccounts((prev) => prev.filter((acc) => acc.id !== userId));
    } else {
      toast.error("Error deleting account", {
        description: result.error,
      });
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <h2 className="text-3xl font-bold text-[#364957] mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          Create HR Account
        </h2>
<Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name Field */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter first name..."
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

            {/* Last Name Field */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter last name..."
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

            {/* Email Field */}
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
                      placeholder="Enter email address..."
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

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#364957] text-lg font-semibold">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Create password..."
                      type="password"
                      className="border-2 border-[#364957]/20 focus:border-[#FF8A00]
                        focus-visible:ring-[#FF8A00]/50 text-[#364957] placeholder-[#364957]/50
                        transition-all duration-200 hover:border-[#364957]/30 h-12"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-[#364957]/80">
                    Minimum 8 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
{/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-[#364957] font-bold
                text-lg py-6 transition-all duration-300 hover:scale-[1.02] shadow-lg
                hover:shadow-xl"
            >
              Create Account
            </Button>
          </form>
        </Form>
      </div>
      {hrAccounts.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-2xl font-bold text-[#364957]">Created HR Accounts</h3>
          {hrAccounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between bg-white rounded-xl shadow p-4 border border-[#364957]/20 transition-all duration-200 hover:shadow-xl"
            >
              <div>
                <p className="text-lg font-semibold text-[#364957]">{acc.firstName} {acc.lastName}</p>
                <p className="text-sm text-[#364957]/70">{acc.email}</p>
              </div>
              <Button
                onClick={() => removeAccount(acc._id, acc.role)}
                className="bg-[#F44336] hover:bg-[#F44336]/90 text-white px-4 py-2 rounded-lg"
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
