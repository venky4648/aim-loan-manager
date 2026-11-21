import { DemoCase, formatINR } from "@/lib/demo-data";
import { calculateDocProgress } from "@/lib/sales-workflow-types";
import { toast } from "sonner";

/**
 * Cleanly escapes a string or number for CSV formatting.
 * Preserves quotes, commas, newlines, and prepends tab for numbers with + signs
 * so Excel does not treat phone numbers or IDs as formulas.
 */
function escapeCsvValue(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  let str = String(val);

  // If string starts with +, -, =, @, Excel might treat as formula -> escape with single quote or space
  if (/^[+=@\-]/.test(str)) {
    str = `'${str}`;
  }

  // Escape inner double quotes by doubling them
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

/**
 * Downloads a structured dataset as a UTF-8 BOM CSV file that opens natively in Microsoft Excel.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | boolean | null | undefined)[][]
) {
  try {
    const csvRows: string[] = [];

    // 1. Header row
    csvRows.push(headers.map(escapeCsvValue).join(","));

    // 2. Data rows
    for (const row of rows) {
      csvRows.push(row.map(escapeCsvValue).join(","));
    }

    const csvContent = csvRows.join("\r\n");

    // Add UTF-8 Byte Order Mark (\uFEFF) so Excel on Windows & Mac decodes UTF-8 automatically
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${rows.length} rows to Excel (${filename}.csv)`);
  } catch (err) {
    console.error("[ExportUtils] CSV Export failed:", err);
    toast.error("Failed to generate Excel export file.");
  }
}

/**
 * Formatted date string for filenames (e.g. 2026-11-18)
 */
export function getExportDateSuffix(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 1. Export Leads / Cases to Excel
 */
export function exportLeadsToExcel(leads: DemoCase[], filenamePrefix: string = "leads_pipeline") {
  if (!leads || leads.length === 0) {
    toast.error("No leads available to export.");
    return;
  }

  const headers = [
    "Case ID",
    "Student Name",
    "Contact Phone",
    "Email Address",
    "Requested Loan Amount (INR)",
    "Sourcing Channel",
    "Sourcing Partner / Name",
    "Current Stage",
    "Sales Workflow Status",
    "Assigned Case Owner",
    "Target Country",
    "Target University",
    "Target Course",
    "Intake Period",
    "Allocated Lender",
    "Lender Underwriting Status",
    "Lender Application Ref No",
    "Lender Submission Date",
    "Sanctioned Amount (INR)",
    "Sanctioned ROI (% p.a.)",
    "Loan Tenure (Months)",
    "Disbursed Amount (INR)",
    "Commission Earned (INR)",
    "Document Progress",
    "Handed Over to Processing",
    "Decline Reason",
    "Last Activity / Updated",
  ];

  const rows = leads.map((c) => {
    const docs = c.workflowDocuments || [];
    const docProg = calculateDocProgress(docs);
    const docStatus = `${docProg.received} of ${docProg.total} Docs (${docProg.percentage}%)`;
    const isHandedOver = c.handover?.isHandedOver
      ? `Yes (to ${c.handover.processingOwner})`
      : "No";

    return [
      c.id,
      c.student,
      c.phone,
      c.email,
      c.amount,
      c.source || "DSA/Connector",
      c.sourceName || "—",
      c.stage,
      c.interestStatus || "Not Contacted",
      c.owner,
      c.country,
      c.university,
      c.course,
      c.intake,
      c.lender && c.lender !== "Not assigned" ? c.lender : "Not Assigned",
      c.lenderStatus || "—",
      c.lenderApplicationNo || "—",
      c.lenderSubmittedAt
        ? new Date(c.lenderSubmittedAt).toLocaleDateString("en-IN")
        : "—",
      c.sanctioned || 0,
      c.roi ? `${c.roi}%` : "—",
      c.tenure || "—",
      c.disbursed || 0,
      c.commission || 0,
      docStatus,
      isHandedOver,
      c.lenderRejectionReason || "—",
      c.updated || "—",
    ];
  });

  const filename = `${filenamePrefix}_${getExportDateSuffix()}`;
  downloadCsv(filename, headers, rows);
}

/**
 * 2. Export Disbursements & Payouts to Excel
 */
export function exportDisbursementsToExcel(
  cases: DemoCase[],
  filenamePrefix: string = "disbursements_payouts"
) {
  if (!cases || cases.length === 0) {
    toast.error("No disbursement cases to export.");
    return;
  }

  const headers = [
    "Case ID",
    "Student Name",
    "Contact Phone",
    "Allocated Lender",
    "Lender Application Ref No",
    "Sanctioned Amount (INR)",
    "Disbursed Amount (INR)",
    "Interest Rate (ROI % p.a.)",
    "Tenure (Months)",
    "Commission Booked (INR)",
    "Current Stage / Status",
    "Destination Country",
    "Target University",
  ];

  const rows = cases.map((c) => [
    c.id,
    c.student,
    c.phone,
    c.lender && c.lender !== "Not assigned" ? c.lender : "—",
    c.lenderApplicationNo || "—",
    c.sanctioned || c.amount || 0,
    c.disbursed || c.sanctioned || 0,
    c.roi ? `${c.roi}%` : "—",
    c.tenure || "—",
    c.commission || 0,
    c.stage,
    c.country,
    c.university,
  ]);

  const filename = `${filenamePrefix}_${getExportDateSuffix()}`;
  downloadCsv(filename, headers, rows);
}

/**
 * 3. Export Lender Partners Performance to Excel
 */
export function exportLendersToExcel(
  lenders: {
    name: string;
    type: string;
    live: number;
    sanctionRate: number;
    avgTat: string;
    payout: string;
  }[],
  filenamePrefix: string = "lender_partners_performance"
) {
  if (!lenders || lenders.length === 0) {
    toast.error("No lender data to export.");
    return;
  }

  const headers = [
    "Lender Partner Name",
    "Institution Type",
    "Active Live Files",
    "Sanction Rate (%)",
    "Average TAT",
    "Commission / Payout Rate",
  ];

  const rows = lenders.map((l) => [
    l.name,
    l.type,
    l.live,
    `${l.sanctionRate}%`,
    l.avgTat,
    l.payout,
  ]);

  const filename = `${filenamePrefix}_${getExportDateSuffix()}`;
  downloadCsv(filename, headers, rows);
}

/**
 * 4. Export Reports & Analytics to Excel
 */
export function exportReportsToExcel(
  funnel: { stage: string; count: number }[],
  byCountry: Record<string, number>,
  byOwner: Record<string, number>,
  filenamePrefix: string = "pipeline_analytics_report"
) {
  const headers = ["Metric Category", "Dimension / Item", "Volume / Count", "Notes"];

  const rows: (string | number)[][] = [];

  // Funnel section
  funnel.forEach((f) => {
    rows.push(["Sales Pipeline Stage", f.stage, f.count, "Active Deal Count"]);
  });

  // Country breakdown
  Object.entries(byCountry).forEach(([country, count]) => {
    rows.push(["Destination Mix", country, count, "Student Destination"]);
  });

  // Owner breakdown
  Object.entries(byOwner).forEach(([owner, count]) => {
    rows.push(["Case Ownership", owner, count, "Assigned Loan Officer"]);
  });

  const filename = `${filenamePrefix}_${getExportDateSuffix()}`;
  downloadCsv(filename, headers, rows);
}

/**
 * 5. Export a Single Student Case File to Excel
 */
export function exportCaseDetailToExcel(record: DemoCase) {
  const headers = ["Section", "Field", "Value"];

  const rows: (string | number)[][] = [
    ["Applicant", "Case ID", record.id],
    ["Applicant", "Student Name", record.student],
    ["Applicant", "Phone", record.phone],
    ["Applicant", "Email", record.email],
    ["Applicant", "Destination Country", record.country],
    ["Applicant", "Course", record.course],
    ["Applicant", "University", record.university],
    ["Applicant", "Intake", record.intake],
    ["Sourcing", "Referral Source", record.source || "—"],
    ["Sourcing", "Source Partner Name", record.sourceName || "—"],
    ["Financials", "Requested Loan Amount (INR)", record.amount],
    ["Financials", "Sanctioned Amount (INR)", record.sanctioned || "—"],
    ["Financials", "Interest Rate (ROI)", record.roi ? `${record.roi}%` : "—"],
    ["Financials", "Tenure (Months)", record.tenure || "—"],
    ["Financials", "Disbursed Amount (INR)", record.disbursed || "—"],
    ["Financials", "Commission (INR)", record.commission || "—"],
    ["Lender", "Assigned Lender", record.lender || "—"],
    ["Lender", "Lender Status", record.lenderStatus || "—"],
    ["Lender", "Lender App Reference", record.lenderApplicationNo || "—"],
    ["Lender", "Submission Date", record.lenderSubmittedAt || "—"],
    ["Lender", "Decline Reason", record.lenderRejectionReason || "—"],
    ["Co-Applicant", "Name", record.coApplicant.name],
    ["Co-Applicant", "Relation", record.coApplicant.relation],
    ["Co-Applicant", "Income (Monthly INR)", record.coApplicant.monthlyIncome],
    ["Co-Applicant", "Obligations (Monthly INR)", record.coApplicant.obligations],
    ["Co-Applicant", "Employment", `${record.coApplicant.employment} (${record.coApplicant.organisation})`],
    ["Status", "Current Stage", record.stage],
    ["Status", "Workflow Interest", record.interestStatus || "—"],
  ];

  // Document checklist
  (record.workflowDocuments || []).forEach((doc) => {
    rows.push(["Documents", doc.name, `${doc.collectionStatus} (${doc.verificationStatus})`]);
  });

  // Submission History
  (record.lenderSubmissions || []).forEach((sub, i) => {
    rows.push([
      `Submission #${i + 1}`,
      sub.lender,
      `Status: ${sub.status} | Ref: ${sub.applicationNo || "—"} | ${sub.notes || ""}`,
    ]);
  });

  const filename = `case_${record.id}_${record.student.replace(/\s+/g, "_")}_${getExportDateSuffix()}`;
  downloadCsv(filename, headers, rows);
}
