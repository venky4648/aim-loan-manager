import { useEffect, useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { AppShell, StageBadge } from "@/components/crm/AppShell";
import { Button } from "@/components/ui/button";
import { formatINR, formatLakh, REFERRAL_SOURCES } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { toast } from "sonner";
import { Check, Edit3, ShieldAlert, Send, FileText, CheckCircle2, Share2, Download, AlertTriangle, Building2 } from "lucide-react";
import { AddLenderApplicationModal } from "@/components/crm/processing/AddLenderApplicationModal";
import { exportCaseDetailToExcel } from "@/lib/export-utils";
import { SalesWorkflowHeader } from "@/components/crm/sales/SalesWorkflowHeader";
import { FirstContactSection } from "@/components/crm/sales/FirstContactSection";
import { FollowUpManager } from "@/components/crm/sales/FollowUpManager";
import { DocumentCollectionManager } from "@/components/crm/sales/DocumentCollectionManager";
import { ReadyForProcessingSection } from "@/components/crm/sales/ReadyForProcessingSection";
import { UnifiedActivityTimeline } from "@/components/crm/sales/UnifiedActivityTimeline";
import { LenderManagementCard } from "@/components/crm/sales/LenderManagementCard";
import {
  DocumentUploadSection,
  type UploadedDocumentEntry,
} from "@/components/crm/DocumentUploadSection";
import { API_BASE_URL } from "@/lib/api-client";

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

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="surface-card p-6 border-2 border-border shadow-sm rounded-xl">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold">{title}</h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function getLegacyTestScore(value: string, label: string) {
  if (!value) return "";
  const match = value.match(new RegExp(`${label}\\s*([0-9]+(?:\\.[0-9]+)?(?:\\s*/\\s*[0-9]+)?|[0-9]+(?:\\.[0-9]+)?\\s*Band)`, "i"));
  return match?.[1]?.trim() || "";
}

const STUDENT_DOCUMENT_CATEGORIES = [
  { title: "KYC Details", names: ["Aadhaar Card", "PAN Card", "Bank Passbook", "Passport"] },
  { title: "Academic Details", names: ["10th Class Certificate / Marks Memo", "Intermediate Certificate / Marks Memo", "Graduation Certificate / Marks Memo"] },
];
const PARENT_DOCUMENT_CATEGORIES = [
  { title: "Parent KYC Details", names: ["Aadhaar Card", "PAN Card", "Bank Passbook / Bank Details"] },
  { title: "Salary / Income Details", names: ["Salary Certificate", "Payslips", "Form 16", "Income Tax Returns (ITR)", "Bank Statements", "Business Registration Certificate"] },
];
const PROPERTY_DOCUMENT_CATEGORIES = [
  { title: "Property Ownership Details", names: ["Sale Deed", "Linked Documents"] },
  { title: "Income Tax Documents", names: ["Income Tax Documents"] },
];

const RELATIONSHIP_OPTIONS = [
  "Parent", "Father", "Mother", "Spouse", "Brother", "Sister", "Son", "Daughter",
  "Grandfather", "Grandmother", "Father-in-law", "Mother-in-law", "Brother-in-law",
  "Sister-in-law", "Guardian", "Relative", "Friend", "Other",
];
const PROFESSION_OPTIONS = ["Salaried", "Self-Employed / Business", "Agriculture"];

