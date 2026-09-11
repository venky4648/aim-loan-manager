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
  GraduationCap,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/leads", label: "Leads & cases", icon: Users },
  { to: "/lenders", label: "Lenders", icon: Landmark },
  { to: "/disbursements", label: "Disbursement & payouts", icon: BadgeIndianRupee },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

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

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar px-4 py-6 text-sidebar-foreground md:flex">
        <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span>
            <span className="block font-display text-base font-semibold leading-tight">Normiloans</span>
            <span className="block text-xs text-sidebar-foreground/60">Lead → Disbursement</span>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-xl border border-sidebar-border p-3 text-xs text-sidebar-foreground/70">
          <p className="font-medium text-sidebar-foreground">Demo workspace</p>
          <p className="mt-1">Sample cases shown. Live data saving comes next.</p>
        </div>

        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background/85 px-5 py-4 backdrop-blur md:px-8">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold md:text-2xl">{title}</h1>
            {subtitle ? <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            {action}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-muted-foreground"
              activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <main className="flex-1 px-5 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}

export function StageBadge({ stage }: { stage: string }) {
  const tone =
    stage === "Rejected"
      ? "bg-destructive/10 text-destructive"
      : ["Sanctioned", "Disbursed", "Joined College"].includes(stage)
        ? "bg-success/12 text-success"
        : ["Sent to Lender", "Logged In"].includes(stage)
          ? "bg-info/12 text-info"
          : "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{stage}</span>
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
    <div className="surface-card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`stat-figure mt-2 text-3xl ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
