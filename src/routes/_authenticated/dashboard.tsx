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
} from "lucide-react";

import { AppShell, StageBadge, StatCard } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { CASES, FUNNEL, LENDERS, MONTHLY, formatLakh, formatINR } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { StudentRegistrationModal } from "@/components/crm/StudentRegistrationModal";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/dashboard")({
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

  return (
    <AppShell
      title={`Welcome back, ${user.name}`}
      subtitle={`Role: ${user.roleTitle} · Hyderabad, Telangana`}
      action={
        role !== "viewer" ? (
          <Button
            size="sm"
            className="font-semibold shadow-md shadow-primary/20"
            onClick={() => setAddLeadOpen(true)}
          >
            <UserPlus className="mr-1.5 size-4" /> Add lead
          </Button>
        ) : null
      }
    >
      {/* Role specific dashboard rendering */}
      {role === "admin" && <AdminDashboard />}
      {role === "sales" && <SalesDashboard />}
      {role === "processing" && <ProcessingDashboard />}
      {role === "viewer" && <ViewerDashboard />}

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
  const maxFunnel = FUNNEL[0]!.count;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Active Cases" value="61" hint="+8 added this week" />
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
            <Link to="/leads" className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
              View all pipeline <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {CASES.slice(0, 5).map((c) => (
              <li key={c.id}>
                <Link
                  to="/cases/$caseId"
                  params={{ caseId: c.id }}
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
  const salesLeads = CASES.filter((c) => c.owner.includes("Praveen") || c.stage === "New Lead" || c.stage === "Contacted");

  return (
    <div className="space-y-6">
      {/* Sales KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="My Assigned Leads" value="18" hint="Active in my bucket" />
        <StatCard label="New Leads Today" value="6" hint="Requires qualification" accent />
        <StatCard label="Follow-ups Due" value="4" hint="Scheduled for today" />
        <StatCard label="Qualified Cases" value="7" hint="Sent to processing" />
        <StatCard label="Converted / Sanctioned" value="5" hint="Total 100% converted" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Follow-up Queue Due Today */}
        <section className="surface-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Clock className="size-4 text-primary" /> Follow-ups Due Today
              </h2>
              <p className="text-xs text-muted-foreground">Call scheduled for student qualification & document reminders</p>
            </div>
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-bold text-primary">
              4 Calls Due
            </span>
          </div>

          <div className="mt-4 divide-y divide-border">
            {[
              { id: "NL-1041", name: "Sai Charan Reddy", phone: "+91 98490 21188", course: "MS CS · USA", time: "10:30 AM", note: "Collect missing 6-month bank statement of father" },
              { id: "NL-1052", name: "Mohammed Arshad", phone: "+91 91234 55780", course: "PG Diploma · Canada", time: "11:45 AM", note: "Discuss Auxilo NBFC rate of interest offer" },
              { id: "NL-1049", name: "Vikramaditya Rao", phone: "+91 94401 88921", course: "UG Medicine · Georgia", time: "02:15 PM", note: "Send property valuation checklist to parent" },
              { id: "NL-1035", name: "Deepika Sharma", phone: "+91 99880 12345", course: "MS Biotech · Germany", time: "04:00 PM", note: "Follow up on GRE score card scan upload" },
            ].map((item) => (
              <div key={item.id} className="py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <span className="text-xs text-muted-foreground">({item.course})</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.phone} · <strong className="text-foreground">{item.time}</strong></p>
                  <p className="text-xs text-primary font-medium mt-1">Note: {item.note}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs font-semibold text-primary border-primary/40 hover:bg-primary/10">
                    <PhoneCall className="mr-1.5 size-3.5" /> Call Student
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sales Target & Conversion Tracker */}
        <section className="surface-card p-6">
          <h2 className="text-base font-semibold">Monthly Lead Target</h2>
          <p className="text-xs text-muted-foreground">Target: 25 Qualified Submissions</p>
          <div className="mt-6 flex flex-col items-center justify-center text-center">
            <div className="relative flex size-36 items-center justify-center rounded-full border-8 border-primary/20 border-t-primary">
              <div>
                <p className="stat-figure text-3xl">72%</p>
                <p className="text-[11px] font-semibold text-muted-foreground">18 / 25 Cases</p>
              </div>
            </div>
            <p className="mt-4 text-xs font-medium text-muted-foreground">
              7 more qualified leads needed to hit monthly performance bonus.
            </p>
          </div>
        </section>
      </div>

      {/* Sanctioned vs Disbursed Analytics */}
      <SanctionedVsDisbursedAnalytics />

      {/* My Leads List */}
      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold">My Active Pipeline & Leads</h2>
          <Link to="/leads" className="text-xs font-semibold text-primary hover:underline">
            View full pipeline →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-secondary/70 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-medium">Student / Case ID</th>
                <th className="px-5 py-3 font-medium">Target Destination</th>
                <th className="px-5 py-3 font-medium">Requirement</th>
                <th className="px-5 py-3 font-medium">Stage</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {salesLeads.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-secondary/50">
                  <td className="px-5 py-3.5 font-medium">
                    <Link to="/cases/$caseId" params={{ caseId: c.id }} className="hover:text-primary">
                      {c.student}
                    </Link>
                    <p className="text-xs text-muted-foreground">{c.id} · {c.source}</p>
                  </td>
                  <td className="px-5 py-3.5 text-xs">
                    <p className="font-medium text-foreground">{c.course}</p>
                    <p className="text-muted-foreground">{c.country} · {c.university}</p>
                  </td>
                  <td className="px-5 py-3.5 stat-figure">{formatLakh(c.amount)}</td>
                  <td className="px-5 py-3.5"><StageBadge stage={c.stage} /></td>
                  <td className="px-5 py-3.5">
                    <Button size="sm" variant="ghost" asChild className="text-xs text-primary">
                      <Link to="/cases/$caseId" params={{ caseId: c.id }}>Update</Link>
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
          <Link to="/leads" className="text-xs font-semibold text-primary hover:underline">
            View all processing cases →
          </Link>
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
                    <Link to="/cases/$caseId" params={{ caseId: c.id }} className="hover:text-primary">
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
  const maxFunnel = FUNNEL[0]!.count;

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
