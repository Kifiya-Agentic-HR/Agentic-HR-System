"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm"

export default function HomePage() {
  const router = useRouter();
  return AuthForm()
}