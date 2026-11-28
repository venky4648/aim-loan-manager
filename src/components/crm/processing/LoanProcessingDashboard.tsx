import React, { useState, useEffect, useMemo } from "react";
import {
  Building2,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Send,
  HelpCircle,
  Award,
  CreditCard,
  FileText,
  FileCheck2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileSignature,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  LoanApplicationRecord,
  LoanApplicationStatus,
  LoanProcessingSummary,
  INITIAL_LOAN_APPLICATIONS,
} from "@/lib/demo-data";
import {
  fetchLoanApplicationsApi,
  fetchLoanApplicationSummaryApi,
} from "@/lib/api-client";
import { useCases } from "@/lib/cases-context";
import { AddLenderApplicationModal } from "./AddLenderApplicationModal";
import { LenderApplicationDrawer } from "./LenderApplicationDrawer";

type SubNavTab =
  | "all"
  | "ready"
  | "submitted"
  | "review"
  | "queries"
  | "sanctioned"
  | "rejected"
  | "agreements"
  | "disbursements";

const SUB_NAV_TABS: Array<{ id: SubNavTab; label: string; countKey?: keyof LoanProcessingSummary }> = [
  { id: "all", label: "All Applications", countKey: "totalApplications" },
  { id: "ready", label: "Ready to Submit", countKey: "readyToSubmit" },
  { id: "submitted", label: "Submitted to Bank", countKey: "submittedToBank" },
  { id: "review", label: "Under Review", countKey: "underReview" },
  { id: "queries", label: "Bank Queries", countKey: "bankQueries" },
  { id: "sanctioned", label: "Sanctioned", countKey: "sanctioned" },
  { id: "rejected", label: "Rejected", countKey: "rejected" },
  { id: "agreements", label: "Agreement & Conditions" },
  { id: "disbursements", label: "Disbursements" },
];

