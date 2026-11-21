export type UserRole = "telecom" | "relationship_manager" | "manager" | "superadmin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  department: string;
  avatar?: string;
}

export const MOCK_USERS: Record<UserRole, UserProfile> = {
  superadmin: {
    id: "usr_superadmin_01",
    name: "Venkatesh Kota",
    email: "venkatesh.k@normiloans.com",
    role: "superadmin",
    roleTitle: "Founder & Managing Director",
    department: "Executive Management",
  },
  telecom: {
    id: "usr_telecom_01",
    name: "Praveen K",
    email: "praveen.k@normiloans.com",
    role: "telecom",
    roleTitle: "Telecom Team",
    department: "Telecom & Lead Generation",
  },
  relationship_manager: {
    id: "usr_rm_01",
    name: "Nikhil V",
    email: "nikhil.v@normiloans.com",
    role: "relationship_manager",
    roleTitle: "Relationship Manager",
    department: "Relationship & Credit Operations",
  },
  manager: {
    id: "usr_manager_01",
    name: "Swathi Sharma",
    email: "swathi.s@auditors.com",
    role: "manager",
    roleTitle: "Manager",
    department: "Operations Management",
  },
};

export type Permission =
  | "dashboard:view"
  | "leads:view"
  | "leads:create"
  | "leads:edit"
  | "leads:assign"
  | "followups:manage"
  | "cases:view_all"
  | "cases:view_assigned"
  | "cases:edit"
  | "documents:manage"
  | "documents:verify"
  | "lender_submission:manage"
  | "bank_queries:manage"
  | "sanctions:manage"
  | "disbursements:view"
  | "disbursements:manage"
  | "commissions:view"
  | "commissions:manage"
  | "reports:view"
  | "users:manage"
  | "activity_log:view";

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  superadmin: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "leads:assign",
    "followups:manage",
    "cases:view_all",
    "cases:view_assigned",
    "cases:edit",
    "documents:manage",
    "documents:verify",
    "lender_submission:manage",
    "bank_queries:manage",
    "sanctions:manage",
    "disbursements:view",
    "disbursements:manage",
    "commissions:view",
    "commissions:manage",
    "reports:view",
    "users:manage",
    "activity_log:view",
  ],
  telecom: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "followups:manage",
    "cases:view_assigned",
  ],
  relationship_manager: [
    "dashboard:view",
    "cases:view_all",
    "cases:view_assigned",
    "cases:edit",
    "documents:manage",
    "documents:verify",
    "lender_submission:manage",
    "bank_queries:manage",
    "sanctions:manage",
    "disbursements:view",
    "disbursements:manage",
  ],
  manager: [
    "dashboard:view",
    "leads:view",
    "cases:view_all",
    "disbursements:view",
    "reports:view",
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canCreate(role: UserRole): boolean {
  return hasPermission(role, "leads:create");
}

export function canEdit(role: UserRole): boolean {
  return hasPermission(role, "cases:edit") || hasPermission(role, "leads:edit");
}

export function isReadOnly(role: UserRole): boolean {
  return role === "manager";
}
