import { Inter } from "next/font/google";
import "@fontsource/inter";
import { HRSidebar } from "@/components/jobs/Sidebar";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} flex`}>
      <HRSidebar />
      <div className="flex-1 ml-64 w-full p-8">{children}</div>
      <Toaster  />
    </div>
  );
}
