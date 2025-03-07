"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { login } from "@/lib/api"; // adjust the import path as needed
import { useRouter } from "next/navigation";
import * as JWTDecode from "jwt-decode"; // Import as namespace

// Log to confirm component mounting
console.log("RecruitmentDashboard component has mounted");

// Define a schema for the login form
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Define an interface for the token payload
interface TokenPayload {
  role: string;
  // add additional properties if needed
}

export default function RecruitmentDashboard() {
  const router = useRouter();

  // react-hook-form setup
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /**
   * A helper function to decode the token, handling libraries that may not export a default.
   * We cast the result instead of passing a type argument to avoid TS error.
   */
  function decodeToken(token: string): TokenPayload {
    // Attempt to use .default first, otherwise use the namespace
    const decodeFn = (JWTDecode as any).default || (JWTDecode as any);
    // Call decodeFn without <TokenPayload>, then cast to TokenPayload
    const decoded = decodeFn(token) as TokenPayload;
    return decoded;
  }

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    console.log("handleLogin was called with values:", values);

    const result = await login(values);
    console.log("Login result:", result);

    if (result.success && result.token) {
      localStorage.setItem("accessToken", result.token);
      console.log("Token saved to localStorage:", result.token);

      let decoded: TokenPayload;
      try {
        decoded = decodeToken(result.token);
        console.log("Decoded token:", decoded);
      } catch (e) {
        console.error("Failed to decode token", e);
        return;
      }

      console.log("User role:", decoded.role);

      // Navigate based on the role extracted from the token
      if (decoded.role === "ADMIN") {
        console.log("Navigating to admin dashboard");
        router.push("/admin/dashboard");
      } else if (decoded.role === "HR") {
        console.log("Navigating to HR dashboard");
        router.push("/hr");
      } else {
        console.log("Navigating to default dashboard");
        router.push("/dashboard");
      }
    } else {
      console.error("Login failed", result.error);
      // Optionally display an error message to the user
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="bg-[#364957] w-1/2 flex flex-col items-center justify-center p-12 space-y-8">
        <img
          src="/logo (2).svg"
          alt="Company Logo"
          className="w-64 h-auto"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#FF8A00]"
            >
              <path
                d="M20 0C8.96 0 0 8.96 0 20C0 31.04 8.96 40 20 40C31.04 40 40 31.04 40 20C40 8.96 31.04 0 20 0ZM16 30L8 22L10.82 19.18L16 24.34L29.18 11.16L32 14L16 30Z"
                fill="#FF8A00"
              />
            </svg>
            <h1 className="text-white text-3xl font-bold text-center">
              Recruitment Dashboard
            </h1>
          </div>
        </div>
        <p className="text-white text-xl text-center">
          Empowering Smarter Hiring Decisions through AI-Driven Insights
        </p>
      </div>

      {/* Right Panel */}
      <div className="w-1/2 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-[#364957]">Welcome Back</h2>
            <p className="text-[#364957]/80">Please sign in to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input
                        placeholder="example@kifiya.et"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
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
                    <Label>Password</Label>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={field.value || ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#FF8A00] hover:bg-[#FF6A00]"
              >
                Login
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
