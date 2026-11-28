export type CaseStage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Docs Collected"
  | "Sent to Lender"
  | "Logged In"
  | "Sanctioned"
  | "Disbursed"
  | "Joined College"
  | "Returned for Corrections"
  | "Rejected";

export const STAGES: CaseStage[] = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Docs Collected",
  "Sent to Lender",
  "Logged In",
  "Sanctioned",
  "Disbursed",
  "Joined College",
  "Returned for Corrections",
  "Rejected",
];

export const REFERRAL_SOURCES = [
  "Customer reference",
  "Employee referral",
  "DSA/Connector",
  "Walk in",
  "Digital marketing",
  "Offline Marketing",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCES)[number];

import {
  InterestStatus,
  ContactStatus,
  FollowUpRecord,
  CaseDocumentItem,
  HandoverInfo,
  ActivityItem,
  LenderStatus,
  LenderSubmissionRecord,
} from "./sales-workflow-types";

export type DemoCase = {
  id: string;
  student: string;
  phone: string;
  alternativePhone?: string | undefined;
  email: string;
  country: string;
  planningCountry?: string | undefined;
  studyCountry?: string | undefined;
  course: string;
  intake: string;
  university: string;
  loanType: "Secured" | "Unsecured";
  amount: number;
  loanRequirement?: string | undefined;
  stage: CaseStage;
  lender: string;
  owner: string;
  source: string;
  sourceName?: string | undefined;
  updated: string;
  roi?: number | undefined;
  tenure?: number | undefined;
  sanctioned?: number | undefined;
  disbursed?: number | undefined;
  commission?: number | undefined;
  commissionReceived?: boolean | undefined;
  coApplicant: {
    name: string;
    relation: string;
    contact?: string | undefined;
    phone?: string | undefined;
    alternativePhone?: string | undefined;
    email?: string | undefined;
    employment: string;
    organisation: string;
    workplace?: string | undefined;
    vintage?: string | undefined;
    monthlyIncome: number;
    annualIncome?: number | undefined;
    obligations: number;
    city: string;
    currentAddress?: string | undefined;
    permanentAddress?: string | undefined;
  };
  collateral?: {
    hasCollateral?: "Yes" | "No" | "" | undefined;
    type: string;
    location: string;
    marketValue: number;
    owner: string;
  } | undefined;
  academics: {
    tenth: string;
    twelfth: string;
    graduation: string;
    tests: string;
    greScore?: string | undefined;
    gmatScore?: string | undefined;
    satScore?: string | undefined;
    ieltsScore?: string | undefined;
    toeflScore?: string | undefined;
    duolingoScore?: string | undefined;
    experience: string;
  };
  guarantor?: {
    hasGuarantor?: "Yes" | "No" | undefined;
    name: string;
    relation: string;
    contact?: string | undefined;
    phone: string;
    alternativePhone?: string | undefined;
    email: string;
    employment: string;
    organisation: string;
    workplace?: string | undefined;
    vintage?: string | undefined;
    monthlyIncome: number;
    annualIncome?: number | undefined;
    obligations?: number | undefined;
    address: string;
    currentAddress?: string | undefined;
    permanentAddress?: string | undefined;
  } | undefined;
  studentDocuments?: { id: string; name: string; type: string; fileName?: string | undefined; fileUrl?: string | undefined; mimeType?: string | undefined; size?: number | undefined; status: "Pending" | "Uploaded"; collectionStatus?: "Not Received" | "Partially Received" | "Received" | undefined; category?: string | undefined; dynamic?: boolean | undefined }[] | undefined;
  parentDocuments?: { id: string; name: string; type: string; fileName?: string | undefined; fileUrl?: string | undefined; mimeType?: string | undefined; size?: number | undefined; status: "Pending" | "Uploaded"; collectionStatus?: "Not Received" | "Partially Received" | "Received" | undefined; category?: string | undefined; dynamic?: boolean | undefined }[] | undefined;
  propertyDocuments?: { id: string; name: string; type: string; fileName?: string | undefined; fileUrl?: string | undefined; mimeType?: string | undefined; size?: number | undefined; status: "Pending" | "Uploaded"; collectionStatus?: "Not Received" | "Partially Received" | "Received" | undefined; category?: string | undefined; dynamic?: boolean | undefined }[] | undefined;
  studentDocumentsStatus?: "Not Received" | "Partially Received" | "Received" | undefined;
  parentDocumentsStatus?: "Not Received" | "Partially Received" | "Received" | undefined;
  propertyDocumentsStatus?: "Not Received" | "Partially Received" | "Received" | undefined;
  documentStatusesUpdatedAt?: string | undefined;
  documentStatusesUpdatedBy?: string | undefined;
  documents: { name: string; status: "Received" | "Pending" | "Verified" }[];
  timeline: { date: string; label: string; by: string }[];
  // Extended Sales Workflow Fields
  contactStatus?: ContactStatus | undefined;
  interestStatus?: InterestStatus | undefined;
  notInterestedReason?: string | undefined;
  lenderStatus?: LenderStatus | undefined;
  lenderApplicationNo?: string | undefined;
  lenderSubmittedAt?: string | undefined;
  lenderSubmittedBy?: string | undefined;
  lenderLocked?: boolean | undefined;
  lenderRejectionReason?: string | undefined;
  lenderSubmissions?: LenderSubmissionRecord[] | undefined;
  followUps?: FollowUpRecord[] | undefined;
  workflowDocuments?: CaseDocumentItem[] | undefined;
  handover?: HandoverInfo | undefined;
  returnToSales?: {
    isReturned?: boolean | undefined;
    returnedAt?: string | undefined;
    returnedBy?: string | undefined;
    returnReason?: string | undefined;
  } | undefined;
  activities?: ActivityItem[] | undefined;
};

