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
  const [role, setRoleState] = useState<UserRole>("superadmin");
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS.superadmin);

  // Load saved role and user on client mount to avoid SSR hydration mismatches
  useEffect(() => {
    try {
      const crmUserRaw = localStorage.getItem("crm_user");
      if (crmUserRaw) {
        const parsed = JSON.parse(crmUserRaw);
        const rawRole = parsed?.role ? String(parsed.role).toLowerCase() : "";
        const roleMap: Record<string, UserRole> = {
          sales: "telecom",
          processing: "relationship_manager",
          viewer: "manager",
          admin: "superadmin",
          telecom: "telecom",
          relationship_manager: "relationship_manager",
          manager: "manager",
          superadmin: "superadmin",
        };
        const matchedRole = roleMap[rawRole] || "superadmin";
        setRoleState(matchedRole);
        setCurrentUser({
          ...MOCK_USERS[matchedRole],
          name: parsed.name || MOCK_USERS[matchedRole].name,
          email: parsed.email || MOCK_USERS[matchedRole].email,
        });
        return;
      }
      const saved = localStorage.getItem(STORAGE_KEY) as UserRole;
      const savedMap: Record<string, UserRole> = {
        sales: "telecom",
        processing: "relationship_manager",
        viewer: "manager",
        admin: "superadmin",
      };
      const savedRole = savedMap[saved] || (MOCK_USERS[saved] ? saved : "superadmin");
      if (savedRole && MOCK_USERS[savedRole]) {
        setRoleState(savedRole);
        setCurrentUser(MOCK_USERS[savedRole]);
      }
    } catch (err) {
      console.warn("[AuthProvider] Error reading saved auth state:", err);
    }
  }, []);

  const setRole = (newRole: UserRole) => {
    const raw = String(newRole).toLowerCase() as UserRole;
    const validRole: UserRole = MOCK_USERS[raw] ? raw : "telecom";
    setRoleState(validRole);
    setCurrentUser(MOCK_USERS[validRole]);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, validRole);
      } catch {}
    }
  };

  const user = currentUser || MOCK_USERS[role] || MOCK_USERS.superadmin;

  const hasPerm = (permission: Permission) => {
    return hasPermission(role || "superadmin", permission);
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
