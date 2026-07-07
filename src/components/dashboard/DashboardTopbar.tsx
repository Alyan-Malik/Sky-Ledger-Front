import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, LogOut, Loader2, Menu, Search, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async (e: Event) => {
    // Prevent dropdown menu auto-closing mechanics from breaking state updates
    e.preventDefault();
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
      navigate({ to: "/login", replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback routing enforcement
      navigate({ to: "/login", replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Helper function to extract user initials dynamically
  const getInitials = (name?: string) => {
    if (!name) return "SL";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
      <button
        onClick={onMenuClick}
        className="grid h-10 w-10 place-items-center rounded-lg text-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search bookings, PNR, passenger…" className="h-10 pl-10" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/dashboard/search">
            <Search className="h-4 w-4" /> Quick Search
          </Link>
        </Button>

        <button className="relative grid h-10 w-10 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-accent outline-none">
  <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground select-none">
    {/* Computes combined initials dynamically from both properties */}
    {user?.first_name && user?.last_name 
      ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
      : "UA"}
  </span>
  <span className="hidden text-left sm:block">
    <span className="block text-sm font-semibold leading-tight text-foreground line-clamp-1">
      {/* Concatenates both names together separated by a single space */}
      {user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : "User Account"}
    </span>
  </span>
</button>

          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/dashboard/profile">
                <User className="h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            {/* <DropdownMenuItem asChild>
              <Link to="/dashboard/settings">
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem> */}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2 cursor-pointer"
              onSelect={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                  <span>Logging out...</span>
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}