export const CASES: DemoCase[] = [
  {
    id: "NL-1041",
    student: "Sai Charan Reddy",
    phone: "+91 98490 21188",
    email: "saicharan.r@gmail.com",
    country: "USA",
    course: "MS Computer Science",
    intake: "Fall 2026",
    university: "Arizona State University",
    loanType: "Unsecured",
    amount: 4200000,
    stage: "Sanctioned",
    lender: "Avanse Financial Services",
    owner: "Praveen K",
    source: "Customer reference",
    sourceName: "Rajesh Reddy (Alumni)",
    updated: "2 hours ago",
    roi: 11.25,
    tenure: 120,
    sanctioned: 4000000,
    commission: 60000,
    commissionReceived: false,
    coApplicant: {
      name: "Ramesh Reddy",
      relation: "Father",
      employment: "Salaried",
      organisation: "BHEL Ramachandrapuram",
      monthlyIncome: 96000,
      obligations: 18500,
      city: "Hyderabad",
    },
    academics: {
      tenth: "CBSE 9.4 CGPA",
      twelfth: "TS Board 94.2%",
      graduation: "B.Tech CSE — 8.6 CGPA, JNTUH",
      tests: "GRE 318 · IELTS 7.5",
      experience: "1.5 years — Infosys",
    },
    documents: [
      { name: "Aadhaar & PAN", status: "Verified" },
      { name: "Admission letter (I-20)", status: "Verified" },
      { name: "Academic marksheets", status: "Verified" },
      { name: "Co-applicant salary slips", status: "Received" },
      { name: "Bank statement (6 months)", status: "Pending" },
    ],
    timeline: [
      { date: "12 Aug", label: "Lead captured from referral", by: "Tele-caller — Divya" },
      { date: "14 Aug", label: "Qualified and assigned", by: "Praveen K" },
      { date: "19 Aug", label: "File submitted to Avanse", by: "Processing — Nikhil" },
      { date: "27 Aug", label: "Sanction letter received — INR 40,00,000 @ 11.25%", by: "Avanse" },
    ],
  },
  {
    id: "NL-1038",
    student: "Aparna Menon",
    phone: "+91 90000 44127",
    email: "aparna.menon@outlook.com",
    country: "UK",
    course: "MBA",
    intake: "Sept 2026",
    university: "Warwick Business School",
    loanType: "Secured",
    amount: 5500000,
    stage: "Disbursed",
    lender: "HDFC Credila",
    owner: "Shruti M",
    source: "Digital marketing",
    sourceName: "Google Search Ads",
    updated: "Yesterday",
    roi: 10.5,
    tenure: 144,
    sanctioned: 5500000,
    disbursed: 2750000,
    commission: 82500,
    commissionReceived: true,
    coApplicant: {
      name: "Suresh Menon",
      relation: "Father",
      employment: "Self-employed",
      organisation: "Menon Traders",
      monthlyIncome: 175000,
      obligations: 42000,
      city: "Secunderabad",
    },
    collateral: {
      type: "Independent house",
      location: "Kompally, Hyderabad",
      marketValue: 12000000,
      owner: "Suresh Menon",
    },
    academics: {
      tenth: "ICSE 92%",
      twelfth: "ISC 89%",
      graduation: "B.Com (Hons) — 8.1 CGPA, Osmania",
      tests: "GMAT 690 · IELTS 7.0",
      experience: "4 years — Deloitte",
    },
    documents: [
      { name: "Aadhaar & PAN", status: "Verified" },
      { name: "Offer letter", status: "Verified" },
      { name: "Property documents", status: "Verified" },
      { name: "ITR — 3 years", status: "Verified" },
      { name: "Valuation report", status: "Received" },
    ],
    timeline: [
      { date: "02 Jul", label: "Lead captured from website", by: "System" },
      { date: "08 Jul", label: "Secured file logged with Credila", by: "Shruti M" },
      { date: "26 Jul", label: "Sanctioned INR 55,00,000 @ 10.50%", by: "HDFC Credila" },
      { date: "21 Aug", label: "Tranche 1 disbursed to university", by: "HDFC Credila" },
    ],
  },
  {
    id: "NL-1052",
    student: "Mohammed Arshad",
    phone: "+91 91234 55780",
    email: "arshad.m@gmail.com",
    country: "Canada",
    course: "PG Diploma — Data Analytics",
    intake: "Jan 2027",
    university: "Seneca College",
    loanType: "Unsecured",
    amount: 2800000,
    stage: "Sent to Lender",
    lender: "Auxilo",
    owner: "Praveen K",
    source: "Employee referral",
    sourceName: "Divya (Tele-calling Team)",
    updated: "3 days ago",
    coApplicant: {
      name: "Fatima Begum",
      relation: "Mother",
      employment: "Salaried",
      organisation: "Government Junior College",
      monthlyIncome: 62000,
      obligations: 9500,
      city: "Hyderabad",
    },
    academics: {
      tenth: "TS Board 88%",
      twelfth: "TS Board 82%",
      graduation: "B.Sc Statistics — 7.4 CGPA",
      tests: "IELTS 6.5",
      experience: "Fresher",
    },
    documents: [
      { name: "Aadhaar & PAN", status: "Received" },
      { name: "Admission letter", status: "Pending" },
      { name: "Co-applicant income proof", status: "Received" },
    ],
    timeline: [
      { date: "28 Aug", label: "Lead captured by tele-caller", by: "Divya" },
      { date: "01 Sep", label: "Profile and documents collected", by: "Nikhil" },
      { date: "08 Sep", label: "Submitted to Auxilo", by: "Praveen K" },
    ],
  },
  {
    id: "NL-1049",
    student: "Nikita Sharma",
    phone: "+91 99590 22014",
    email: "nikita.sharma@gmail.com",
    country: "Germany",
    course: "MS Mechanical Engineering",
    intake: "Summer 2027",
    university: "TU Munich",
    loanType: "Secured",
    amount: 2000000,
    stage: "Qualified",
    lender: "Not assigned",
    owner: "Shruti M",
    source: "Digital marketing",
    sourceName: "Instagram Campaign",
    updated: "4 days ago",
    coApplicant: {
      name: "Anil Sharma",
      relation: "Father",
      employment: "Salaried",
      organisation: "Dr. Reddy's Laboratories",
      monthlyIncome: 118000,
      obligations: 31000,
      city: "Hyderabad",
    },
    collateral: {
      type: "Flat (3BHK)",
      location: "Gachibowli, Hyderabad",
      marketValue: 9500000,
      owner: "Anil Sharma",
    },
    academics: {
      tenth: "CBSE 90%",
      twelfth: "CBSE 88%",
      graduation: "B.E Mechanical — 8.2 CGPA",
      tests: "IELTS 7.0 · GRE 310",
      experience: "2 years — Tata Motors",
    },
    documents: [
      { name: "Aadhaar & PAN", status: "Received" },
      { name: "Blocked account proof", status: "Pending" },
      { name: "Property documents", status: "Pending" },
    ],
    timeline: [
      { date: "30 Aug", label: "Lead captured from campaign", by: "System" },
      { date: "02 Sep", label: "Qualified — collateral available", by: "Shruti M" },
    ],
  },
  {
    id: "NL-1055",
    student: "Harshith Varma",
    phone: "+91 70133 90021",
    email: "harshith.varma@gmail.com",
    country: "Australia",
    course: "Master of IT",
    intake: "Feb 2027",
    university: "University of Melbourne",
    loanType: "Unsecured",
    amount: 3600000,
    stage: "New Lead",
    lender: "Not assigned",
    owner: "Unassigned",
    source: "DSA/Connector",
    sourceName: "Warangal Edu Partner",
    updated: "Today",
    coApplicant: {
      name: "Vijaya Varma",
      relation: "Mother",
      employment: "Self-employed",
      organisation: "Varma Textiles",
      monthlyIncome: 84000,
      obligations: 12000,
      city: "Warangal",
    },
    academics: {
      tenth: "TS Board 91%",
      twelfth: "TS Board 86%",
      graduation: "B.Tech IT — 7.9 CGPA",
      tests: "PTE 68",
      experience: "Fresher",
    },
    documents: [{ name: "Aadhaar & PAN", status: "Pending" }],
    timeline: [{ date: "11 Sep", label: "Lead received from channel partner", by: "System" }],
  },
  {
    id: "NL-1029",
    student: "Divya Teja",
    phone: "+91 98851 77302",
    email: "divya.teja@gmail.com",
    country: "Ireland",
    course: "MSc Business Analytics",
    intake: "Sept 2026",
    university: "University College Dublin",
    loanType: "Unsecured",
    amount: 3000000,
    stage: "Rejected",
    lender: "ICICI Bank",
    owner: "Praveen K",
    source: "Walk in",
    sourceName: "Hyderabad Main Branch",
    updated: "1 week ago",
    coApplicant: {
      name: "Srinivas Teja",
      relation: "Father",
      employment: "Self-employed",
      organisation: "Teja Auto Works",
      monthlyIncome: 48000,
      obligations: 26000,
      city: "Hyderabad",
    },
    academics: {
      tenth: "TS Board 84%",
      twelfth: "TS Board 79%",
      graduation: "BBA — 6.8 CGPA",
      tests: "IELTS 6.5",
      experience: "Fresher",
    },
    documents: [
      { name: "Aadhaar & PAN", status: "Verified" },
      { name: "ITR — 2 years", status: "Received" },
    ],
    timeline: [
      { date: "18 Aug", label: "Submitted to ICICI Bank", by: "Praveen K" },
      { date: "04 Sep", label: "Rejected — co-applicant obligations high", by: "ICICI Bank" },
      { date: "05 Sep", label: "Marked for re-submission to Auxilo", by: "Praveen K" },
    ],
  },
];

