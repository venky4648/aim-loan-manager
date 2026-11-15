export const API_BASE_URL =
  (import.meta.env as Record<string, string | undefined>)["VITE_API_BASE_URL"] ||
  (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? "https://loancrm-backend.llp.trizenventures.com/api/v1"
    : "http://localhost:5000/api/v1");

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
    role: "admin" | "sales" | "processing" | "viewer" | "student";
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

