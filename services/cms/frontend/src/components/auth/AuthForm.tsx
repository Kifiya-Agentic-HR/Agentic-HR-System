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
import { login } from "@/lib/api"; // Adjust the import path as needed
import { useRouter } from "next/navigation";
import { jwtDecode, JwtPayload } from "jwt-decode";

console.log("AuthForm component has mounted");

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

interface TokenPayload extends JwtPayload {
  role: string;
}

export default function AuthForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwtDecode<TokenPayload>(token);
      console.log("Decoded Token:", decoded);
      return decoded;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  }

  const handleLogin = async (values: z.infer<typeof loginSchema>) => {
    console.log("handleLogin was called with values:", values);

    const result = await login(values);
    console.log("Login result:", result);

    if (result.success && result.token) {
      const decoded = decodeToken(result.token);

      if (!decoded || !decoded.role) {
        console.error("Invalid or missing role in token. Redirecting to default dashboard.");
        router.push("/dashboard");
        return;
      }

      // Save token and role to localStorage
      localStorage.setItem("accessToken", result.token);
      localStorage.setItem("userRole", decoded.role);

      console.log("Token saved to localStorage:", result.token);
      console.log("Role saved to localStorage:", decoded.role);

      // Redirect based on role
      if (decoded.role === "admin") {
        router.push("/admin");
      } else if (decoded.role === "hr") {
        router.push("/hr");
      } else {
        router.push("/dashboard");
      }
    } else {
      console.error("Login failed", result.error);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="bg-[#364957] w-1/2 flex flex-col items-center justify-center p-12 space-y-8">
        <img src="/logo (2).svg" alt="Company Logo" className="w-64 h-auto" />
        <h1 className="text-white text-3xl font-bold text-center">Recruitment Dashboard</h1>
        <p className="text-white text-xl text-center">Empowering Smarter Hiring Decisions through AI-Driven Insights</p>
      </div>
      <div className="w-1/2 flex items-center justify-center p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <h2 className="text-2xl font-bold text-[#364957] text-center">Welcome Back</h2>
          <p className="text-[#364957]/80 text-center">Please sign in to continue</p>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <Label>Email</Label>
                    <FormControl>
                      <Input placeholder="example@kifiya.et" {...field} />
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
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-[#FF8A00] hover:bg-[#FF6A00]">Login</Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
