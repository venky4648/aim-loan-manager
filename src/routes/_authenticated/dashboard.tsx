import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";

import { AppShell, StageBadge, StatCard } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { CASES, FUNNEL, LENDERS, MONTHLY, formatLakh } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Pipeline Dashboard | Normiloans CRM" },
      { name: "description", content: "Live view of education loan leads, sanctions, disbursements and commissions." },
      { property: "og:title", content: "Pipeline Dashboard | Normiloans CRM" },
      { property: "og:description", content: "Leads, sanctions, disbursements and payouts at a glance." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const maxFunnel = FUNNEL[0]!.count;
  const maxMonth = Math.max(...MONTHLY.map((m) => m.sanctioned));

  return (
    <AppShell
      title="Pipeline dashboard"
      subtitle="Hyderabad, Telangana · September 2026"
      action={
        <Button asChild size="sm" className="font-semibold shadow-md shadow-primary/20">
          <Link to="/leads">Open pipeline</Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active cases" value="61" hint="+8 added this week" />
        <StatCard label="Sanctioned value" value="₹9.6 Cr" hint="38 files sanctioned" accent />
        <StatCard label="Disbursed value" value="₹7.1 Cr" hint="24 files disbursed" />
        <StatCard label="Commission earned" value="₹11.4 L" hint="₹3.2 L pending receipt" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="surface-card p-6 lg:col-span-2">
          <h2 className="text-base font-semibold">Sanctioned vs disbursed (₹ lakh)</h2>
          <p className="text-sm text-muted-foreground">Last six months across all lender partners</p>
          <div className="mt-6 flex h-52 items-end gap-4">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-full w-full items-end justify-center gap-1.5">
                  <div
                    className="w-1/3 rounded-t-md bg-primary/85"
                    style={{ height: `${(m.sanctioned / maxMonth) * 100}%` }}
                    title={`Sanctioned ₹${m.sanctioned}L`}
                  />
                  <div
                    className="w-1/3 rounded-t-md bg-accent"
                    style={{ height: `${(m.disbursed / maxMonth) * 100}%` }}
                    title={`Disbursed ₹${m.disbursed}L`}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-5 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-primary" /> Sanctioned
            </span>
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-accent" /> Disbursed
            </span>
          </div>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Conversion funnel</h2>
          <p className="text-sm text-muted-foreground">This quarter</p>
          <ul className="mt-5 space-y-4">
            {FUNNEL.map((step) => (
              <li key={step.stage}>
                <div className="flex items-baseline justify-between text-sm">
                  <span className="text-muted-foreground">{step.stage}</span>
                  <span className="stat-figure">{step.count}</span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${(step.count / maxFunnel) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="surface-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Recent case activity</h2>
            <Link to="/leads" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {CASES.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to="/cases/$caseId"
                  params={{ caseId: c.id }}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-secondary/60"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{c.student}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {c.id} · {c.course} · {c.country} · {c.lender}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="stat-figure text-sm">{formatLakh(c.amount)}</span>
                    <StageBadge stage={c.stage} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Top lender partners</h2>
          <ul className="mt-4 space-y-4">
            {LENDERS.slice(0, 4).map((l) => (
              <li key={l.name} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.live} live files · TAT {l.avgTat}
                  </p>
                </div>
                <span className="stat-figure text-sm text-success font-semibold">{l.sanctionRate}%</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