export function LoanProcessingDashboard() {
  const { cases } = useCases();
  const [activeTab, setActiveTab] = useState<SubNavTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLender, setSelectedLender] = useState<string>("All");
  const [selectedRM, setSelectedRM] = useState<string>("All");
  const [selectedSanctionStatus, setSelectedSanctionStatus] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(false);

  // Data from backend or fallback to initial
  const [applications, setApplications] = useState<LoanApplicationRecord[]>(INITIAL_LOAN_APPLICATIONS);
  const [summary, setSummary] = useState<LoanProcessingSummary>({
    totalApplications: 5,
    readyToSubmit: 1,
    submittedToBank: 1,
    underReview: 1,
    bankQueries: 1,
    sanctioned: 1,
    rejected: 0,
    agreementSigned: 0,
    disbursed: 1,
    totalSanctionedAmount: 4200000,
    totalDisbursedAmount: 2200000,
  });

  // Modal & Drawer states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAppForDrawer, setSelectedAppForDrawer] = useState<LoanApplicationRecord | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [appsRes, summaryRes] = await Promise.all([
        fetchLoanApplicationsApi(),
        fetchLoanApplicationSummaryApi(),
      ]);

      if (appsRes.success && appsRes.applications && appsRes.applications.length > 0) {
        setApplications(appsRes.applications);
      }
      if (summaryRes.success && summaryRes.summary) {
        setSummary(summaryRes.summary);
      }
    } catch (err) {
      console.error("Failed to load loan processing data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter applications by Sub-Navigation Tab
  const tabFilteredApps = useMemo(() => {
    return applications.filter((app) => {
      switch (activeTab) {
        case "ready":
          return app.applicationStatus === "Ready to Submit";
        case "submitted":
          return app.applicationStatus === "Submitted to Bank";
        case "review":
          return app.applicationStatus === "Under Review";
        case "queries":
          return (
            app.applicationStatus === "Query Raised" ||
            (app.bankQueries && app.bankQueries.some((q) => q.status === "Open"))
          );
        case "sanctioned":
          return app.applicationStatus === "Sanctioned";
        case "rejected":
          return app.applicationStatus === "Rejected";
        case "agreements":
          return (
            app.applicationStatus === "Agreement Signed" ||
            app.applicationStatus === "Sanctioned" ||
            (app.conditions && app.conditions.length > 0)
          );
        case "disbursements":
          return (
            app.applicationStatus === "Disbursed" ||
            app.applicationStatus === "Sanctioned" ||
            app.applicationStatus === "Agreement Signed"
          );
        case "all":
        default:
          return true;
      }
    });
  }, [applications, activeTab]);

  // Apply secondary filters (Search, Lender, RM, Sanction Status)
  const filteredApplications = useMemo(() => {
    return tabFilteredApps.filter((app) => {
      // Search: Student name, Case ID, App ID
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStudent = app.studentName?.toLowerCase().includes(q);
        const matchesCaseId = app.leadId?.toLowerCase().includes(q);
        const matchesAppId = app.applicationId?.toLowerCase().includes(q);
        if (!matchesStudent && !matchesCaseId && !matchesAppId) return false;
      }

      // Lender filter
      if (selectedLender !== "All" && app.lender !== selectedLender) {
        return false;
      }

      // RM filter
      if (selectedRM !== "All" && app.assignedRM !== selectedRM) {
        return false;
      }

      // Sanction filter
      if (selectedSanctionStatus === "Sanctioned" && app.applicationStatus !== "Sanctioned") {
        return false;
      }
      if (selectedSanctionStatus === "Not Sanctioned" && app.applicationStatus === "Sanctioned") {
        return false;
      }

      return true;
    });
  }, [tabFilteredApps, searchQuery, selectedLender, selectedRM, selectedSanctionStatus]);

  // Unique lists for filter dropdowns
  const uniqueLenders = useMemo(() => {
    const list = Array.from(new Set(applications.map((a) => a.lender))).filter(Boolean);
    return list;
  }, [applications]);

  const uniqueRMs = useMemo(() => {
    const list = Array.from(new Set(applications.map((a) => a.assignedRM))).filter(Boolean);
    return list;
  }, [applications]);

  const getStatusBadge = (status: LoanApplicationStatus) => {
    const map: Record<LoanApplicationStatus, string> = {
      "Draft": "bg-slate-100 text-slate-700 border-slate-300",
      "Ready to Submit": "bg-slate-200 text-slate-800 border-slate-400 font-medium",
      "Submitted to Bank": "bg-slate-800 text-white border-slate-800 font-medium",
      "Under Review": "bg-slate-200 text-slate-900 border-slate-400 font-medium",
      "Additional Documents Required": "bg-slate-100 text-slate-800 border-slate-300 font-medium",
      "Query Raised": "bg-slate-200 text-slate-900 border-slate-400 font-semibold",
      "Conditionally Approved": "bg-slate-800 text-white border-slate-800 font-semibold",
      "Sanctioned": "bg-slate-900 text-white border-slate-900 font-semibold",
      "Rejected": "bg-slate-100 text-slate-600 border-slate-300 line-through",
      "Agreement Signed": "bg-slate-800 text-white border-slate-800 font-semibold",
      "Disbursed": "bg-slate-950 text-white border-slate-950 font-bold",
      "Withdrawn": "bg-slate-100 text-slate-500 border-slate-300",
      "Expired": "bg-slate-100 text-slate-500 border-slate-300",
      "Closed": "bg-slate-100 text-slate-500 border-slate-300",
    };
    return <Badge variant="outline" className={map[status] || "bg-slate-100 text-slate-700 border-slate-300"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Loan Processing Desk</h1>
              <p className="text-sm text-muted-foreground">
                Independent multi-lender application submission, underwriting query resolution, sanctions & disbursement.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Lender Application
          </Button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Total Apps</span>
          <span className="text-xl font-bold font-mono text-slate-900">{summary.totalApplications}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-600 uppercase font-semibold block">Ready</span>
          <span className="text-xl font-bold font-mono text-slate-900">{summary.readyToSubmit}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-600 uppercase font-semibold block">Submitted</span>
          <span className="text-xl font-bold font-mono text-slate-900">{summary.submittedToBank}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-600 uppercase font-semibold block">In Review</span>
          <span className="text-xl font-bold font-mono text-slate-900">{summary.underReview}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-600 uppercase font-semibold block">Queries</span>
          <span className="text-xl font-bold font-mono text-slate-900">{summary.bankQueries}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-700 uppercase font-semibold block">Sanctioned</span>
          <span className="text-xl font-bold font-mono text-slate-950">{summary.sanctioned}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Rejected</span>
          <span className="text-xl font-bold font-mono text-slate-700">{summary.rejected}</span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Sanctioned Total</span>
          <span className="text-base font-bold font-mono text-slate-900">
            ₹{((summary.totalSanctionedAmount || 0) / 100000).toFixed(1)}L
          </span>
        </div>
        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block">Disbursed Total</span>
          <span className="text-base font-bold font-mono text-slate-900">
            ₹{((summary.totalDisbursedAmount || 0) / 100000).toFixed(1)}L
          </span>
        </div>
      </div>

      {/* 9 Sub-Navigation Tabs */}
      <div className="border-b flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
        {SUB_NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = tab.countKey ? summary[tab.countKey] : undefined;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              {typeof count === "number" && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted-foreground/15 text-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-card p-3 rounded-xl border shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by Student Name, Case ID (e.g. NL-1048), or App ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Lender Filter */}
          <select
            value={selectedLender}
            onChange={(e) => setSelectedLender(e.target.value)}
            className="h-9 px-3 text-xs border rounded-lg bg-background"
          >
            <option value="All">All Lenders</option>
            {uniqueLenders.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          {/* RM Filter */}
          <select
            value={selectedRM}
            onChange={(e) => setSelectedRM(e.target.value)}
            className="h-9 px-3 text-xs border rounded-lg bg-background"
          >
            <option value="All">All RMs</option>
            {uniqueRMs.map((rm) => (
              <option key={rm} value={rm}>
                {rm}
              </option>
            ))}
          </select>

          {/* Sanction Status */}
          <select
            value={selectedSanctionStatus}
            onChange={(e) => setSelectedSanctionStatus(e.target.value)}
            className="h-9 px-3 text-xs border rounded-lg bg-background"
          >
            <option value="All">All Sanction States</option>
            <option value="Sanctioned">Sanctioned Only</option>
            <option value="Not Sanctioned">Not Sanctioned</option>
          </select>
        </div>
      </div>

      {/* Application Table */}
      <div className="border rounded-xl bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 text-muted-foreground border-b uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Lender</th>
                <th className="py-3 px-4">Assigned RM</th>
                <th className="py-3 px-4">Requested Amt</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Bank Status</th>
                <th className="py-3 px-4">Sanctioned Amt</th>
                <th className="py-3 px-4">Last Updated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-muted-foreground text-sm">
                    No loan applications matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => (
                  <tr
                    key={app.id || app.applicationId}
                    className="hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedAppForDrawer(app)}
                  >
                    <td className="py-3 px-4 font-semibold text-foreground">
                      <div>{app.studentName}</div>
                      <span className="text-[11px] text-muted-foreground font-normal">
                        {app.university || "University"} ({app.country || "Global"})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      {app.leadId}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-4 font-medium flex items-center gap-1.5 pt-4">
                      <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                      {app.lender}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {app.assignedRM || "Unassigned"}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      ₹{app.requestedAmount?.toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {app.submissionDetails?.submittedAt
                        ? new Date(app.submissionDetails.submittedAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(app.applicationStatus)}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {app.sanctionDetails?.sanctionedAmount ? (
                        <span className="text-slate-900 font-semibold font-mono">
                          ₹{app.sanctionDetails.sanctionedAmount.toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {new Date(app.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAppForDrawer(app);
                        }}
                        className="h-7 text-xs px-2 gap-1"
                      >
                        Manage
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prepare / Add Lender Modal */}
      <AddLenderApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        allCases={cases}
        onSuccess={loadData}
      />

      {/* Lender Detail & Action Drawer */}
      <LenderApplicationDrawer
        isOpen={!!selectedAppForDrawer}
        onClose={() => setSelectedAppForDrawer(null)}
        application={selectedAppForDrawer}
        onRefresh={loadData}
      />
    </div>
  );
}
