export const API_BASE_URL =
  (import.meta.env as Record<string, string | undefined>)["VITE_API_BASE_URL"] ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://loancrm-backend.llp.trizenventures.com/api/v1"
    : "http://localhost:5000/api/v1");

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("crm_token");
}

export function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export function handleAuthStatus(res: Response): void {
  if (res.status === 401 && typeof window !== "undefined") {
    // If token expired or invalid, can optionally trigger session clear
  }
}

export interface RegisterPayload {
  name: string;
  email: string;
  role: string;
  roleTitle?: string;
  department?: string;
  mobile?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
  name?: string;
  valid?: boolean;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: "superadmin" | "telecom" | "relationship_manager" | "manager";
    roleTitle?: string;
    department?: string;
    mobile?: string;
    status?: string;
  };
}

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Registration failed. Please check your details.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server. Make sure the backend is running on port 5000.",
    };
  }
}

export async function verifyActivationToken(token: string, email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Activation link is invalid or expired.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server to verify token.",
    };
  }
}

export async function setPasswordAndActivate(token: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/set-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to set password.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to process password reset request.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function verifyResetToken(token: string, email: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Password reset link is invalid or has expired.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server to verify reset token.",
    };
  }
}

export async function resetPasswordWithToken(token: string, email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to reset password.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Login failed. Invalid email or password.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server. Make sure the backend is running on port 5000.",
    };
  }
}

