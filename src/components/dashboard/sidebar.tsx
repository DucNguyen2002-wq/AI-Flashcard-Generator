"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "@/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  LayoutDashboard,
  Library,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  {
    href: "/dashboard",
    label: "Tổng quan",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/decks",
    label: "Bộ thẻ của tôi",
    icon: Library,
  },
  {
    href: "/settings",
    label: "Cài đặt",
    icon: Settings,
  },
];

interface SidebarContentProps {
  userEmail?: string;
  onNavigate?: () => void;
}

export function SidebarContent({ userEmail, onNavigate }: SidebarContentProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <BookOpen className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">AI Flashcard</span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* User / Sign Out */}
      <div className="px-2 py-4 space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs">
              {userEmail ? userEmail[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs text-muted-foreground">
            {userEmail ?? ""}
          </span>
        </div>
        <form action={signOut}>
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </form>
      </div>
    </div>
  );
}
