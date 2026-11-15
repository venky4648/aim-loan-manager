import React, { useState } from "react";
import { DemoCase, LENDERS } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Landmark,
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

  const { user, role } = useAuth();
  const { updateLender, markLenderRejected } = useCases();

  const isRejected = record.stage === "Rejected";
  const currentLender = record.lender || "Not assigned";

  // Find partner benchmark metrics
  const partnerMeta =
    LENDERS.find((l) => l.name.toLowerCase() === currentLender.toLowerCase()) || {
      name: currentLender,
      type: "NBFC Partner",
      live: 8,
      sanctionRate: 72,
      avgTat: "8 days",
      payout: "1.5%",
    };

  // Change Lender Modal
  const [changeModalOpen, setChangeModalOpen] = useState(false);
  const [selectedLender, setSelectedLender] = useState(
    currentLender !== "Not assigned" ? currentLender : "Avanse Financial Services"
  );
  const [customLender, setCustomLender] = useState("");
  const [changeReason, setChangeReason] = useState("");

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(COMMON_REJECTION_REASONS[0]!);
  const [customRejectionReason, setCustomRejectionReason] = useState("");

  const handleOpenChangeLender = () => {
    setSelectedLender(currentLender !== "Not assigned" ? currentLender : "Avanse Financial Services");
    setCustomLender("");
    setChangeReason("");
    setChangeModalOpen(true);
  };

  const handleConfirmChangeLender = (e: React.FormEvent) => {
    e.preventDefault();
    const finalLender =
      selectedLender === "Other Lender" && customLender.trim()
        ? customLender.trim()
        : selectedLender;

    if (!finalLender) {
      toast.error("Please select or enter a valid lender partner.");
      return;
    }

    updateLender(record.id, {
      newLender: finalLender,
      reason:
        changeReason.trim() ||
        (isRejected
          ? `Re-routed following previous rejection by ${currentLender}`
          : undefined),
      authorName: user?.name || "Staff",
    });

    setChangeModalOpen(false);
  };

  const handleOpenReject = () => {
    setRejectionReason(COMMON_REJECTION_REASONS[0]!);
    setCustomRejectionReason("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      rejectionReason === "Other lender credit policy guidelines" &&
      customRejectionReason.trim()
        ? customRejectionReason.trim()
        : rejectionReason;

    markLenderRejected(record.id, {
      rejectionReason: finalReason,
      authorName: user?.name || "Staff",
    });

    setRejectModalOpen(false);
  };

  return (
    <section className="surface-card p-5 sm:p-6 border-2 border-border shadow-xs rounded-xl bg-card">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Lender Partner Hub
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Banking & NBFC partner routing, sanction metrics, and application status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isRejected ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-500/30">
              <XCircle className="size-3.5" /> Declined by Lender
            </span>
          ) : currentLender !== "Not assigned" ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5" /> Active Partner File
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-500/30">
              <Clock className="size-3.5" /> Partner Unassigned
            </span>
          )}
        </div>
      </div>

      {/* Primary Partner Overview Box */}
      <div className="mt-4 p-4 rounded-xl border border-border bg-muted/20 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] uppercase font-bold tracking-wider text-muted-foreground block">
              Assigned Banking / NBFC Partner
            </span>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <h3 className="text-lg font-bold text-foreground">
                {currentLender}
              </h3>
              {currentLender !== "Not assigned" && (
                <span className="text-[10px] uppercase font-extrabold bg-primary/10 text-primary border border-primary/25 px-2 py-0.5 rounded shrink-0">
                  {partnerMeta.type || "NBFC"} Partner
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="outline"
              onClick={handleOpenChangeLender}
              className="text-xs font-semibold gap-1.5 shadow-xs"
            >
              <Edit3 className="size-3.5 text-primary" />
              {isRejected ? "Change Lender & Re-submit" : "Change Lender"}
            </Button>

            {!isRejected && currentLender !== "Not assigned" && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleOpenReject}
                className="text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <XCircle className="size-3.5 mr-1" /> Mark Declined
              </Button>
            )}
          </div>
        </div>

        {/* Live Partner Performance Metrics */}
        {currentLender !== "Not assigned" && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-border/60">
            <div className="p-2.5 rounded-lg bg-card border border-border/80">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Approval Rate
              </span>
              <span className="text-sm font-extrabold text-emerald-600 mt-0.5 block">
                {partnerMeta.sanctionRate}% Sanctions
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border/80">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Average TAT
              </span>
              <span className="text-sm font-extrabold text-foreground mt-0.5 block">
                {partnerMeta.avgTat}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border/80">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Live Files
              </span>
              <span className="text-sm font-extrabold text-foreground mt-0.5 block">
                {partnerMeta.live} in Queue
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-card border border-border/80">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                Commission Payout
              </span>
              <span className="text-sm font-extrabold text-primary mt-0.5 block">
                {partnerMeta.payout}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs border-t border-border/60">
          <div>
            <span className="text-muted-foreground block text-[11px]">Case Executive</span>
            <span className="font-semibold text-foreground truncate block">{record.owner}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">Loan Preference</span>
            <span className="font-semibold text-foreground truncate block">{record.loanType}</span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px]">File Last Updated</span>
            <span className="font-semibold text-foreground truncate block">{record.updated}</span>
          </div>
        </div>
      </div>

      {/* REJECTION RECOVERY CALLOUT */}
      {isRejected && (
        <div className="mt-4 p-4 rounded-xl border-2 border-rose-500/40 bg-rose-500/10 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-rose-950">
                Loan Application Was Declined / Rejected by {currentLender}
              </h4>
              <p className="text-xs text-rose-800 leading-relaxed">
                <strong>Decline Reason:</strong>{" "}
                {record.lenderRejectionReason || "Lender credit policy criteria not met."}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-white/90 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs text-rose-950 font-bold leading-relaxed">
                Re-route to an alternative partner to save this deal!
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Recommended partners for fast approval: Avanse (72% sanction), Auxilo (69% sanction), or HDFC Credila (78% sanction).
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleOpenChangeLender}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0 shadow-sm"
            >
              <RotateCcw className="size-3.5 mr-1.5" /> Change Lender & Re-submit
            </Button>
          </div>
        </div>
      )}

      {/* MODAL 1: CHANGE / RE-ROUTE LENDER */}
      <Dialog open={changeModalOpen} onOpenChange={setChangeModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              {isRejected ? "Change Lender Partner & Re-apply" : "Select Partner Bank / NBFC"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Choose an alternative lender partner for <strong>{record.student}</strong> ({record.id}).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmChangeLender} className="space-y-4 pt-2">
            <div className="p-3 rounded-lg bg-muted/50 border border-border text-xs flex justify-between items-center">
              <span className="text-muted-foreground font-medium">Previous Partner:</span>
              <strong className="text-foreground">
                {currentLender}{" "}
                {isRejected && <span className="text-rose-600 font-bold">(Declined)</span>}
              </strong>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Select Alternative Lender Partner <span className="text-primary">*</span>
              </Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto p-1 border border-border/50 rounded-lg bg-muted/20">
                {LENDERS.map((lend) => {
                  const active = selectedLender === lend.name;
                  return (
                    <button
                      key={lend.name}
                      type="button"
                      onClick={() => setSelectedLender(lend.name)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        active
                          ? "bg-primary/10 border-primary shadow-xs ring-2 ring-primary/20"
                          : "bg-card border-border hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground">
                          {lend.name}
                        </span>
                        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {lend.type}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-bold">
                          {lend.sanctionRate}% Sanctions
                        </span>
                        <span className="text-muted-foreground">
                          TAT: {lend.avgTat}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Re-submission Remarks / Reason for Switch
              </Label>
              <Textarea
                placeholder="Why is this file being routed to this partner? (e.g. Higher unsecured loan eligibility, lower interest rate, previous rejection resolution...)"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                className="mt-1 text-xs min-h-[70px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangeModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="font-bold bg-primary hover:bg-primary/90 text-white"
              >
                <ArrowRight className="mr-1.5 size-3.5" />
                Confirm & Route File
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: MARK REJECTED BY LENDER */}
      <Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertCircle className="size-5 text-destructive" />
              Mark File Declined by {currentLender}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record the rejection decision and reason from the credit underwriting team.
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

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                Confirm Decline Decision
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
