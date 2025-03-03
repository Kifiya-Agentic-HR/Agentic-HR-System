import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  LayoutDashboard,
  Settings,
  FileText,
  LogOut,
} from "lucide-react";

export default function RoleNav() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isHR = user?.role === 'HR';
  const baseRoute = isHR ? '/hr' : '/admin';

  const links = isHR 
    ? [
        { href: '/hr/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/hr/job-post', label: 'Post Job', icon: FileText },
        { href: '/hr/settings', label: 'Settings', icon: Settings },
      ]
    : [
        { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
      ];

  return (
    <div className="min-h-screen w-64 bg-[#364957] text-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold">{isHR ? 'HR Dashboard' : 'Admin Dashboard'}</h2>
        <p className="text-sm opacity-75">Welcome, {user?.name}</p>
      </div>

      <nav className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href}>
              <a className={`flex items-center gap-3 px-4 py-2 rounded hover:bg-white/10 transition-colors ${
                location === link.href ? 'bg-white/20' : ''
              }`}>
                <Icon className="h-5 w-5" />
                {link.label}
              </a>
            </Link>
          );
        })}

        <button
          onClick={() => logoutMutation.mutate()}
          className="w-full flex items-center gap-3 px-4 py-2 rounded hover:bg-white/10 transition-colors text-left"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </nav>
    </div>
  );
}
