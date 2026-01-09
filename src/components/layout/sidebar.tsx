"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Send,
  Users,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
  },
  {
    title: "Templates",
    href: "/templates",
    icon: FolderOpen,
  },
  {
    title: "Team",
    href: "/settings/team",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Admin",
    href: "/admin",
    icon: Shield,
    adminOnly: true,
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobile?: boolean;
}

function SidebarContent({
  collapsed,
  onToggle,
  isMobile,
}: {
  collapsed: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mounted, setMounted] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Check if user is admin
  React.useEffect(() => {
    async function checkAdmin() {
      try {
        const res = await fetch("/api/admin/stats");
        // If we get a 200, user is admin (the endpoint requires admin)
        setIsAdmin(res.ok);
      } catch {
        setIsAdmin(false);
      }
    }
    if (session?.user) {
      checkAdmin();
    }
  }, [session?.user]);

  const user = session?.user;
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "?";

  return (
    <div className="flex flex-1 flex-col h-full min-h-0">
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed && !isMobile ? "justify-center" : "justify-between"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 font-semibold",
            collapsed && !isMobile && "hidden"
          )}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Send className="h-5 w-5" />
          </div>
          <span className="text-lg">OpenProposal</span>
        </Link>
        {collapsed && !isMobile && (
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Send className="h-5 w-5" />
          </button>
        )}
        {!isMobile && !collapsed && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggle}
            className="hidden lg:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems
          .filter((item) => !item.adminOnly || isAdmin)
          .map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && !isMobile && "justify-center px-2"
              )}
              title={collapsed && !isMobile ? item.title : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {(!collapsed || isMobile) && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Menu - pinned to bottom */}
      <div className="mt-auto border-t p-4">
        {mounted && status !== "loading" ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 px-3",
                  collapsed && !isMobile && "justify-center px-2"
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                {(!collapsed || isMobile) && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium">{user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email || ""}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className={cn(
            "flex items-center gap-3 px-3 py-2",
            collapsed && !isMobile && "justify-center px-2"
          )}>
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
            {(!collapsed || isMobile) && (
              <div className="flex flex-col gap-1">
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-3 w-28 rounded bg-muted animate-pulse" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ isOpen, onClose, isMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(false);

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          <SidebarContent collapsed={false} isMobile={true} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "hidden sticky top-0 h-screen border-r bg-card transition-all duration-300 lg:flex lg:flex-col",
        collapsed ? "w-[72px]" : "w-64"
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        isMobile={false}
      />
    </aside>
  );
}

export { navItems };
