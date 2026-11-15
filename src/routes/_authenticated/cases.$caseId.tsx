import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, StageBadge } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { formatINR, formatLakh, REFERRAL_SOURCES } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { toast } from "sonner";
import { Check, Edit3, ShieldAlert, Send, FileText, CheckCircle2, Share2 } from "lucide-react";
import { SalesWorkflowHeader } from "@/components/crm/sales/SalesWorkflowHeader";
import { FirstContactSection } from "@/components/crm/sales/FirstContactSection";
import { FollowUpManager } from "@/components/crm/sales/FollowUpManager";
import { DocumentCollectionManager } from "@/components/crm/sales/DocumentCollectionManager";
import { ReadyForProcessingSection } from "@/components/crm/sales/ReadyForProcessingSection";
import { UnifiedActivityTimeline } from "@/components/crm/sales/UnifiedActivityTimeline";
import { LenderManagementCard } from "@/components/crm/sales/LenderManagementCard";

export const Route = createFileRoute("/_authenticated/cases/$caseId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Case File | Normiloans CRM" },
      { name: "description", content: "Student, co-applicant, collateral, documents and lender status for one case." },
    ],
  }),
  component: CaseDetail,
  notFoundComponent: CaseMissing,
});

function CaseMissing() {
  return (
    <AppShell title="Case not found" subtitle="This case ID does not exist in the demo data">
      <Button asChild>
        <Link to="/leads">Back to pipeline</Link>
      </Button>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="surface-card p-6 border-2 border-border shadow-sm rounded-xl">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CaseDetail() {
  const { caseId } = Route.useParams();
  const { role, user, hasPerm } = useAuth();
  const { getCase, updateReferralSource } = useCases();

  const record = getCase(caseId);
  if (!record) throw notFound();

  const [isEditingSource, setIsEditingSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(record.source || "Website inquiry form");

  const canEditCase = hasPerm("cases:edit");
  const isHandedOver = record.handover?.isHandedOver ?? false;

  return (
    <AppShell
      title={record.student}
      subtitle={`${record.id} · ${record.course} · ${record.university}`}
      action={
        <div className="flex items-center gap-2">
          <StageBadge stage={record.stage} />
          {canEditCase ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.success(`Updating processing stage for ${record.student} (${role.toUpperCase()} Action)`)}
            >
              <Edit3 className="mr-1.5 size-3.5" /> Update stage
            </Button>
          ) : isHandedOver ? (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="size-3" /> Handed Over
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 bg-muted px-2.5 py-1 rounded-md">
              <ShieldAlert className="size-3 text-amber-500" /> Sales Active
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sales Workflow Header Stepper */}
        <SalesWorkflowHeader record={record} />

        {/* Top KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="surface-card p-5 border-2 border-border rounded-xl">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Requirement</p>
            <p className="stat-figure mt-2 text-2xl font-bold">{formatLakh(record.amount)}</p>
            <p className="text-xs text-muted-foreground">{record.loanType} loan</p>
          </div>
          <div className="surface-card p-5 border-2 border-border rounded-xl">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Sanctioned</p>
            <p className="stat-figure mt-2 text-2xl font-bold text-primary">
              {record.sanctioned ? formatLakh(record.sanctioned) : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {record.roi ? `${record.roi}% ROI · ${record.tenure} months` : "Awaiting lender decision"}
            </p>
          </div>
          <div className="surface-card p-5 border-2 border-border rounded-xl">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Disbursed</p>
            <p className="stat-figure mt-2 text-2xl font-bold">{record.disbursed ? formatLakh(record.disbursed) : "—"}</p>
            <p className="text-xs text-muted-foreground">{record.disbursed ? "Tranche 1 released" : "Not started"}</p>
          </div>

          {/* Commission only visible to Admin, Processing, and Viewer */}
          {role === "admin" || role === "processing" || role === "viewer" ? (
            <div className="surface-card p-5 border-2 border-border rounded-xl">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Commission</p>
              <p className="stat-figure mt-2 text-2xl font-bold">{record.commission ? formatINR(record.commission) : "—"}</p>
              <p className="text-xs text-muted-foreground">
                {record.commission ? (record.commissionReceived ? "Received" : "Pending receipt") : "Not applicable yet"}
              </p>
            </div>
          ) : (
            <div className="surface-card p-5 border-2 border-border rounded-xl bg-card">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Sales Tracking</p>
              <p className="stat-figure mt-2 text-xl font-bold text-primary">
                {isHandedOver ? "Handed Over" : "In Sales Bucket"}
              </p>
              <p className="text-xs text-muted-foreground">Executive: {record.owner}</p>
            </div>
          )}
        </div>

        {/* Step-by-Step Sales Workflow: Paired Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Step 1: First Contact & Interest Qualification */}
          <FirstContactSection record={record} />

          {/* Step 2: Follow-up & Reminder Management */}
          <FollowUpManager record={record} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Step 3: Document Collection Management (Strictly Gated - Unlocks upon Interest confirmation) */}
          <DocumentCollectionManager record={record} />

          {/* Step 4: Ready for Processing & Team Handover (Strictly Gated - Unlocks upon 100% docs) */}
          <ReadyForProcessingSection record={record} />
        </div>

        {/* Full-Width Horizontal Activity Timeline & Audit Stream */}
        <UnifiedActivityTimeline record={record} />

        {/* Student & Co-Applicant Application Information & Lender Partner Hub */}
        <div className="grid gap-6 lg:grid-cols-3 items-start">
          <div className="space-y-6 lg:col-span-2">
            <Panel title="Student / applicant">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Contact" value={record.phone} />
                <Field label="Email" value={record.email} />
                <Field label="Destination" value={record.country} />
                <Field label="Course" value={record.course} />
                <Field label="Intake" value={record.intake} />
                <Field label="University" value={record.university} />
                <Field label="10th" value={record.academics.tenth} />
                <Field label="12th" value={record.academics.twelfth} />
                <Field label="Graduation" value={record.academics.graduation} />
                <Field label="Test scores" value={record.academics.tests} />
                <Field label="Work experience" value={record.academics.experience} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Share2 className="size-3 text-primary" /> Referral / Lead Source
                  </p>
                  {isEditingSource ? (
                    <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                      <select
                        value={selectedSource}
                        onChange={(e) => setSelectedSource(e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus:outline-hidden"
                      >
                        {REFERRAL_SOURCES.map((src) => (
                          <option key={src} value={src}>{src}</option>
                        ))}
                      </select>
                      <Button
                        size="sm"
                        className="h-7 px-2 text-[11px] font-semibold"
                        onClick={() => {
                          updateReferralSource(record.id, selectedSource, user?.name || "Staff");
                          setIsEditingSource(false);
                        }}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-1.5 text-[11px]"
                        onClick={() => {
                          setSelectedSource(record.source || "Website inquiry form");
                          setIsEditingSource(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-700 px-2.5 py-0.5 text-xs font-semibold">
                        <Share2 className="size-3 text-blue-600" /> {record.source || "Website inquiry form"}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSource(record.source || "Website inquiry form");
                          setIsEditingSource(true);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-primary underline flex items-center gap-0.5"
                        title="Change referral source"
                      >
                        <Edit3 className="size-2.5" /> Change
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <Panel title="Co-applicant / co-borrower">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Name" value={`${record.coApplicant.name} (${record.coApplicant.relation})`} />
                <Field label="Employment" value={record.coApplicant.employment} />
                <Field label="Organisation / business" value={record.coApplicant.organisation} />
                <Field label="Monthly income" value={formatINR(record.coApplicant.monthlyIncome)} />
                <Field label="Existing obligations" value={formatINR(record.coApplicant.obligations)} />
                <Field label="Place of work" value={record.coApplicant.city} />
              </div>
            </Panel>

            {record.collateral ? (
              <Panel title="Security / collateral">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Property type" value={record.collateral.type} />
                  <Field label="Location" value={record.collateral.location} />
                  <Field label="Market value" value={formatINR(record.collateral.marketValue)} />
                  <Field label="Owner" value={record.collateral.owner} />
                </div>
              </Panel>
            ) : null}

            {/* Document Checklist for Processing/Admin Verification */}
            {(role === "processing" || role === "admin") && (
              <Panel title="Processing Document Verification Queue">
                <ul className="divide-y divide-border">
                  {record.documents.map((d) => (
                    <li key={d.name} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-foreground">{d.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            d.status === "Verified"
                              ? "bg-emerald-500/15 text-emerald-700"
                              : d.status === "Received"
                              ? "bg-blue-500/15 text-blue-700"
                              : "bg-amber-500/15 text-amber-700"
                          }`}
                        >
                          {d.status}
                        </span>
                        {d.status !== "Verified" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs font-semibold text-emerald-600 hover:bg-emerald-50"
                            onClick={() => toast.success(`Marked ${d.name} as Verified`)}
                          >
                            <Check className="mr-1 size-3" /> Mark Verified
                          </Button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>
            )}
          </div>

          <div className="space-y-6 lg:col-span-1">
            {/* Optimized Lender Partner Hub Card */}
            <LenderManagementCard record={record} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
