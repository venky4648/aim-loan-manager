import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Send,
  HelpCircle,
  Award,
  UserCheck,
  FileSignature,
  CreditCard,
  History,
  FileCheck2,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  LoanApplicationRecord,
  LoanApplicationStatus,
  BankQueryItem,
  DisbursementTranche,
} from "@/lib/demo-data";
import {
  recordBankSubmissionApi,
  updateLoanApplicationStatusApi,
  addBankQueryApi,
  respondBankQueryApi,
  recordSanctionDecisionApi,
  recordStudentAcceptanceApi,
  updateAgreementAndConditionsApi,
  createDisbursementApi,
  updateDisbursementApi,
} from "@/lib/api-client";
import { toast } from "sonner";

interface LenderApplicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application: LoanApplicationRecord | null;
  onRefresh: () => void;
}

export function LenderApplicationDrawer({
  isOpen,
  onClose,
  application,
  onRefresh,
}: LenderApplicationDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Tab 2: Bank Submission form state
  const [channel, setChannel] = useState<"Bank Portal" | "Email" | "API" | "Branch Physical">("Bank Portal");
  const [bankRefNo, setBankRefNo] = useState("");
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split("T")[0]);
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [isSubmittingBank, setIsSubmittingBank] = useState(false);

  // Tab 3: Bank Queries form state
  const [newQueryTitle, setNewQueryTitle] = useState("");
  const [newQueryDesc, setNewQueryDesc] = useState("");
  const [newQueryDeadline, setNewQueryDeadline] = useState("");
  const [queryResponseText, setQueryResponseText] = useState<{ [key: string]: string }>({});
  const [isQuerySubmitting, setIsQuerySubmitting] = useState(false);

  // Tab 4: Sanction / Decision form state
  const [decision, setDecision] = useState<"Sanctioned" | "Rejected">("Sanctioned");
  const [sanctionAmount, setSanctionAmount] = useState<number>(application?.requestedAmount || 3500000);
  const [interestRate, setInterestRate] = useState<number>(10.5);
  const [interestType, setInterestType] = useState<"Fixed" | "Floating">("Floating");
  const [tenureMonths, setTenureMonths] = useState<number>(120);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(24);
  const [processingFee, setProcessingFee] = useState<number>(15000);
  const [sanctionRefNo, setSanctionRefNo] = useState("");
  const [sanctionDate, setSanctionDate] = useState(new Date().toISOString().split("T")[0]);
  const [sanctionLetterUrl, setSanctionLetterUrl] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isDecisionSubmitting, setIsDecisionSubmitting] = useState(false);

  // Tab 5: Student Acceptance state
  const [studentChoice, setStudentChoice] = useState<"Accepted" | "Rejected" | "Clarification Requested">("Accepted");
  const [studentRemarks, setStudentRemarks] = useState("");
  const [isAcceptanceSubmitting, setIsAcceptanceSubmitting] = useState(false);

  // Tab 6: Agreement & CP state
  const [stampDutyPaid, setStampDutyPaid] = useState(application?.agreementDetails?.stampDutyPaid || false);
  const [nachSubmitted, setNachSubmitted] = useState(application?.agreementDetails?.nachSubmitted || false);
  const [conditions, setConditions] = useState<any[]>(
    application?.conditions && application.conditions.length > 0
      ? application.conditions
      : [
          { conditionType: "Margin Money", title: "Margin Money Proof (20%)", status: "Pending" },
          { conditionType: "Visa", title: "Valid Student Visa copy", status: "Pending" },
          { conditionType: "I-20 / CAS", title: "Official Admission I-20 or CAS letter", status: "Pending" },
          { conditionType: "Security PDC", title: "Security Post-dated Cheques signed", status: "Pending" },
        ]
  );
  const [isAgreementSubmitting, setIsAgreementSubmitting] = useState(false);

  // Tab 7: Disbursement tranche state
  const [tranchePurpose, setTranchePurpose] = useState<"Tuition Fee" | "Living Expense" | "Insurance" | "Travel / Forex" | "Other">("Tuition Fee");
  const [trancheBeneficiaryType, setTrancheBeneficiaryType] = useState<"University Directly" | "Student Account" | "Co-borrower Account" | "Forex Vendor">("University Directly");
  const [trancheBeneficiaryName, setTrancheBeneficiaryName] = useState(application?.university || "University Bursar");
  const [trancheAmount, setTrancheAmount] = useState<number>(application?.sanctionDetails?.sanctionedAmount || 2000000);
  const [isTrancheSubmitting, setIsTrancheSubmitting] = useState(false);

  if (!application) return null;

  // Handler: Submit to Bank
  const handleBankSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankRefNo.trim()) {
      toast.error("Please enter bank portal reference number.");
      return;
    }
    setIsSubmittingBank(true);
    try {
      const payload: any = {
        submissionChannel: channel,
        bankReferenceNumber: bankRefNo,
      };
      if (submissionDate) payload.submissionDate = submissionDate;
      if (submissionNotes) payload.notes = submissionNotes;

      const res = await recordBankSubmissionApi(application.id || application.applicationId, payload);
      if (res.success) {
        toast.success(`Marked application as Submitted to ${application.lender}.`);
        onRefresh();
      } else {
        toast.error(res.error || "Failed to record submission");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmittingBank(false);
    }
  };

  // Handler: Add Bank Query
  const handleAddQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueryTitle.trim() || !newQueryDesc.trim()) {
      toast.error("Title and description are required.");
      return;
    }
    setIsQuerySubmitting(true);
    try {
      const payload: any = {
        queryTitle: newQueryTitle,
        description: newQueryDesc,
      };
      if (newQueryDeadline) payload.deadline = newQueryDeadline;

      const res = await addBankQueryApi(application.id || application.applicationId, payload);
      if (res.success) {
        toast.success("Application status changed to Bank Queries.");
        setNewQueryTitle("");
        setNewQueryDesc("");
        setNewQueryDeadline("");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to add query");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsQuerySubmitting(false);
    }
  };

  // Handler: Respond to query
  const handleRespondQuery = async (queryId: string) => {
    const response = queryResponseText[queryId];
    if (!response || !response.trim()) {
      toast.error("Please write a response to this bank query.");
      return;
    }
    try {
      const res = await respondBankQueryApi(application.id || application.applicationId, queryId, {
        response,
        isResolved: true,
      });
      if (res.success) {
        toast.success("Query resolved and application updated to Under Review.");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to respond");
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Handler: Record Sanction / Decision
  const handleSanctionDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDecisionSubmitting(true);
    try {
      const payload: any = {
        decision,
        sanctionedAmount: sanctionAmount,
        interestRate,
        interestType,
        loanTenureMonths: tenureMonths,
        moratoriumPeriodMonths: moratoriumMonths,
        processingFee,
      };
      if (sanctionDate) payload.sanctionDate = sanctionDate;
      if (sanctionLetterUrl) payload.sanctionLetterUrl = sanctionLetterUrl;
      if (sanctionRefNo) payload.sanctionReferenceNumber = sanctionRefNo;
      if (rejectionReason) payload.rejectionReason = rejectionReason;

      const res = await recordSanctionDecisionApi(application.id || application.applicationId, payload);
      if (res.success) {
        toast.success(
          decision === "Sanctioned"
            ? "Loan Sanction Recorded!"
            : "Rejection Recorded"
        );
        onRefresh();
      } else {
        toast.error(res.error || "Failed to record decision");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDecisionSubmitting(false);
    }
  };

  // Handler: Record Student Acceptance
  const handleStudentAcceptance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAcceptanceSubmitting(true);
    try {
      const res = await recordStudentAcceptanceApi(application.id || application.applicationId, {
        studentAcceptance: studentChoice,
        acceptanceDate: new Date().toISOString(),
        studentRemarks,
      });
      if (res.success) {
        toast.success(`Offer marked as ${studentChoice}.`);
        onRefresh();
      } else {
        toast.error(res.error || "Failed to record acceptance");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAcceptanceSubmitting(false);
    }
  };

  // Handler: Agreement & Conditions
  const handleUpdateConditions = async () => {
    setIsAgreementSubmitting(true);
    try {
      const res = await updateAgreementAndConditionsApi(application.id || application.applicationId, {
        stampDutyPaid,
        nachSubmitted,
        conditions,
      });
      if (res.success) {
        toast.success("Agreement checklist & CPs saved.");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to update conditions");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsAgreementSubmitting(false);
    }
  };

  // Handler: Create Disbursement Tranche
  const handleCreateTranche = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTrancheSubmitting(true);
    try {
      const res = await createDisbursementApi({
        loanApplicationId: application.id || application.applicationId,
        leadId: application.leadId,
        purpose: tranchePurpose,
        beneficiaryType: trancheBeneficiaryType,
        beneficiaryName: trancheBeneficiaryName,
        requestedAmount: trancheAmount,
      });
      if (res.success) {
        toast.success("Disbursement request initiated in Requested status.");
        onRefresh();
      } else {
        toast.error(res.error || "Failed to create tranche");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsTrancheSubmitting(false);
    }
  };

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
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-0 flex flex-col">
        {/* Header Banner */}
        <div className="p-6 border-b bg-card space-y-3 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">{application.lender}</h2>
                  {getStatusBadge(application.applicationStatus)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Application ID: <span className="font-mono text-foreground font-semibold">{application.applicationId}</span> • Case: <span className="font-mono text-foreground font-semibold">{application.leadId}</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Requested Amount</span>
              <span className="text-base font-bold text-primary font-mono">
                ₹{application.requestedAmount?.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t text-muted-foreground">
            <span>Student: <strong className="text-foreground">{application.studentName}</strong></span>
            <span>Target: <strong className="text-foreground">{application.university || "University"}</strong> ({application.country || "Global"})</span>
            <span>RM: <strong className="text-foreground">{application.assignedRM || "Unassigned"}</strong></span>
          </div>
        </div>

        {/* 8 Functional Tabs */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 sm:grid-cols-8 h-auto p-1 bg-muted/60">
              <TabsTrigger value="overview" className="text-xs py-2">
                Overview
              </TabsTrigger>
              <TabsTrigger value="submission" className="text-xs py-2">
                Submit
              </TabsTrigger>
              <TabsTrigger value="queries" className="text-xs py-2 relative">
                Queries
                {(application.bankQueries || []).filter((q: any) => q.status === "Open").length > 0 && (
                  <span className="ml-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse inline-block" />
                )}
              </TabsTrigger>
              <TabsTrigger value="decision" className="text-xs py-2">
                Decision
              </TabsTrigger>
              <TabsTrigger value="acceptance" className="text-xs py-2">
                Acceptance
              </TabsTrigger>
              <TabsTrigger value="agreement" className="text-xs py-2">
                CP & Agree
              </TabsTrigger>
              <TabsTrigger value="disbursements" className="text-xs py-2">
                Disburse
              </TabsTrigger>
              <TabsTrigger value="audit" className="text-xs py-2">
                Audit
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: OVERVIEW & DOCUMENTS */}
            <TabsContent value="overview" className="space-y-4">
              <div className="rounded-xl border p-4 bg-muted/20 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileCheck2 className="w-4 h-4 text-primary" />
                  Application Parameters & Shared Documents
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Program / Degree</span>
                    <span className="font-medium">{application.programType || application.course || "Master's"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Loan Product</span>
                    <span className="font-medium">{application.loanProduct || "Unsecured Education Loan"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Created On</span>
                    <span className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">Last Activity</span>
                    <span className="font-medium">{new Date(application.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Status progression card */}
              <div className="rounded-xl border p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Current Bank Processing Status
                </h4>
                <div className="flex items-center gap-3">
                  {getStatusBadge(application.applicationStatus)}
                  <span className="text-xs text-muted-foreground">
                    {application.submissionDetails?.submittedAt
                      ? `Submitted on ${new Date(application.submissionDetails.submittedAt).toLocaleDateString()} via ${application.submissionDetails.channel} (Ref: ${application.submissionDetails.referenceNumber})`
                      : "Not yet submitted to bank portal."}
                  </span>
                </div>
                {application.remarks && (
                  <p className="text-xs text-muted-foreground italic bg-muted/40 p-2.5 rounded-lg border">
                    "{application.remarks}"
                  </p>
                )}
              </div>
            </TabsContent>

            {/* TAB 2: BANK SUBMISSION */}
            <TabsContent value="submission" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Send className="w-4 h-4 text-primary" />
                    Record Official Bank Portal Submission
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Enter the submission acknowledgement details from {application.lender}'s portal.
                  </p>
                </div>

                <form onSubmit={handleBankSubmission} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Submission Channel</Label>
                      <select
                        value={channel}
                        onChange={(e: any) => setChannel(e.target.value)}
                        className="w-full h-9 px-3 text-xs border rounded-md bg-background"
                      >
                        <option value="Bank Portal">Bank Online Portal / Partner API</option>
                        <option value="Email">Official RM Bank Email</option>
                        <option value="API">Direct System-to-Bank API</option>
                        <option value="Branch Physical">Branch Physical Dossier</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Bank Reference / Application No *</Label>
                      <Input
                        type="text"
                        value={bankRefNo}
                        onChange={(e) => setBankRefNo(e.target.value)}
                        placeholder="e.g. HDFC-APP-9982310"
                        className="text-xs h-9 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Submission Date</Label>
                      <Input
                        type="date"
                        value={submissionDate}
                        onChange={(e) => setSubmissionDate(e.target.value)}
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Submission Notes / Login Remarks</Label>
                      <Input
                        type="text"
                        value={submissionNotes}
                        onChange={(e) => setSubmissionNotes(e.target.value)}
                        placeholder="e.g. Uploaded all 14 KYC and academic files"
                        className="text-xs h-9"
                      />
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmittingBank} className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    {isSubmittingBank ? "Recording Submission..." : `Mark as Submitted to ${application.lender}`}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* TAB 3: BANK QUERIES */}
            <TabsContent value="queries" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-4">
                <h4 className="text-sm font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-700" />
                    Lender Queries & Discrepancies
                  </span>
                  <Badge variant="outline">
                    {(application.bankQueries || []).length} query(s) logged
                  </Badge>
                </h4>

                {/* Query List */}
                <div className="space-y-3">
                  {(application.bankQueries || []).length === 0 ? (
                    <div className="text-center py-6 border border-dashed rounded-lg text-xs text-muted-foreground">
                      No queries raised by {application.lender} for this application.
                    </div>
                  ) : (
                    application.bankQueries?.map((qry: any) => (
                      <div
                        key={qry.id || qry._id}
                        className={`p-3.5 rounded-lg border text-xs space-y-2 ${
                          qry.status === "Open" ? "border-slate-400 bg-slate-50" : "bg-muted/30"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {qry.queryTitle || qry.queryDescription}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              qry.status === "Open"
                                ? "bg-slate-900 text-white border-slate-900"
                                : "bg-slate-100 text-slate-700 border-slate-300"
                            }
                          >
                            {qry.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{qry.description || qry.queryDescription}</p>

                        {qry.response && (
                          <div className="p-2 rounded bg-background border text-xs">
                            <span className="font-semibold text-slate-900 block">Response:</span>
                            {qry.response}
                          </div>
                        )}

                        {qry.status === "Open" && (
                          <div className="pt-2 border-t flex items-center gap-2">
                            <Input
                              type="text"
                              placeholder="Write reply to bank..."
                              value={queryResponseText[qry.id || qry._id] || ""}
                              onChange={(e) =>
                                setQueryResponseText({
                                  ...queryResponseText,
                                  [qry.id || qry._id]: e.target.value,
                                })
                              }
                              className="text-xs h-8"
                            />
                            <Button
                              size="sm"
                              className="h-8 text-xs shrink-0"
                              onClick={() => handleRespondQuery(qry.id || qry._id)}
                            >
                              Resolve
                            </Button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Add new Query Form */}
                <form onSubmit={handleAddQuery} className="pt-4 border-t space-y-3">
                  <h5 className="text-xs font-semibold text-muted-foreground uppercase">
                    Log New Bank Query / Requirement
                  </h5>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Query subject / document required..."
                      value={newQueryTitle}
                      onChange={(e) => setNewQueryTitle(e.target.value)}
                      className="text-xs h-8"
                      required
                    />
                    <Textarea
                      placeholder="Detailed explanation from underwriter..."
                      value={newQueryDesc}
                      onChange={(e) => setNewQueryDesc(e.target.value)}
                      className="text-xs"
                      rows={2}
                      required
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="date"
                        value={newQueryDeadline}
                        onChange={(e) => setNewQueryDeadline(e.target.value)}
                        className="text-xs h-8 max-w-[200px]"
                      />
                      <Button type="submit" size="sm" disabled={isQuerySubmitting} className="h-8 text-xs gap-1">
                        <Plus className="w-3.5 h-3.5" />
                        Log Bank Query
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </TabsContent>

            {/* TAB 4: DECISION & SANCTION */}
            <TabsContent value="decision" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-700" />
                  Bank Credit Decision & Sanction Terms
                </h4>

                <form onSubmit={handleSanctionDecision} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant={decision === "Sanctioned" ? "default" : "outline"}
                      onClick={() => setDecision("Sanctioned")}
                      className="flex-1"
                    >
                      Loan Sanctioned (Approved)
                    </Button>
                    <Button
                      type="button"
                      variant={decision === "Rejected" ? "destructive" : "outline"}
                      onClick={() => setDecision("Rejected")}
                      className="flex-1"
                    >
                      Application Rejected
                    </Button>
                  </div>

                  {decision === "Sanctioned" ? (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Sanctioned Amount (₹) *</Label>
                          <Input
                            type="number"
                            value={sanctionAmount}
                            onChange={(e) => setSanctionAmount(Number(e.target.value))}
                            className="text-xs font-mono h-9"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Interest Rate (% p.a.)</Label>
                          <Input
                            type="number"
                            step="0.05"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="text-xs h-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Rate Type</Label>
                          <select
                            value={interestType}
                            onChange={(e: any) => setInterestType(e.target.value)}
                            className="w-full h-9 px-3 text-xs border rounded-md bg-background"
                          >
                            <option value="Floating">Floating Rate</option>
                            <option value="Fixed">Fixed Rate</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tenure (Months)</Label>
                          <Input
                            type="number"
                            value={tenureMonths}
                            onChange={(e) => setTenureMonths(Number(e.target.value))}
                            className="text-xs h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Moratorium (Months)</Label>
                          <Input
                            type="number"
                            value={moratoriumMonths}
                            onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                            className="text-xs h-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Sanction Letter Ref No.</Label>
                          <Input
                            type="text"
                            value={sanctionRefNo}
                            onChange={(e) => setSanctionRefNo(e.target.value)}
                            placeholder="e.g. SL-2026-9901"
                            className="text-xs h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Sanction Date</Label>
                          <Input
                            type="date"
                            value={sanctionDate}
                            onChange={(e) => setSanctionDate(e.target.value)}
                            className="text-xs h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Sanction Letter URL / Link</Label>
                        <Input
                          type="url"
                          value={sanctionLetterUrl}
                          onChange={(e) => setSanctionLetterUrl(e.target.value)}
                          placeholder="https://..."
                          className="text-xs h-9"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Rejection Reason</Label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="e.g. Inadequate co-borrower debt-to-income ratio or collateral shortfall"
                          rows={3}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  )}

                  <Button type="submit" disabled={isDecisionSubmitting} className="w-full gap-2">
                    <Award className="w-4 h-4" />
                    {isDecisionSubmitting ? "Saving Decision..." : `Save Credit Decision for ${application.lender}`}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* TAB 5: STUDENT ACCEPTANCE */}
            <TabsContent value="acceptance" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-4">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-primary" />
                  Student Offer Acceptance Status
                </h4>

                <form onSubmit={handleStudentAcceptance} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Student Decision</Label>
                    <select
                      value={studentChoice}
                      onChange={(e: any) => setStudentChoice(e.target.value)}
                      className="w-full h-9 px-3 text-xs border rounded-md bg-background"
                    >
                      <option value="Accepted">Accepted Offer (Primary Selected Bank)</option>
                      <option value="Rejected">Rejected Offer (Chose alternative bank / terms)</option>
                      <option value="Clarification Requested">Clarification / ROI Negotiation Requested</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Student / RM Notes</Label>
                    <Textarea
                      value={studentRemarks}
                      onChange={(e) => setStudentRemarks(e.target.value)}
                      placeholder="e.g. Student accepted HDFC Credila over SBI due to quicker processing time."
                      rows={3}
                      className="text-xs"
                    />
                  </div>

                  <Button type="submit" disabled={isAcceptanceSubmitting} className="w-full">
                    {isAcceptanceSubmitting ? "Saving..." : "Record Student Acceptance"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* TAB 6: AGREEMENT & CONDITIONS (CP) */}
            <TabsContent value="agreement" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <FileSignature className="w-4 h-4 text-slate-700" />
                    Agreement & Conditions Precedent (CP) Tracker
                  </h4>
                  <Button size="sm" variant="outline" onClick={handleUpdateConditions} disabled={isAgreementSubmitting}>
                    {isAgreementSubmitting ? "Saving..." : "Save Checklist"}
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={stampDutyPaid}
                      onChange={(e) => setStampDutyPaid(e.target.checked)}
                      className="rounded"
                    />
                    <span>Stamp Duty Paid & Franked</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nachSubmitted}
                      onChange={(e) => setNachSubmitted(e.target.checked)}
                      className="rounded"
                    />
                    <span>NACH / e-Mandate Registered</span>
                  </label>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">
                    Pre-Disbursement Conditions
                  </span>
                  {conditions.map((cp, idx) => (
                    <div key={idx} className="p-3 rounded-lg border flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-semibold block">{cp.title}</span>
                        <span className="text-muted-foreground">{cp.conditionType}</span>
                      </div>
                      <select
                        value={cp.status}
                        onChange={(e) => {
                          const updated = [...conditions];
                          updated[idx].status = e.target.value;
                          setConditions(updated);
                        }}
                        className="h-8 px-2 border rounded text-xs bg-background"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Submitted">Submitted</option>
                        <option value="Verified">Verified</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Not Applicable">Not Applicable</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* TAB 7: DISBURSEMENT TRANCHES */}
            <TabsContent value="disbursements" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-700" />
                    Multi-Tranche Disbursements
                  </h4>
                  <div className="text-right text-xs">
                    <span className="text-muted-foreground block">Sanctioned Total</span>
                    <strong className="text-slate-900 font-mono">
                      ₹{(application.sanctionDetails?.sanctionedAmount || 0).toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>

                {/* Tranche Form */}
                <form onSubmit={handleCreateTranche} className="p-3 rounded-lg bg-muted/40 border space-y-3">
                  <span className="text-xs font-semibold uppercase text-primary">Initiate New Disbursement Tranche</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Purpose</Label>
                      <select
                        value={tranchePurpose}
                        onChange={(e: any) => setTranchePurpose(e.target.value)}
                        className="w-full h-8 px-2 text-xs border rounded bg-background"
                      >
                        <option value="Tuition Fee">Tuition Fee</option>
                        <option value="Living Expense">Living Expense</option>
                        <option value="Insurance">Insurance</option>
                        <option value="Travel / Forex">Travel / Forex</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Beneficiary Type</Label>
                      <select
                        value={trancheBeneficiaryType}
                        onChange={(e: any) => setTrancheBeneficiaryType(e.target.value)}
                        className="w-full h-8 px-2 text-xs border rounded bg-background"
                      >
                        <option value="University Directly">University Directly</option>
                        <option value="Student Account">Student Account</option>
                        <option value="Co-borrower Account">Co-borrower Account</option>
                        <option value="Forex Vendor">Forex Vendor</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tranche Amount (₹)</Label>
                      <Input
                        type="number"
                        value={trancheAmount}
                        onChange={(e) => setTrancheAmount(Number(e.target.value))}
                        className="h-8 text-xs font-mono"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" size="sm" disabled={isTrancheSubmitting} className="w-full h-8 text-xs gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    {isTrancheSubmitting ? "Initiating..." : "Request Disbursement Tranche"}
                  </Button>
                </form>
              </div>
            </TabsContent>

            {/* TAB 8: AUDIT HISTORY */}
            <TabsContent value="audit" className="space-y-4">
              <div className="rounded-xl border p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <History className="w-4 h-4 text-primary" />
                  Chronological Status & Audit Log
                </h4>

                <div className="space-y-2">
                  {(application.statusHistory || []).length === 0 ? (
                    <div className="text-xs text-muted-foreground">
                      No status transitions recorded yet.
                    </div>
                  ) : (
                    application.statusHistory?.map((h: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs p-2 rounded border bg-card">
                        <CheckCircle2 className="w-4 h-4 text-slate-700 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold">{h.toStatus}</span>
                            <span className="text-muted-foreground text-[10px]">
                              {new Date(h.changedAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-muted-foreground block text-[11px]">
                            Changed by: {h.changedByName || "System RM"}
                          </span>
                          {h.remarks && <p className="italic text-foreground mt-0.5">"{h.remarks}"</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
