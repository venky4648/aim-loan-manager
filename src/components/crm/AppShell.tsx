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
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";

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
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col bg-sidebar px-5 py-6 text-sidebar-foreground md:flex">
        {/* Prominent Large Normiloans Logo */}
        <Link to="/dashboard" className="mb-6 flex items-center px-1 py-2 transition-opacity hover:opacity-95">
          <NormiloansLogo variant="dark" size="lg" showTagline={true} />
        </Link>

        <nav className="flex flex-1 flex-col gap-1.5">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-white"
              activeProps={{
                className: "bg-primary text-white font-semibold shadow-md shadow-primary/20",
              }}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-sidebar-border bg-sidebar-accent/50 p-3.5 text-xs text-sidebar-foreground/80">
          <div className="flex items-center gap-2 font-semibold text-white">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            Normiloans CRM
          </div>
          <p className="mt-1 leading-relaxed text-sidebar-foreground/70">
            Education Loan Aggregator Platform · Hyderabad
          </p>
        </div>

        <button
          onClick={signOut}
          className="mt-4 flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-destructive/15 hover:text-destructive"
        >
          <LogOut className="size-4" />
          Sign out
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-card/90 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <div className="md:hidden">
              <NormiloansLogo variant="full-color" size="md" showTagline={true} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold tracking-tight text-foreground md:text-2xl">{title}</h1>
              {subtitle ? <p className="mt-0.5 text-xs font-medium text-muted-foreground md:text-sm">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {action}
            <Button variant="outline" size="sm" className="md:hidden" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2 md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground font-semibold" }}
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