function EditField({
  label,
  name,
  draft,
  setDraft,
  type = "text",
  options,
  textarea = false,
}: {
  label: string;
  name: string;
  draft: Record<string, string>;
  setDraft: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  type?: string;
  options?: string[];
  textarea?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs uppercase tracking-wide text-muted-foreground" htmlFor={name}>{label}</label>
      {options ? (
        <select
          id={name}
          value={draft[name] || ""}
          onChange={(event) => setDraft((previous) => ({ ...previous, [name]: event.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Select option</option>
          {options.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      ) : textarea ? (
        <textarea
          id={name}
          value={draft[name] || ""}
          onChange={(event) => setDraft((previous) => ({ ...previous, [name]: event.target.value }))}
          className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      ) : (
        <input
          id={name}
          type={type}
          value={draft[name] || ""}
          onChange={(event) => setDraft((previous) => ({ ...previous, [name]: event.target.value }))}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      )}
    </div>
  );
}

function CaseDetail() {
  const { caseId } = Route.useParams();
  const { role, user, hasPerm } = useAuth();
  const { getCase, updateReferralSource, updateApplicationDocuments, updateApplicationDetails } = useCases();

  const record = getCase(caseId);
  if (!record) throw notFound();

  const academics = record.academics || {
    tenth: "",
    twelfth: "",
    graduation: "",
    tests: "",
    experience: "",
  };
  const legacyTestScores = academics.tests || "";
  const greScore = academics.greScore || getLegacyTestScore(legacyTestScores, "GRE");
  const gmatScore = academics.gmatScore || getLegacyTestScore(legacyTestScores, "GMAT");
  const satScore = academics.satScore || getLegacyTestScore(legacyTestScores, "SAT");
  const ieltsScore = academics.ieltsScore || getLegacyTestScore(legacyTestScores, "IELTS");
  const toeflScore = academics.toeflScore || getLegacyTestScore(legacyTestScores, "TOEFL");
  const duolingoScore = academics.duolingoScore || getLegacyTestScore(legacyTestScores, "Duolingo");

  const [isEditingSource, setIsEditingSource] = useState(false);
  const [selectedSource, setSelectedSource] = useState(record.source || "Customer reference");
  const [selectedSourceName, setSelectedSourceName] = useState(record.sourceName || "");
  const [studentDocuments, setStudentDocuments] = useState<UploadedDocumentEntry[]>(
    (record.studentDocuments || []) as UploadedDocumentEntry[],
  );
  const [parentDocuments, setParentDocuments] = useState<UploadedDocumentEntry[]>(
    (record.parentDocuments || []) as UploadedDocumentEntry[],
  );
  const [propertyDocuments, setPropertyDocuments] = useState<UploadedDocumentEntry[]>(
    (record.propertyDocuments || []) as UploadedDocumentEntry[],
  );
  const [isLenderModalOpen, setIsLenderModalOpen] = useState(false);
  type EditingSection = "student" | "academics" | "coApplicant" | "guarantor" | "collateral";
  const [editingSection, setEditingSection] = useState<EditingSection | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});

  useEffect(() => {
    setStudentDocuments((record.studentDocuments || []) as UploadedDocumentEntry[]);
    setParentDocuments((record.parentDocuments || []) as UploadedDocumentEntry[]);
    setPropertyDocuments((record.propertyDocuments || []) as UploadedDocumentEntry[]);
  }, [record.studentDocuments, record.parentDocuments, record.propertyDocuments]);

  const startEditing = (section: EditingSection) => {
    if (section === "student") {
      setEditDraft({
        student: record.student || "",
        phone: record.phone || "",
        alternativePhone: record.alternativePhone || "",
        email: record.email || "",
        planningCountry: record.planningCountry || "",
        studyCountry: record.studyCountry || record.country || "",
        course: record.course || "",
        intake: record.intake || "",
        university: record.university || "",
        loanRequirement: record.loanRequirement || "",
        loanType: record.loanType || "",
        amount: String(record.amount || ""),
        source: record.source || "",
        sourceName: record.sourceName || "",
      });
    } else if (section === "academics") {
      setEditDraft({
        tenth: academics.tenth || "",
        twelfth: academics.twelfth || "",
        graduation: academics.graduation || "",
        workExperience: academics.experience || "",
        greScore: greScore || "",
        gmatScore: gmatScore || "",
        satScore: satScore || "",
        ieltsScore: ieltsScore || "",
        toeflScore: toeflScore || "",
        duolingoScore: duolingoScore || "",
      });
    } else if (section === "coApplicant") {
      setEditDraft({
        name: record.coApplicant.name || "",
        relation: record.coApplicant.relation || "",
        contact: record.coApplicant.contact || record.coApplicant.phone || "",
        alternativePhone: record.coApplicant.alternativePhone || "",
        email: record.coApplicant.email || "",
        employment: record.coApplicant.employment || "",
        organisation: record.coApplicant.organisation || "",
        workplace: record.coApplicant.workplace || record.coApplicant.city || "",
        vintage: record.coApplicant.vintage || "",
        monthlyIncome: String(record.coApplicant.monthlyIncome || ""),
        annualIncome: String(record.coApplicant.annualIncome || ""),
        obligations: String(record.coApplicant.obligations || ""),
        currentAddress: record.coApplicant.currentAddress || "",
        permanentAddress: record.coApplicant.permanentAddress || "",
      });
    } else if (section === "guarantor") {
      setEditDraft({
        hasGuarantor: record.guarantor?.hasGuarantor || (record.guarantor?.name ? "Yes" : "No"),
        name: record.guarantor?.name || "",
        relation: record.guarantor?.relation || "",
        contact: record.guarantor?.contact || record.guarantor?.phone || "",
        alternativePhone: record.guarantor?.alternativePhone || "",
        email: record.guarantor?.email || "",
        employment: record.guarantor?.employment || "",
        organisation: record.guarantor?.organisation || "",
        workplace: record.guarantor?.workplace || record.guarantor?.address || "",
        vintage: record.guarantor?.vintage || "",
        monthlyIncome: String(record.guarantor?.monthlyIncome || ""),
        annualIncome: String(record.guarantor?.annualIncome || ""),
        obligations: String(record.guarantor?.obligations || ""),
        currentAddress: record.guarantor?.currentAddress || "",
        permanentAddress: record.guarantor?.permanentAddress || "",
      });
    } else {
      setEditDraft({
        hasCollateral: record.collateral?.hasCollateral || (record.collateral?.type ? "Yes" : "No"),
        type: record.collateral?.type || "",
        location: record.collateral?.location || "",
        marketValue: String(record.collateral?.marketValue || ""),
        owner: record.collateral?.owner || "",
      });
    }
    setEditingSection(section);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditDraft({});
  };

  const saveEditing = async () => {
    if (!editingSection) return;
    let payload: Record<string, unknown> = {};
    const numberValue = (value: string | undefined) => Number((value || "").replace(/[^0-9.]/g, "")) || 0;

    if (editingSection === "student") {
      payload = {
        student: editDraft["student"],
        phone: editDraft["phone"],
        alternativePhone: editDraft["alternativePhone"],
        email: editDraft["email"],
        planningCountry: editDraft["planningCountry"],
        studyCountry: editDraft["studyCountry"],
        country: editDraft["studyCountry"],
        course: editDraft["course"],
        intake: editDraft["intake"],
        university: editDraft["university"],
        loanRequirement: editDraft["loanRequirement"],
        loanType: editDraft["loanType"] === "Secured" || editDraft["loanType"] === "Unsecured" ? editDraft["loanType"] : "",
        amount: numberValue(editDraft["amount"]),
        source: editDraft["source"],
        sourceName: editDraft["sourceName"],
      };
    } else if (editingSection === "academics") {
      payload = {
        academics: {
          ...record.academics,
          tenth: editDraft["tenth"],
          twelfth: editDraft["twelfth"],
          graduation: editDraft["graduation"],
          experience: editDraft["workExperience"],
          greScore: editDraft["greScore"],
          gmatScore: editDraft["gmatScore"],
          satScore: editDraft["satScore"],
          ieltsScore: editDraft["ieltsScore"],
          toeflScore: editDraft["toeflScore"],
          duolingoScore: editDraft["duolingoScore"],
          tests: "",
        },
      };
    } else if (editingSection === "coApplicant") {
      payload = {
        coApplicant: {
          ...record.coApplicant,
          name: editDraft["name"],
          relation: editDraft["relation"],
          contact: editDraft["contact"],
          phone: editDraft["contact"],
          alternativePhone: editDraft["alternativePhone"],
          email: editDraft["email"],
          employment: editDraft["employment"],
          organisation: editDraft["organisation"],
          workplace: editDraft["workplace"],
          city: editDraft["workplace"],
          vintage: editDraft["vintage"],
          monthlyIncome: numberValue(editDraft["monthlyIncome"]),
          annualIncome: numberValue(editDraft["annualIncome"]),
          obligations: numberValue(editDraft["obligations"]),
          currentAddress: editDraft["currentAddress"],
          permanentAddress: editDraft["permanentAddress"],
        },
      };
    } else if (editingSection === "guarantor") {
      payload = {
        guarantor: editDraft["hasGuarantor"] === "Yes"
          ? {
              hasGuarantor: "Yes",
              name: editDraft["name"],
              relation: editDraft["relation"],
              contact: editDraft["contact"],
              phone: editDraft["contact"],
              alternativePhone: editDraft["alternativePhone"],
              email: editDraft["email"],
              employment: editDraft["employment"],
              organisation: editDraft["organisation"],
              workplace: editDraft["workplace"],
              address: editDraft["workplace"],
              vintage: editDraft["vintage"],
              monthlyIncome: numberValue(editDraft["monthlyIncome"]),
              annualIncome: numberValue(editDraft["annualIncome"]),
              obligations: numberValue(editDraft["obligations"]),
              currentAddress: editDraft["currentAddress"],
              permanentAddress: editDraft["permanentAddress"],
            }
          : { hasGuarantor: "No" },
      };
    } else {
      payload = {
        collateral: {
          hasCollateral: editDraft["hasCollateral"],
          type: editDraft["type"],
          location: editDraft["location"],
          marketValue: numberValue(editDraft["marketValue"]),
          owner: editDraft["owner"],
        },
      };
    }

    const saved = await updateApplicationDetails(record.id, payload);
    if (saved) cancelEditing();
  };

  const canEditCase = hasPerm("cases:edit");
  const isHandedOver = record.handover?.isHandedOver ?? false;

  return (
    <AppShell
      title={record.student}
      subtitle={`${record.id} · ${record.course} · ${record.university}`}
      action={
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border border-border bg-card hover:bg-muted font-semibold text-xs gap-1.5 shadow-xs"
            onClick={() => exportCaseDetailToExcel(record)}
            title="Export complete student case file to Excel"
          >
            <Download className="size-3.5 text-slate-700" />
            <span className="hidden sm:inline">Export Case (.csv)</span>
          </Button>

          {(role === "relationship_manager" || role === "superadmin" || role === "manager") && (
            <Button
              size="sm"
              onClick={() => setIsLenderModalOpen(true)}
              className="font-semibold text-xs gap-1.5 shadow-xs"
            >
              <Building2 className="size-3.5" />
              <span>Apply to Lenders</span>
            </Button>
          )}

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
            <span className="text-xs font-semibold text-slate-900 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-md flex items-center gap-1">
              <CheckCircle2 className="size-3 text-slate-700" /> Handed Over
            </span>
          ) : (
            <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              <ShieldAlert className="size-3 text-slate-500" /> Sales Active
            </span>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Sales Workflow Header Stepper */}
        <SalesWorkflowHeader record={record} />

        {/* Returned for Corrections Banner */}
        {record.stage === "Returned for Corrections" && (
          <div className="p-4 sm:p-5 rounded-xl border border-slate-300 bg-slate-100/90 shadow-xs flex items-start gap-3.5">
            <AlertTriangle className="size-5 text-slate-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">
                Application File Returned to Sales Team (Corrections Needed)
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                <strong>RM Feedback / Remarks:</strong> {record.returnToSales?.returnReason || "Please verify applicant documents and co-applicant financials with student."}
              </p>
              <p className="text-[11px] text-slate-600">
                Returned by <strong>{record.returnToSales?.returnedBy || "Relationship Manager"}</strong> {record.returnToSales?.returnedAt ? `on ${new Date(record.returnToSales.returnedAt).toLocaleString("en-IN")}` : ""}. Please correct the required details and re-handover the file.
              </p>
            </div>
          </div>
        )}

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
          {role === "superadmin" || role === "relationship_manager" || role === "manager" ? (
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
            <Panel
              title="Student / applicant"
              action={
                editingSection === "student" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                    <Button size="sm" onClick={saveEditing}>Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing("student")}>
                    <Edit3 className="mr-1.5 size-3" /> Edit
                  </Button>
                )
              }
            >
              {editingSection === "student" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <EditField label="Student Name" name="student" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Contact" name="phone" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Alternative Mobile Number" name="alternativePhone" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Email" name="email" draft={editDraft} setDraft={setEditDraft} type="email" />
                  <EditField label="Country of Planning" name="planningCountry" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Country to Study" name="studyCountry" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Course" name="course" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Intake" name="intake" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="University" name="university" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Loan Requirement" name="loanRequirement" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Loan Amount" name="amount" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Loan Type Preference" name="loanType" draft={editDraft} setDraft={setEditDraft} options={["Unsecured", "Secured"]} />
                  <EditField label="Sourcing Channel" name="source" draft={editDraft} setDraft={setEditDraft} options={[...REFERRAL_SOURCES]} />
                  <EditField label="Source Name / Referrer Detail" name="sourceName" draft={editDraft} setDraft={setEditDraft} />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Student Name" value={record.student} />
                  <Field label="Contact" value={record.phone} />
                  <Field label="Alternative Mobile Number" value={record.alternativePhone || "—"} />
                  <Field label="Email" value={record.email} />
                  <Field label="Country of Planning" value={record.planningCountry || "—"} />
                  <Field label="Country to Study" value={record.studyCountry || record.country} />
                  <Field label="Course" value={record.course} />
                  <Field label="Intake" value={record.intake} />
                  <Field label="University" value={record.university} />
                  <Field label="Loan Requirement" value={record.loanRequirement || "—"} />
                  <Field label="Loan Amount" value={formatINR(record.amount)} />
                  <Field label="Loan Type Preference" value={record.loanType === "Secured" ? "Secured (With Property/FD Collateral)" : "Unsecured (No Collateral)"} />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                    <Share2 className="size-3 text-primary" /> Sourcing Channel & Detail
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
                      <input
                        type="text"
                        placeholder="Source / Referrer Name"
                        value={selectedSourceName}
                        onChange={(e) => setSelectedSourceName(e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1 text-xs shadow-xs focus:outline-hidden w-44"
                      />
                      <Button
                        size="sm"
                        className="h-7 px-2 text-[11px] font-semibold"
                        onClick={() => {
                          updateReferralSource(record.id, selectedSource, selectedSourceName, user?.name || "Staff");
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
                          setSelectedSource(record.source || "Customer reference");
                          setSelectedSourceName(record.sourceName || "");
                          setIsEditingSource(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-1 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-300 text-slate-800 px-2.5 py-0.5 text-xs font-semibold">
                        <Share2 className="size-3 text-slate-600" />
                        <span>{record.source || "Customer reference"}</span>
                        {record.sourceName && (
                          <span className="font-normal text-slate-600">({record.sourceName})</span>
                        )}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedSource(record.source || "Customer reference");
                          setSelectedSourceName(record.sourceName || "");
                          setIsEditingSource(true);
                        }}
                        className="text-[11px] text-muted-foreground hover:text-primary underline flex items-center gap-0.5"
                        title="Change sourcing details"
                      >
                        <Edit3 className="size-2.5" /> Change
                      </button>
                    </div>
                  )}
                </div>
              </div>
              )}
            </Panel>

            <Panel
              title="Academic Details"
              action={
                editingSection === "academics" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                    <Button size="sm" onClick={saveEditing}>Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing("academics")}>
                    <Edit3 className="mr-1.5 size-3" /> Edit
                  </Button>
                )
              }
            >
              {editingSection === "academics" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <EditField label="10th Score" name="tenth" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="12th Score" name="twelfth" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Graduation" name="graduation" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Work Experience" name="workExperience" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="GRE" name="greScore" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="GMAT" name="gmatScore" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="SAT" name="satScore" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="IELTS" name="ieltsScore" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="TOEFL" name="toeflScore" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Duolingo" name="duolingoScore" draft={editDraft} setDraft={setEditDraft} />
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="10th" value={academics.tenth || "—"} />
                  <Field label="12th" value={academics.twelfth || "—"} />
                  <Field label="Graduation" value={academics.graduation || "—"} />
                  <Field label="Work Experience" value={academics.experience || "—"} />
                  <Field label="GRE" value={greScore || "—"} />
                  <Field label="GMAT" value={gmatScore || "—"} />
                  <Field label="SAT" value={satScore || "—"} />
                  <Field label="IELTS" value={ieltsScore || "—"} />
                  <Field label="TOEFL" value={toeflScore || "—"} />
                  <Field label="Duolingo" value={duolingoScore || "—"} />
                </div>
              )}
            </Panel>

            <Panel
              title="Co-applicant / co-borrower"
              action={
                editingSection === "coApplicant" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                    <Button size="sm" onClick={saveEditing}>Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing("coApplicant")}>
                    <Edit3 className="mr-1.5 size-3" /> Edit
                  </Button>
                )
              }
            >
              {editingSection === "coApplicant" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <EditField label="Co-applicant Full Name" name="name" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Relationship" name="relation" draft={editDraft} setDraft={setEditDraft} options={RELATIONSHIP_OPTIONS} />
                  <EditField label="Contact Number" name="contact" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Alternative Mobile Number" name="alternativePhone" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Email ID" name="email" draft={editDraft} setDraft={setEditDraft} type="email" />
                  <EditField label="Profession" name="employment" draft={editDraft} setDraft={setEditDraft} options={PROFESSION_OPTIONS} />
                  <EditField label="Organisation / Business Name" name="organisation" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Place of Work / City" name="workplace" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Work / Business Vintage" name="vintage" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Monthly Income (₹)" name="monthlyIncome" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Annual Income (₹)" name="annualIncome" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Existing Loan Obligations (₹/month)" name="obligations" draft={editDraft} setDraft={setEditDraft} />
                  <EditField label="Current Address" name="currentAddress" draft={editDraft} setDraft={setEditDraft} textarea />
                  <EditField label="Permanent Address" name="permanentAddress" draft={editDraft} setDraft={setEditDraft} textarea />
                </div>
              ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Co-applicant Full Name" value={record.coApplicant.name} />
                <Field label="Relationship" value={record.coApplicant.relation} />
                <Field label="Contact Number" value={(record.coApplicant as any).contact || record.coApplicant.phone || "—"} />
                <Field label="Alternative Mobile Number" value={(record.coApplicant as any).alternativePhone || "—"} />
                <Field label="Email ID" value={(record.coApplicant as any).email || "—"} />
                <Field label="Profession" value={record.coApplicant.employment} />
                <Field label="Organisation / Business Name" value={record.coApplicant.organisation} />
                <Field label="Place of Work / City" value={(record.coApplicant as any).workplace || record.coApplicant.city} />
                <Field label="Work / Business Vintage" value={(record.coApplicant as any).vintage || "—"} />
                <Field label="Monthly income" value={formatINR(record.coApplicant.monthlyIncome)} />
                <Field label="Annual income" value={formatINR((record.coApplicant as any).annualIncome || 0)} />
                <Field label="Existing Loan Obligations (₹/month)" value={formatINR(record.coApplicant.obligations)} />
                <Field label="Current Address" value={(record.coApplicant as any).currentAddress || "—"} />
                <Field label="Permanent Address" value={(record.coApplicant as any).permanentAddress || "—"} />
              </div>
              )}
            </Panel>

            <Panel
              title="Guarantor Details"
              action={
                editingSection === "guarantor" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                    <Button size="sm" onClick={saveEditing}>Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing("guarantor")}>
                    <Edit3 className="mr-1.5 size-3" /> Edit
                  </Button>
                )
              }
            >
              {editingSection === "guarantor" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <EditField label="Provide Guarantor Details" name="hasGuarantor" draft={editDraft} setDraft={setEditDraft} options={["Yes", "No"]} />
                  {editDraft["hasGuarantor"] === "Yes" && (
                    <>
                      <EditField label="Guarantor Full Name" name="name" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Relationship" name="relation" draft={editDraft} setDraft={setEditDraft} options={RELATIONSHIP_OPTIONS} />
                      <EditField label="Contact Number" name="contact" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Alternative Mobile Number" name="alternativePhone" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Email ID" name="email" draft={editDraft} setDraft={setEditDraft} type="email" />
                      <EditField label="Profession" name="employment" draft={editDraft} setDraft={setEditDraft} options={PROFESSION_OPTIONS} />
                      <EditField label="Organisation / Business Name" name="organisation" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Place of Work / City" name="workplace" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Work / Business Vintage" name="vintage" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Monthly Income (₹)" name="monthlyIncome" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Annual Income (₹)" name="annualIncome" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Existing Loan Obligations (₹/month)" name="obligations" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Current Address" name="currentAddress" draft={editDraft} setDraft={setEditDraft} textarea />
                      <EditField label="Permanent Address" name="permanentAddress" draft={editDraft} setDraft={setEditDraft} textarea />
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  {record.guarantor?.hasGuarantor === "Yes" || record.guarantor?.name ? (
                    <>
                      <Field label="Guarantor Full Name" value={record.guarantor.name || "—"} />
                      <Field label="Relationship" value={record.guarantor.relation || "—"} />
                      <Field label="Contact Number" value={record.guarantor.contact || record.guarantor.phone || "—"} />
                      <Field label="Alternative Mobile Number" value={record.guarantor.alternativePhone || "—"} />
                      <Field label="Email ID" value={record.guarantor.email || "—"} />
                      <Field label="Profession" value={record.guarantor.employment || "—"} />
                      <Field label="Organisation / Business Name" value={record.guarantor.organisation || "—"} />
                      <Field label="Place of Work / City" value={record.guarantor.workplace || record.guarantor.address || "—"} />
                      <Field label="Work / Business Vintage" value={record.guarantor.vintage || "—"} />
                      <Field label="Monthly Income (₹)" value={formatINR(record.guarantor.monthlyIncome || 0)} />
                      <Field label="Annual Income (₹)" value={formatINR(record.guarantor.annualIncome || 0)} />
                      <Field label="Existing Loan Obligations (₹/month)" value={formatINR(record.guarantor.obligations || 0)} />
                      <Field label="Current Address" value={record.guarantor.currentAddress || "—"} />
                      <Field label="Permanent Address" value={record.guarantor.permanentAddress || "—"} />
                    </>
                  ) : (
                    <Field label="Guarantor Details" value="No guarantor selected" />
                  )}
                </div>
              )}
            </Panel>

            <Panel
              title="Security / collateral"
              action={
                editingSection === "collateral" ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                    <Button size="sm" onClick={saveEditing}>Save</Button>
                  </div>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => startEditing("collateral")}>
                    <Edit3 className="mr-1.5 size-3" /> Edit
                  </Button>
                )
              }
            >
              {editingSection === "collateral" ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <EditField label="Has Collateral" name="hasCollateral" draft={editDraft} setDraft={setEditDraft} options={["Yes", "No"]} />
                  {editDraft["hasCollateral"] === "Yes" && (
                    <>
                      <EditField label="Property type" name="type" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Location" name="location" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Market value" name="marketValue" draft={editDraft} setDraft={setEditDraft} />
                      <EditField label="Owner" name="owner" draft={editDraft} setDraft={setEditDraft} />
                    </>
                  )}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Has Collateral" value={record.collateral?.hasCollateral || (record.collateral?.type ? "Yes" : "No")} />
                  <Field label="Property type" value={record.collateral?.type || "—"} />
                  <Field label="Location" value={record.collateral?.location || "—"} />
                  <Field label="Market value" value={formatINR(record.collateral?.marketValue || 0)} />
                  <Field label="Owner" value={record.collateral?.owner || "—"} />
                </div>
              )}
            </Panel>

            <Panel title="Application Documents">
              <div className="space-y-6">
                <DocumentUploadSection
                  title="Student Documents"
                  categories={STUDENT_DOCUMENT_CATEGORIES}
                  documents={studentDocuments}
                  onChange={setStudentDocuments}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => updateApplicationDocuments(record.id, "student", studentDocuments)}
                  >
                    Save Student Documents
                  </Button>
                </div>

                <DocumentUploadSection
                  title="Parent Documents"
                  categories={PARENT_DOCUMENT_CATEGORIES}
                  documents={parentDocuments}
                  onChange={setParentDocuments}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => updateApplicationDocuments(record.id, "parent", parentDocuments)}
                  >
                    Save Parent Documents
                  </Button>
                </div>

                <DocumentUploadSection
                  title="Property Documents"
                  categories={PROPERTY_DOCUMENT_CATEGORIES}
                  documents={propertyDocuments}
                  onChange={setPropertyDocuments}
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => updateApplicationDocuments(record.id, "property", propertyDocuments)}
                  >
                    Save Property Documents
                  </Button>
                </div>
              </div>
            </Panel>

            {/* Document Checklist for Processing/Admin Verification */}
            {(role === "relationship_manager" || role === "superadmin") && (
              <Panel title="Processing Document Verification Queue">
                <ul className="divide-y divide-border">
                  {record.documents.map((d) => (
                    <li key={d.name} className="flex items-center justify-between py-3 text-sm">
                      <span className="font-medium text-foreground">{d.name}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${
                            d.status === "Verified"
                              ? "bg-slate-900 text-white border-slate-900"
                              : d.status === "Received"
                              ? "bg-slate-200 text-slate-900 border-slate-400"
                              : "bg-slate-100 text-slate-700 border-slate-300"
                          }`}
                        >
                          {d.status}
                        </span>
                        {d.status !== "Verified" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs font-semibold text-slate-700 hover:bg-slate-100"
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

        {/* Modal to apply to multiple lenders directly from this student file */}
        <AddLenderApplicationModal
          isOpen={isLenderModalOpen}
          onClose={() => setIsLenderModalOpen(false)}
          caseItem={record}
          onSuccess={() => {
            toast.success("Lender applications initiated successfully!");
          }}
        />
      </div>
    </AppShell>
  );
}
