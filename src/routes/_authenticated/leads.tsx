import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, UserPlus, Filter, ArrowRight, Clock, CheckCircle2, AlertCircle, Share2, Download } from "lucide-react";
import { exportLeadsToExcel } from "@/lib/export-utils";

import { AppShell, StageBadge } from "@/components/crm/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STAGES, formatLakh, REFERRAL_SOURCES } from "@/lib/demo-data";
import { StudentRegistrationModal } from "@/components/crm/StudentRegistrationModal";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import {
  calculateDocProgress,
  getEffectiveFollowUpStatus,
  isFollowUpDueToday,
  formatDateTime,
} from "@/lib/sales-workflow-types";

export const Route = createFileRoute("/_authenticated/leads")({
  ssr: false,
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
  const { cases } = useCases();

  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<string>("All");
  const [workflowFilter, setWorkflowFilter] = useState<string>("All");
  const [sourceFilter, setSourceFilter] = useState<string>("All");
  const [myFilter, setMyFilter] = useState<boolean>(role === "telecom" || role === "relationship_manager");
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const rows = useMemo(() => {
    return cases.filter((c) => {
      // 1. Stage Filter
      if (stage !== "All" && c.stage !== stage) return false;

      // 1b. Referral / Lead Source Filter
      if (sourceFilter !== "All" && c.source !== sourceFilter) return false;

      // 2. Workflow Filter
      if (workflowFilter !== "All") {
        if (workflowFilter === "Interested" && c.interestStatus !== "Interested") return false;
        if (workflowFilter === "Not Interested" && c.interestStatus !== "Not Interested") return false;
        if (workflowFilter === "Follow-up Required" && c.interestStatus !== "Follow-up Required") return false;
        if (workflowFilter === "Not Contacted" && c.interestStatus !== "Not Contacted") return false;
        if (workflowFilter === "Handed Over" && !c.handover?.isHandedOver) return false;

        if (workflowFilter === "Follow-ups Due") {
          const hasDue = (c.followUps || []).some(
            (f) =>
              (isFollowUpDueToday(f.scheduledAt) || getEffectiveFollowUpStatus(f) === "Overdue") &&
              f.status !== "Completed" &&
              f.status !== "Cancelled"
          );
          if (!hasDue) return false;
        }

        if (workflowFilter === "Docs Pending") {
          const isPending =
            c.interestStatus === "Interested" &&
            !c.handover?.isHandedOver &&
            !calculateDocProgress(c.workflowDocuments).isComplete;
          if (!isPending) return false;
        }

        if (workflowFilter === "Ready for Handover") {
          const isReady =
            c.interestStatus === "Interested" &&
            !c.handover?.isHandedOver &&
            calculateDocProgress(c.workflowDocuments).isComplete;
          if (!isReady) return false;
        }
      }

      // 3. Ownership filter for sales/processing
      if (myFilter) {
        if (role === "telecom") {
          return (c.owner && c.owner.includes("Praveen")) || c.stage === "New Lead" || c.stage === "Contacted";
        }
        if (role === "relationship_manager") {
          return c.stage === "Docs Collected" || c.stage === "Sent to Lender" || c.stage === "Logged In" || c.handover?.isHandedOver;
        }
      }

      // 4. Search Query
      const q = query.toLowerCase();
      return (
        `${c.student} ${c.id} ${c.university} ${c.lender} ${c.owner} ${c.phone} ${c.source || ""} ${c.sourceName || ""} ${c.interestStatus || ""}`
          .toLowerCase()
          .includes(q)
      );
    });
  }, [cases, query, stage, workflowFilter, sourceFilter, myFilter, role]);

  const canCreateLead = hasPerm("leads:create");

  return (
    <AppShell
      title={role === "telecom" ? "My Leads & Follow-ups" : role === "relationship_manager" ? "Assigned Cases for Relationship Management" : "Leads & pipeline"}
      subtitle="Every applicant from first call to college joining"
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="font-semibold border-2 border-border bg-card hover:bg-muted shadow-xs gap-1.5"
            onClick={() => exportLeadsToExcel(rows, "leads_pipeline")}
            title={`Export ${rows.length} leads to Excel`}
          >
            <Download className="size-4 text-slate-700" />
            <span className="hidden sm:inline">Export to Excel</span>
            <span className="sm:hidden">Export</span>
            <span className="text-[11px] bg-muted px-1.5 py-0.5 rounded font-mono text-muted-foreground font-normal">
              ({rows.length})
            </span>
          </Button>

          {canCreateLead && (
            <Button
              size="sm"
              className="font-semibold shadow-md shadow-primary/20"
              onClick={() => setAddLeadOpen(true)}
            >
              <UserPlus className="mr-1.5 size-4" /> Add lead
            </Button>
          )}
        </div>
      }
    >
      <div className="surface-card p-5 border-2 border-border rounded-xl">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by student, phone, case ID, referral source, referral name, lender..."
              className="h-10 pl-10 text-sm border-2 border-border"
            />
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border-2 border-border bg-card px-2.5 py-1.5 text-xs shadow-2xs">
            <Share2 className="size-3.5 text-primary shrink-0" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-foreground focus:outline-hidden cursor-pointer"
            >
              <option value="All">All Referral Sources</option>
              {REFERRAL_SOURCES.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
          </div>

          {(role === "telecom" || role === "relationship_manager") && (
            <Button
              variant={myFilter ? "default" : "outline"}
              size="sm"
              onClick={() => setMyFilter(!myFilter)}
              className={
                myFilter
                  ? "bg-primary text-white hover:bg-primary/90 font-semibold shadow-xs border-2 border-primary"
                  : "border-2 border-border bg-card text-foreground hover:bg-muted font-semibold transition-colors"
              }
            >
              <Filter className={`mr-1.5 size-3.5 ${myFilter ? "text-white" : "text-foreground"}`} />
              {myFilter ? (role === "telecom" ? "Showing My Assigned Leads" : "Showing My Relationship Manager Queue") : "Show All Pipeline Cases"}
            </Button>
          )}
        </div>

        {/* Workflow Filters */}
        <div className="mt-4 border-t-2 border-border pt-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Sales Workflow Filter:
            </span>
            {(workflowFilter !== "All" || stage !== "All" || sourceFilter !== "All") && (
              <button
                onClick={() => {
                  setWorkflowFilter("All");
                  setStage("All");
                  setSourceFilter("All");
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9">
            {[
              "All",
              "Interested",
              "Follow-ups Due",
              "Follow-up Required",
              "Docs Pending",
              "Ready for Handover",
              "Handed Over",
              "Not Interested",
              "Not Contacted",
            ].map((wf) => (
              <button
                key={wf}
                onClick={() => setWorkflowFilter(wf)}
                className={`min-h-9 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-bold transition-all border text-center ${
                  workflowFilter === wf
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-card text-foreground border-border hover:bg-muted"
                }`}
              >
                {wf}
              </button>
            ))}
          </div>

          {/* Stage Filter Tabs */}
          <div className="mt-4 border-t border-border/60 pt-4">
            <span className="mb-2 block text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Stage
            </span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-11">
            {["All", ...STAGES].map((s) => (
              <button
                key={s}
                onClick={() => setStage(s)}
                className={`min-h-9 whitespace-normal rounded-lg px-3 py-1.5 text-center text-xs leading-tight transition-all font-semibold ${
                  stage === s
                    ? "bg-[#1E3A5F] text-white font-bold shadow-xs"
                    : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="surface-card mt-5 overflow-hidden border-2 border-border rounded-xl shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] text-sm">
            <thead className="bg-slate-100/80 text-left text-xs uppercase tracking-wide text-slate-700 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Case & Contact</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Destination & course</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Requirement</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Lender Partner</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Interest Status</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Next Follow-up</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Doc Collection</th>
                <th className="px-5 py-3.5 font-bold whitespace-nowrap">Stage / Handover</th>
                <th className="px-5 py-3.5 font-bold text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5F0]">
              {rows.map((c) => {
                const docP = calculateDocProgress(c.workflowDocuments);
                const isHanded = c.handover?.isHandedOver ?? false;

                // Find next upcoming/overdue follow-up
                const activeFollowUps = (c.followUps || [])
                  .filter((f) => f.status !== "Completed" && f.status !== "Cancelled")
                  .map((f) => ({ ...f, effective: getEffectiveFollowUpStatus(f) }))
                  .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

                const nextFollowUp = activeFollowUps[0];

                return (
                  <tr
                    key={c.id}
                    onClick={() => navigate({ to: "/cases/$caseId", params: { caseId: c.id } })}
                    className="group cursor-pointer transition-colors bg-white hover:bg-[#DBEAFE]/80"
                  >
                    <td className="px-5 py-4 align-middle">
                      <p className="font-bold text-foreground group-hover:text-slate-900 transition-colors whitespace-nowrap">
                        {c.student}
                      </p>
                      <p className="text-xs text-muted-foreground transition-colors whitespace-nowrap mt-0.5">
                        {c.id} · {c.phone}
                      </p>
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 px-2 py-0.5 text-[11px] font-semibold mt-1 whitespace-nowrap">
                        <Share2 className="size-3 text-slate-600" />
                        <span>{c.source || "Customer reference"}</span>
                        {c.sourceName && <span className="font-normal text-slate-600">({c.sourceName})</span>}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle">
                      <p className="font-semibold text-foreground whitespace-nowrap">{c.course}</p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap mt-0.5">
                        {c.country} · {c.university}
                      </p>
                    </td>

                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                      <p className="stat-figure text-foreground font-bold">{formatLakh(c.amount)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.loanType}</p>
                    </td>

                    {/* Assigned Lender Partner */}
                    <td className="px-5 py-4 align-middle">
                      {c.lender && c.lender !== "Not assigned" ? (
                        <div className="space-y-1">
                          <span className="font-bold text-xs text-foreground block whitespace-nowrap">
                            {c.lender}
                          </span>
                          {c.stage === "Rejected" ? (
                            <span className="inline-flex items-center text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded whitespace-nowrap">
                              Rejected by Lender
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] font-medium text-muted-foreground bg-muted/80 px-2 py-0.5 rounded whitespace-nowrap">
                              {c.stage === "Sent to Lender" || c.stage === "Logged In" || c.stage === "Sanctioned" || c.stage === "Disbursed"
                                ? "Active with Lender"
                                : "Proposed Partner"}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic whitespace-nowrap">
                          Not assigned
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border ${
                          c.interestStatus === "Interested"
                            ? "bg-slate-900 text-white border-slate-900"
                            : c.interestStatus === "Follow-up Required"
                            ? "bg-slate-200 text-slate-900 border-slate-400"
                            : c.interestStatus === "Not Interested"
                            ? "bg-slate-100 text-slate-500 border-slate-300 line-through"
                            : "bg-slate-100 text-slate-700 border-slate-300"
                        }`}
                      >
                        {c.interestStatus || "Not Contacted"}
                      </span>
                    </td>

                    <td className="px-5 py-4 align-middle whitespace-nowrap text-xs">
                      {nextFollowUp ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Clock className="size-3.5 text-slate-700 shrink-0" />
                            <span>{formatDateTime(nextFollowUp.scheduledAt)}</span>
                          </div>
                          {nextFollowUp.effective === "Overdue" && (
                            <span className="inline-flex items-center text-[10px] font-extrabold text-slate-900 bg-slate-200 px-1.5 py-0.5 rounded border border-slate-400">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>

                    <td className="px-5 py-4 align-middle whitespace-nowrap text-xs">
                      <div className="space-y-1.5 min-w-[110px]">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span>{docP.received}/{docP.total} Docs</span>
                          <span className={docP.isComplete ? "text-slate-950 font-extrabold" : "text-slate-700"}>
                            {docP.percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          <div
                            className={`h-full transition-all ${docP.isComplete ? "bg-slate-900" : "bg-slate-700"}`}
                            style={{ width: `${docP.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle whitespace-nowrap">
                      <div className="space-y-1">
                        <StageBadge stage={c.stage} />
                        {isHanded ? (
                          <span className="inline-block text-[10px] font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                            ✓ Handed Over to RM
                          </span>
                        ) : c.stage === "Returned for Corrections" ? (
                          <span className="inline-block text-[10px] font-bold text-slate-800 bg-slate-200 px-2 py-0.5 rounded border border-slate-400">
                            ⚠ Returned to Sales
                          </span>
                        ) : (
                          <span className="inline-block text-[10px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            With Sales
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4 align-middle text-right whitespace-nowrap">
                      <span className="inline-flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                        Manage <ArrowRight className="ml-1 size-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">
                    No cases match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <StudentRegistrationModal open={addLeadOpen} onOpenChange={setAddLeadOpen} />
    </AppShell>
  );
}
