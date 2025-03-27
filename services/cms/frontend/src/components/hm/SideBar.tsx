"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Briefcase, Settings } from "lucide-react";

export function HMSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/hm",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },

    {
      href: "/hm/account-settings",
      label: "Account Settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r bg-white">
      <ScrollArea className="h-full p-4">
        <div className="mb-6 ml-4">
          <img src="/logo.svg" alt="Logo" className="h-12" />
        </div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Button
              key={item.href}
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start",
                pathname === item.href
                  ? "bg-[#364957] text-white hover:bg-[#364957]/90"
                  : "hover:bg-[#FF8A00]/10 text-[#364957]"
              )}
            >
              <Link href={item.href}>
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
