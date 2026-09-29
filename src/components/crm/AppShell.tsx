import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Users,
  Landmark,
  BadgeIndianRupee,
  BarChart3,
  LogOut,
  UserCheck,
  ShieldCheck,
  Headphones,
  FileText,
  Eye,
  ChevronDown,
  UserPlus,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";
import { useAuth } from "@/lib/auth-context";
import { UserRole, MOCK_USERS } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ALL_NAV_ITEMS = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "sales", "processing", "viewer"] as UserRole[],
  },
  {
    to: "/leads",
    label: "Leads & cases",
    labelMap: {
      sales: "My Leads & Follow-ups",
      processing: "Assigned Cases",
      admin: "Leads & pipeline",
      viewer: "All Cases & Pipeline",
    },
    icon: Users,
    roles: ["admin", "sales", "processing", "viewer"] as UserRole[],
  },
  {
    to: "/lenders",
    label: "Lender Panel",
    icon: Landmark,
    roles: ["admin", "viewer"] as UserRole[],
  },
  {
    to: "/disbursements",
    label: "Disbursement & Payouts",
    icon: BadgeIndianRupee,
    roles: ["admin", "processing", "viewer"] as UserRole[],
  },
  {
    to: "/reports",
    label: "Analytics & Reports",
    icon: BarChart3,
    roles: ["admin", "viewer"] as UserRole[],
  },
];

const ROLE_BADGE_STYLE: Record<UserRole, { label: string; style: string; icon: any }> = {
  admin: {
    label: "Admin / Owner",
    style: "bg-primary/15 text-primary border-primary/30",
    icon: ShieldCheck,
  },
  sales: {
    label: "Sales Exec",
    style: "bg-blue-500/15 text-blue-600 border-blue-500/30 dark:text-blue-400",
    icon: Headphones,
  },
  processing: {
    label: "Processing Exec",
    style: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400",
    icon: FileText,
  },
  viewer: {
    label: "Viewer (Read-Only)",
    style: "bg-amber-500/15 text-amber-600 border-amber-500/30 dark:text-amber-400",
    icon: Eye,
  },
};

