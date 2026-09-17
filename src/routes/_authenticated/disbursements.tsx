import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, StatCard } from "@/components/crm/AppShell";
import { CASES, formatINR, formatLakh } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/disbursements")({
  head: () => ({
    meta: [
      { title: "Disbursements & Payouts | Normiloans CRM" },
      { name: "description", content: "Track disbursed tranches, college joining and commission received per case." },
      { property: "og:title", content: "Disbursements & Payouts | Normiloans CRM" },
      { property: "og:description", content: "Reconcile disbursements and commission payouts case by case." },
    ],
  }),
  component: Disbursements,
});

function Disbursements() {
  const rows = CASES.filter((c) => c.sanctioned);

  return (
    <AppShell title="Disbursement & payouts" subtitle="Reconcile what the lender released and what you earned">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disbursed this month" value="₹2.4 Cr" hint="9 tranches released" />
        <StatCard label="Commission booked" value="₹11.4 L" hint="Total revenue earned" accent />
        <StatCard label="Awaiting receipt" value="₹3.2 L" hint="Across 6 lender invoices" />
      </div>

      <div className="surface-card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Case</th>
                <th className="px-5 py-3 font-medium">Lender</th>
                <th className="px-5 py-3 font-medium">Sanctioned</th>
                <th className="px-5 py-3 font-medium">Disbursed</th>
                <th className="px-5 py-3 font-medium">Commission</th>
                <th className="px-5 py-3 font-medium">Payout status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/50">
                  <td className="px-5 py-4">
                    <Link to="/cases/$caseId" params={{ caseId: c.id }} className="font-medium hover:text-primary">
                      {c.student}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.id}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.lender}</td>
                  <td className="px-5 py-4 stat-figure">{formatLakh(c.sanctioned!)}</td>
                  <td className="px-5 py-4 stat-figure">{c.disbursed ? formatLakh(c.disbursed) : "—"}</td>
                  <td className="px-5 py-4 stat-figure">{c.commission ? formatINR(c.commission) : "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.commissionReceived ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                      }`}
                    >
                      {c.commissionReceived ? "Received" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
