export type InterestStatus =
  | "Not Contacted"
  | "Interested"
  | "Not Interested"
  | "Follow-up Required";

export type ContactStatus =
  | "Not Contacted"
  | "Contacted"
  | "Call Attempted - No Answer"
  | "Call Rescheduled";

export type FollowUpStatus =
  | "Upcoming"
  | "Completed"
  | "Rescheduled"
  | "Cancelled"
  | "Overdue";

export type DocCollectionStatus =
  | "Not Received"
  | "Partially Received"
  | "Received";

export type DocVerificationStatus = "Pending" | "Verified" | "Rejected";

export interface FollowUpRecord {
  id: string;
  caseId: string;
  scheduledAt: string; // ISO String (e.g. 2026-11-07T15:30:00)
  reminderNote: string;
  status: FollowUpStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string | undefined;
  completionNote?: string | undefined;
  rescheduledAt?: string | undefined;
  rescheduleReason?: string | undefined;
  cancelledAt?: string | undefined;
  cancellationReason?: string | undefined;
}

export interface CaseDocumentItem {
  id: string;
  name: string;
  required: boolean;
  collectionStatus: DocCollectionStatus;
  verificationStatus: DocVerificationStatus;
  comments?: string | undefined;
  updatedAt?: string | undefined;
  updatedBy?: string | undefined;
}

export interface HandoverInfo {
  isHandedOver: boolean;
  handedOverAt?: string | undefined;
  handedOverBy?: string | undefined;
  handoverRemarks?: string | undefined;
  processingOwner?: string | undefined;
}

export interface ActivityItem {
  id: string;
  caseId: string;
  type:
    | "first_contact"
    | "interest_change"
    | "not_interested"
    | "reactivation"
    | "followup_created"
    | "followup_completed"
    | "followup_rescheduled"
    | "followup_cancelled"
    | "document_update"
    | "ready_for_processing"
    | "handover"
    | "comment"
    | "system";
  description: string;
  previousValue?: string | undefined;
  newValue?: string | undefined;
  comment?: string | undefined;
  updatedBy: string;
  timestamp: string; // ISO string
}

export interface ExtendedCaseWorkflow {
  contactStatus: ContactStatus;
  interestStatus: InterestStatus;
  notInterestedReason?: string | undefined;
  followUps: FollowUpRecord[];
  workflowDocuments: CaseDocumentItem[];
  handover: HandoverInfo;
  activities: ActivityItem[];
}

export function calculateDocProgress(docs: CaseDocumentItem[] = []) {
  if (!Array.isArray(docs) || docs.length === 0) {
    return {
      total: 0,
      received: 0,
      partiallyReceived: 0,
      notReceived: 0,
      pending: 0,
      percentage: 0,
      isComplete: false,
    };
  }

  const validDocs = docs.filter((d) => d && typeof d === "object");
  const total = validDocs.length;
  if (total === 0) {
    return {
      total: 0,
      received: 0,
      partiallyReceived: 0,
      notReceived: 0,
      pending: 0,
      percentage: 0,
      isComplete: false,
    };
  }

  const received = validDocs.filter((d) => d.collectionStatus === "Received").length;
  const partiallyReceived = validDocs.filter((d) => d.collectionStatus === "Partially Received").length;
  const notReceived = validDocs.filter((d) => d.collectionStatus === "Not Received").length;
  const pending = total - received;
  const percentage = Math.round((received / total) * 100);
  const isComplete = total > 0 && received === total;

  return {
    total,
    received,
    partiallyReceived,
    notReceived,
    pending,
    percentage,
    isComplete,
  };
}

export function getEffectiveFollowUpStatus(f: FollowUpRecord): FollowUpStatus {
  if (!f || typeof f !== "object") return "Upcoming";
  if (f.status === "Completed" || f.status === "Cancelled" || f.status === "Rescheduled") {
    return f.status;
  }
  if (!f.scheduledAt) return "Upcoming";
  try {
    const scheduledTime = new Date(f.scheduledAt).getTime();
    if (isNaN(scheduledTime)) return "Upcoming";
    const now = Date.now();
    if (scheduledTime < now) {
      return "Overdue";
    }
  } catch {
    return "Upcoming";
  }
  return "Upcoming";
}

export function isFollowUpDueToday(scheduledAt: string): boolean {
  if (!scheduledAt) return false;
  try {
    const scheduled = new Date(scheduledAt);
    if (isNaN(scheduled.getTime())) return false;
    const today = new Date();
    return (
      scheduled.getFullYear() === today.getFullYear() &&
      scheduled.getMonth() === today.getMonth() &&
      scheduled.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
}

export function formatDateTime(isoOrDateStr: string): string {
  if (!isoOrDateStr) return "—";
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return d.toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoOrDateStr;
  }
}

export function formatDateOnly(isoOrDateStr: string): string {
  if (!isoOrDateStr) return "—";
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return isoOrDateStr;
  }
}

