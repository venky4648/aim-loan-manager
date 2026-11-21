import React, { useState } from "react";
import { DemoCase, LENDERS, formatINR } from "@/lib/demo-data";
import { LenderStatus } from "@/lib/sales-workflow-types";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Send,
  Lock,
  Unlock,
  History,
  FileCheck2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface LenderManagementCardProps {
  record?: DemoCase | null | undefined;
}

const COMMON_REJECTION_REASONS = [
  "CIBIL score / credit history below minimum cutoff",
  "Co-applicant monthly income or debt-to-income ratio insufficient",
  "Selected foreign university or course not on approved lender list",
  "Collateral property legal valuation or title search mismatch",
  "Incomplete documentation / applicant failed to submit requested proofs",
  "Other lender credit policy guidelines",
];

export function LenderManagementCard({ record }: LenderManagementCardProps) {
  if (!record) return null;

  const { user } = useAuth();
  const {
    submitToLender,
    updateLenderDecision,
    rerouteToNewLender,
  } = useCases();

  const currentLender = record.lender && record.lender !== "Not assigned" ? record.lender : "";
  const isRejected = record.lenderStatus === "Rejected" || record.stage === "Rejected";
  const isSanctioned = record.lenderStatus === "Sanctioned" || record.stage === "Sanctioned";
  const isLocked = Boolean(record.lenderLocked && !isRejected);
  const currentStatus: LenderStatus =
    record.lenderStatus || (isSanctioned ? "Sanctioned" : isRejected ? "Rejected" : currentLender ? "Submitted" : "Not Assigned");

  // Find partner benchmark metrics
  const partnerMeta =
    LENDERS.find((l) => l.name.toLowerCase() === (currentLender || "").toLowerCase()) || {
      name: currentLender || "Partner",
      type: "NBFC Partner",
      live: 8,
      sanctionRate: 72,
      avgTat: "8 days",
      payout: "1.5%",
    };

  // 1. Submit Modal
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [targetLender, setTargetLender] = useState("Avanse Financial Services");
  const [submitAppNo, setSubmitAppNo] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");

  // 2. Status / Sanction Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState<"In Underwriting" | "Sanctioned" | "Disbursed">("Sanctioned");
  const [sanctionAmount, setSanctionAmount] = useState(String(record.sanctioned || record.amount || 3500000));
  const [roi, setRoi] = useState(String(record.roi || 11.25));
  const [tenure, setTenure] = useState(String(record.tenure || 120));
  const [decisionNotes, setDecisionNotes] = useState("");

  // 3. Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(COMMON_REJECTION_REASONS[0]!);
  const [customRejectionReason, setCustomRejectionReason] = useState("");

  // 4. Re-route Modal
  const [rerouteModalOpen, setRerouteModalOpen] = useState(false);
  const [newLender, setNewLender] = useState(
    LENDERS.find((l) => l.name.toLowerCase() !== currentLender.toLowerCase())?.name || "Auxilo"
  );
  const [rerouteAppNo, setRerouteAppNo] = useState("");
  const [rerouteReason, setRerouteReason] = useState("");

  // Handlers
  const handleOpenSubmit = () => {
    setTargetLender(currentLender || "Avanse Financial Services");
    setSubmitAppNo(`APP-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitNotes("File submitted to credit underwriting.");
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLender) {
      toast.error("Please select a lender partner.");
      return;
    }

    submitToLender(record.id, {
      lender: targetLender,
      applicationNo: submitAppNo,
      notes: submitNotes,
      authorName: user?.name || "Processing Team",
    });

    setSubmitModalOpen(false);
  };

  const handleOpenDecision = () => {
    setDecisionType(isSanctioned ? "Disbursed" : "Sanctioned");
    setSanctionAmount(String(record.sanctioned || record.amount || 3500000));
    setRoi(String(record.roi || 11.25));
    setTenure(String(record.tenure || 120));
    setDecisionNotes("");
    setStatusModalOpen(true);
  };

  const handleConfirmDecision = (e: React.FormEvent) => {
    e.preventDefault();
    updateLenderDecision(record.id, {
      status: decisionType,
      sanctionAmount: decisionType === "Sanctioned" ? Number(sanctionAmount) || record.amount : undefined,
      roi: decisionType === "Sanctioned" ? Number(roi) || undefined : undefined,
      tenure: decisionType === "Sanctioned" ? Number(tenure) || undefined : undefined,
      notes: decisionNotes,
      authorName: user?.name || "Processing Team",
    });

    setStatusModalOpen(false);
  };

  const handleOpenReject = () => {
    setRejectionReason(COMMON_REJECTION_REASONS[0]!);
    setCustomRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      rejectionReason === "Other lender credit policy guidelines" && customRejectionReason.trim()
        ? customRejectionReason.trim()
        : rejectionReason;

    updateLenderDecision(record.id, {
      status: "Rejected",
      rejectionReason: finalReason,
      authorName: user?.name || "Processing Team",
    });

    setRejectModalOpen(false);
  };

  const handleOpenReroute = () => {
    const alternative = LENDERS.find((l) => l.name.toLowerCase() !== currentLender.toLowerCase())?.name || "Auxilo";
    setNewLender(alternative);
    setRerouteAppNo(`APP-${Math.floor(100000 + Math.random() * 900000)}`);
    setRerouteReason(`Re-routed following previous review/decline by ${currentLender || "prior lender"}`);
    setRerouteModalOpen(true);
  };

  const handleConfirmReroute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLender) {
      toast.error("Please select a new lender partner.");
      return;
    }

    rerouteToNewLender(record.id, {
      newLender,
      applicationNo: rerouteAppNo,
      reason: rerouteReason,
      authorName: user?.name || "Processing Team",
    });

    setRerouteModalOpen(false);
  };

  return (
    <section className="surface-card p-4 sm:p-5 border-2 border-border shadow-xs rounded-xl bg-card space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col gap-2.5 border-b border-border pb-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Building2 className="size-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">
                Lender Partner Hub
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Lifecycle & Multi-Submission Audit
              </p>
            </div>
          </div>

          {/* Quick Lock / Unlock Status Pill */}
          {isLocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 border border-blue-500/25 shrink-0">
              <Lock className="size-3 text-blue-600" /> File Locked
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-500/25 shrink-0">
              <Unlock className="size-3 text-rose-600" /> Unlocked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-500/25 shrink-0">
              <Unlock className="size-3 text-slate-600" /> Ready
            </span>
          )}
        </div>

        {/* Current State Status Pill */}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {currentStatus === "Sanctioned" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5 text-emerald-600" /> Sanction Letter Issued
            </span>
          )}
          {currentStatus === "Disbursed" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-2 py-0.5 text-xs font-bold text-green-700 border border-green-500/30">
              <CheckCircle2 className="size-3.5 text-green-600" /> Loan Disbursed
            </span>
          )}
          {currentStatus === "In Underwriting" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/15 px-2 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-500/30">
              <Clock className="size-3.5 text-indigo-600" /> In Credit Review
            </span>
          )}
          {currentStatus === "Submitted" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-700 border border-amber-500/30">
              <Send className="size-3.5 text-amber-600" /> Submitted & Logged In
            </span>
          )}
          {currentStatus === "Rejected" && (
            <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-xs font-bold text-rose-700 border border-rose-500/30">
              <XCircle className="size-3.5 text-rose-600" /> Application Declined
            </span>
          )}
          {isLocked && currentLender && (
            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[220px]">
              Active Desk: <strong>{currentLender}</strong>
            </span>
          )}
        </div>
      </div>

      {/* Main Active Partner Box */}
      <div className="p-3.5 sm:p-4 rounded-xl border border-border bg-muted/20 space-y-3">
        {/* Allocated Partner Header */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
              Allocated Lender
            </span>
            {currentLender && (
              <span className="text-[10px] uppercase font-extrabold bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded shrink-0">
                {partnerMeta.type || "NBFC"} Partner
              </span>
            )}
          </div>
          <h3 className="text-base font-bold text-foreground mt-1 leading-snug">
            {currentLender || "No Partner Bank Allocated Yet"}
          </h3>
        </div>

        {/* Application Ref & Metadata Card */}
        {record.lenderApplicationNo ? (
          <div className="grid grid-cols-2 gap-2 text-xs bg-card p-2.5 rounded-lg border border-border">
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                App Ref No
              </span>
              <span className="font-mono font-semibold text-foreground text-xs truncate block mt-0.5">
                {record.lenderApplicationNo}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-medium text-muted-foreground block">
                Submitted Date
              </span>
              <span className="font-semibold text-foreground text-xs block mt-0.5">
                {record.lenderSubmittedAt
                  ? new Date(record.lenderSubmittedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            {record.lenderSubmittedBy && (
              <div className="col-span-2 pt-1.5 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Submitted by:</span>
                <span className="font-medium text-foreground">{record.lenderSubmittedBy}</span>
              </div>
            )}
          </div>
        ) : null}

        {/* Action Buttons Toolbar (Stacked / Grid layout with zero overlap) */}
        <div className="space-y-2 pt-1">
          {!currentLender || (!isLocked && !isRejected) ? (
            <Button
              size="sm"
              onClick={handleOpenSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 justify-center gap-2 shadow-sm"
            >
              <Send className="size-3.5" />
              {currentLender ? `Send File Directly to ${currentLender}` : "Select Lender & Submit File"}
            </Button>
          ) : null}

          {isLocked && (
            <div className="space-y-2">
              {/* Primary Action Button */}
              <Button
                size="sm"
                onClick={handleOpenDecision}
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 justify-center gap-2 shadow-sm"
              >
                <FileCheck2 className="size-4" />
                Update Decision / Sanction
              </Button>

              {/* Secondary Actions Row */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenReroute}
                  className="w-full text-xs font-semibold h-8 justify-center gap-1 border-border bg-card hover:bg-muted"
                >
                  <RotateCcw className="size-3 text-muted-foreground" />
                  Change Lender
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleOpenReject}
                  className="w-full text-xs font-semibold h-8 justify-center gap-1 border-rose-500/30 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-500/50"
                >
                  <XCircle className="size-3 text-rose-600" />
                  Mark Declined
                </Button>
              </div>
            </div>
          )}

          {isRejected && (
            <Button
              size="sm"
              onClick={handleOpenReroute}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 justify-center gap-2 shadow-sm"
            >
              <RotateCcw className="size-3.5" /> Re-route to New Lender
            </Button>
          )}
        </div>

        {/* Live Partner Performance Metrics (2x2 Grid) */}
        {currentLender && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
            <div className="p-2.5 rounded-lg bg-card border border-border">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Sanction Rate
              </span>
              <span className="text-xs font-extrabold text-emerald-600 mt-0.5 block">
                {partnerMeta.sanctionRate}% Sanctions
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Average TAT
              </span>
              <span className="text-xs font-extrabold text-foreground mt-0.5 block">
                {partnerMeta.avgTat}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Sanctioned Amount
              </span>
              <span className="text-xs font-extrabold text-foreground mt-0.5 block truncate">
                {record.sanctioned ? formatINR(record.sanctioned) : "Pending"}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Interest Rate (ROI)
              </span>
              <span className="text-xs font-extrabold text-primary mt-0.5 block truncate">
                {record.roi ? `${record.roi}% p.a.` : "TBD"}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* REJECTION RECOVERY CALLOUT */}
      {isRejected && (
        <div className="p-3.5 rounded-xl border-2 border-rose-500/40 bg-rose-500/10 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 min-w-0">
              <h4 className="text-xs font-bold text-rose-950">
                Application Declined by {currentLender}
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed bg-card/60 p-2 rounded border border-rose-200">
                <strong>Decline Reason:</strong>{" "}
                {record.lenderRejectionReason || "Lender credit policy criteria not met."}
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-card border border-rose-500/20 space-y-2">
            <p className="text-xs text-foreground font-bold leading-tight">
              Re-route to an alternative partner to save this deal
            </p>
            <p className="text-[11px] text-muted-foreground leading-snug">
              The file lock has been released. Select a new lending partner to initiate a fresh submission cycle.
            </p>
            <Button
              size="sm"
              onClick={handleOpenReroute}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 justify-center gap-1.5 shadow-sm"
            >
              <RotateCcw className="size-3.5" /> Re-route Deal to New Lender
            </Button>
          </div>
        </div>
      )}

      {/* SUBMISSION HISTORY AUDIT STREAM */}
      {Array.isArray(record.lenderSubmissions) && record.lenderSubmissions.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <History className="size-3.5 text-primary" />
              <span>Submissions ({record.lenderSubmissions.length})</span>
            </h4>
          </div>

          <div className="space-y-2">
            {record.lenderSubmissions.map((sub, idx) => (
              <div
                key={sub.id || idx}
                className="p-2.5 rounded-lg border border-border/80 bg-card hover:bg-muted/30 transition-colors text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-bold text-foreground block truncate">
                      {sub.lender}
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground block truncate">
                      Ref: {sub.applicationNo || "—"}
                    </span>
                  </div>

                  <div>
                    {sub.status === "Sanctioned" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-500/30 shrink-0">
                        <CheckCircle2 className="size-3" /> Sanctioned
                      </span>
                    ) : sub.status === "Rejected" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-rose-500/15 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-500/30 shrink-0">
                        <XCircle className="size-3" /> Declined
                      </span>
                    ) : sub.status === "In Underwriting" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-500/30 shrink-0">
                        <Clock className="size-3" /> Reviewing
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-500/30 shrink-0">
                        <Send className="size-3" /> Submitted
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1 border-t border-border/50">
                  <span>
                    {sub.submittedAt
                      ? new Date(sub.submittedAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                        })
                      : "—"}
                  </span>
                  <span className="truncate max-w-[170px] text-right font-medium">
                    {sub.rejectionReason ? (
                      <span className="text-rose-700">{sub.rejectionReason}</span>
                    ) : sub.sanctionAmount ? (
                      <span className="text-emerald-700 font-semibold">
                        {formatINR(sub.sanctionAmount)} @ {sub.roi}%
                      </span>
                    ) : (
                      sub.notes || "In processing"
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT APPLICATION TO LENDER */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-primary" />
              {currentLender ? `Send File Directly to ${currentLender}` : "Select Lending Partner & Submit File"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official credit submission for <strong>{record.student}</strong> ({record.id}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-2">
            {currentLender ? (
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-primary">
                    Assigned Lending Partner
                  </span>
                  <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {partnerMeta.type || "NBFC"} · {partnerMeta.avgTat} TAT
                  </span>
                </div>
                <p className="text-sm font-bold text-foreground">{currentLender}</p>
                <p className="text-[11px] text-muted-foreground">
                  The file will be locked with {currentLender} upon submission.
                </p>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                {currentLender ? "Change Partner (Optional)" : "Select Partner Bank / NBFC"} <span className="text-primary">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 border border-border/50 rounded-lg bg-muted/20">
                {LENDERS.map((lend) => {
                  const active = targetLender === lend.name;
                  return (
                    <button
                      key={lend.name}
                      type="button"
                      onClick={() => setTargetLender(lend.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                          : "bg-card border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground truncate">{lend.name}</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded shrink-0">
                          {lend.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                        {lend.sanctionRate}% Sanction Rate
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="submitAppNo" className="text-xs font-bold">
                  Lender Application / Reference No
                </Label>
                <Input
                  id="submitAppNo"
                  placeholder="e.g. AVN-98421"
                  value={submitAppNo}
                  onChange={(e) => setSubmitAppNo(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Requested Loan Amount</Label>
                <Input
                  disabled
                  value={formatINR(record.amount)}
                  className="text-xs bg-muted"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="submitNotes" className="text-xs font-bold">
                Submission Notes / Remarks
              </Label>
              <Textarea
                id="submitNotes"
                placeholder="Notes for credit desk, co-applicant details, collateral summary..."
                value={submitNotes}
                onChange={(e) => setSubmitNotes(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSubmitModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold bg-primary hover:bg-primary/90 text-white"
              >
                <Lock className="mr-1.5 size-3.5" /> Submit & Lock File
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: UPDATE DECISION / SANCTION */}
      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <FileCheck2 className="size-5 text-emerald-600" />
              Update Lender Decision — {currentLender}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record credit committee updates, loan sanction terms, or disbursement.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmDecision} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">
                Status Update <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setDecisionType("In Underwriting")}
                  className={`p-2.5 rounded-lg border text-center text-xs font-bold transition-all ${
                    decisionType === "In Underwriting"
                      ? "bg-indigo-500/15 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Clock className="size-4 mx-auto mb-1 text-indigo-600" />
                  In Underwriting
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("Sanctioned")}
                  className={`p-2.5 rounded-lg border text-center text-xs font-bold transition-all ${
                    decisionType === "Sanctioned"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="size-4 mx-auto mb-1 text-emerald-600" />
                  Sanction Issued
                </button>
                <button
                  type="button"
                  onClick={() => setDecisionType("Disbursed")}
                  className={`p-2.5 rounded-lg border text-center text-xs font-bold transition-all ${
                    decisionType === "Disbursed"
                      ? "bg-green-500/15 border-green-500 text-green-700 ring-2 ring-green-500/20"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle2 className="size-4 mx-auto mb-1 text-green-600" />
                  Disbursed
                </button>
              </div>
            </div>

            {decisionType === "Sanctioned" && (
              <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-3">
                <span className="text-xs font-bold text-emerald-800 block">
                  Sanction Letter Terms
                </span>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1">
                    <Label htmlFor="sanctionAmt" className="text-[11px] font-semibold">
                      Sanctioned (INR)
                    </Label>
                    <Input
                      id="sanctionAmt"
                      type="number"
                      value={sanctionAmount}
                      onChange={(e) => setSanctionAmount(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sanctionRoi" className="text-[11px] font-semibold">
                      ROI (% p.a.)
                    </Label>
                    <Input
                      id="sanctionRoi"
                      type="number"
                      step="0.05"
                      value={roi}
                      onChange={(e) => setRoi(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="sanctionTenure" className="text-[11px] font-semibold">
                      Tenure (Months)
                    </Label>
                    <Input
                      id="sanctionTenure"
                      type="number"
                      value={tenure}
                      onChange={(e) => setTenure(e.target.value)}
                      className="text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <Label htmlFor="decisionNotes" className="text-xs font-bold">
                Decision Notes / Conditions
              </Label>
              <Textarea
                id="decisionNotes"
                placeholder="e.g. Sanction letter received. Conditions: Co-applicant original property documents required before disbursement..."
                value={decisionNotes}
                onChange={(e) => setDecisionNotes(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStatusModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Save Decision
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: MARK REJECTED */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Mark File Declined by {currentLender}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record the credit rejection. The file lock will be released so you can immediately
              re-route to an alternative partner.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReject} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-bold text-foreground">
                Select Credit Policy Rejection Reason <span className="text-destructive">*</span>
              </Label>
              <div className="space-y-2 mt-2">
                {COMMON_REJECTION_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer text-xs transition-colors ${
                      rejectionReason === reason
                        ? "bg-destructive/10 border-destructive/40 text-foreground font-semibold"
                        : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={rejectionReason === reason}
                      onChange={() => setRejectionReason(reason)}
                      className="mt-0.5 text-destructive"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {rejectionReason === "Other lender credit policy guidelines" && (
              <div>
                <Label className="text-xs font-bold text-foreground">
                  Specific Reason Details
                </Label>
                <Textarea
                  placeholder="Describe the rejection criteria noted in the lender portal..."
                  value={customRejectionReason}
                  onChange={(e) => setCustomRejectionReason(e.target.value)}
                  className="mt-1 text-xs min-h-[60px]"
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRejectModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-destructive hover:bg-destructive/90 text-white font-bold"
              >
                Confirm Decline & Unlock Deal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: RE-ROUTE TO NEW LENDER */}
      <Dialog open={rerouteModalOpen} onOpenChange={setRerouteModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="size-5 text-primary" />
              Re-route Application to New Lender
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select an alternative lending partner to save this deal for{" "}
              <strong>{record.student}</strong> ({record.id}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReroute} className="space-y-4 pt-2">
            {currentLender && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs flex justify-between items-center">
                <span className="text-rose-900 font-medium">Previous Partner:</span>
                <strong className="text-rose-700">
                  {currentLender} {isRejected ? "(Declined)" : "(Active)"}
                </strong>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Select New Alternative Lender <span className="text-primary">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1 border border-border/50 rounded-lg bg-muted/20">
                {LENDERS.filter(
                  (l) => l.name.toLowerCase() !== currentLender.toLowerCase()
                ).map((lend) => {
                  const active = newLender === lend.name;
                  return (
                    <button
                      key={lend.name}
                      type="button"
                      onClick={() => setNewLender(lend.name)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                          : "bg-card border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground truncate">
                          {lend.name}
                        </span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded shrink-0">
                          {lend.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                        {lend.sanctionRate}% Sanction Rate
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="rerouteAppNo" className="text-xs font-bold">
                  New Application Reference No
                </Label>
                <Input
                  id="rerouteAppNo"
                  placeholder="e.g. AUX-10291"
                  value={rerouteAppNo}
                  onChange={(e) => setRerouteAppNo(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold">Requested Loan Amount</Label>
                <Input
                  disabled
                  value={formatINR(record.amount)}
                  className="text-xs bg-muted"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="rerouteReason" className="text-xs font-bold">
                Re-routing Remarks / Notes
              </Label>
              <Textarea
                id="rerouteReason"
                placeholder="e.g. Switching to Auxilo as they accept second co-applicant income / higher unsecured cutoff..."
                value={rerouteReason}
                onChange={(e) => setRerouteReason(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRerouteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold bg-primary hover:bg-primary/90 text-white"
              >
                <Lock className="mr-1.5 size-3.5" /> Re-assign & Submit File
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
