export type UserRole = "admin" | "sales" | "processing" | "viewer";

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
  admin: {
    id: "usr_admin_01",
    name: "Venkatesh Kota",
    email: "venkatesh.k@normiloans.com",
    role: "admin",
    roleTitle: "Founder & Managing Director",
    department: "Executive Management",
  },
  sales: {
    id: "usr_sales_01",
    name: "Praveen K",
    email: "praveen.k@normiloans.com",
    role: "sales",
    roleTitle: "Senior Tele-Calling & Sales Exec",
    department: "Sales & Lead Gen",
  },
  processing: {
    id: "usr_proc_01",
    name: "Nikhil V",
    email: "nikhil.v@normiloans.com",
    role: "processing",
    roleTitle: "Lead Loan Processing Officer",
    department: "Credit & Bank Operations",
  },
  viewer: {
    id: "usr_view_01",
    name: "Swathi Sharma",
    email: "swathi.s@auditors.com",
    role: "viewer",
    roleTitle: "External Auditor / Operations Viewer",
    department: "Audit & Compliance",
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
  admin: [
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
  sales: [
    "dashboard:view",
    "leads:view",
    "leads:create",
    "leads:edit",
    "followups:manage",
    "cases:view_assigned",
  ],
  processing: [
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
  viewer: [
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
  return role === "viewer";
}
