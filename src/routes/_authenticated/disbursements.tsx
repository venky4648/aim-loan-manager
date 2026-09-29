import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

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
  const navigate = useNavigate();
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
            <thead className="bg-[#EDF3FD] text-left text-xs uppercase tracking-wide text-[#0F2237] border-b border-[#DDE5F0]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Case</th>
                <th className="px-5 py-3.5 font-bold">Lender</th>
                <th className="px-5 py-3.5 font-bold">Sanctioned</th>
                <th className="px-5 py-3.5 font-bold">Disbursed</th>
                <th className="px-5 py-3.5 font-bold">Commission</th>
                <th className="px-5 py-3.5 font-bold">Payout status</th>
                <th className="px-5 py-3.5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5F0]">
              {rows.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate({ to: "/cases/$caseId", params: { caseId: c.id } })}
                  className="group cursor-pointer transition-colors bg-white hover:bg-[#DBEAFE]"
                >
                  <td className="px-5 py-4">
                    <p className="font-bold text-[#0F2237] group-hover:text-[#F26500] transition-colors">
                      {c.student}
                    </p>
                    <p className="text-xs text-[#64748B] group-hover:text-[#F26500] transition-colors">{c.id}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#64748B] group-hover:text-[#F26500] transition-colors">{c.lender}</td>
                  <td className="px-5 py-4 stat-figure font-bold text-[#0F2237] group-hover:text-[#F26500] transition-colors">{formatLakh(c.sanctioned!)}</td>
                  <td className="px-5 py-4 stat-figure font-bold text-[#0F2237] group-hover:text-[#F26500] transition-colors">{c.disbursed ? formatLakh(c.disbursed) : "—"}</td>
                  <td className="px-5 py-4 stat-figure font-bold text-[#0F2237] group-hover:text-[#F26500] transition-colors">{c.commission ? formatINR(c.commission) : "—"}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        c.commissionReceived ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                      }`}
                    >
                      {c.commissionReceived ? "Received" : "Pending"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center text-xs font-bold text-[#F26500] group-hover:translate-x-1 transition-transform">
                      Details <ArrowRight className="ml-1 size-3.5" />
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
