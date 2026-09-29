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
  const [role, setRoleState] = useState<UserRole>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY) as UserRole;
      if (saved && MOCK_USERS[saved]) {
        return saved;
      }
    }
    return "admin";
  });

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newRole);
    }
  };

  const user = MOCK_USERS[role];

  const hasPerm = (permission: Permission) => {
    return hasPermission(role, permission);
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