export async function fetchCurrentUser(token: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch user profile.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

/* =========================================================================
   LEAD CRM CORE APIS
   ========================================================================= */

export async function createLeadApi(
  payload: any
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to create lead on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function uploadLeadDocumentsApi(
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
  }>,
): Promise<{ success: boolean; documents?: any[]; error?: string }> {
  try {
    const formData = new FormData();
    formData.append("section", section);
    formData.append("documents", JSON.stringify(documents.map(({ file, ...metadata }) => metadata)));
    const fileIds: string[] = [];
    documents.forEach((document) => {
      if (document.file) {
        formData.append("files", document.file, document.fileName || document.file.name);
        fileIds.push(document.id);
      }
    });
    formData.append("fileIds", JSON.stringify(fileIds));

    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/documents/upload`, {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to upload documents." };
    }
    return data;
  } catch {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function fetchLeadsApi(): Promise<{
  success: boolean;
  count?: number;
  leads?: any[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch leads from backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function updateLeadApi(
  caseId: string,
  payload: any
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to update lead on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

/* =========================================================================
   FOLLOW-UP MANAGEMENT APIS (STAGE 1)
   ========================================================================= */

export async function createFollowUpApi(
  caseId: string,
  payload: {
    scheduledAt: string;
    reminderNote: string;
    authorName: string;
  }
): Promise<{ success: boolean; followUp?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/followups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to schedule follow-up on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function updateFollowUpApi(
  caseId: string,
  followUpId: string,
  payload: {
    action: "complete" | "reschedule" | "cancel";
    completionNote?: string | undefined;
    newScheduledAt?: string | undefined;
    rescheduleReason?: string | undefined;
    cancellationReason?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; followUp?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/followups/${encodeURIComponent(followUpId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || `Failed to ${payload.action} follow-up on backend.`,
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function fetchFollowUpsApi(
  caseId: string
): Promise<{ success: boolean; count?: number; followUps?: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/followups`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch follow-ups from backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

/* =========================================================================
   DOCUMENT COLLECTION MANAGEMENT APIS (STAGE 2)
   ========================================================================= */

export async function updateDocumentStatusApi(
  caseId: string,
  payload: {
    docName?: string | undefined;
    docId?: string | undefined;
    collectionStatus: string;
    verificationStatus?: string | undefined;
    comments?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; document?: any; workflowDocuments?: any[]; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/documents`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to update document status on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function addCustomDocumentApi(
  caseId: string,
  payload: {
    name: string;
    required?: boolean | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; document?: any; workflowDocuments?: any[]; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/documents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to add document requirement on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function fetchDocumentsApi(
  caseId: string
): Promise<{ success: boolean; count?: number; workflowDocuments?: any[]; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/documents`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to fetch documents from backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

/* =========================================================================
   FIRST CONTACT & STUDENT INTEREST APIS (STAGE 3)
   ========================================================================= */

export async function updateFirstContactApi(
  caseId: string,
  payload: {
    contactStatus?: string | undefined;
    interestStatus?: string | undefined;
    comment?: string | undefined;
    notInterestedReason?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/contact`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to update contact/interest status on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function reactivateLeadApi(
  caseId: string,
  payload: {
    newInterestStatus: string;
    comment?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/reactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to reactivate lead on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

/* =========================================================================
   HANDOVER & LENDER MANAGEMENT APIS (STAGE 4 & STAGE 5)
   ========================================================================= */

export async function handoverLeadApi(
  caseId: string,
  payload: {
    handoverRemarks: string;
    processingOwner?: string | undefined;
    authorName: string;
    force?: boolean | undefined;
  }
): Promise<{ success: boolean; handover?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/handover`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to handover lead on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function returnLeadToSalesApi(
  caseId: string,
  payload: {
    reason?: string;
    returnReason?: string;
    requiredCorrections?: string;
    authorName?: string;
    returnedBy?: string;
  }
): Promise<{ success: boolean; returnToSales?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/return-to-sales`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to return lead to sales on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function publicRegisterStudentApi(payload: any): Promise<{
  success: boolean;
  lead?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/public-register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Registration failed.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function updateLeadLenderApi(
  caseId: string,
  payload: {
    lender?: string | undefined;
    lenderRejectionReason?: string | undefined;
    reason?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/lender`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to update lender on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function submitToLenderApi(
  caseId: string,
  payload: {
    lender: string;
    applicationNo?: string | undefined;
    notes?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; submission?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/lender/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to submit lead to lender on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function updateLenderDecisionApi(
  caseId: string,
  payload: {
    status: string;
    rejectionReason?: string | undefined;
    sanctionAmount?: number | undefined;
    roi?: number | undefined;
    tenure?: number | undefined;
    notes?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/lender/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to update lender decision on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function rerouteToNewLenderApi(
  caseId: string,
  payload: {
    newLender: string;
    applicationNo?: string | undefined;
    reason?: string | undefined;
    authorName: string;
  }
): Promise<{ success: boolean; submission?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/lender/reroute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to re-route lead to new lender on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

export async function addCommentApi(
  caseId: string,
  payload: {
    comment: string;
    authorName: string;
  }
): Promise<{ success: boolean; activity?: any; lead?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/leads/${encodeURIComponent(caseId)}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: data.error || "Failed to save comment on backend.",
      };
    }

    return data;
  } catch (err) {
    return {
      success: false,
      error: "Unable to connect to backend server.",
    };
  }
}

// -------------------------------------------------------------
// LOAN PROCESSING & MULTI-LENDER SUBMISSION APIS
// -------------------------------------------------------------

export async function fetchLoanApplicationsApi(params?: {
  status?: string;
  leadId?: string;
  lender?: string;
  relationshipManager?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  applications?: any[];
  summary?: any;
  pagination?: any;
  error?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params) {
      if (params.status && params.status !== "All") query.set("status", params.status);
      if (params.leadId) query.set("leadId", params.leadId);
      if (params.lender && params.lender !== "All") query.set("lender", params.lender);
      if (params.relationshipManager) query.set("relationshipManager", params.relationshipManager);
      if (params.search) query.set("search", params.search);
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
    }

    const res = await fetch(`${API_BASE_URL}/loan-applications?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to fetch loan applications." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function fetchLoanApplicationSummaryApi(): Promise<{
  success: boolean;
  summary?: any;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/summary`, {
      method: "GET",
      headers: authHeaders(),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to fetch loan processing summary." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function fetchLoanApplicationByIdApi(id: string): Promise<{
  success: boolean;
  application?: any;
  disbursements?: any[];
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}`, {
      method: "GET",
      headers: authHeaders(),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to fetch loan application details." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function createLoanApplicationsApi(payload: {
  leadId: string;
  lenders: Array<{ lender: string; requestedAmount: number; notes?: string }>;
  programType?: string;
  loanProduct?: string;
  selectedDocumentIds?: string[];
}): Promise<{
  success: boolean;
  created?: any[];
  message?: string;
  error?: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to create lender applications." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function updateLoanApplicationApi(
  id: string,
  payload: any
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to update loan application." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function recordBankSubmissionApi(
  id: string,
  payload: {
    submissionChannel: "Bank Portal" | "Email" | "API" | "Branch Physical";
    bankReferenceNumber: string;
    submissionDate?: string;
    notes?: string;
    acknowledgementDocUrl?: string;
  }
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/submit`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to record bank submission." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function updateLoanApplicationStatusApi(
  id: string,
  payload: {
    status: string;
    remarks?: string;
  }
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to update application status." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function addBankQueryApi(
  id: string,
  payload: {
    queryTitle: string;
    description: string;
    deadline?: string;
    priority?: string;
  }
): Promise<{ success: boolean; application?: any; query?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/queries`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to add bank query." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function respondBankQueryApi(
  id: string,
  queryId: string,
  payload: {
    response: string;
    attachmentUrls?: string[];
    isResolved?: boolean;
  }
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/queries/${encodeURIComponent(queryId)}/respond`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      }
    );

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to respond to bank query." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function recordSanctionDecisionApi(
  id: string,
  payload: {
    decision: "Sanctioned" | "Rejected";
    sanctionedAmount?: number;
    interestRate?: number;
    interestType?: "Fixed" | "Floating";
    loanTenureMonths?: number;
    moratoriumPeriodMonths?: number;
    processingFee?: number;
    sanctionDate?: string;
    sanctionLetterUrl?: string;
    sanctionReferenceNumber?: string;
    rejectionReason?: string;
    rejectionCategory?: string;
    notes?: string;
  }
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/decision`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to record sanction/decision." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function recordStudentAcceptanceApi(
  id: string,
  payload: {
    studentAcceptance: "Accepted" | "Rejected" | "Clarification Requested";
    acceptanceDate?: string;
    studentRemarks?: string;
  }
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/student-acceptance`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to record student acceptance." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function updateAgreementAndConditionsApi(
  id: string,
  payload: {
    agreementSignedDate?: string;
    agreementDocumentUrl?: string;
    stampDutyPaid?: boolean;
    nachSubmitted?: boolean;
    conditions?: Array<{
      conditionType: string;
      title: string;
      description?: string;
      status: "Pending" | "Submitted" | "Under Verification" | "Verified" | "Rejected" | "Not Applicable";
      verificationRemarks?: string;
    }>;
  }
): Promise<{ success: boolean; application?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/loan-applications/${encodeURIComponent(id)}/agreement-conditions`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to update agreement & conditions." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

// -------------------------------------------------------------
// MULTI-TRANCHE DISBURSEMENT APIS
// -------------------------------------------------------------

export async function fetchDisbursementsApi(params?: {
  loanApplicationId?: string;
  leadId?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  disbursements?: any[];
  summary?: any;
  pagination?: any;
  error?: string;
}> {
  try {
    const query = new URLSearchParams();
    if (params) {
      if (params.loanApplicationId) query.set("loanApplicationId", params.loanApplicationId);
      if (params.leadId) query.set("leadId", params.leadId);
      if (params.status && params.status !== "All") query.set("status", params.status);
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
    }

    const res = await fetch(`${API_BASE_URL}/disbursements?${query.toString()}`, {
      method: "GET",
      headers: authHeaders(),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to fetch disbursements." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function createDisbursementApi(payload: {
  loanApplicationId: string;
  leadId: string;
  trancheNumber?: number;
  purpose: "Tuition Fee" | "Living Expense" | "Insurance" | "Travel / Forex" | "Other";
  beneficiaryType: "University Directly" | "Student Account" | "Co-borrower Account" | "Forex Vendor";
  beneficiaryName: string;
  beneficiaryAccount?: string;
  beneficiaryBankIfscSwift?: string;
  requestedAmount: number;
  notes?: string;
}): Promise<{ success: boolean; disbursement?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/disbursements`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to create disbursement tranche." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}

export async function updateDisbursementApi(
  id: string,
  payload: {
    status?: "Requested" | "Bank Approved" | "Disbursed" | "Partially Disbursed" | "On Hold" | "Cancelled";
    approvedAmount?: number;
    disbursedAmount?: number;
    utrNumber?: string;
    paymentDate?: string;
    disbursementReceiptUrl?: string;
    remarks?: string;
  }
): Promise<{ success: boolean; disbursement?: any; error?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/disbursements/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });

    handleAuthStatus(res);
    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.error || "Failed to update disbursement tranche." };
    }
    return data;
  } catch (err) {
    return { success: false, error: "Unable to connect to backend server." };
  }
}