export const LENDERS = [
  { name: "HDFC Credila", type: "NBFC", live: 14, sanctionRate: 78, avgTat: "9 days", payout: "1.5%" },
  { name: "Avanse Financial Services", type: "NBFC", live: 11, sanctionRate: 72, avgTat: "8 days", payout: "1.5%" },
  { name: "Auxilo", type: "NBFC", live: 8, sanctionRate: 69, avgTat: "7 days", payout: "1.6%" },
  { name: "ICICI Bank", type: "Bank", live: 6, sanctionRate: 54, avgTat: "14 days", payout: "1.0%" },
  { name: "State Bank of India", type: "Bank", live: 5, sanctionRate: 48, avgTat: "21 days", payout: "0.8%" },
  { name: "IDFC First Bank", type: "Bank", live: 4, sanctionRate: 61, avgTat: "12 days", payout: "1.1%" },
];

export const FUNNEL = [
  { stage: "Leads captured", count: 148 },
  { stage: "Qualified", count: 96 },
  { stage: "Sent to lender", count: 61 },
  { stage: "Sanctioned", count: 38 },
  { stage: "Disbursed", count: 24 },
];

export const MONTHLY = [
  { month: "Apr", sanctioned: 42, disbursed: 28 },
  { month: "May", sanctioned: 55, disbursed: 34 },
  { month: "Jun", sanctioned: 61, disbursed: 41 },
  { month: "Jul", sanctioned: 74, disbursed: 52 },
  { month: "Aug", sanctioned: 88, disbursed: 63 },
  { month: "Sep", sanctioned: 96, disbursed: 71 },
];

