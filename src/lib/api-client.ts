export const API_BASE_URL = "http://localhost:5000/api/v1";

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
