import { createFileRoute } from "@tanstack/react-router";

import { AppShell } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { LENDERS } from "@/lib/demo-data";

export const Route = createFileRoute("/_authenticated/lenders")({
  head: () => ({
    meta: [
      { title: "Lender Partners | Normiloans CRM" },
      { name: "description", content: "Bank and NBFC partner performance: live files, sanction rate, turnaround and payout." },
      { property: "og:title", content: "Lender Partners | Normiloans CRM" },
      { property: "og:description", content: "Track sanction rates, turnaround times and payouts by lender." },
    ],
  }),
  component: Lenders,
});

function Lenders() {
  return (
    <AppShell
      title="Lender partners"
      subtitle="Banks and NBFCs currently on the panel"
      action={<Button size="sm" className="font-semibold shadow-md shadow-primary/20">Add lender</Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LENDERS.map((l) => (
          <article key={l.name} className="surface-card p-6 transition-all hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{l.name}</h2>
                <p className="text-xs text-muted-foreground">{l.type}</p>
              </div>
              <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                {l.payout} payout
              </span>
            </div>
            <dl className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div>
                <dt className="text-xs text-muted-foreground">Live files</dt>
                <dd className="stat-figure mt-1 text-xl">{l.live}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Sanction</dt>
                <dd className="stat-figure mt-1 text-xl text-success font-semibold">{l.sanctionRate}%</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Avg TAT</dt>
                <dd className="stat-figure mt-1 text-xl">{l.avgTat}</dd>
              </div>
            </dl>
            <div className="mt-5 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${l.sanctionRate}%` }} />
            </div>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
