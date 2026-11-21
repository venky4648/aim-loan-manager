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
  const { submitToLender, rerouteToNewLender, handoverToProcessing } = useCases();

  const isSalesOrAdmin = role === "telecom" || role === "superadmin";
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

  // Submission Dialog State
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
              Step 4: Document Verification & Lender Submission
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validate collected documentation and submit the application directly to the assigned lender.
          </p>
        </div>

        {/* Status Pill */}
        {isLocked ? (
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
        ) : !isInterested ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-500/30">
            <Lock className="size-3.5" /> Step Locked
          </span>
        ) : isEligible ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 className="size-3.5" /> Ready for Lender Submission
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-500/30">
            <AlertCircle className="size-3.5" /> Submission Blocked
          </span>
        )}
      </div>

      {/* STATE 0: Locked if student is not interested yet */}
      {!isInterested && (
        <div className="p-6 rounded-xl border-2 border-dashed border-border bg-muted/20 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Lender Submission is Currently Locked
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              This case cannot be submitted to a lender until the student confirms interest in Step 1.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-xs font-semibold text-muted-foreground">
            Current Stage: <span className="text-primary font-bold">{record.stage}</span>
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
        <div className="p-4 rounded-xl border-2 border-rose-500/40 bg-rose-500/10 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-rose-950">
                Application Declined by {currentLender}
              </h4>
              <p className="text-xs text-rose-800 mt-1 bg-card/70 p-2.5 rounded border border-rose-200 leading-relaxed">
                <strong>Decline Reason:</strong> {record.lenderRejectionReason || "Credit criteria not met."}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-card border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shrink-0 shadow-sm gap-1.5"
            >
              <RotateCcw className="size-3.5" /> Select New Lender & Re-route
            </Button>
          </div>
        </div>
      )}

      {/* STATE 4: Interested & Ready to Send to Lender */}
      {isInterested && isEligible && !isLocked && !isRejected && (
        <div className="p-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 space-y-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileCheck className="size-6" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                Application Ready for Lender Review
              </h3>
              <p className="text-xs text-emerald-900 mt-0.5">
                The student has confirmed interest. The application can be sent to the selected lender without requiring 100% document collection.
              </p>
            </div>
          </div>

          {/* Smart Allocation Panel */}
          <div className="p-4 rounded-xl bg-card border border-emerald-500/30 shadow-xs space-y-3">
            {hasAssignedLender ? (
              /* PATH A: Lender is Already Assigned */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Assigned Partner Bank / NBFC
                  </span>
                  <span className="text-[10px] uppercase font-extrabold bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded">
                    {partnerMeta.type || "NBFC"} Partner · {partnerMeta.sanctionRate}% Sanction Rate
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-base font-bold text-foreground">
                      {currentLender}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Ready to send file directly to <strong>{currentLender}</strong>'s credit desk.
                    </p>
                  </div>

                  {isSalesOrAdmin && (
                    <Button
                      onClick={handleOpenSubmit}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-md shadow-emerald-600/20 gap-2"
                    >
                      <Send className="size-3.5" /> Send Directly to {currentLender}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              /* PATH B: No Lender Assigned Yet */
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-amber-600">
                    Lender Not Assigned Yet
                  </span>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                    Partner Selection Required
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-foreground">
                      Choose a Lending Partner
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Select a preferred bank/NBFC (Avanse, Auxilo, Credila, InCred, Tata Capital) to submit.
                    </p>
                  </div>

                  {isSalesOrAdmin && (
                    <Button
                      onClick={handleOpenSubmit}
                      size="sm"
                      className="bg-primary hover:bg-primary/90 text-white font-bold text-xs h-9 px-4 shrink-0 shadow-md gap-2"
                    >
                      <Building2 className="size-3.5" /> Select Lender & Submit File
                    </Button>
                  )}
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
    </section>
  );
}
