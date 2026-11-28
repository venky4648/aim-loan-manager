import React, { useState } from "react";
import { DemoCase, LENDERS, formatINR } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Lock,
  Unlock,
  Building2,
  RotateCcw,
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ReadyForProcessingSectionProps {
  record: DemoCase;
}

export function ReadyForProcessingSection({
  record,
}: ReadyForProcessingSectionProps) {
  const { user, role } = useAuth();
  const { submitToLender, rerouteToNewLender, handoverToProcessing, returnLeadToSales, updateInterestStatus } = useCases();

  const isSales = role === "telecom";
  const isRmOrAdmin = role === "relationship_manager" || role === "superadmin";
  const isHandedOver = Boolean(record.handover?.isHandedOver);
  const isInterested = record.interestStatus === "Interested";
  const isEligible = isInterested;

  const currentLender =
    record.lender && record.lender !== "Not assigned" ? record.lender : "";
  const hasAssignedLender = Boolean(currentLender);
  const isRejected = record.lenderStatus === "Rejected" || record.stage === "Rejected";
  const isSanctioned = record.lenderStatus === "Sanctioned" || record.stage === "Sanctioned";
  const isLocked = Boolean(record.lenderLocked && !isRejected);

  // Partner Benchmark metadata
  const partnerMeta =
    LENDERS.find((l) => l.name.toLowerCase() === (currentLender || "").toLowerCase()) || {
      name: currentLender || "Partner Bank",
      type: "NBFC Partner",
      sanctionRate: 72,
      avgTat: "8 days",
    };

  // Handover to Processing Dialog State (for Sales)
  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [handoverRemarks, setHandoverRemarks] = useState("");
  const [processingOwner, setProcessingOwner] = useState(
    record.handover?.processingOwner || "Nikhil V (Lead Processing)"
  );

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (record.interestStatus !== "Interested") {
      updateInterestStatus(record.id, {
        interestStatus: "Interested",
        authorName: user?.name || "Sales Team",
      });
    }
    handoverToProcessing(record.id, {
      handoverRemarks:
        handoverRemarks.trim() ||
        "Documents collected and applicant verified. Handing over to Processing Team for bank underwriting.",
      processingOwner: processingOwner || "Nikhil V (Lead Processing)",
      authorName: user?.name || "Sales Team",
    });
    setHandoverModalOpen(false);
    setHandoverRemarks("");
  };

  // Submission Dialog State (RM & Admin only)
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [targetLender, setTargetLender] = useState(currentLender || "Avanse Financial Services");
  const [submitAppNo, setSubmitAppNo] = useState("");
  const [submitNotes, setSubmitNotes] = useState("");

  // Re-route Dialog State (if rejected)
  const [rerouteModalOpen, setRerouteModalOpen] = useState(false);
  const [newLender, setNewLender] = useState(
    LENDERS.find((l) => l.name.toLowerCase() !== currentLender.toLowerCase())?.name || "Auxilo"
  );
  const [rerouteAppNo, setRerouteAppNo] = useState("");
  const [rerouteReason, setRerouteReason] = useState("");

  // Return to Sales Dialog State (Corrections Needed)
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnReason, setReturnReason] = useState("");

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      toast.error("Please provide the correction reason / feedback for Sales.");
      return;
    }
    returnLeadToSales(record.id, {
      reason: returnReason.trim(),
      authorName: user?.name || "Relationship Manager",
    });
    setReturnModalOpen(false);
    setReturnReason("");
  };

  const handleOpenSubmit = () => {
    if (!isEligible) {
      toast.error("Lender submission is blocked: the student must confirm interest first.");
      return;
    }
    const defaultLender = currentLender || "Avanse Financial Services";
    setTargetLender(defaultLender);
    setSubmitAppNo(`APP-${Math.floor(100000 + Math.random() * 900000)}`);
    setSubmitNotes("All applicant documents verified. Submitting file for credit underwriting.");
    setSubmitModalOpen(true);
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLender) {
      toast.error("Please select a partner lender.");
      return;
    }
    if (!window.confirm(`Are you sure you want to send this application to ${targetLender}?`)) {
      return;
    }

    // 1. Submit directly to lender & lock file
    submitToLender(record.id, {
      lender: targetLender,
      applicationNo: submitAppNo,
      notes: submitNotes,
      authorName: user?.name || "Processing Team",
    });

    // 2. Mark processing handover complete
    handoverToProcessing(record.id, {
      handoverRemarks: `Directly submitted to ${targetLender} (App No: ${submitAppNo}). ${submitNotes}`,
      processingOwner: "Credit Operations & Desk",
      authorName: user?.name || "Processing Team",
    });

    setSubmitModalOpen(false);
  };

  const handleOpenReroute = () => {
    const alternative =
      LENDERS.find((l) => l.name.toLowerCase() !== currentLender.toLowerCase())?.name || "Auxilo";
    setNewLender(alternative);
    setRerouteAppNo(`APP-${Math.floor(100000 + Math.random() * 900000)}`);
    setRerouteReason(`Re-routed following previous decline by ${currentLender || "prior lender"}`);
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
    <section className="surface-card p-5 sm:p-6 border-2 border-border shadow-sm rounded-xl space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Step 4: Document Verification & Processing Handover (RM)
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validate collected documentation and handover the case to Relationship Manager / Processing Team for bank desk submission.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Return to Sales Action Button for RM & Admin */}
          {isRmOrAdmin && record.stage !== "Returned for Corrections" && !isSanctioned && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setReturnModalOpen(true)}
              className="border-amber-500/50 text-amber-800 hover:bg-amber-500/10 font-bold text-xs h-8 gap-1.5 shrink-0"
              title="Return application back to Sales team for correction or missing proofs"
            >
              <RotateCcw className="size-3.5 text-amber-600" /> Return to Sales
            </Button>
          )}

          {/* Status Pill */}
          {record.stage === "Returned for Corrections" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-500/30">
              <AlertCircle className="size-3.5 text-amber-600" /> Returned for Corrections
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-500/30">
              <Lock className="size-3.5 text-blue-600" /> File Locked ({currentLender})
            </span>
          ) : isSanctioned ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5 text-emerald-600" /> Sanction Letter Issued
            </span>
          ) : isRejected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-500/30">
              <Unlock className="size-3.5 text-rose-600" /> File Unlocked (Declined)
            </span>
          ) : isHandedOver ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-500/30">
              <Clock className="size-3.5 text-blue-600" /> Handed Over to RM
            </span>
          ) : !isInterested ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-500/30">
              <Lock className="size-3.5" /> Step Locked
            </span>
          ) : isEligible ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5" /> Ready for Processing
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-500/30">
              <AlertCircle className="size-3.5" /> Submission Blocked
            </span>
          )}
        </div>
      </div>

      {/* STATE 0: When student interest is not yet confirmed */}
      {!isInterested && (
        <div className="p-6 rounded-xl border-2 border-dashed border-amber-500/40 bg-amber-500/5 text-center space-y-3.5">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Send className="size-6 text-amber-700" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Handover File to Relationship Manager (Processing)
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Confirm applicant interest and send this application to the Relationship Manager for document verification and bank desk submission.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                updateInterestStatus(record.id, {
                  interestStatus: "Interested",
                  authorName: user?.name || "Sales Team",
                });
                toast.success("Student marked as Interested! You can now handover to RM.");
              }}
              className="text-xs font-semibold h-8 border-amber-500/50 text-amber-800 hover:bg-amber-100"
            >
              <CheckCircle2 className="mr-1.5 size-3.5 text-emerald-600" /> 1. Mark Interested
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setHandoverModalOpen(true)}
              className="text-xs font-bold h-8 bg-primary hover:bg-primary/90 text-white gap-1.5 shadow-sm"
            >
              <Send className="size-3.5" /> Handover File to RM Now
            </Button>
          </div>
        </div>
      )}


      {/* STATE 2: File Already Locked & Submitted to Lender */}
      {isLocked && (
        <div className="p-5 rounded-xl border-2 border-blue-500/30 bg-blue-500/10 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <Lock className="size-5" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-blue-950">
                  File Locked & Submitted to {currentLender}
                </h3>
                <p className="text-xs text-blue-900 mt-0.5">
                  The application is under active review with {currentLender}. Multi-desk submission is locked.
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-blue-800 bg-blue-100 px-2.5 py-1 rounded-md border border-blue-300 flex items-center gap-1 shrink-0">
              <Clock className="size-3" /> Logged In / Underwriting
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-card p-3 rounded-lg border border-blue-500/20">
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Application Ref No
              </span>
              <span className="font-mono font-bold text-foreground text-xs">
                {record.lenderApplicationNo || "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Submitted Date
              </span>
              <span className="font-semibold text-foreground text-xs">
                {record.lenderSubmittedAt
                  ? new Date(record.lenderSubmittedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Submitted By
              </span>
              <span className="font-semibold text-foreground text-xs">
                {record.lenderSubmittedBy || "Processing Team"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-blue-900 font-medium">
            Track sanction terms or record lender decisions in the <strong>Lender Partner Hub</strong> card on the right.
          </p>
        </div>
      )}

      {/* STATE 3: Application Declined / Rejected */}
      {isRejected && (
        <div className="p-4 rounded-xl border border-slate-300 bg-slate-50 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-slate-700 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900">
                Application Declined by {currentLender}
              </h4>
              <p className="text-xs text-slate-700 mt-1 bg-white p-2.5 rounded border border-slate-200 leading-relaxed">
                <strong>Decline Reason:</strong> {record.lenderRejectionReason || "Credit criteria not met."}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-foreground">
                The file lock has been released.
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select an alternative lending partner to save this deal and start a fresh submission cycle.
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenReroute}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shrink-0 shadow-sm gap-1.5"
            >
              <RotateCcw className="size-3.5" /> Select New Lender & Re-route
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: Interested & Ready to Send to Lender */}
      {isInterested && isEligible && !isLocked && !isRejected && (
        <div className="p-5 rounded-xl border border-slate-300 bg-slate-50 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <FileCheck className="size-6" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isRmOrAdmin
                  ? "Application Ready for Lender Review & Submission"
                  : isHandedOver && record.stage !== "Returned for Corrections"
                  ? "Application Handed Over to Processing Team"
                  : "Application Ready for Processing Team Handover"}
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                {isRmOrAdmin
                  ? "The student has confirmed interest. As Relationship Manager, you can verify documents and submit directly to partner bank credit desks."
                  : isHandedOver && record.stage !== "Returned for Corrections"
                  ? `File successfully handed over to ${record.handover?.processingOwner || "Processing Team"}. The Relationship Manager will review and submit to the bank.`
                  : "The student has confirmed interest. Handover this file to the Processing Team (RM) for document verification and bank desk submission."}
              </p>
            </div>
          </div>

          {/* Smart Allocation Panel */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
            {hasAssignedLender ? (
              /* PATH A: Lender is Already Assigned */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Assigned Partner Bank / NBFC
                  </span>
                  <span className="text-[10px] uppercase font-bold bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded">
                    {partnerMeta.type || "NBFC"} Partner · {partnerMeta.sanctionRate}% Sanction Rate
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      {currentLender}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isRmOrAdmin
                        ? `Ready to send file directly to ${currentLender}'s credit desk.`
                        : `Target lender for processing: ${currentLender}. (Managed by RM)`}
                    </p>
                  </div>

                  {/* Actions based on role */}
                  {isRmOrAdmin ? (
                    <Button
                      onClick={handleOpenSubmit}
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-sm gap-2"
                    >
                      <Send className="size-3.5" /> Send Directly to {currentLender}
                    </Button>
                  ) : isSales ? (
                    !isHandedOver || record.stage === "Returned for Corrections" ? (
                      <Button
                        onClick={() => setHandoverModalOpen(true)}
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-sm gap-2"
                      >
                        <Send className="size-3.5" /> Handover File to Processing (RM)
                      </Button>
                    ) : (
                      <div className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-slate-700 shrink-0" />
                        <span>Handed Over to {record.handover?.processingOwner || "Processing Team"}</span>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            ) : (
              /* PATH B: No Lender Assigned Yet */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-600">
                    Lender Not Assigned Yet
                  </span>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 rounded">
                    Partner Selection Required
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Choose a Lending Partner
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {isRmOrAdmin
                        ? "Select a preferred bank/NBFC (Avanse, Auxilo, Credila, InCred, Tata Capital) to submit."
                        : "Lender partner selection and bank submission is handled by the Processing Team (RM)."}
                    </p>
                  </div>

                  {/* Actions based on role */}
                  {isRmOrAdmin ? (
                    <Button
                      onClick={handleOpenSubmit}
                      size="sm"
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-sm gap-2"
                    >
                      <Building2 className="size-3.5" /> Select Lender & Submit File
                    </Button>
                  ) : isSales ? (
                    !isHandedOver || record.stage === "Returned for Corrections" ? (
                      <Button
                        onClick={() => setHandoverModalOpen(true)}
                        size="sm"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-sm gap-2"
                      >
                        <Send className="size-3.5" /> Handover File to Processing (RM)
                      </Button>
                    ) : (
                      <div className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                        <CheckCircle2 className="size-4 text-slate-700 shrink-0" />
                        <span>Handed Over to {record.handover?.processingOwner || "Processing Team"}</span>
                      </div>
                    )
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: SUBMIT APPLICATION DIRECTLY TO LENDER */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-primary" />
              {hasAssignedLender
                ? `Send File Directly to ${currentLender}`
                : "Select Lending Partner & Submit File"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Official credit submission for <strong>{record.student}</strong> ({record.id}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSubmit} className="space-y-4 pt-2">
            {/* If Lender already assigned, show prominent card with option to switch */}
            {hasAssignedLender ? (
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-1.5">
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
                  The application will be locked with {currentLender} upon submission.
                </p>
              </div>
            ) : null}

            {/* If no lender assigned, display partner bank selection cards */}
            {!hasAssignedLender && (
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">
                  Select Partner Bank / NBFC <span className="text-primary">*</span>
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
                          <span className="text-xs font-bold text-foreground truncate">
                            {lend.name}
                          </span>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded shrink-0">
                            {lend.type}
                          </span>
                        </div>
                        <span className="text-[11px] text-emerald-700 font-bold block mt-1">
                          {lend.sanctionRate}% Sanction Rate · {lend.avgTat} TAT
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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
                  required
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
                Submission Remarks for Credit Desk
              </Label>
              <Textarea
                id="submitNotes"
                placeholder="Notes for credit committee: co-applicant income verified, collateral valuation done, urgent sanction needed..."
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
                <Lock className="mr-1.5 size-3.5" /> Submit File & Lock Deal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: RE-ROUTE APPLICATION (IF PREVIOUSLY DECLINED) */}
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
                  {currentLender} (Declined)
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
                        {lend.sanctionRate}% Sanction Rate · {lend.avgTat} TAT
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

      {/* MODAL 3: RETURN FILE TO SALES TEAM */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="size-5 text-amber-600" /> Return File to Sales Team
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Please state clearly what documents or information need correction so the sales team can contact the student and fix them.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReturn} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="returnReason" className="text-xs font-bold text-foreground">
                Correction Feedback / Remarks *
              </Label>
              <Textarea
                id="returnReason"
                required
                rows={4}
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                placeholder="e.g. Bank statement is missing page 4; Co-applicant salary slips needed for past 3 months..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReturnModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold bg-slate-900 hover:bg-slate-800 text-white"
              >
                <RotateCcw className="mr-1.5 size-3.5" /> Confirm Return to Sales
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: HANDOVER FILE TO PROCESSING (RM) */}
      <Dialog open={handoverModalOpen} onOpenChange={setHandoverModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-primary" /> Handover File to Processing Team (RM)
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Transfer this application from Sales to the Relationship Manager / Processing Team for document verification and bank desk submission.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmHandover} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="processingOwner" className="text-xs font-bold text-foreground">
                Assign to Processing Officer / RM
              </Label>
              <Input
                id="processingOwner"
                value={processingOwner}
                onChange={(e) => setProcessingOwner(e.target.value)}
                placeholder="e.g. Nikhil V (Lead Processing)"
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="handoverRemarks" className="text-xs font-bold text-foreground">
                Handover Notes / Instructions for RM
              </Label>
              <Textarea
                id="handoverRemarks"
                rows={3}
                value={handoverRemarks}
                onChange={(e) => setHandoverRemarks(e.target.value)}
                placeholder="e.g. All KYC and academic docs collected; student prefers Avanse or Auxilo; urgent I-20 deadline next week..."
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setHandoverModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold bg-primary hover:bg-primary/90 text-white gap-1.5"
              >
                <Send className="size-3.5" /> Confirm Handover to Processing
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