export const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const formatLakh = (value: number) => {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  return `₹${(value / 100000).toFixed(1)} L`;
};

export const stageTone = (stage: CaseStage) => {
  if (stage === "Rejected" || stage === "Returned for Corrections") return "destructive" as const;
  if (stage === "Disbursed" || stage === "Joined College" || stage === "Sanctioned") return "success" as const;
  if (stage === "Sent to Lender" || stage === "Logged In") return "info" as const;
  return "muted" as const;
};

/* =========================================================================
   LOAN PROCESSING MODULE TYPES & DATA
   ========================================================================= */

export type LoanApplicationStatus =
  | "Draft"
  | "Ready to Submit"
  | "Submitted to Bank"
  | "Under Review"
  | "Additional Documents Required"
  | "Query Raised"
  | "Conditionally Approved"
  | "Sanctioned"
  | "Rejected"
  | "Agreement Signed"
  | "Disbursed"
  | "Withdrawn"
  | "Expired"
  | "Closed";

export interface BankQueryItem {
  id: string;
  queryDescription: string;
  queryDate: string;
  deadline?: string;
  response?: string;
  responseDate?: string;
  status: "Open" | "Responded" | "Resolved";
  supportingDocuments?: string[];
  assignedRM?: string;
}

export interface PreDisbursementCondition {
  id: string;
  description: string;
  requiredDoc?: string;
  status: "Pending" | "Submitted" | "Under Verification" | "Verified" | "Rejected" | "Not Applicable";
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  remarks?: string;
  documentUrl?: string;
}

