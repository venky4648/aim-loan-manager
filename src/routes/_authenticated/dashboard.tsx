import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  PhoneCall,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Send,
  UserPlus,
  ShieldCheck,
  Headphones,
  FileText,
  Eye,
  Share2,
  Download,
} from "lucide-react";
import { exportLeadsToExcel } from "@/lib/export-utils";

import { AppShell, StageBadge, StatCard } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { CASES, FUNNEL, LENDERS, MONTHLY, formatLakh, formatINR } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import {
  calculateDocProgress,
  getEffectiveFollowUpStatus,
  isFollowUpDueToday,
  formatDateTime,
} from "@/lib/sales-workflow-types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudentRegistrationModal } from "@/components/crm/StudentRegistrationModal";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Dashboard | Normiloans CRM" },
      { name: "description", content: "Role-based pipeline, follow-ups, and case management dashboard." },
    ],
  }),
  component: RoleBasedDashboard,
});

function RoleBasedDashboard() {
  const { role, user } = useAuth();
  const [addLeadOpen, setAddLeadOpen] = useState(false);

  const safeRole =
    role && ["superadmin", "telecom", "relationship_manager", "manager"].includes(role)
      ? role
      : "superadmin";
  const safeName = user?.name || "Staff User";
  const safeTitle = user?.roleTitle || "Loan Officer";

  return (
    <AppShell
      title={`Welcome back, ${safeName}`}
      subtitle={`Role: ${safeTitle} · Hyderabad, Telangana`}
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="font-semibold border-2 border-border bg-card hover:bg-muted shadow-xs gap-1.5"
            onClick={() => exportLeadsToExcel(CASES, "normiloans_pipeline_cases")}
            title="Export all cases to Excel"
          >
            <Download className="size-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </Button>

          {safeRole !== "manager" ? (
            <Button
              size="sm"
              className="font-semibold shadow-md shadow-primary/20"
              onClick={() => setAddLeadOpen(true)}
            >
              <UserPlus className="mr-1.5 size-4" /> Add lead
            </Button>
          ) : null}
        </div>
      }
    >
      {/* Role specific dashboard rendering */}
      {safeRole === "superadmin" && <AdminDashboard />}
      {safeRole === "telecom" && <SalesDashboard />}
      {safeRole === "relationship_manager" && <ProcessingDashboard />}
      {safeRole === "manager" && <ViewerDashboard />}

      <StudentRegistrationModal open={addLeadOpen} onOpenChange={setAddLeadOpen} />
    </AppShell>
  );
}

/* =========================================================================
   SANCTIONED VS DISBURSED ANALYTICS COMPONENT
   ========================================================================= */
