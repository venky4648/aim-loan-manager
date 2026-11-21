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
  if (stage === "Rejected") return "destructive" as const;
  if (stage === "Disbursed" || stage === "Joined College" || stage === "Sanctioned") return "success" as const;
  if (stage === "Sent to Lender" || stage === "Logged In") return "info" as const;
  return "muted" as const;
};
