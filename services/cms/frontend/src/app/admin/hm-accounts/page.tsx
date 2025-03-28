"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";
import { createHMAccount } from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

export default function CreateHmAccountForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      await createHMAccount({
        ...values,
        role: "hm",
      });

      toast.success("Account created successfully", {
        description: `HM ${values.firstName} ${values.lastName} has been registered`,
      });

      form.reset();
      router.push("/users"); // Redirect back to user management
    } catch (error: any) {
      toast.error("Creation failed", {
        description: error || "There was an error creating the account",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 transition-all duration-300 hover:shadow-3xl hover:-translate-y-1">
        <div className="flex items-center gap-4 mb-8 border-b-2 border-[#FF8A00]/30 pb-4">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/user-management")}
            className="p-2 rounded-full hover:bg-[#FF8A00]/10 text-[#364957]"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h2 className="text-3xl font-bold text-[#364957]">
            Create Hiring Manager
          </h2>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <div className="flex gap-4">
            
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#FF8A00] hover:bg-[#FF8A00]/90 text-white
                  text-lg py-6 transition-all duration-300 hover:scale-[1.02] shadow-lg
                  hover:shadow-xl"
              >
                {loading ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}