export interface SanctionRevisionItem {
  previousAmount: number;
  newAmount: number;
  revisedAt: string;
  revisedBy: string;
  reason: string;
}

export interface SanctionDetailsInfo {
  sanctionedAmount?: number;
  interestRate?: number;
  interestType?: "Fixed" | "Floating";
  tenureMonths?: number;
  moratoriumMonths?: number;
  processingFee?: number;
  otherCharges?: number;
  sanctionDate?: string;
  validityDate?: string;
  bankRefNo?: string;
  sanctionLetterUrl?: string;
  specialConditions?: string;
  rmRemarks?: string;
  revisionHistory?: SanctionRevisionItem[];
}

export interface StudentAcceptanceInfo {
  status: "Awaiting Student Response" | "Accepted" | "Rejected" | "Clarification Requested";
  respondedAt?: string;
  remarks?: string;
  documentUrl?: string;
}

export interface AgreementTrackingInfo {
  status: "Draft" | "Sent to Student" | "Student Signed" | "Co-applicant Signed" | "Stamp Duty Done" | "Executed" | "Uploaded";
  executedAt?: string;
  documentUrl?: string;
  notes?: string;
  stampDutyPaid?: boolean;
  nachSubmitted?: boolean;
}

export interface StatusHistoryItem {
  previousStatus: string;
  newStatus: string;
  updatedBy: string;
  updatedAt: string;
  remarks?: string;
}

