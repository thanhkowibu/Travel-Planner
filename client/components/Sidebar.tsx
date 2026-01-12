"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, History, Settings, Menu, X } from "lucide-react";
import { FaSuitcaseRolling } from "react-icons/fa";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const navItems: NavItem[] = [
  {
    name: "Lập kế hoạch",
    href: "/",
    icon: <Home className="w-5 h-5" />,
    description: "Tạo lịch trình mới",
  },
  {
    name: "Lịch sử",
    href: "/history",
    icon: <History className="w-5 h-5" />,
    description: "Xem tìm kiếm cũ",
  },
  {
    name: "Playground",
    href: "/playground",
    icon: <Settings className="w-5 h-5" />,
    description: "Điều chỉnh thuật toán",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden"
        size="icon"
        variant="default"
      >
        {isMobileOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </Button>

      {/* Overlay cho mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-card border-r border-border",
          "flex flex-col shadow-xl z-40 transition-transform duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        {/* Logo Header */}
        <div className="p-6 border-b border-border">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="block"
          >
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2 hover:opacity-80 transition-opacity">
              <FaSuitcaseRolling className="w-8 h-8" /> Smart Travel
            </h1>
            <p className="text-xs text-muted-foreground mt-2">
              Tối ưu hóa lịch trình du lịch của bạn
            </p>
          </Link>
          <div className="mt-4">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-all",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-transparent"
                )}
              >
                <div className="mt-0.5">{item.icon}</div>
                <div>
                  <div className="font-medium text-sm">{item.name}</div>
                  <div className="text-xs opacity-70 mt-0.5">
                    {item.description}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="p-2 border-t border-border">
          <p className="text-[10px] text-muted-foreground">
            © 2026 HUST Project
          </p>
        </div>
      </aside>
    </>
  );
}