function SanctionedVsDisbursedAnalytics() {
  const maxMonth = Math.max(...MONTHLY.map((m) => m.sanctioned));

  return (
    <section className="surface-card p-6 border-2 border-[#CBD5E1]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#CBD5E1] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#0F2237]">Sanctioned vs Disbursed Analytics</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Last 6 months performance across all lender partners (in ₹ Lakhs)</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-[#0F2237]">
            <span className="size-3 rounded-xs bg-[#F26500]" /> Sanctioned
          </span>
          <span className="flex items-center gap-1.5 text-[#0F2237]">
            <span className="size-3 rounded-xs bg-[#1E3A5F]" /> Disbursed
          </span>
        </div>
      </div>

      <div className="mt-6 flex h-60 w-full items-end gap-3 pt-6 pb-2">
        {MONTHLY.map((m) => {
          const sanctionedPct = Math.round((m.sanctioned / maxMonth) * 100);
          const disbursedPct = Math.round((m.disbursed / maxMonth) * 100);

          return (
            <div key={m.month} className="flex h-full flex-1 flex-col items-center justify-end">
              {/* Bars container */}
              <div className="relative flex h-full w-full items-end justify-center gap-2 border-b-2 border-[#CBD5E1] px-1">
                {/* Sanctioned Bar */}
                <div className="group relative flex flex-1 flex-col items-center justify-end h-full">
                  <span className="mb-1 text-[11px] font-bold text-[#F26500] opacity-90 group-hover:scale-110 transition-transform">
                    ₹{m.sanctioned}L
                  </span>
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-[#F26500] hover:bg-[#E05B00] transition-all shadow-xs"
                    style={{ height: `${sanctionedPct}%` }}
                    title={`${m.month}: Sanctioned ₹${m.sanctioned} Lakhs`}
                  />
                </div>

                {/* Disbursed Bar */}
                <div className="group relative flex flex-1 flex-col items-center justify-end h-full">
                  <span className="mb-1 text-[11px] font-bold text-[#1E3A5F] opacity-90 group-hover:scale-110 transition-transform">
                    ₹{m.disbursed}L
                  </span>
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-[#1E3A5F] hover:bg-[#0F2237] transition-all shadow-xs"
                    style={{ height: `${disbursedPct}%` }}
                    title={`${m.month}: Disbursed ₹${m.disbursed} Lakhs`}
                  />
                </div>
              </div>

              {/* Month Label */}
              <span className="mt-2.5 text-xs font-bold text-[#0F2237]">{m.month}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================================
   1. ADMIN / OWNER DASHBOARD
   ========================================================================= */
function AdminDashboard() {
  const { cases } = useCases();
  const validCases = Array.isArray(cases) ? cases.filter(Boolean) : [];
  const maxFunnel = FUNNEL && FUNNEL[0] ? FUNNEL[0].count : 100;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Active Cases" value={String(validCases.length || 61)} hint="+8 added this week" />
        <StatCard label="Sanctioned Value" value="₹9.6 Cr" hint="38 files sanctioned" accent />
        <StatCard label="Disbursed Value" value="₹7.1 Cr" hint="24 files disbursed" />
        <StatCard label="Commission Earned" value="₹11.4 L" hint="₹3.2 L pending receipt" />
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SanctionedVsDisbursedAnalytics />
        </div>

        <section className="surface-card p-6 border-2 border-[#CBD5E1]">
          <h2 className="text-base font-bold text-[#0F2237]">Conversion Funnel</h2>
          <p className="text-sm text-muted-foreground">This quarter overview</p>
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

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="surface-card overflow-hidden lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-base font-semibold">Recent Case Activity</h2>
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="ghost"
                className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 h-7 px-2 gap-1 cursor-pointer"
                onClick={() => exportLeadsToExcel(validCases, "admin_cases_summary")}
              >
                <Download className="size-3.5" /> Export Excel
              </Button>
              <Link to="/leads" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
                View all pipeline <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {validCases.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to="/cases/$caseId"
                  params={{ caseId: String(c.id || "NL-1041") }}
                  className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 transition-colors hover:bg-[#EDF3FD]/80"
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
          <h2 className="text-base font-semibold text-foreground">Top Lender Partners</h2>
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
    </div>
  );
}

/* =========================================================================
   2. SALES / TELECALLER DASHBOARD
   ========================================================================= */
function SalesDashboard() {
  const { cases, completeFollowUp } = useCases();
  const { user } = useAuth();

  const [filterInterest, setFilterInterest] = useState<string>("All");

  // Complete Dialog on Dashboard
  const [completeOpen, setCompleteOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<{ caseId: string; followUpId: string; student: string } | null>(null);
  const [outcomeNote, setOutcomeNote] = useState("");

  const validCases = Array.isArray(cases) ? cases.filter(Boolean) : [];

  const salesLeads = validCases.filter(
    (c) => (c.owner && c.owner.includes("Praveen")) || c.stage === "New Lead" || c.stage === "Contacted"
  );

  // Dynamic KPI calculations
  const myAssignedCount = salesLeads.length;
  const newLeadsCount = validCases.filter(
    (c) => c.stage === "New Lead" || c.interestStatus === "Not Contacted"
  ).length;
  const interestedCount = validCases.filter((c) => c.interestStatus === "Interested").length;
  const notInterestedCount = validCases.filter((c) => c.interestStatus === "Not Interested").length;

  // Flatten follow-ups
  const allFollowUps = validCases.flatMap((c) =>
    (Array.isArray(c.followUps) ? c.followUps : []).filter(Boolean).map((f) => ({
      ...f,
      caseId: c.id || "",
      studentName: c.student || "Student",
      phone: c.phone || "—",
      course: `${c.course || "Course"} · ${c.country || ""}`,
      effectiveStatus: getEffectiveFollowUpStatus(f),
      isDueToday: isFollowUpDueToday(f.scheduledAt),
    }))
  );

  const overdueFollowUps = allFollowUps.filter((f) => f.effectiveStatus === "Overdue");
  const dueTodayFollowUps = allFollowUps.filter(
    (f) => (f.isDueToday || f.effectiveStatus === "Overdue") && f.status !== "Completed" && f.status !== "Cancelled"
  );

  const docsPendingCount = validCases.filter((c) => {
    if (c.interestStatus !== "Interested" || c.handover?.isHandedOver) return false;
    const p = calculateDocProgress(c.workflowDocuments);
    return !p.isComplete;
  }).length;

  const readyForHandoverCount = validCases.filter((c) => {
    if (c.interestStatus !== "Interested" || c.handover?.isHandedOver) return false;
    const p = calculateDocProgress(c.workflowDocuments);
    return p.isComplete;
  }).length;

  const handedOverCount = validCases.filter((c) => c.handover?.isHandedOver).length;

  const handleOpenCompleteModal = (caseId: string, followUpId: string, student: string) => {
    setActiveFollowUp({ caseId, followUpId, student });
    setOutcomeNote("");
    setCompleteOpen(true);
  };

  const handleConfirmDashboardComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFollowUp) return;

    completeFollowUp(activeFollowUp.caseId, activeFollowUp.followUpId, {
      completionNote: outcomeNote.trim() || "Call completed via sales dashboard.",
      authorName: user?.name || "Praveen K",
    });

    setCompleteOpen(false);
    setActiveFollowUp(null);
  };

  const filteredPipelineLeads = salesLeads.filter((c) => {
    if (filterInterest === "All") return true;
    if (filterInterest === "Interested") return c.interestStatus === "Interested";
    if (filterInterest === "Follow-up Required") return c.interestStatus === "Follow-up Required";
    if (filterInterest === "Not Interested") return c.interestStatus === "Not Interested";
    if (filterInterest === "Not Contacted") return c.interestStatus === "Not Contacted";
    if (filterInterest === "Docs Pending") {
      return c.interestStatus === "Interested" && !calculateDocProgress(c.workflowDocuments).isComplete;
    }
    if (filterInterest === "Ready for Handover") {
      return c.interestStatus === "Interested" && calculateDocProgress(c.workflowDocuments).isComplete && !c.handover?.isHandedOver;
    }
    if (filterInterest === "Handed Over") return c.handover?.isHandedOver;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Sales Dynamic KPIs Grid (9 Cards) */}
      <div className="grid gap-3.5 grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard label="My Assigned Leads" value={String(myAssignedCount)} hint="Active in my bucket" />
        <StatCard label="New Leads" value={String(newLeadsCount)} hint="Requires qualification" accent />
        <StatCard label="Interested Students" value={String(interestedCount)} hint="Document stage active" />
        <StatCard label="Follow-ups Due Today" value={String(dueTodayFollowUps.length)} hint="Calls scheduled" />
        <StatCard label="Overdue Follow-ups" value={String(overdueFollowUps.length)} hint={overdueFollowUps.length > 0 ? "Immediate action required" : "All up to date"} accent={overdueFollowUps.length > 0} />
        <StatCard label="Documents Pending" value={String(docsPendingCount)} hint="Partially collected" />
        <StatCard label="Ready for Handover" value={String(readyForHandoverCount)} hint="100% docs collected" accent={readyForHandoverCount > 0} />
        <StatCard label="Handed Over" value={String(handedOverCount)} hint="Transferred to Processing" />
        <StatCard label="Not Interested" value={String(notInterestedCount)} hint="Reactivation available" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Follow-up Queue Due Today */}
        <section className="surface-card p-6 border-2 border-border rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-bold flex items-center gap-2 text-foreground">
                <Clock className="size-4 text-primary" /> Follow-ups Queue & Reminders
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Calls scheduled for student qualification & document collection reminders
              </p>
            </div>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
              {dueTodayFollowUps.length} Calls Pending
            </span>
          </div>

          <div className="mt-4 divide-y divide-border">
            {dueTodayFollowUps.slice(0, 5).map((item) => (
              <div key={item.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Link
                      to="/cases/$caseId"
                      params={{ caseId: String(item.caseId || "NL-1041") }}
                      className="font-bold text-sm text-foreground hover:text-primary transition-colors"
                    >
                      {item.studentName}
                    </Link>
                    <span className="text-xs text-muted-foreground">({item.course})</span>
                    {item.effectiveStatus === "Overdue" && (
                      <span className="rounded bg-rose-600 px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                        OVERDUE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.phone} · <strong className="text-foreground">{formatDateTime(item.scheduledAt)}</strong>
                  </p>
                  <p className="text-xs text-primary font-medium mt-1">
                    Agenda: {item.reminderNote}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs font-semibold text-primary border-primary/40 hover:bg-primary/10"
                    onClick={() => toast.success(`Simulating call to ${item.studentName} (${item.phone})...`)}
                  >
                    <PhoneCall className="mr-1.5 size-3.5" /> Call Student
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleOpenCompleteModal(item.caseId, item.id, item.studentName)}
                  >
                    <CheckCircle2 className="mr-1.5 size-3.5" /> Mark Done
                  </Button>
                </div>
              </div>
            ))}

            {dueTodayFollowUps.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                ✓ No calls scheduled for today or overdue. All follow-ups completed!
              </div>
            )}
          </div>
        </section>

        {/* Sales Target & Conversion Tracker */}
        <section className="surface-card p-6 border-2 border-border rounded-xl">
          <h2 className="text-base font-bold text-foreground">Monthly Lead Target</h2>
          <p className="text-xs text-muted-foreground">Target: 25 Qualified Submissions</p>
          <div className="mt-6 flex flex-col items-center justify-center text-center">
            <div className="relative flex size-36 items-center justify-center rounded-full border-8 border-primary/20 border-t-primary">
              <div>
                <p className="stat-figure text-3xl font-extrabold">
                  {Math.round((myAssignedCount / 25) * 100)}%
                </p>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {myAssignedCount} / 25 Cases
                </p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              {Math.max(0, 25 - myAssignedCount)} more qualified leads needed to hit monthly performance bonus.
            </p>
          </div>
        </section>
      </div>

      {/* Sanctioned vs Disbursed Analytics */}
      <SanctionedVsDisbursedAnalytics />

      {/* My Active Pipeline & Leads with Interest Filter */}
      <section className="surface-card overflow-hidden border-2 border-border rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border px-6 py-4 gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">My Active Pipeline & Leads</h2>
            <p className="text-xs text-muted-foreground">Track student interest, follow-up status, and collection progress</p>
          </div>
          <Link to="/leads" className="text-xs font-bold text-primary hover:underline">
            View full pipeline →
          </Link>
        </div>

        {/* Quick Filter Tabs */}
        <div className="px-6 py-2.5 bg-muted/40 border-b border-border flex flex-wrap gap-1.5">
          {[
            "All",
            "Interested",
            "Follow-up Required",
            "Docs Pending",
            "Ready for Handover",
            "Handed Over",
            "Not Interested",
            "Not Contacted",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterInterest(tab)}
              className={`px-3 py-1 text-xs rounded-full transition-all font-semibold ${
                filterInterest === tab
                  ? "bg-primary text-white shadow-xs font-bold"
                  : "bg-card text-muted-foreground hover:bg-muted border border-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-sm">
            <thead className="bg-[#EDF3FD] text-left text-xs uppercase tracking-wide text-[#0F2237] border-b border-[#DDE5F0]">
              <tr>
                <th className="px-5 py-3 font-bold">Student / Case ID</th>
                <th className="px-5 py-3 font-bold">Target Destination</th>
                <th className="px-5 py-3 font-bold">Requirement</th>
                <th className="px-5 py-3 font-bold">Interest Status</th>
                <th className="px-5 py-3 font-bold">Doc Progress</th>
                <th className="px-5 py-3 font-bold">Handover</th>
                <th className="px-5 py-3 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE5F0]">
              {filteredPipelineLeads.map((c) => {
                const docP = calculateDocProgress(c.workflowDocuments);
                const isHanded = c.handover?.isHandedOver ?? false;

                return (
                  <tr key={c.id} className="transition-colors hover:bg-muted/40">
                    <td className="px-5 py-3.5 font-medium">
                      <Link to="/cases/$caseId" params={{ caseId: String(c.id || "NL-1041") }} className="hover:text-primary font-bold text-foreground">
                        {c.student}
                      </Link>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">{c.id}</span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                          <Share2 className="size-2.5 text-blue-600" />
                          <span>{c.source || "Customer reference"}</span>
                          {c.sourceName && <span className="font-normal text-blue-900/80">({c.sourceName})</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="font-semibold text-foreground">{c.course}</p>
                      <p className="text-muted-foreground">{c.country} · {c.university}</p>
                    </td>
                    <td className="px-5 py-3.5 stat-figure font-bold">{formatLakh(c.amount)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                          c.interestStatus === "Interested"
                            ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                            : c.interestStatus === "Follow-up Required"
                            ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                            : c.interestStatus === "Not Interested"
                            ? "bg-rose-500/15 text-rose-700 border-rose-500/30"
                            : "bg-slate-500/15 text-slate-700 border-slate-500/30"
                        }`}
                      >
                        {c.interestStatus || "Not Contacted"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {docP.received}/{docP.total}
                        </span>
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full ${docP.isComplete ? "bg-emerald-600" : "bg-primary"}`}
                            style={{ width: `${docP.percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {isHanded ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 text-emerald-700 px-2 py-0.5 text-[11px] font-bold border border-emerald-500/30">
                          <CheckCircle2 className="size-3" /> Handed Over
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">In Sales</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button size="sm" variant="ghost" asChild className="text-xs font-bold text-primary">
                        <Link to="/cases/$caseId" params={{ caseId: String(c.id || "NL-1041") }}>Manage →</Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}

              {filteredPipelineLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-xs text-muted-foreground">
                    No leads match this interest filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL: Complete Follow-up from Dashboard */}
      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" /> Complete Follow-up Call
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Student: <strong>{activeFollowUp?.student}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmDashboardComplete} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-bold text-foreground">
                Call Summary / Notes
              </Label>
              <Textarea
                placeholder="What was discussed? (e.g. Student confirmed interest, collecting salary slips, scheduled next call...)"
                value={outcomeNote}
                onChange={(e) => setOutcomeNote(e.target.value)}
                className="mt-1 text-xs min-h-[85px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCompleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Save & Complete
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* =========================================================================
   3. PROCESSING EXECUTIVE DASHBOARD
   ========================================================================= */
function ProcessingDashboard() {
  return (
    <div className="space-y-6">
      {/* Processing KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Assigned Files" value="14" hint="Files in processing pipeline" />
        <StatCard label="Documents Pending" value="9" hint="Verification required" accent />
        <StatCard label="Bank Queries" value="3" hint="Lender queries raised" />
        <StatCard label="Awaiting Decision" value="4" hint="Logged in with bank" />
        <StatCard label="Sanctioned / Ready" value="5" hint="Sanction letters issued" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Documents Verification Queue */}
        <section className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <FileCheck className="size-4 text-primary" /> Document Verification Queue
              </h2>
              <p className="text-xs text-muted-foreground">Verify applicant proofs before bank submission</p>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2.5 py-1 text-xs font-bold text-amber-600 border border-amber-500/30">
              9 Files Need Review
            </span>
          </div>

          <div className="mt-4 divide-y divide-border">
            {[
              { id: "NL-1041", student: "Sai Charan Reddy", doc: "Co-applicant salary slips & 6-month bank stmt", bank: "Avanse", status: "Pending Verification" },
              { id: "NL-1052", student: "Mohammed Arshad", doc: "ITR 3-years & property valuation doc", bank: "Auxilo", status: "Pending Verification" },
              { id: "NL-1049", student: "Vikramaditya Rao", doc: "Passport & 12th marksheet scan", bank: "State Bank of India", status: "Requires Correction" },
            ].map((item) => (
              <div key={item.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{item.student} <span className="text-xs font-normal text-muted-foreground">({item.id})</span></p>
                  <p className="text-xs font-medium text-foreground mt-0.5">Doc: {item.doc}</p>
                  <p className="text-xs text-muted-foreground">Target Lender: {item.bank}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs font-semibold">
                    Review File
                  </Button>
                  <Button size="sm" className="text-xs font-semibold bg-success hover:bg-success/90">
                    Verify
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bank Queries & Action Widget */}
        <section className="surface-card p-6">
          <h2 className="text-base font-semibold flex items-center gap-2 text-destructive">
            <AlertCircle className="size-4 text-destructive" /> Active Bank Queries
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Lender clarification requests</p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3.5">
              <p className="text-xs font-bold text-destructive">HDFC Credila Query · NL-1038</p>
              <p className="text-xs text-foreground mt-1 leading-relaxed">
                "Property valuation report missing Kompally survey number seal."
              </p>
              <Button size="sm" variant="outline" className="mt-2.5 w-full text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive/10">
                Resolve Query
              </Button>
            </div>

            <div className="rounded-xl border border-warning/20 bg-warning/5 p-3.5">
              <p className="text-xs font-bold text-amber-700">ICICI Bank Query · NL-1044</p>
              <p className="text-xs text-foreground mt-1 leading-relaxed">
                "Father's Form 16 required for FY 2024-25 verification."
              </p>
              <Button size="sm" variant="outline" className="mt-2.5 w-full text-xs font-semibold text-amber-700 border-amber-700/30 hover:bg-warning/10">
                Resolve Query
              </Button>
            </div>
          </div>
        </section>
      </div>

      {/* Sanctioned vs Disbursed Analytics */}
      <SanctionedVsDisbursedAnalytics />

      {/* Cases in Processing */}
      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Cases Ready for Bank Submission</h2>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 h-7 px-2 gap-1 cursor-pointer"
              onClick={() =>
                exportLeadsToExcel(
                  CASES.filter((c) => c.stage === "Docs Collected" || c.stage === "Sent to Lender"),
                  "processing_bank_submissions"
                )
              }
            >
              <Download className="size-3.5" /> Export Excel
            </Button>
            <Link to="/leads" className="text-xs font-semibold text-primary hover:underline">
              View all processing cases →
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Case ID & Student</th>
                <th className="px-5 py-3 font-medium">Course & Country</th>
                <th className="px-5 py-3 font-medium">Selected Lender</th>
                <th className="px-5 py-3 font-medium">Stage</th>
                <th className="px-5 py-3 font-medium">Lender Submission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CASES.filter((c) => c.stage === "Docs Collected" || c.stage === "Sent to Lender").map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/50">
                  <td className="px-5 py-3.5 font-medium">
                    <Link to="/cases/$caseId" params={{ caseId: String(c.id || "NL-1041") }} className="hover:text-primary">
                      {c.student}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.id}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <p className="font-medium text-foreground">{c.course}</p>
                    <p className="text-muted-foreground">{c.country}</p>
                  </td>
                  <td className="px-5 py-3.5 font-medium">{c.lender}</td>
                  <td className="px-5 py-3.5"><StageBadge stage={c.stage} /></td>
                  <td className="px-5 py-3.5">
                    <Button size="sm" className="text-xs font-semibold bg-primary hover:bg-primary/90">
                      <Send className="mr-1.5 size-3.5" /> Submit to Bank
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

/* =========================================================================
   4. VIEWER / AUDITOR DASHBOARD (READ-ONLY)
   ========================================================================= */
function ViewerDashboard() {
  const maxFunnel = FUNNEL && FUNNEL[0] ? FUNNEL[0].count : 100;

  return (
    <div className="space-y-6">
      {/* Read Only Notice Banner */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs font-medium text-amber-700 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Eye className="size-4 text-amber-600" />
          You are viewing Normiloans CRM in <strong>Read-Only Auditor Mode</strong>. Editing and file submission actions are disabled.
        </span>
      </div>

      {/* Viewer KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Cases Recorded" value="61" hint="Across all locations" />
        <StatCard label="Total Sanction Volume" value="₹9.6 Cr" hint="38 files approved" accent />
        <StatCard label="Total Disbursed Volume" value="₹7.1 Cr" hint="24 files disbursed" />
        <StatCard label="Conversion Efficiency" value="62.2%" hint="Lead to sanction ratio" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SanctionedVsDisbursedAnalytics />
        </div>

        <section className="surface-card p-6 border-2 border-[#CBD5E1]">
          <h2 className="text-base font-bold text-[#0F2237]">High-Level Pipeline Funnel</h2>
          <p className="text-xs text-muted-foreground">Quarterly audit breakdown</p>
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

        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Lender Distribution Audit</h2>
          <ul className="mt-4 space-y-3.5">
            {LENDERS.map((l) => (
              <li key={l.name} className="flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-foreground">{l.name}</p>
                  <p className="text-muted-foreground">{l.live} active cases</p>
                </div>
                <span className="font-bold text-success">{l.sanctionRate}% Sanction Rate</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Read Only Case List */}
      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">Audit Trail — Recent Cases</h2>
          <Link to="/leads" className="text-xs font-semibold text-primary hover:underline">
            View full audit table →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Case ID</th>
                <th className="px-5 py-3 font-medium">Student Name</th>
                <th className="px-5 py-3 font-medium">Lender</th>
                <th className="px-5 py-3 font-medium">Loan Amount</th>
                <th className="px-5 py-3 font-medium">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {CASES.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/50">
                  <td className="px-5 py-3.5 text-xs font-bold text-muted-foreground">{c.id}</td>
                  <td className="px-5 py-3.5 font-medium">{c.student}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{c.lender}</td>
                  <td className="px-5 py-3.5 stat-figure">{formatLakh(c.amount)}</td>
                  <td className="px-5 py-3.5"><StageBadge stage={c.stage} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
