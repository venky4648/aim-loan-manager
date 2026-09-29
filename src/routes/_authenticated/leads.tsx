import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus, Filter, ArrowRight } from "lucide-react";

import { AppShell, StageBadge } from "@/components/crm/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CASES, STAGES, formatLakh } from "@/lib/demo-data";
import { StudentRegistrationModal } from "@/components/crm/StudentRegistrationModal";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads & Cases | Normiloans CRM" },
      { name: "description", content: "Capture, assign and track every student loan case from lead to disbursement." },
    ],
  }),
  component: Leads,
});

function Leads() {
  const navigate = useNavigate();
  const { role, user, hasPerm } = useAuth();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<string>("All");
  const [myFilter, setMyFilter] = useState<boolean>(role === "sales" || role === "processing");
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const rows = useMemo(() => {
    return CASES.filter((c) => {
      if (stage !== "All" && c.stage !== stage) return false;

      // Ownership filter for sales/processing
      if (myFilter) {
        if (role === "sales") {
          return c.owner.includes("Praveen") || c.stage === "New Lead" || c.stage === "Contacted";
        }
        if (role === "processing") {
          return c.stage === "Docs Collected" || c.stage === "Sent to Lender" || c.stage === "Logged In";
        }
      }

      const q = query.toLowerCase();
      return `${c.student} ${c.id} ${c.university} ${c.lender} ${c.owner}`.toLowerCase().includes(q);
    });
  }, [query, stage, myFilter, role]);

  const canCreateLead = hasPerm("leads:create");

  return (
    <AppShell
      title={role === "sales" ? "My Leads & Follow-ups" : role === "processing" ? "Assigned Cases for Processing" : "Leads & pipeline"}
      subtitle="Every applicant from first call to college joining"
      action={
        canCreateLead ? (
          <Button
            size="sm"
            className="font-semibold shadow-md shadow-primary/20"
            onClick={() => setAddLeadOpen(true)}
          >
            <UserPlus className="mr-1.5 size-4" /> Add lead
          </Button>
        ) : undefined
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
              className="pl-9 border-2 border-[#CBD5E1]"
            />
          </div>

          {(role === "sales" || role === "processing") && (
            <Button
              variant={myFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setMyFilter(!myFilter)}
              className={
                myFilter
                  ? "bg-[#F26500] text-white hover:bg-[#E05B00] font-semibold shadow-xs border-2 border-[#F26500]"
                  : "border-2 border-[#CBD5E1] bg-white text-[#0F2237] hover:bg-[#F1F5F9] font-semibold transition-colors"
              }
            >
              <Filter className={`mr-1.5 size-3.5 ${myFilter ? "text-white" : "text-[#0F2237]"}`} />
              {myFilter ? (role === "sales" ? "Showing My Assigned Leads" : "Showing My Processing Queue") : "Show All Pipeline Cases"}
            </Button>
          )}
        </div>

        {/* Stage Filter Tabs */}
        <div className="mt-3.5 flex flex-wrap gap-2 pt-2.5 border-t-2 border-[#CBD5E1]">
          {["All", ...STAGES].map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs transition-all ${
                stage === s
                  ? "bg-[#F26500] text-white font-extrabold shadow-xs border-2 border-[#F26500]"
                  : "bg-white text-[#0F2237] border-2 border-[#CBD5E1] font-semibold hover:bg-[#F1F5F9] hover:border-[#94A3B8]"
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
            <thead className="bg-[#EDF3FD] text-left text-xs uppercase tracking-wide text-[#0F2237] border-b border-[#DDE5F0]">
              <tr>
                <th className="px-5 py-3.5 font-bold">Case</th>
                <th className="px-5 py-3.5 font-bold">Destination & course</th>
                <th className="px-5 py-3.5 font-bold">Requirement</th>
                <th className="px-5 py-3.5 font-bold">Lender</th>
                <th className="px-5 py-3.5 font-bold">Owner</th>
                <th className="px-5 py-3.5 font-bold">Stage</th>
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
                    <p className="text-xs text-[#64748B] group-hover:text-[#F26500] transition-colors">
                      {c.id} · {c.source}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[#0F2237] group-hover:text-[#F26500] transition-colors">{c.course}</p>
                    <p className="text-xs text-[#64748B] group-hover:text-[#F26500] transition-colors">
                      {c.country} · {c.university} · {c.intake}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="stat-figure text-[#0F2237] font-bold group-hover:text-[#F26500] transition-colors">{formatLakh(c.amount)}</p>
                    <p className="text-xs text-[#64748B] group-hover:text-[#F26500] transition-colors">{c.loanType}</p>
                  </td>
                  <td className="px-5 py-4 font-medium text-[#64748B] group-hover:text-[#F26500] transition-colors">{c.lender}</td>
                  <td className="px-5 py-4 font-medium text-[#64748B] group-hover:text-[#F26500] transition-colors">{c.owner}</td>
                  <td className="px-5 py-4">
                    <StageBadge stage={c.stage} />
                    <p className="mt-1 text-xs text-[#64748B] group-hover:text-[#F26500] transition-colors">{c.updated}</p>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-flex items-center text-xs font-bold text-[#F26500] group-hover:translate-x-1 transition-transform">
                      View details <ArrowRight className="ml-1 size-3.5" />
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                    No cases match this filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <StudentRegistrationModal open={addLeadOpen} onOpenChange={setAddLeadOpen} />
    </AppShell>
  );
}
