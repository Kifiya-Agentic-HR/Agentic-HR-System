"use client";

import { useRouter } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm"

export default function HomePage() {
  const router = useRouter();
  return AuthForm()

  // return (
  //   <div className="min-h-screen flex items-center justify-center bg-gray-50">
  //     <div className="bg-[#FFF4E6] rounded-xl shadow-2xl p-8 max-w-md w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-3xl">
  //       <h1 className="text-3xl font-bold text-[#364957] mb-6 border-b-2 border-[#FF8A00]/30 pb-4">
  //         Select Dashboard
  //       </h1>
  //       <div className="space-y-4">
  //         <button
  //           className="w-full py-4 text-xl font-bold border border-[#364957] text-[#364957] hover:bg-[#364957]/10 transition-all"
  //           onClick={() => router.push("/hr")}
  //         >
  //           HR Dashboard
  //         </button>
  //         <button
  //           className="w-full py-4 text-xl font-bold bg-[#FF8A00] text-[#364957] hover:bg-[#FF8A00]/90 transition-all"
  //           onClick={() => router.push("/admin")}
  //         >
  //           Admin Dashboard
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
}