export function AppShell({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { role, user, setRole } = useAuth();

  const signOut = async () => {
    localStorage.removeItem("crm_user");
    await queryClient.cancelQueries();
    queryClient.clear();
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    navigate({ to: "/auth", replace: true });
  };

  const navItems = ALL_NAV_ITEMS.filter((item) => item.roles.includes(role));
  const currentBadge = ROLE_BADGE_STYLE[role];
  const BadgeIcon = currentBadge.icon;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex border-r-2 border-[#1E3A5F] overflow-y-auto no-scrollbar">
        {/* Logo */}
        <Link to="/dashboard" className="mb-6 flex items-center px-1 py-2 transition-opacity hover:opacity-95">
          <NormiloansLogo variant="dark" size="lg" showTagline={true} />
        </Link>

        {/* User Card inside Sidebar */}
        <div className="mb-5 rounded-2xl border-2 border-[#1E3A5F] bg-sidebar-accent/40 p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-sm">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">{user.name}</p>
              <p className="truncate text-xs text-sidebar-foreground/75">{user.roleTitle}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-sidebar-border/60 pt-2.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/60">Active Role</span>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${currentBadge.style}`}>
              <BadgeIcon className="size-3" />
              {role.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const displayLabel = item.labelMap ? item.labelMap[role] || item.label : item.label;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-white"
                activeProps={{
                  className: "bg-primary text-white font-semibold shadow-md shadow-primary/20",
                }}
              >
                <item.icon className="size-4 shrink-0" />
                {displayLabel}
              </Link>
            );
          })}

          {/* Quick Create Lead for Sales & Admin */}
          {role !== "viewer" && (
            <Link
              to="/student-registration"
              className="mt-2 flex items-center gap-3 rounded-xl border-2 border-primary/40 bg-primary/10 px-3.5 py-2.5 text-sm font-semibold text-primary transition-all hover:bg-primary hover:text-white"
            >
              <UserPlus className="size-4 shrink-0" />
              Student Registration
            </Link>
          )}
        </nav>

        {/* Role Switcher Widget for Dev & Demo */}
        <div className="mt-4 rounded-xl border-2 border-[#1E3A5F] bg-sidebar-accent/50 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/70">
            Dev Mode Role Switcher
          </p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="mt-2 w-full justify-between border-2 border-[#1E3A5F] bg-sidebar text-white hover:bg-sidebar-accent">
                <span className="flex items-center gap-2 truncate text-xs font-semibold">
                  <UserCheck className="size-3.5 text-primary" />
                  {currentBadge.label}
                </span>
                  <ChevronDown className="size-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Switch Simulation Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(Object.keys(MOCK_USERS) as UserRole[]).map((r) => {
                const u = MOCK_USERS[r];
                const badge = ROLE_BADGE_STYLE[r];
                const Icon = badge.icon;
                return (
                  <DropdownMenuItem key={r} onClick={() => setRole(r)} className="cursor-pointer">
                    <Icon className="mr-2 size-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold">{u.roleTitle}</p>
                      <p className="text-[11px] text-muted-foreground">{u.name} ({r})</p>
                    </div>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#CBD5E1] bg-card/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden">
              <NormiloansLogo variant="full-color" size="md" showTagline={true} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h1>
                <span className={`hidden sm:inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${currentBadge.style}`}>
                  <BadgeIcon className="size-3" />
                  {role.toUpperCase()} MODE
                </span>
              </div>
              {subtitle ? <p className="mt-0.5 text-xs font-medium text-muted-foreground md:text-sm">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Header Role Switcher for quick mobile/header access */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex font-semibold text-xs gap-1.5 border-2 border-[#CBD5E1] bg-white text-[#0F2237] hover:bg-[#F1F5F9] hover:border-slate-400 transition-colors shadow-xs"
                >
                  <UserCheck className="size-3.5 text-[#F26500]" />
                  <span>Role: <strong className="text-[#0F2237]">{user.name}</strong> ({role})</span>
                  <ChevronDown className="size-3 opacity-60 text-[#0F2237]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="text-xs">Switch User & Role</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(MOCK_USERS) as UserRole[]).map((r) => {
                  const u = MOCK_USERS[r];
                  const badge = ROLE_BADGE_STYLE[r];
                  const Icon = badge.icon;
                  return (
                    <DropdownMenuItem key={r} onClick={() => setRole(r)} className="cursor-pointer">
                      <Icon className="mr-2 size-4 text-primary" />
                      <div>
                        <p className="text-xs font-bold">{u.name}</p>
                        <p className="text-[11px] text-muted-foreground">{u.roleTitle}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {action}
            <Button variant="outline" size="sm" className="md:hidden text-[#0F2237] border-2 border-[#CBD5E1] hover:bg-[#F26500] hover:text-white" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>

        {/* Mobile Navigation bar */}
        <nav className="flex gap-1 overflow-x-auto no-scrollbar border-b-2 border-[#CBD5E1] bg-card px-3 py-2 md:hidden">
          {navItems.map((item) => {
            const displayLabel = item.labelMap ? item.labelMap[role] || item.label : item.label;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-[#0F2237] hover:bg-[#F26500]/10 hover:text-[#F26500] transition-colors"
                activeProps={{ className: "bg-[#F26500] text-white font-semibold shadow-xs" }}
              >
                {displayLabel}
              </Link>
            );
          })}
        </nav>

        {/* Page Content */}
        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const tone =
    stage === "Rejected"
      ? "bg-destructive/12 text-destructive font-semibold"
      : ["Sanctioned", "Disbursed", "Joined College"].includes(stage)
        ? "bg-success/15 text-success font-semibold"
        : ["Sent to Lender", "Logged In"].includes(stage)
          ? "bg-primary/15 text-primary font-semibold"
          : "bg-secondary text-secondary-foreground font-medium";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs ${tone}`}>{stage}</span>
  );
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="surface-card p-5 transition-all hover:shadow-md">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`stat-figure mt-2 text-3xl ${accent ? "text-primary font-extrabold" : "text-foreground font-extrabold"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs font-medium text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
