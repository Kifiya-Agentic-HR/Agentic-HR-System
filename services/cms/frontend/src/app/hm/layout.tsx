import { Inter } from "next/font/google";
import "@fontsource/inter";
import { HMSidebar } from "@/components/hm/SideBar";
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${inter.className} flex`}>
      <HMSidebar />
      <div className="flex-1 ml-64 w-full p-8">{children}</div>
    </div>
  );
}
