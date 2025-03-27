"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Settings,
  Users,
  BookOpen,
  MessageSquareText,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      href: "/admin/prompt-settings",
      label: "AI Agent Settings",
      icon: <MessageSquareText className="h-5 w-5" />,
    },
    {
      href: "/admin/knowledge-base",
      label: "Knowledge Base",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      href: "/admin/hr-accounts",
      label: "HR Accounts",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/admin/hm-accounts",
      label: "HM Accounts",
      icon: <Users className="h-5 w-5" />,
    },
    {
      href: "/admin/account-settings",
      label: "Account Settings",
      icon: <Settings className="h-5 w-5" />,
    },
    {
      href: "/admin/user-management",
      label: "User management",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return (
    <div className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r bg-white">
      <ScrollArea className="h-full p-4">
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
