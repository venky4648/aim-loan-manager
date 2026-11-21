import React, { createContext, useContext, useState, useEffect } from "react";
import { CASES, DemoCase, CaseStage } from "./demo-data";
import {
  InterestStatus,
  ContactStatus,
  FollowUpRecord,
  CaseDocumentItem,
  HandoverInfo,
  ActivityItem,
  DocCollectionStatus,
  calculateDocProgress,
  getEffectiveFollowUpStatus,
  LenderStatus,
  LenderSubmissionRecord,
} from "./sales-workflow-types";
import { toast } from "sonner";
import {
  createLeadApi,
  fetchLeadsApi,
  updateLeadApi,
  createFollowUpApi,
  updateFollowUpApi,
  updateDocumentStatusApi,
  addCustomDocumentApi,
  updateFirstContactApi,
  reactivateLeadApi,
  handoverLeadApi,
  updateLeadLenderApi,
  addCommentApi,
  submitToLenderApi,
  updateLenderDecisionApi,
  rerouteToNewLenderApi,
  uploadLeadDocumentsApi,
} from "./api-client";

const STORAGE_KEY = "normiloans_crm_cases_v3";

function normalizeCase(c: any): DemoCase {
  const defaultDocsList: CaseDocumentItem[] = [
    { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
    { id: "doc_2", name: "Admission letter", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
    { id: "doc_3", name: "Academic marksheets", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
    { id: "doc_4", name: "Co-applicant salary slips / ITR", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
    { id: "doc_5", name: "Bank statement (6 months)", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
  ];

  if (!c || typeof c !== "object") {
    return {
      id: `NL-${Math.floor(1000 + Math.random() * 9000)}`,
      student: "Student Applicant",
      phone: "+91 98000 00000",
      email: "student@example.com",
      country: "USA",
      course: "Master of Science",
      intake: "Fall 2026",
      university: "University Partner",
      loanType: "Unsecured",
      amount: 3500000,
      stage: "New Lead",
      lender: "Not assigned",
      owner: "Praveen K",
      source: "Customer reference",
      sourceName: "",
      updated: "Today",
      contactStatus: "Not Contacted",
      interestStatus: "Not Contacted",
      workflowDocuments: defaultDocsList,
      followUps: [],
      activities: [],
      handover: { isHandedOver: false },
      documents: [],
      timeline: [],
      coApplicant: {
        name: "Co-applicant",
        relation: "Parent",
        employment: "Salaried",
        organisation: "Private Company",
        monthlyIncome: 75000,
        obligations: 10000,
        city: "Hyderabad",
      },
      academics: {
        tenth: "88%",
        twelfth: "85%",
        graduation: "8.0 CGPA",
        tests: "IELTS 7.0",
        experience: "Fresher",
      },
    };
  }

  // Ensure workflowDocuments elements have proper schema
  let normalizedDocs: CaseDocumentItem[] = defaultDocsList;
  if (Array.isArray(c.workflowDocuments) && c.workflowDocuments.length > 0) {
    normalizedDocs = c.workflowDocuments
      .filter((d: any) => d && typeof d === "object")
      .map((d: any, idx: number) => ({
        id: String(d.id || `doc_${idx + 1}`),
        name: String(d.name || `Document ${idx + 1}`),
        required: d.required !== false,
        collectionStatus: (d.collectionStatus === "Received" || d.collectionStatus === "Partially Received" || d.collectionStatus === "Not Received")
          ? d.collectionStatus
          : (d.status === "Received" ? "Received" : "Not Received"),
        verificationStatus: d.verificationStatus || "Pending",
        comments: d.comments || undefined,
        updatedAt: d.updatedAt || undefined,
        updatedBy: d.updatedBy || undefined,
      }));
    if (normalizedDocs.length === 0) normalizedDocs = defaultDocsList;
  }

  // Ensure followUps are valid
  const normalizedFollowUps: FollowUpRecord[] = Array.isArray(c.followUps)
    ? c.followUps
        .filter((f: any) => f && typeof f === "object" && f.id)
        .map((f: any) => ({
          id: String(f.id),
          caseId: String(f.caseId || c.id || ""),
          scheduledAt: f.scheduledAt || new Date().toISOString(),
          reminderNote: f.reminderNote || "Follow up with student",
          status: f.status || "Upcoming",
          createdBy: f.createdBy || "Sales Team",
          createdAt: f.createdAt || new Date().toISOString(),
          completedAt: f.completedAt,
          completionNote: f.completionNote,
          rescheduledAt: f.rescheduledAt,
          rescheduleReason: f.rescheduleReason,
          cancelledAt: f.cancelledAt,
          cancellationReason: f.cancellationReason,
        }))
    : [];

  const normalizedActivities: ActivityItem[] = Array.isArray(c.activities)
    ? c.activities
        .filter((a: any) => a && typeof a === "object" && a.id)
        .map((a: any) => ({
          id: String(a.id),
          caseId: String(a.caseId || c.id || ""),
          type: a.type || "system",
          description: a.description || "Activity recorded",
          comment: a.comment,
          previousValue: a.previousValue,
          newValue: a.newValue,
          updatedBy: a.updatedBy || "System",
          timestamp: a.timestamp || new Date().toISOString(),
        }))
    : [];

  return {
    ...c,
    id: String(c.id || `NL-${Math.floor(1000 + Math.random() * 9000)}`),
    student: String(c.student || "Student Applicant"),
    phone: String(c.phone || "+91 98000 00000"),
    email: String(c.email || "student@example.com"),
    country: String(c.country || "USA"),
    course: String(c.course || "Master of Science"),
    intake: String(c.intake || "Fall 2026"),
    university: String(c.university || "University Partner"),
    loanType: c.loanType === "Secured" ? "Secured" : "Unsecured",
    amount: typeof c.amount === "number" && !isNaN(c.amount) ? c.amount : 3500000,
    stage: c.stage || "New Lead",
    lender: String(c.lender || "Not assigned"),
    lenderStatus: c.lenderStatus || (c.stage === "Sanctioned" ? "Sanctioned" : c.stage === "Rejected" ? "Rejected" : c.lender && c.lender !== "Not assigned" ? "Submitted" : "Not Assigned"),
    lenderApplicationNo: c.lenderApplicationNo || undefined,
    lenderSubmittedAt: c.lenderSubmittedAt || undefined,
    lenderSubmittedBy: c.lenderSubmittedBy || undefined,
    lenderLocked: c.lenderLocked !== undefined ? c.lenderLocked : (c.lender && c.lender !== "Not assigned" && c.stage !== "Rejected"),
    lenderRejectionReason: c.lenderRejectionReason,
    lenderSubmissions: Array.isArray(c.lenderSubmissions) ? c.lenderSubmissions : [],
    owner: String(c.owner || "Praveen K"),
    source: String(c.source || "Customer reference"),
    sourceName: c.sourceName ? String(c.sourceName) : undefined,
    alternativePhone: c.alternativePhone ? String(c.alternativePhone) : undefined,
    planningCountry: c.planningCountry ? String(c.planningCountry) : undefined,
    studyCountry: c.studyCountry ? String(c.studyCountry) : undefined,
    loanRequirement: c.loanRequirement ? String(c.loanRequirement) : undefined,
    updated: String(c.updated || "Today"),
    contactStatus: c.contactStatus || "Not Contacted",
    interestStatus: c.interestStatus || "Not Contacted",
    workflowDocuments: normalizedDocs,
    followUps: normalizedFollowUps,
    activities: normalizedActivities,
    handover: c.handover && typeof c.handover === "object" ? c.handover : { isHandedOver: false },
    documents: Array.isArray(c.documents) ? c.documents : [],
    timeline: Array.isArray(c.timeline) ? c.timeline : [],
    coApplicant: c.coApplicant && typeof c.coApplicant === "object" ? c.coApplicant : {
      name: "Co-applicant",
      relation: "Parent",
      employment: "Salaried",
      organisation: "Private Company",
      monthlyIncome: 75000,
      obligations: 10000,
      city: "Hyderabad",
    },
    academics: c.academics && typeof c.academics === "object" ? c.academics : {
      tenth: "88%",
      twelfth: "85%",
      graduation: "8.0 CGPA",
      tests: "IELTS 7.0",
      experience: "Fresher",
    },
    guarantor: c.guarantor && typeof c.guarantor === "object" ? c.guarantor : undefined,
    studentDocuments: Array.isArray(c.studentDocuments) ? c.studentDocuments : [],
    parentDocuments: Array.isArray(c.parentDocuments) ? c.parentDocuments : [],
    propertyDocuments: Array.isArray(c.propertyDocuments) ? c.propertyDocuments : [],
    studentDocumentsStatus: c.studentDocumentsStatus || "Not Received",
    parentDocumentsStatus: c.parentDocumentsStatus || "Not Received",
    propertyDocumentsStatus: c.propertyDocumentsStatus || "Not Received",
    documentStatusesUpdatedAt: c.documentStatusesUpdatedAt || undefined,
    documentStatusesUpdatedBy: c.documentStatusesUpdatedBy || undefined,
  };
}

interface CasesContextType {
  cases: DemoCase[];
  getCase: (id: string) => DemoCase | undefined;
  updateFirstContact: (
    caseId: string,
    payload: {
      contactStatus: ContactStatus;
      interestStatus: InterestStatus;
      comment?: string | undefined;
      notInterestedReason?: string | undefined;
      authorName: string;
    }
  ) => void;
  updateInterestStatus: (
    caseId: string,
    payload: {
      interestStatus: InterestStatus;
      notInterestedReason?: string | undefined;
      comment?: string | undefined;
      authorName: string;
    }
  ) => void;
  reactivateLead: (
    caseId: string,
    payload: {
      newInterestStatus: InterestStatus;
      comment?: string | undefined;
      authorName: string;
    }
  ) => void;
  scheduleFollowUp: (
    caseId: string,
    payload: {
      scheduledAt: string;
      reminderNote: string;
      authorName: string;
    }
  ) => void;
  completeFollowUp: (
    caseId: string,
    followUpId: string,
    payload: {
      completionNote?: string | undefined;
      authorName: string;
    }
  ) => void;
  rescheduleFollowUp: (
    caseId: string,
    followUpId: string,
    payload: {
      newScheduledAt: string;
      rescheduleReason?: string | undefined;
      authorName: string;
    }
  ) => void;
  cancelFollowUp: (
    caseId: string,
    followUpId: string,
    payload: {
      reason?: string | undefined;
      authorName: string;
    }
  ) => void;
  updateDocumentStatus: (
    caseId: string,
    docName: string,
    payload: {
      collectionStatus: DocCollectionStatus;
      comments?: string | undefined;
      authorName: string;
    }
  ) => void;
  markReadyForProcessing: (
    caseId: string,
    payload: {
      remarks?: string | undefined;
      authorName: string;
    }
  ) => void;
  handoverToProcessing: (
    caseId: string,
    payload: {
      handoverRemarks: string;
      processingOwner?: string | undefined;
      authorName: string;
    }
  ) => void;
  addComment: (
    caseId: string,
    payload: {
      comment: string;
      authorName: string;
    }
  ) => void;
  updateLender: (
    caseId: string,
    payload: {
      newLender: string;
      reason?: string | undefined;
      authorName: string;
    }
  ) => void;
  markLenderRejected: (
    caseId: string,
    payload: {
      rejectionReason: string;
      authorName: string;
    }
  ) => void;
  submitToLender: (
    caseId: string,
    payload: {
      lender: string;
      applicationNo?: string | undefined;
      notes?: string | undefined;
      authorName: string;
    }
  ) => void;
  updateLenderDecision: (
    caseId: string,
    payload: {
      status: LenderStatus;
      rejectionReason?: string | undefined;
      sanctionAmount?: number | undefined;
      roi?: number | undefined;
      tenure?: number | undefined;
      notes?: string | undefined;
      authorName: string;
    }
  ) => void;
  rerouteToNewLender: (
    caseId: string,
    payload: {
      newLender: string;
      applicationNo?: string | undefined;
      reason?: string | undefined;
      authorName: string;
    }
  ) => void;
  updateReferralSource: (
    caseId: string,
    newSource: string,
    sourceName?: string | undefined,
    authorName?: string | undefined
  ) => void;
  updateApplicationDocuments: (
    caseId: string,
    section: "student" | "parent" | "property",
    documents: Array<{
      id: string;
      name: string;
      type: string;
      category?: string | undefined;
      collectionStatus?: "Not Received" | "Partially Received" | "Received" | undefined;
      fileName?: string | undefined;
      fileUrl?: string | undefined;
      mimeType?: string | undefined;
      size?: number | undefined;
      status: "Pending" | "Uploaded";
      file?: File | undefined;
    }>
  ) => Promise<boolean>;
  updateApplicationDetails: (
    caseId: string,
    payload: Record<string, unknown>,
  ) => Promise<boolean>;
  updateDocumentSectionStatus: (
    caseId: string,
    section: "student" | "parent" | "property",
    status: "Not Received" | "Partially Received" | "Received",
    authorName: string,
  ) => Promise<boolean>;
  addCase: (newCase: Partial<DemoCase>) => DemoCase;
  resetCases: () => void;
}

const CasesContext = createContext<CasesContextType | undefined>(undefined);

function getInitialCases(): DemoCase[] {
  const defaultDocs = (names: string[]): CaseDocumentItem[] =>
    names.map((name, idx) => ({
      id: `doc_${idx + 1}`,
      name,
      required: true,
      collectionStatus: "Not Received",
      verificationStatus: "Pending",
    }));

  return [
    {
      ...CASES[0]!, // NL-1041 - Sai Charan Reddy
      contactStatus: "Contacted",
      interestStatus: "Interested",
      workflowDocuments: [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_2", name: "Admission letter (I-20)", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_3", name: "Academic marksheets", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_4", name: "Co-applicant salary slips", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_5", name: "Bank statement (6 months)", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
      ],
      handover: {
        isHandedOver: true,
        handedOverAt: "2026-08-19T11:30:00.000Z",
        handedOverBy: "Praveen K",
        handoverRemarks: "All financial and academic proofs verified. Avanse loan sanction requested.",
        processingOwner: "Nikhil V",
      },
      followUps: [],
      activities: [
        {
          id: "act_1041_1",
          caseId: "NL-1041",
          type: "first_contact",
          description: "First contact made with student and father.",
          comment: "Candidate is eager to finalize Avanse NBFC sanction before VISA interview.",
          updatedBy: "Praveen K",
          timestamp: "2026-08-14T10:00:00.000Z",
        },
        {
          id: "act_1041_2",
          caseId: "NL-1041",
          type: "handover",
          description: "Application handed over to Processing Team.",
          comment: "All KYC and bank statements collected. Handed over to Nikhil V.",
          updatedBy: "Praveen K",
          timestamp: "2026-08-19T11:30:00.000Z",
        },
      ],
    },
    {
      ...CASES[1]!, // NL-1038 - Aparna Menon
      contactStatus: "Contacted",
      interestStatus: "Interested",
      workflowDocuments: [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_2", name: "Offer letter", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_3", name: "Property documents", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_4", name: "ITR — 3 years", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
        { id: "doc_5", name: "Valuation report", required: true, collectionStatus: "Received", verificationStatus: "Verified" },
      ],
      handover: {
        isHandedOver: true,
        handedOverAt: "2026-07-08T10:00:00.000Z",
        handedOverBy: "Shruti M",
        handoverRemarks: "Secured loan application for Warwick Business School. Collateral valuation attached.",
        processingOwner: "Nikhil V",
      },
      followUps: [],
      activities: [
        {
          id: "act_1038_1",
          caseId: "NL-1038",
          type: "handover",
          description: "Handed over to Processing Team.",
          comment: "Secured property files submitted.",
          updatedBy: "Shruti M",
          timestamp: "2026-07-08T10:00:00.000Z",
        },
      ],
    },
    {
      ...CASES[2]!, // NL-1052 - Mohammed Arshad
      stage: "Docs Collected",
      contactStatus: "Contacted",
      interestStatus: "Interested",
      workflowDocuments: [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
        { id: "doc_2", name: "Admission letter", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
        { id: "doc_3", name: "Co-applicant income proof", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
        { id: "doc_4", name: "Graduation Certificate & Marksheets", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
        { id: "doc_5", name: "Bank statement (6 months)", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
      ],
      handover: {
        isHandedOver: false,
      },
      followUps: [
        {
          id: "fl_1052_1",
          caseId: "NL-1052",
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          reminderNote: "Discuss Auxilo NBFC rate of interest offer and confirm processing login",
          status: "Upcoming",
          createdBy: "Praveen K",
          createdAt: new Date().toISOString(),
        },
      ],
      activities: [
        {
          id: "act_1052_1",
          caseId: "NL-1052",
          type: "first_contact",
          description: "First contact established with student.",
          comment: "Student accepted Auxilo lender terms. Preparing file.",
          updatedBy: "Praveen K",
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
        {
          id: "act_1052_2",
          caseId: "NL-1052",
          type: "ready_for_processing",
          description: "All 5 required documents received. Ready for handover.",
          comment: "Applicant submitted last 6-month bank statements this morning.",
          updatedBy: "Praveen K",
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      ...CASES[3]!, // NL-1049 - Nikita Sharma
      contactStatus: "Contacted",
      interestStatus: "Interested",
      workflowDocuments: [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
        { id: "doc_2", name: "Blocked account proof", required: true, collectionStatus: "Partially Received", verificationStatus: "Pending", comments: "Parent requested bank stamp verification on statement" },
        { id: "doc_3", name: "Property documents", required: true, collectionStatus: "Not Received", verificationStatus: "Pending", comments: "Parent gathering registered title deed from bank locker" },
        { id: "doc_4", name: "Academic Marksheets", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
        { id: "doc_5", name: "Co-applicant salary slips", required: true, collectionStatus: "Received", verificationStatus: "Pending" },
      ],
      handover: {
        isHandedOver: false,
      },
      followUps: [
        {
          id: "fl_1049_1",
          caseId: "NL-1049",
          scheduledAt: new Date().toISOString().split("T")[0] + "T14:15:00.000Z", // Due Today 2:15 PM
          reminderNote: "Send property valuation checklist to parent & collect title deed scan",
          status: "Upcoming",
          createdBy: "Praveen K",
          createdAt: new Date().toISOString(),
        },
      ],
      activities: [
        {
          id: "act_1049_1",
          caseId: "NL-1049",
          type: "first_contact",
          description: "First contact completed. Student confirmed high interest.",
          comment: "Targeting TU Munich for MS Mechanical. Collateral available in Gachibowli.",
          updatedBy: "Shruti M",
          timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
        {
          id: "act_1049_2",
          caseId: "NL-1049",
          type: "document_update",
          description: "Updated Blocked account proof to Partially Received.",
          comment: "German blocked account requires apostille or bank branch stamp.",
          updatedBy: "Shruti M",
          timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        },
      ],
    },
    {
      ...CASES[4]!, // NL-1055 - Harshith Varma
      contactStatus: "Not Contacted",
      interestStatus: "Not Contacted",
      workflowDocuments: defaultDocs([
        "Aadhaar & PAN",
        "Admission Letter / Offer Letter",
        "10th, 12th & Degree Marksheets",
        "Co-applicant Business ITR & Balance Sheets",
        "Bank statement (6 months)",
      ]),
      handover: {
        isHandedOver: false,
      },
      followUps: [],
      activities: [
        {
          id: "act_1055_1",
          caseId: "NL-1055",
          type: "system",
          description: "Lead captured from channel partner Warangal.",
          comment: "Assigned to sales queue. Ready for initial tele-calling.",
          updatedBy: "System",
          timestamp: new Date().toISOString(),
        },
      ],
    },
    {
      ...CASES[5]!, // NL-1029 - Divya Teja
      contactStatus: "Contacted",
      interestStatus: "Not Interested",
      notInterestedReason: "Student opted for alternative financing via relative in Ireland.",
      workflowDocuments: defaultDocs([
        "Aadhaar & PAN",
        "Admission Letter",
        "Academic marksheets",
        "Co-applicant ITR",
      ]),
      handover: {
        isHandedOver: false,
      },
      followUps: [],
      activities: [
        {
          id: "act_1029_1",
          caseId: "NL-1029",
          type: "not_interested",
          description: "Marked as Not Interested.",
          comment: "Student opted for alternative financing via relative in Ireland. Can be reactivated if requirements change.",
          updatedBy: "Praveen K",
          timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        },
      ],
    },
    // Adding Deepika Sharma for overdue follow-up testing
    {
      id: "NL-1035",
      student: "Deepika Sharma",
      phone: "+91 99880 12345",
      email: "deepika.s@gmail.com",
      country: "Germany",
      course: "MS Biotechnology",
      intake: "Summer 2027",
      university: "Heidelberg University",
      loanType: "Unsecured",
      amount: 2500000,
      stage: "Contacted",
      lender: "Auxilo",
      owner: "Praveen K",
      source: "Website form",
      updated: "1 day ago",
      coApplicant: {
        name: "Rajesh Sharma",
        relation: "Father",
        employment: "Salaried",
        organisation: "Sun Pharma",
        monthlyIncome: 85000,
        obligations: 14000,
        city: "Hyderabad",
      },
      academics: {
        tenth: "CBSE 9.2 CGPA",
        twelfth: "TS Board 91%",
        graduation: "B.Sc Biotech — 8.0 CGPA",
        tests: "IELTS 7.0 · GRE 312",
        experience: "1 year — Dr. Reddy's",
      },
      documents: [
        { name: "Aadhaar & PAN", status: "Received" },
        { name: "Admission letter", status: "Pending" },
      ],
      timeline: [
        { date: "Yesterday", label: "Lead contacted by Praveen K", by: "Praveen K" },
      ],
      contactStatus: "Call Attempted - No Answer",
      interestStatus: "Follow-up Required",
      workflowDocuments: defaultDocs([
        "Aadhaar & PAN",
        "Admission Letter",
        "GRE & IELTS Score Card",
        "Salary Slips & Form 16",
        "Bank Statement (6 months)",
      ]),
      handover: {
        isHandedOver: false,
      },
      followUps: [
        {
          id: "fl_1035_1",
          caseId: "NL-1035",
          // Scheduled yesterday = Overdue!
          scheduledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
          reminderNote: "Follow up on GRE score card scan upload and discuss co-applicant salary slips",
          status: "Upcoming", // Becomes Overdue dynamically
          createdBy: "Praveen K",
          createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        },
      ],
      activities: [
        {
          id: "act_1035_1",
          caseId: "NL-1035",
          type: "first_contact",
          description: "Call Attempted - No Answer. Follow-up scheduled.",
          comment: "Candidate was in lecture. Requested evening callback.",
          updatedBy: "Praveen K",
          timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
      ],
    },
  ];
}

export function CasesProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<DemoCase[]>(getInitialCases);

  // Sync from localStorage and backend on client mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(STORAGE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCases(parsed.filter(Boolean).map(normalizeCase));
          }
        }
      } catch (err) {
        console.warn("[CasesProvider] Failed to load cached cases:", err);
      }

      // Fetch fresh leads from backend MongoDB API
      fetchLeadsApi()
        .then((res) => {
          if (res.success && Array.isArray(res.leads) && res.leads.length > 0) {
            setCases((prev) => {
              const backendCases = res.leads!.map(normalizeCase);
              // Merge: backend cases placed at the top, then any hardcoded/cached cases not in backend
              const backendIdSet = new Set(backendCases.map((b) => b.id));
              const preservedCases = prev.filter((c) => !backendIdSet.has(c.id));
              return [...backendCases, ...preservedCases];
            });
          }
        })
        .catch((err) => {
          console.warn("[CasesProvider] Backend sync error (using local mock cases):", err);
        });
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
      } catch (err) {
        console.warn("[CasesProvider] Failed to persist cases:", err);
      }
    }
  }, [cases]);

  const getCase = (id: string) => cases.find((c) => c.id === id);

  // 1. Update First Contact & Interest
  const updateFirstContact = (
    caseId: string,
    payload: {
      contactStatus: ContactStatus;
      interestStatus: InterestStatus;
      comment?: string | undefined;
      notInterestedReason?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const prevInterest = c.interestStatus || "Not Contacted";
        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "first_contact",
            description: `First contact updated to "${payload.contactStatus}" and Interest set to "${payload.interestStatus}".`,
            previousValue: prevInterest,
            newValue: payload.interestStatus,
            comment: payload.comment || (payload.notInterestedReason ? `Reason: ${payload.notInterestedReason}` : undefined),
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        const targetStage: CaseStage =
          payload.interestStatus === "Interested"
            ? "Qualified"
            : payload.interestStatus === "Not Interested"
            ? "Rejected"
            : "Contacted";

        return {
          ...c,
          contactStatus: payload.contactStatus,
          interestStatus: payload.interestStatus,
          notInterestedReason: payload.interestStatus === "Not Interested" ? payload.notInterestedReason : undefined,
          stage: targetStage,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 3)
    updateFirstContactApi(caseId, {
      contactStatus: payload.contactStatus,
      interestStatus: payload.interestStatus,
      comment: payload.comment,
      notInterestedReason: payload.notInterestedReason,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync contact to backend:", err));

    toast.success("Contact and interest status updated successfully!");
  };

  // 2. Update Interest Status directly
  const updateInterestStatus = (
    caseId: string,
    payload: {
      interestStatus: InterestStatus;
      notInterestedReason?: string | undefined;
      comment?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const prevInterest = c.interestStatus || "Not Contacted";
        const docProgress = calculateDocProgress(c.workflowDocuments || []);
        const targetStage: CaseStage =
          c.handover?.isHandedOver
            ? "Sent to Lender"
            : payload.interestStatus === "Interested"
            ? (docProgress.isComplete ? "Docs Collected" : "Qualified")
            : payload.interestStatus === "Not Interested"
            ? "Rejected"
            : "Contacted";

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: payload.interestStatus === "Not Interested" ? "not_interested" : "interest_change",
            description: `Interest status changed from "${prevInterest}" to "${payload.interestStatus}".`,
            previousValue: prevInterest,
            newValue: payload.interestStatus,
            comment: payload.comment || (payload.notInterestedReason ? `Reason: ${payload.notInterestedReason}` : undefined),
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          interestStatus: payload.interestStatus,
          notInterestedReason: payload.interestStatus === "Not Interested" ? payload.notInterestedReason : undefined,
          stage: targetStage,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 3)
    updateFirstContactApi(caseId, {
      interestStatus: payload.interestStatus,
      comment: payload.comment,
      notInterestedReason: payload.notInterestedReason,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync interest to backend:", err));

    toast.success(`Interest marked as "${payload.interestStatus}"`);
  };

  // 3. Reactivate Not Interested Lead
  const reactivateLead = (
    caseId: string,
    payload: {
      newInterestStatus: InterestStatus;
      comment?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const targetStage: CaseStage =
          payload.newInterestStatus === "Interested" ? "Qualified" : "Contacted";

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "reactivation",
            description: `Lead reactivated! Interest status set to "${payload.newInterestStatus}".`,
            previousValue: "Not Interested",
            newValue: payload.newInterestStatus,
            comment: payload.comment || "Student changed mind / reopened loan enquiry.",
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          interestStatus: payload.newInterestStatus,
          notInterestedReason: undefined,
          stage: targetStage,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 3)
    reactivateLeadApi(caseId, {
      newInterestStatus: payload.newInterestStatus,
      comment: payload.comment,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync reactivation to backend:", err));

    toast.success("Lead successfully reactivated!");
  };

  // 4. Schedule Follow-up
  const scheduleFollowUp = (
    caseId: string,
    payload: {
      scheduledAt: string;
      reminderNote: string;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const newFollowUp: FollowUpRecord = {
          id: `fl_${Date.now()}`,
          caseId,
          scheduledAt: payload.scheduledAt,
          reminderNote: payload.reminderNote,
          status: "Upcoming",
          createdBy: payload.authorName,
          createdAt: new Date().toISOString(),
        };

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "followup_created",
            description: `Scheduled follow-up for ${new Date(payload.scheduledAt).toLocaleString("en-IN")}.`,
            comment: payload.reminderNote,
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          interestStatus: c.interestStatus === "Not Contacted" ? "Follow-up Required" : c.interestStatus,
          stage: c.stage === "New Lead" ? "Contacted" : c.stage,
          followUps: [newFollowUp, ...(c.followUps || [])],
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 1)
    createFollowUpApi(caseId, {
      scheduledAt: payload.scheduledAt,
      reminderNote: payload.reminderNote,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync follow-up to backend:", err));

    toast.success("Follow-up scheduled successfully!");
  };

  // 5. Complete Follow-up
  const completeFollowUp = (
    caseId: string,
    followUpId: string,
    payload: {
      completionNote?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const updatedFollowUps = (c.followUps || []).map((f) => {
          if (f.id !== followUpId) return f;
          return {
            ...f,
            status: "Completed" as const,
            completedAt: new Date().toISOString(),
            completionNote: payload.completionNote || "Follow-up completed.",
          };
        });

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "followup_completed",
            description: "Marked follow-up call as Completed.",
            comment: payload.completionNote || "Call completed with student/parent.",
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          followUps: updatedFollowUps,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 1)
    updateFollowUpApi(caseId, followUpId, {
      action: "complete",
      completionNote: payload.completionNote,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync follow-up completion to backend:", err));

    toast.success("Follow-up marked as Completed!");
  };

  // 6. Reschedule Follow-up
  const rescheduleFollowUp = (
    caseId: string,
    followUpId: string,
    payload: {
      newScheduledAt: string;
      rescheduleReason?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const updatedFollowUps = (c.followUps || []).map((f) => {
          if (f.id !== followUpId) return f;
          return {
            ...f,
            scheduledAt: payload.newScheduledAt,
            status: "Upcoming" as const,
            rescheduledAt: new Date().toISOString(),
            rescheduleReason: payload.rescheduleReason,
          };
        });

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "followup_rescheduled",
            description: `Follow-up rescheduled to ${new Date(payload.newScheduledAt).toLocaleString("en-IN")}.`,
            comment: payload.rescheduleReason || "Student requested different time slot.",
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          followUps: updatedFollowUps,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 1)
    updateFollowUpApi(caseId, followUpId, {
      action: "reschedule",
      newScheduledAt: payload.newScheduledAt,
      rescheduleReason: payload.rescheduleReason,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync follow-up reschedule to backend:", err));

    toast.success("Follow-up rescheduled successfully!");
  };

  // 7. Cancel Follow-up
  const cancelFollowUp = (
    caseId: string,
    followUpId: string,
    payload: {
      reason?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const updatedFollowUps = (c.followUps || []).map((f) => {
          if (f.id !== followUpId) return f;
          return {
            ...f,
            status: "Cancelled" as const,
            cancelledAt: new Date().toISOString(),
            cancellationReason: payload.reason,
          };
        });

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "followup_cancelled",
            description: "Follow-up cancelled.",
            comment: payload.reason || "Cancelled by sales executive.",
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          followUps: updatedFollowUps,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 1)
    updateFollowUpApi(caseId, followUpId, {
      action: "cancel",
      cancellationReason: payload.reason,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync follow-up cancellation to backend:", err));

    toast.success("Follow-up cancelled.");
  };

  // 8. Update Individual Document Collection Status
  const updateDocumentStatus = (
    caseId: string,
    docName: string,
    payload: {
      collectionStatus: DocCollectionStatus;
      comments?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const existingDocs = c.workflowDocuments || [];
        const prevDoc = existingDocs.find((d) => d.name === docName);
        const prevStatus = prevDoc?.collectionStatus || "Not Received";

        const updatedDocs = existingDocs.map((d) => {
          if (d.name !== docName) return d;
          return {
            ...d,
            collectionStatus: payload.collectionStatus,
            comments: payload.comments !== undefined ? payload.comments : d.comments,
            updatedAt: new Date().toISOString(),
            updatedBy: payload.authorName,
          };
        });

        const progress = calculateDocProgress(updatedDocs);
        const autoStage = progress.isComplete
          ? "Docs Collected"
          : progress.received > 0
          ? "Qualified"
          : c.stage;

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "document_update",
            description: `Document "${docName}" updated from "${prevStatus}" to "${payload.collectionStatus}".`,
            previousValue: prevStatus,
            newValue: payload.collectionStatus,
            comment: payload.comments,
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          workflowDocuments: updatedDocs,
          studentDocuments: (c.studentDocuments || []).map((document) =>
            document.name === docName
              ? {
                  ...document,
                  collectionStatus: payload.collectionStatus,
                  status: payload.collectionStatus === "Received" ? "Uploaded" : "Pending",
                }
              : document,
          ),
          parentDocuments: (c.parentDocuments || []).map((document) =>
            document.name === docName
              ? {
                  ...document,
                  collectionStatus: payload.collectionStatus,
                  status: payload.collectionStatus === "Received" ? "Uploaded" : "Pending",
                }
              : document,
          ),
          propertyDocuments: (c.propertyDocuments || []).map((document) =>
            document.name === docName
              ? {
                  ...document,
                  collectionStatus: payload.collectionStatus,
                  status: payload.collectionStatus === "Received" ? "Uploaded" : "Pending",
                }
              : document,
          ),
          stage: autoStage,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 2)
    updateDocumentStatusApi(caseId, {
      docName,
      collectionStatus: payload.collectionStatus,
      comments: payload.comments,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync document status to backend:", err));

    toast.success(`"${docName}" marked as ${payload.collectionStatus}`);
  };

  // 9. Mark Ready for Processing
  const markReadyForProcessing = (
    caseId: string,
    payload: {
      remarks?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "ready_for_processing",
            description: "Marked file as Ready for Processing Handover.",
            comment: payload.remarks || "All required documents collected and verified by Sales.",
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          stage: "Docs Collected",
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 4)
    updateLeadApi(caseId, {
      stage: "Docs Collected",
    }).catch((err) => console.warn("[CasesProvider] Failed to sync stage to backend:", err));

    toast.success("Case file confirmed Ready for Processing!");
  };

  // 10. Handover to Processing
  const handoverToProcessing = (
    caseId: string,
    payload: {
      handoverRemarks: string;
      processingOwner?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const newHandover: HandoverInfo = {
          isHandedOver: true,
          handedOverAt: new Date().toISOString(),
          handedOverBy: payload.authorName,
          handoverRemarks: payload.handoverRemarks,
          processingOwner: payload.processingOwner || "Nikhil V (Lead Processing)",
        };

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "handover",
            description: `File officially handed over to Processing Team (${newHandover.processingOwner}).`,
            comment: payload.handoverRemarks,
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          handover: newHandover,
          stage: "Sent to Lender",
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 4)
    handoverLeadApi(caseId, {
      handoverRemarks: payload.handoverRemarks,
      processingOwner: payload.processingOwner,
      authorName: payload.authorName,
      force: true,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync handover to backend:", err));

    toast.success("Application successfully handed over to Processing Team!");
  };

  // 11. Add Note / Free Comment
  const addComment = (
    caseId: string,
    payload: {
      comment: string;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "comment",
            description: "Added interaction remark / note.",
            comment: payload.comment,
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 5)
    addCommentApi(caseId, {
      comment: payload.comment,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync comment to backend:", err));

    toast.success("Comment added to case file.");
  };

  // 12. Update / Change Lender
  const updateLender = (
    caseId: string,
    payload: {
      newLender: string;
      reason?: string | undefined;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const prevLender = c.lender || "Not assigned";
        // If case was rejected, re-routing with a new lender moves stage to "Sent to Lender"
        const targetStage: CaseStage =
          c.stage === "Rejected"
            ? "Sent to Lender"
            : c.stage;

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "system",
            description: `Lender changed from "${prevLender}" to "${payload.newLender}". File re-routed.`,
            comment: payload.reason || "Re-applied with new lender partner.",
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          lender: payload.newLender,
          lenderRejectionReason: undefined,
          stage: targetStage,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 4)
    updateLeadLenderApi(caseId, {
      lender: payload.newLender,
      reason: payload.reason,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync lender to backend:", err));

    toast.success(`Lender updated to "${payload.newLender}" successfully!`);
  };

  // 13. Mark Lender Rejected
  const markLenderRejected = (
    caseId: string,
    payload: {
      rejectionReason: string;
      authorName: string;
    }
  ) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const currentLender = c.lender || "Lender";

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "not_interested",
            description: `Loan rejected by ${currentLender}.`,
            comment: `Rejection Reason: ${payload.rejectionReason}`,
            updatedBy: payload.authorName,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          stage: "Rejected" as CaseStage,
          lenderRejectionReason: payload.rejectionReason,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API (Stage 4)
    updateLeadLenderApi(caseId, {
      lenderRejectionReason: payload.rejectionReason,
      authorName: payload.authorName,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync lender rejection to backend:", err));

    toast.error(`Case marked as Rejected by lender. You can now re-assign to another lender.`);
  };

  // 13c. Submit File to Lender & Lock
  const submitToLender = (
    caseId: string,
    payload: {
      lender: string;
      applicationNo?: string | undefined;
      notes?: string | undefined;
      authorName: string;
    }
  ) => {
    const appNo = payload.applicationNo || `${payload.lender.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const newSub: LenderSubmissionRecord = {
      id: `sub_${Date.now()}`,
      lender: payload.lender,
      applicationNo: appNo,
      status: "Submitted",
      submittedAt: nowIso,
      submittedBy: payload.authorName,
      notes: payload.notes || "File submitted to lender.",
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "lender_submit",
            description: `File officially submitted to ${payload.lender} (App No: ${appNo}). File is locked with lender.`,
            comment: payload.notes || undefined,
            updatedBy: payload.authorName,
            timestamp: nowIso,
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          lender: payload.lender,
          lenderStatus: "Submitted" as LenderStatus,
          lenderApplicationNo: appNo,
          lenderSubmittedAt: nowIso,
          lenderSubmittedBy: payload.authorName,
          lenderLocked: true,
          lenderRejectionReason: undefined,
          stage: "Logged In" as CaseStage,
          lenderSubmissions: [newSub, ...(c.lenderSubmissions || [])],
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    submitToLenderApi(caseId, payload).catch((err) =>
      console.warn("[CasesProvider] Failed to sync lender submission to backend:", err)
    );

    toast.success(`File successfully locked & submitted to ${payload.lender} (App No: ${appNo})`);
  };

  // 13d. Update Lender Decision / Status
  const updateLenderDecision = (
    caseId: string,
    payload: {
      status: LenderStatus;
      rejectionReason?: string | undefined;
      sanctionAmount?: number | undefined;
      roi?: number | undefined;
      tenure?: number | undefined;
      notes?: string | undefined;
      authorName: string;
    }
  ) => {
    const nowIso = new Date().toISOString();

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const currentLender = c.lender || "Lender";

        let targetStage: CaseStage = c.stage;
        let actType: ActivityItem["type"] = "system";
        let actDesc = `Lender status updated to "${payload.status}".`;
        let isLocked = c.lenderLocked ?? true;
        let rejectionReason = c.lenderRejectionReason;
        let sanctionedAmt = c.sanctioned;
        let roiVal = c.roi;
        let tenureVal = c.tenure;
        let disbursedAmt = c.disbursed;

        if (payload.status === "In Underwriting") {
          targetStage = "Logged In";
          actType = "underwriting";
          actDesc = `Application is under active Credit Underwriting review with ${currentLender}.`;
        } else if (payload.status === "Sanctioned" || payload.status === "Approved") {
          targetStage = "Sanctioned";
          actType = "sanction";
          sanctionedAmt = payload.sanctionAmount || c.amount;
          roiVal = payload.roi || c.roi;
          tenureVal = payload.tenure || c.tenure;
          rejectionReason = undefined;
          actDesc = `Loan Sanction Letter issued by ${currentLender} for INR ${sanctionedAmt.toLocaleString("en-IN")}${roiVal ? ` @ ${roiVal}%` : ""}.`;
        } else if (payload.status === "Disbursed") {
          targetStage = "Disbursed";
          actType = "disbursement";
          disbursedAmt = sanctionedAmt || c.amount;
          actDesc = `Loan disbursed by ${currentLender} (INR ${disbursedAmt.toLocaleString("en-IN")}).`;
        } else if (payload.status === "Rejected") {
          targetStage = "Rejected";
          actType = "not_interested";
          isLocked = false; // UNLOCKED FOR RE-ROUTING
          rejectionReason = payload.rejectionReason || "Lender credit policy criteria not met.";
          actDesc = `Loan application declined / rejected by ${currentLender}. Reason: ${rejectionReason}`;
        }

        const updatedSubmissions = (c.lenderSubmissions || []).map((s, idx) => {
          if (idx !== 0) return s;
          return {
            ...s,
            status: payload.status,
            decisionAt: nowIso,
            rejectionReason: payload.status === "Rejected" ? rejectionReason : s.rejectionReason,
            sanctionAmount: payload.status === "Sanctioned" ? sanctionedAmt : s.sanctionAmount,
            roi: payload.status === "Sanctioned" ? roiVal : s.roi,
            tenure: payload.status === "Sanctioned" ? tenureVal : s.tenure,
          };
        });

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: actType,
            description: actDesc,
            comment: payload.notes || (payload.status === "Rejected" ? `Rejection Reason: ${rejectionReason}` : undefined),
            updatedBy: payload.authorName,
            timestamp: nowIso,
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          lenderStatus: payload.status,
          stage: targetStage,
          lenderLocked: isLocked,
          lenderRejectionReason: rejectionReason,
          sanctioned: sanctionedAmt,
          roi: roiVal,
          tenure: tenureVal,
          disbursed: disbursedAmt,
          lenderSubmissions: updatedSubmissions,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    updateLenderDecisionApi(caseId, payload).catch((err) =>
      console.warn("[CasesProvider] Failed to sync lender decision to backend:", err)
    );

    if (payload.status === "Rejected") {
      toast.error("Application marked as Declined. The file is unlocked and ready for re-routing.");
    } else {
      toast.success(`Lender status updated to "${payload.status}"`);
    }
  };

  // 13e. Re-route to New Lender
  const rerouteToNewLender = (
    caseId: string,
    payload: {
      newLender: string;
      applicationNo?: string | undefined;
      reason?: string | undefined;
      authorName: string;
    }
  ) => {
    const appNo = payload.applicationNo || `${payload.newLender.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const nowIso = new Date().toISOString();

    const newSub: LenderSubmissionRecord = {
      id: `sub_${Date.now()}`,
      lender: payload.newLender,
      applicationNo: appNo,
      status: "Submitted",
      submittedAt: nowIso,
      submittedBy: payload.authorName,
      notes: payload.reason || "Re-routed to new lender.",
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const prevLender = c.lender || "Previous Lender";

        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId,
            type: "reroute",
            description: `File re-routed from ${prevLender} to new partner ${payload.newLender} (App No: ${appNo}). File re-locked for review.`,
            comment: payload.reason || "Re-routed following previous decline.",
            updatedBy: payload.authorName,
            timestamp: nowIso,
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          lender: payload.newLender,
          lenderStatus: "Submitted" as LenderStatus,
          lenderApplicationNo: appNo,
          lenderSubmittedAt: nowIso,
          lenderSubmittedBy: payload.authorName,
          lenderLocked: true,
          lenderRejectionReason: undefined,
          stage: "Logged In" as CaseStage,
          lenderSubmissions: [newSub, ...(c.lenderSubmissions || [])],
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    rerouteToNewLenderApi(caseId, payload).catch((err) =>
      console.warn("[CasesProvider] Failed to sync lender re-routing to backend:", err)
    );

    toast.success(`File successfully re-routed and locked with ${payload.newLender}!`);
  };

  // 13b. Update Referral Source & Detail
  const updateReferralSource = (
    caseId: string,
    newSource: string,
    sourceName?: string | undefined,
    authorName?: string | undefined
  ) => {
    const author = authorName || "Staff";
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== caseId) return c;
        const oldSource = c.source || "Customer reference";
        const oldSourceName = c.sourceName || "";
        const desc = sourceName
          ? `Sourcing channel updated to "${newSource}" (${sourceName}).`
          : `Sourcing channel updated from "${oldSource}" to "${newSource}".`;
        const newActivities: ActivityItem[] = [
          {
            id: `act_${Date.now()}`,
            caseId: c.id,
            type: "system",
            description: desc,
            previousValue: oldSourceName ? `${oldSource} (${oldSourceName})` : oldSource,
            newValue: sourceName ? `${newSource} (${sourceName})` : newSource,
            updatedBy: author,
            timestamp: new Date().toISOString(),
          },
          ...(c.activities || []),
        ];

        return {
          ...c,
          source: newSource,
          sourceName: sourceName !== undefined ? sourceName : c.sourceName,
          updated: "Just now",
          activities: newActivities,
        };
      })
    );

    // Sync to backend MongoDB API
    updateLeadApi(caseId, {
      source: newSource,
      sourceName: sourceName !== undefined ? sourceName : undefined,
    }).catch((err) => console.warn("[CasesProvider] Failed to sync referral source to backend:", err));

    toast.success(`Sourcing updated to "${newSource}"`);
  };

  // 14. Add New Lead (from modal/registration)
  const addCase = (newCaseData: Partial<DemoCase>): DemoCase => {
    const randomId = `NL-${Math.floor(1000 + Math.random() * 9000)}`;
    const fullCase: DemoCase = {
      id: newCaseData.id || randomId,
      student: newCaseData.student || "New Student",
      phone: newCaseData.phone || "+91 98000 00000",
      email: newCaseData.email || "student@example.com",
      country: newCaseData.country || "USA",
      course: newCaseData.course || "Master of Science",
      intake: newCaseData.intake || "Fall 2026",
      university: newCaseData.university || "University Partner",
      loanType: newCaseData.loanType || "Unsecured",
      amount: newCaseData.amount || 3500000,
      stage: "New Lead",
      lender: newCaseData.lender || "Not assigned",
      owner: newCaseData.owner || "Praveen K",
      source: newCaseData.source || "Customer reference",
      sourceName: newCaseData.sourceName || "",
      studentDocumentsStatus: newCaseData.studentDocumentsStatus || "Not Received",
      parentDocumentsStatus: newCaseData.parentDocumentsStatus || "Not Received",
      propertyDocumentsStatus: newCaseData.propertyDocumentsStatus || "Not Received",
      updated: "Just now",
      coApplicant: newCaseData.coApplicant || {
        name: "Co-applicant Name",
        relation: "Father",
        employment: "Salaried",
        organisation: "Private Firm",
        monthlyIncome: 75000,
        obligations: 10000,
        city: "Hyderabad",
      },
      academics: newCaseData.academics || {
        tenth: "90%",
        twelfth: "88%",
        graduation: "8.0 CGPA",
        tests: "IELTS 7.0",
        experience: "Fresher",
      },
      documents: [
        { name: "Aadhaar & PAN", status: "Pending" },
        { name: "Admission letter", status: "Pending" },
        { name: "Academic marksheets", status: "Pending" },
        { name: "Income proof", status: "Pending" },
        { name: "Bank statements (6 months)", status: "Pending" },
      ],
      timeline: [
        { date: "Today", label: "Lead captured from registration", by: "System" },
      ],
      contactStatus: "Not Contacted",
      interestStatus: "Not Contacted",
      workflowDocuments: [
        { id: "doc_1", name: "Aadhaar & PAN", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_2", name: "Admission letter", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_3", name: "Academic marksheets", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_4", name: "Income proof", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
        { id: "doc_5", name: "Bank statements (6 months)", required: true, collectionStatus: "Not Received", verificationStatus: "Pending" },
      ],
      handover: {
        isHandedOver: false,
      },
      followUps: [],
      activities: [
        {
          id: `act_${Date.now()}`,
          caseId: randomId,
          type: "system",
          description: "New student lead registration created in CRM.",
          comment: "Awaiting sales first contact.",
          updatedBy: "System",
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setCases((prev) => [fullCase, ...prev]);
    toast.success(`Lead registered as ${fullCase.id}`);

    // Asynchronously persist to backend MongoDB
    createLeadApi(fullCase)
      .then((res) => {
        if (res.success && res.lead) {
          console.log("[CasesProvider] New lead successfully synced to MongoDB backend:", res.lead.id);
          Promise.all([
            uploadLeadDocumentsApi(res.lead.id, "student", (newCaseData as any).studentDocuments || []),
            uploadLeadDocumentsApi(res.lead.id, "parent", (newCaseData as any).parentDocuments || []),
            uploadLeadDocumentsApi(res.lead.id, "property", (newCaseData as any).propertyDocuments || []),
          ]).catch((err) => {
            console.warn("[CasesProvider] Document upload sync failed:", err);
          });
        }
      })
      .catch((err) => {
        console.warn("[CasesProvider] Backend sync error for lead creation:", err);
      });

    return fullCase;
  };

  const resetCases = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setCases(getInitialCases());
    toast.success("Cases reset to default demonstration data.");
  };

  const updateDocumentSectionStatus = async (
    caseId: string,
    section: "student" | "parent" | "property",
    status: "Not Received" | "Partially Received" | "Received",
    authorName: string,
  ) => {
    const fieldName =
      section === "student"
        ? "studentDocumentsStatus"
        : section === "parent"
          ? "parentDocumentsStatus"
          : "propertyDocumentsStatus";
    const updatedAt = new Date().toISOString();
    const response = await updateLeadApi(caseId, {
      [fieldName]: status,
      documentStatusesUpdatedAt: updatedAt,
      documentStatusesUpdatedBy: authorName,
    });
    if (!response.success) {
      toast.error(response.error || "Failed to update document status.");
      return false;
    }

    setCases((previous) =>
      previous.map((item) =>
        item.id === caseId
          ? {
              ...item,
              [fieldName]: status,
              documentStatusesUpdatedAt: updatedAt,
              documentStatusesUpdatedBy: authorName,
            }
          : item,
      ),
    );
    const sectionLabel = section === "student" ? "Student" : section === "parent" ? "Parent" : "Property";
    toast.success(`${sectionLabel} documents marked as ${status}.`);
    return true;
  };

  const updateApplicationDocuments = async (
    caseId: string,
    section: "student" | "parent" | "property",
    documents: Array<{
      id: string;
      name: string;
      type: string;
      category?: string | undefined;
      fileName?: string | undefined;
      fileUrl?: string | undefined;
      mimeType?: string | undefined;
      size?: number | undefined;
      status: "Pending" | "Uploaded";
      file?: File | undefined;
    }>,
  ) => {
    const response = await uploadLeadDocumentsApi(caseId, section, documents);
    if (!response.success) {
      toast.error(response.error || "Failed to save application documents.");
      return false;
    }

    const fieldName =
      section === "student"
        ? "studentDocuments"
        : section === "parent"
          ? "parentDocuments"
          : "propertyDocuments";

    setCases((previous) =>
      previous.map((item) =>
        item.id === caseId
          ? { ...item, [fieldName]: response.documents || documents }
          : item,
      ),
    );
    const sectionLabel = section === "student" ? "Student" : section === "parent" ? "Parent" : "Property";
    toast.success(`${sectionLabel} documents saved.`);
    return true;
  };

  const updateApplicationDetails = async (
    caseId: string,
    payload: Record<string, unknown>,
  ) => {
    const response = await updateLeadApi(caseId, payload);
    if (!response.success) {
      toast.error(response.error || "Failed to save application details.");
      return false;
    }

    setCases((previous) =>
      previous.map((item) => {
        if (item.id !== caseId) return item;
        const merged: DemoCase = {
          ...item,
          ...(payload["student"] !== undefined ? { student: String(payload["student"]) } : {}),
          ...(payload["phone"] !== undefined ? { phone: String(payload["phone"]) } : {}),
          ...(payload["alternativePhone"] !== undefined ? { alternativePhone: String(payload["alternativePhone"]) } : {}),
          ...(payload["email"] !== undefined ? { email: String(payload["email"]) } : {}),
          ...(payload["country"] !== undefined ? { country: String(payload["country"]) } : {}),
          ...(payload["planningCountry"] !== undefined ? { planningCountry: String(payload["planningCountry"]) } : {}),
          ...(payload["studyCountry"] !== undefined ? { studyCountry: String(payload["studyCountry"]) } : {}),
          ...(payload["course"] !== undefined ? { course: String(payload["course"]) } : {}),
          ...(payload["intake"] !== undefined ? { intake: String(payload["intake"]) } : {}),
          ...(payload["university"] !== undefined ? { university: String(payload["university"]) } : {}),
          ...(payload["loanRequirement"] !== undefined ? { loanRequirement: String(payload["loanRequirement"]) } : {}),
          ...(payload["loanType"] === "Secured" || payload["loanType"] === "Unsecured" ? { loanType: payload["loanType"] } : {}),
          ...(typeof payload["amount"] === "number" ? { amount: payload["amount"] } : {}),
          ...(payload["source"] !== undefined ? { source: String(payload["source"]) } : {}),
          ...(payload["sourceName"] !== undefined ? { sourceName: String(payload["sourceName"]) } : {}),
          coApplicant: payload["coApplicant"]
            ? { ...item.coApplicant, ...(payload["coApplicant"] as Partial<DemoCase["coApplicant"]>) }
            : item.coApplicant,
          academics: payload["academics"]
            ? { ...item.academics, ...(payload["academics"] as Partial<DemoCase["academics"]>) }
            : item.academics,
          guarantor: payload["guarantor"]
            ? {
                name: "",
                relation: "",
                phone: "",
                email: "",
                employment: "",
                organisation: "",
                monthlyIncome: 0,
                address: "",
                ...item.guarantor,
                ...(payload["guarantor"] as Partial<NonNullable<DemoCase["guarantor"]>>),
              }
            : item.guarantor,
          collateral: payload["collateral"]
            ? {
                type: "",
                location: "",
                marketValue: 0,
                owner: "",
                ...item.collateral,
                ...(payload["collateral"] as Partial<NonNullable<DemoCase["collateral"]>>),
              }
            : item.collateral,
        };
        return merged;
      }),
    );
    toast.success("Application details saved.");
    return true;
  };

  return (
    <CasesContext.Provider
      value={{
        cases,
        getCase,
        updateFirstContact,
        updateInterestStatus,
        reactivateLead,
        scheduleFollowUp,
        completeFollowUp,
        rescheduleFollowUp,
        cancelFollowUp,
        updateDocumentStatus,
        markReadyForProcessing,
        handoverToProcessing,
        addComment,
        updateLender,
        markLenderRejected,
        submitToLender,
        updateLenderDecision,
        rerouteToNewLender,
        updateReferralSource,
        updateApplicationDocuments,
        updateApplicationDetails,
        updateDocumentSectionStatus,
        addCase,
        resetCases,
      }}
    >
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) {
    throw new Error("useCases must be used within a CasesProvider");
  }
  return ctx;
}
