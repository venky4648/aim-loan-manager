import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { UserRole, UserProfile, MOCK_USERS, hasPermission, type Permission } from "./permissions";

interface AuthContextType {
  role: UserRole;
  user: UserProfile;
  setRole: (role: UserRole) => void;
  hasPerm: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "normiloans_crm_role";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("admin");
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.admin);

  // Load saved role and user on client mount to avoid SSR hydration mismatches
  useEffect(() => {
    try {
      const crmUserRaw = localStorage.getItem("crm_user");
      if (crmUserRaw) {
        const parsed = JSON.parse(crmUserRaw);
        const rawRole = parsed?.role ? String(parsed.role).toLowerCase() : "";
        const matchedRole: UserRole =
          rawRole && (MOCK_USERS as Record<string, UserProfile>)[rawRole]
            ? (rawRole as UserRole)
            : "admin";
        setRoleState(matchedRole);
        setCurrentUser({
          ...MOCK_USERS[matchedRole],
          name: parsed.name || MOCK_USERS[matchedRole].name,
          email: parsed.email || MOCK_USERS[matchedRole].email,
        });
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEY) as UserRole;
      if (saved && MOCK_USERS[saved]) {
        setRoleState(saved);
        setCurrentUser(MOCK_USERS[saved]);
      }
    } catch (err) {
      console.warn("[AuthProvider] Error reading saved auth state:", err);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    const raw = String(newRole).toLowerCase() as UserRole;
    const validRole: UserRole = MOCK_USERS[raw] ? raw : "sales";
    setRoleState(validRole);
    setCurrentUser(MOCK_USERS[validRole]);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, validRole);
      } catch {}
    }
  };

  const user = currentUser || MOCK_USERS[role] || MOCK_USERS.admin;

  const hasPerm = (permission: Permission) => {
    return hasPermission(role || "admin", permission);
  };

  return (
    <AuthContext.Provider value={{ role, user, setRole, hasPerm }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
