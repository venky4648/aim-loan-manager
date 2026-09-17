import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus } from "lucide-react";

import { AppShell, StageBadge } from "@/components/crm/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CASES, STAGES, formatLakh } from "@/lib/demo-data";
import { StudentRegistrationModal } from "@/components/crm/StudentRegistrationModal";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads & Cases | Normiloans CRM" },
      { name: "description", content: "Capture, assign and track every student loan case from lead to disbursement." },
      { property: "og:title", content: "Leads & Cases | Normiloans CRM" },
      { property: "og:description", content: "Every student loan case from lead to disbursement in one pipeline." },
    ],
  }),
  component: Leads,
});

function Leads() {
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<string>("All");
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const rows = useMemo(
    () =>
      CASES.filter((c) => (stage === "All" ? true : c.stage === stage)).filter((c) =>
        `${c.student} ${c.id} ${c.university} ${c.lender} ${c.owner}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, stage],
  );

  return (
    <AppShell
      title="Leads & cases"
      subtitle="Every applicant from first call to college joining"
      action={
        <Button
          size="sm"
          className="font-semibold shadow-md shadow-primary/20"
          onClick={() => setAddLeadOpen(true)}
        >
          <UserPlus className="mr-1.5 size-4" /> Add lead
        </Button>
      }
    >
      <div className="surface-card p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search student, case ID, lender or executive"
              className="pl-9"
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["All", ...STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                stage === s
                  ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="surface-card mt-5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Case</th>
                <th className="px-5 py-3 font-medium">Destination & course</th>
                <th className="px-5 py-3 font-medium">Requirement</th>
                <th className="px-5 py-3 font-medium">Lender</th>
                <th className="px-5 py-3 font-medium">Owner</th>
                <th className="px-5 py-3 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/50">
                  <td className="px-5 py-4">
                    <Link to="/cases/$caseId" params={{ caseId: c.id }} className="font-medium hover:text-primary">
                      {c.student}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {c.id} · {c.source}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p>{c.course}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.country} · {c.university} · {c.intake}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="stat-figure">{formatLakh(c.amount)}</p>
                    <p className="text-xs text-muted-foreground">{c.loanType}</p>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{c.lender}</td>
                  <td className="px-5 py-4 text-muted-foreground">{c.owner}</td>
                  <td className="px-5 py-4">
                    <StageBadge stage={c.stage} />
                    <p className="mt-1 text-xs text-muted-foreground">{c.updated}</p>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No cases match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Student Registration Modal */}
      <StudentRegistrationModal
        open={addLeadOpen}
        onOpenChange={setAddLeadOpen}
      />
    </AppShell>
  );
}
