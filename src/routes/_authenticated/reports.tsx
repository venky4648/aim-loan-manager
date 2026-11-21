import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { AppShell } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { CASES, FUNNEL, LENDERS } from "@/lib/demo-data";
import { exportReportsToExcel } from "@/lib/export-utils";

export const Route = createFileRoute("/_authenticated/reports")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reports | Normiloans CRM" },
      { name: "description", content: "Lead conversion, destination mix and executive performance reports with export." },
      { property: "og:title", content: "Reports | Normiloans CRM" },
      { property: "og:description", content: "Conversion, destination mix and team performance reporting." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const byCountry = CASES.reduce<Record<string, number>>((acc, c) => {
    acc[c.country] = (acc[c.country] ?? 0) + 1;
    return acc;
  }, {});
  const byOwner = CASES.reduce<Record<string, number>>((acc, c) => {
    acc[c.owner] = (acc[c.owner] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <AppShell
      title="Reports"
      subtitle="Conversion, destination mix and team performance"
      action={
        <Button
          size="sm"
          variant="outline"
          className="font-semibold border-2 border-border bg-card hover:bg-muted shadow-xs gap-1.5"
          onClick={() => exportReportsToExcel(FUNNEL, byCountry, byOwner, "reports_analytics")}
          title="Export analytics report to Excel"
        >
          <Download className="size-4 text-emerald-600" />
          <span>Export to Excel</span>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Stage conversion</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {FUNNEL.map((f, i) => (
              <li key={f.stage} className="flex items-center justify-between">
                <span className="text-muted-foreground">{f.stage}</span>
                <span className="stat-figure">
                  {f.count}
                  {i > 0 ? (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      {Math.round((f.count / FUNNEL[i - 1]!.count) * 100)}%
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Destination mix</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {Object.entries(byCountry).map(([country, count]) => (
              <li key={country}>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{country}</span>
                  <span className="stat-figure">{count}</span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full bg-accent"
                    style={{ width: `${(count / CASES.length) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Cases per executive</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {Object.entries(byOwner).map(([owner, count]) => (
              <li key={owner} className="flex items-center justify-between">
                <span className="text-muted-foreground">{owner}</span>
                <span className="stat-figure">{count}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="surface-card mt-5 overflow-hidden">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Lender scorecard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Lender</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Live files</th>
                <th className="px-6 py-3 font-medium">Sanction rate</th>
                <th className="px-6 py-3 font-medium">Avg TAT</th>
                <th className="px-6 py-3 font-medium">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {LENDERS.map((l) => (
                <tr key={l.name}>
                  <td className="px-6 py-3 font-medium">{l.name}</td>
                  <td className="px-6 py-3 text-muted-foreground">{l.type}</td>
                  <td className="px-6 py-3 stat-figure">{l.live}</td>
                  <td className="px-6 py-3 stat-figure text-success">{l.sanctionRate}%</td>
                  <td className="px-6 py-3 text-muted-foreground">{l.avgTat}</td>
                  <td className="px-6 py-3 text-muted-foreground">{l.payout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
