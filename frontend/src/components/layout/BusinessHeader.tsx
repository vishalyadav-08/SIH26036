"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Scale,
  LogOut,
  Menu,
  X,
  Building2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { BUSINESS_NAV_ITEMS } from "./BusinessSidebar";
import { Button } from "@/components/ui/button";

export function BusinessHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const isActive = (href: string) => {
    if (href === "/app") {
      return pathname === "/app";
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-8">
            <Link
              href="/app"
              className="flex items-center gap-2.5 group focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            >
              <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-2xs group-hover:bg-primary/90 transition-colors">
                <Scale className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight leading-none">
                  MapanSetu
                </span>
                <span className="text-[10px] font-semibold text-primary uppercase tracking-wider mt-0.5">
                  Business Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right Area: User Profile & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border">
              <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-left leading-none">
                <div className="text-xs font-bold text-foreground truncate max-w-[140px]">
                  {user?.displayName || "Business User"}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {user?.businessId || "BUSINESS"}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-1.5 text-xs text-destructive hover:text-destructive border-border hover:bg-destructive/10"
              title="Sign out of current account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="text-muted-foreground hover:bg-muted"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pt-3 pb-5 space-y-4 shadow-lg absolute w-full h-[calc(100vh-4rem)] overflow-y-auto">
          {/* User info in mobile view */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
            <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-foreground">
                {user?.displayName || "Business User"}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">
                {user?.email} &bull; {user?.role}
              </div>
            </div>
          </div>

          <nav
            aria-label="Mobile workspace navigation"
            className="space-y-1 pt-1"
          >
            {BUSINESS_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Button
                  key={item.href}
                  variant={active ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-10 font-medium"
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={item.href} aria-current={active ? "page" : undefined}>
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>


          <div className="pt-2 border-t border-border">
            <Button
              variant="destructive"
              className="w-full justify-center gap-2 font-semibold"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