export interface SelectedDocumentItem {
  docId: string;
  name: string;
  category?: string;
  fileUrl?: string;
  isRequired?: boolean;
}

export interface LoanApplicationRecord {
  id: string;
  applicationId: string;
  leadId: string;
  studentName: string;
  studentPhone?: string;
  studentEmail?: string;
  country?: string;
  university?: string;
  course?: string;
  programType?: string;
  loanProduct?: string;
  remarks?: string;
  lender: string;
  requestedAmount: number;
  assignedRM: string;
  applicationStatus: LoanApplicationStatus;
  lenderSpecificData?: Record<string, any>;
  selectedDocuments?: SelectedDocumentItem[];
  submissionDetails?: {
    channel: "Bank Portal" | "Email" | "Branch Submission" | "Bank Representative" | "API Integration" | "Other";
    referenceNumber: string;
    submittedAt?: string;
    submittedBy?: string;
    acknowledgementUrl?: string;
    notes?: string;
  };
  bankQueries?: BankQueryItem[];
  sanctionDetails?: SanctionDetailsInfo;
  studentAcceptance?: StudentAcceptanceInfo;
  agreementDetails?: AgreementTrackingInfo;
  conditions?: PreDisbursementCondition[];
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DisbursementTranche {
  id: string;
  disbursementId: string;
  loanApplicationId: string;
  leadId: string;
  studentName: string;
  lender: string;
  trancheNumber: number;
  purpose: "Tuition Fees" | "Living Expenses" | "Travel / Insurance" | "University Housing" | "Other";
  beneficiaryType: "University Direct" | "Student Account" | "Forex Card Vendor" | "Escrow Account" | "Other";
  beneficiaryName: string;
  requestedAmount: number;
  approvedAmount: number;
  actualDisbursedAmount: number;
  status: "Planned" | "Request Submitted" | "Bank Processing" | "Disbursed" | "Failed" | "Cancelled";
  paymentDate?: string;
  transactionReference?: string;
  supportingDocuments?: { title: string; url: string; uploadedAt?: string }[];
  remarks?: string;
  createdBy: string;
  updatedBy?: string;
  createdAt: string;
}

export interface LoanProcessingSummary {
  totalApplications: number;
  readyToSubmit: number;
  submittedToBank: number;
  underReview: number;
  bankQueries: number;
  sanctioned: number;
  rejected: number;
  agreementSigned?: number;
  disbursed?: number;
  totalSanctionedAmount: number;
  totalDisbursedAmount: number;
}

export const INITIAL_LOAN_APPLICATIONS: LoanApplicationRecord[] = [
  {
    id: "app_1",
    applicationId: "APP-HDF-982141",
    leadId: "NL-1048",
    studentName: "Ananya Sharma",
    studentPhone: "+91 98490 12345",
    studentEmail: "ananya.s@gmail.com",
    country: "USA",
    university: "Columbia University",
    course: "MS in Data Science",
    lender: "HDFC Credila",
    requestedAmount: 4500000,
    assignedRM: "Nikhil V (Lead Processing)",
    applicationStatus: "Sanctioned",
    submissionDetails: {
      channel: "Bank Portal",
      referenceNumber: "HDFC-PORTAL-81029",
      submittedAt: "2026-11-20T10:30:00.000Z",
      submittedBy: "Nikhil V",
      notes: "Submitted via HDFC Credila partner portal with complete financial bundle.",
    },
    sanctionDetails: {
      sanctionedAmount: 4200000,
      interestRate: 10.75,
      interestType: "Floating",
      tenureMonths: 144,
      moratoriumMonths: 6,
      processingFee: 15000,
      bankRefNo: "SAN-HDFC-9921",
      sanctionDate: "2026-11-24T14:15:00.000Z",
      validityDate: "2027-05-24T14:15:00.000Z",
      rmRemarks: "Sanctioned under prime university unsecured education scheme.",
      revisionHistory: [
        {
          previousAmount: 3800000,
          newAmount: 4200000,
          revisedAt: "2026-11-25T11:00:00.000Z",
          revisedBy: "Credit Committee",
          reason: "Increased based on co-applicant revised ITR.",
        },
      ],
    },
    studentAcceptance: {
      status: "Accepted",
      respondedAt: "2026-11-25T16:00:00.000Z",
      remarks: "Student confirmed acceptance of 10.75% ROI offer.",
    },
    agreementDetails: {
      status: "Executed",
      executedAt: "2026-11-26T12:00:00.000Z",
      notes: "Loan agreement executed with electronic stamping.",
    },
    conditions: [
      {
        id: "cp_1",
        description: "Official University I-20 Form Copy",
        requiredDoc: "I-20 Form",
        status: "Verified",
        submittedAt: "2026-11-22T10:00:00.000Z",
        verifiedAt: "2026-11-23T11:00:00.000Z",
        verifiedBy: "Nikhil V",
      },
      {
        id: "cp_2",
        description: "US F-1 Visa Stamp Copy",
        requiredDoc: "Passport Visa Page",
        status: "Pending",
        remarks: "Visa interview scheduled for next week.",
      },
      {
        id: "cp_3",
        description: "Margin Money Proof (5% of First Semester)",
        requiredDoc: "Student Bank Statement",
        status: "Verified",
        verifiedAt: "2026-11-26T15:00:00.000Z",
      },
    ],
    createdAt: "2026-11-18T09:00:00.000Z",
    updatedAt: "2026-11-26T15:00:00.000Z",
  },
  {
    id: "app_2",
    applicationId: "APP-AUX-471092",
    leadId: "NL-1048",
    studentName: "Ananya Sharma",
    studentPhone: "+91 98490 12345",
    studentEmail: "ananya.s@gmail.com",
    country: "USA",
    university: "Columbia University",
    course: "MS in Data Science",
    lender: "Auxilo",
    requestedAmount: 4000000,
    assignedRM: "Nikhil V (Lead Processing)",
    applicationStatus: "Under Review",
    submissionDetails: {
      channel: "Email",
      referenceNumber: "AUX-EMAIL-3312",
      submittedAt: "2026-11-21T11:00:00.000Z",
      submittedBy: "Nikhil V",
      notes: "Under review with Auxilo south credit underwriting desk.",
    },
    bankQueries: [
      {
        id: "qry_1",
        queryDescription: "Co-applicant company seal required on March 2026 payslip.",
        queryDate: "2026-11-23T15:30:00.000Z",
        status: "Resolved",
        response: "Signed and stamped payslip re-uploaded.",
        responseDate: "2026-11-24T10:00:00.000Z",
      },
    ],
    createdAt: "2026-11-19T10:00:00.000Z",
    updatedAt: "2026-11-24T10:00:00.000Z",
  },
  {
    id: "app_3",
    applicationId: "APP-AVN-582910",
    leadId: "NL-1049",
    studentName: "Rohan Varma",
    studentPhone: "+91 99887 76655",
    studentEmail: "rohan.v@outlook.com",
    country: "UK",
    university: "Imperial College London",
    course: "MSc Finance",
    lender: "Avanse Financial Services",
    requestedAmount: 3800000,
    assignedRM: "Praveen K",
    applicationStatus: "Ready to Submit",
    selectedDocuments: [
      { docId: "d1", name: "Aadhaar & PAN", isRequired: true },
      { docId: "d2", name: "Imperial Offer Letter", isRequired: true },
      { docId: "d3", name: "Co-applicant ITR (3 Years)", isRequired: true },
    ],
    createdAt: "2026-11-25T14:00:00.000Z",
    updatedAt: "2026-11-25T16:00:00.000Z",
  },
  {
    id: "app_4",
    applicationId: "APP-SBI-319082",
    leadId: "NL-1049",
    studentName: "Rohan Varma",
    studentPhone: "+91 99887 76655",
    studentEmail: "rohan.v@outlook.com",
    country: "UK",
    university: "Imperial College London",
    course: "MSc Finance",
    lender: "State Bank of India (SBI)",
    requestedAmount: 3500000,
    assignedRM: "Praveen K",
    applicationStatus: "Draft",
    createdAt: "2026-11-26T09:30:00.000Z",
    updatedAt: "2026-11-26T09:30:00.000Z",
  },
  {
    id: "app_5",
    applicationId: "APP-INC-609124",
    leadId: "NL-1051",
    studentName: "Sneha Patel",
    studentPhone: "+91 97654 32100",
    studentEmail: "sneha.p@gmail.com",
    country: "Canada",
    university: "University of Toronto",
    course: "MBA",
    lender: "InCred",
    requestedAmount: 5000000,
    assignedRM: "Nikhil V (Lead Processing)",
    applicationStatus: "Query Raised",
    submissionDetails: {
      channel: "Bank Portal",
      referenceNumber: "INC-99410",
      submittedAt: "2026-11-22T12:00:00.000Z",
      submittedBy: "Nikhil V",
    },
    bankQueries: [
      {
        id: "qry_2",
        queryDescription: "Property valuation report required for second co-applicant guarantee.",
        queryDate: "2026-11-26T16:00:00.000Z",
        deadline: "2026-12-02T18:00:00.000Z",
        status: "Open",
      },
    ],
    createdAt: "2026-11-20T11:00:00.000Z",
    updatedAt: "2026-11-26T16:00:00.000Z",
  },
];

export const INITIAL_DISBURSEMENTS: DisbursementTranche[] = [
  {
    id: "disb_1",
    disbursementId: "DISB-88102",
    loanApplicationId: "APP-HDF-982141",
    leadId: "NL-1048",
    studentName: "Ananya Sharma",
    lender: "HDFC Credila",
    trancheNumber: 1,
    purpose: "Tuition Fees",
    beneficiaryType: "University Direct",
    beneficiaryName: "Columbia University Bursar Office",
    requestedAmount: 2200000,
    approvedAmount: 2200000,
    actualDisbursedAmount: 2200000,
    status: "Disbursed",
    paymentDate: "2026-11-26T16:30:00.000Z",
    transactionReference: "UTR-HDFC-992104821",
    remarks: "Direct wire transfer to Columbia University tuition account.",
    createdBy: "Nikhil V",
    createdAt: "2026-11-24T10:00:00.000Z",
  },
  {
    id: "disb_2",
    disbursementId: "DISB-88103",
    loanApplicationId: "APP-HDF-982141",
    leadId: "NL-1048",
    studentName: "Ananya Sharma",
    lender: "HDFC Credila",
    trancheNumber: 2,
    purpose: "Living Expenses",
    beneficiaryType: "Forex Card Vendor",
    beneficiaryName: "Niyo Global Student Forex",
    requestedAmount: 600000,
    approvedAmount: 600000,
    actualDisbursedAmount: 0,
    status: "Bank Processing",
    remarks: "Living expenses tranche for Spring 2027 semester.",
    createdBy: "Nikhil V",
    createdAt: "2026-11-26T11:00:00.000Z",
  },
];

