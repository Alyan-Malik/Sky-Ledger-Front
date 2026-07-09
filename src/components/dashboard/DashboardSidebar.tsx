// src/components/dashboard/DashboardSidebar.tsx

import { Link, useRouterState } from "@tanstack/react-router";
import {
  CalendarSearch,
  LayoutDashboard,
  ListChecks,
  Printer,
  Settings,
  User,
} from "lucide-react";
import { Brand } from "@/components/common/Brand";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const nav = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard, exact: true },
  { label: "Search Flights", to: "/dashboard/search", icon: CalendarSearch, exact: false },
  { label: "Bookings", to: "/dashboard/bookings", icon: ListChecks, exact: false },
    { label: "Tickets", to: "/dashboard/ticket", icon: Printer, exact: false },
  { label: "Profile", to: "/dashboard/profile", icon: User, exact: false },
] as any[]; // Removed 'as const' to safely allow conditional parameters matching layout engines smoothly

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-20 flex-col justify-center border-b border-sidebar-border px-6 gap-0.5">
        <Brand />
        {user?.email && (
          <span className="block text-xs text-muted-foreground/80 font-medium truncate select-none ml-2 mt-1">
            {user.email}
          </span>
        )}
      </div>
      
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Menu
        </p>
        {nav.map((item) => {
          // 2. Cleaned up the match criteria: normalize dynamic path tokens so startsWith performs matching against base folders
          const baseCheckPath = item.to.replace("/$bookingId", "");
          const active = item.exact 
            ? pathname === item.to 
            : pathname.startsWith(baseCheckPath);

          return (
            <Link
              key={item.to}
              to={item.to}
              params={item.params || {}}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-soft"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="m-4 rounded-2xl bg-hero-gradient p-5 text-white">
        <p className="text-sm font-semibold">Need help?</p>
        <p className="mt-1 text-xs text-white/80">Our support team is here 24/7.</p>
        <button className="mt-3 w-full rounded-lg bg-white/15 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/25">
          Contact Support
        </button>
      </div>
    </div>
  );
}