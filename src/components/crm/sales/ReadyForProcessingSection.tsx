import React, { useState } from "react";
import { DemoCase } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { calculateDocProgress, formatDateTime } from "@/lib/sales-workflow-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Lock,
  UserCheck,
  Clock,
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
  const { handoverToProcessing, markReadyForProcessing } = useCases();

  const isHandedOver = record.handover?.isHandedOver ?? false;
  const isSalesOrAdmin = role === "sales" || role === "admin";
  const isInterested = record.interestStatus === "Interested";
  const canPerformHandover = isSalesOrAdmin && !isHandedOver;

  const docs = record.workflowDocuments || [];
  const progress = calculateDocProgress(docs);
  const isEligible = isInterested && progress.isComplete;

  const [handoverModalOpen, setHandoverModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [officer, setOfficer] = useState("Nikhil V (Lead Loan Processing Officer)");

  const handleOpenHandover = () => {
    if (!isEligible) {
      toast.error("Handover is blocked because required documents are still pending.");
      return;
    }
    setRemarks("");
    setHandoverModalOpen(true);
  };

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();

    if (!remarks.trim()) {
      toast.error("Please provide handover remarks/instructions for the processing officer.");
      return;
    }

    handoverToProcessing(record.id, {
      handoverRemarks: remarks.trim(),
      processingOwner: officer,
      authorName: user.name,
    });

    setHandoverModalOpen(false);
  };

  return (
    <section className="surface-card p-6 border-2 border-border shadow-sm rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Send className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Step 4: Ready for Processing & Team Handover
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Validate collected documentation and transfer case ownership to Processing & Credit Operations.
          </p>
        </div>

        {isHandedOver ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 className="size-3.5" /> Handover Complete
          </span>
        ) : !isInterested ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-500/30">
            <Lock className="size-3.5" /> Step Locked
          </span>
        ) : isEligible ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
            <CheckCircle2 className="size-3.5" /> Eligible for Handover
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-500/30">
            <AlertCircle className="size-3.5" /> Handover Blocked
          </span>
        )}
      </div>

      {/* STATE 0: Locked if student is not interested yet */}
      {!isHandedOver && !isInterested && (
        <div className="mt-5 p-6 rounded-xl border-2 border-dashed border-border bg-muted/20 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Processing Handover is Currently Locked
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              This case cannot be handed over until the student confirms interest in Step 1 and all required documents are successfully collected in Step 3.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-xs font-semibold text-muted-foreground">
            Current Stage: <span className="text-primary font-bold">{record.stage}</span>
          </div>
        </div>
      )}

      {/* STATE 1: Already Handed Over to Processing */}
      {isHandedOver && record.handover && (
        <div className="mt-5 p-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                <CheckCircle2 className="size-6" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-emerald-950">
                  Case Handed Over to Processing Team
                </h3>
                <p className="text-xs text-emerald-900 mt-0.5">
                  Handed over on <strong>{formatDateTime(record.handover.handedOverAt || "")}</strong> by{" "}
                  <strong>{record.handover.handedOverBy}</strong>.
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Assigned Processing Officer: <strong>{record.handover.processingOwner}</strong>
                </p>
              </div>
            </div>

            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-md border border-emerald-300 flex items-center gap-1">
              <Lock className="size-3" /> Sales Read-Only
            </span>
          </div>

          <div className="mt-2 p-3 rounded-lg bg-white/70 border border-emerald-500/20 text-xs text-foreground">
            <strong className="text-emerald-950 block mb-0.5">Handover Remarks:</strong>
            {record.handover.handoverRemarks || "No handover remarks recorded."}
          </div>

          <p className="text-[11px] text-emerald-800 font-medium pt-1">
            Sales controls are now locked. Processing executives ({record.handover.processingOwner}) and Admins can now manage bank login, queries, sanctions, and verification.
          </p>
        </div>
      )}

      {/* STATE 2: Pending Documents - Handover Blocked */}
      {!isHandedOver && isInterested && !isEligible && (
        <div className="mt-5 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-950">
                Cannot Handover: Incomplete Documentation
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                All required documents must be received before handing over this file to the Processing Team.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/60 p-3 border border-amber-500/20 text-xs space-y-1.5">
            <span className="font-bold text-amber-950 block">Pending / Incomplete Documents:</span>
            {docs
              .filter((d) => d.collectionStatus !== "Received")
              .map((d) => (
                <div key={d.name} className="flex items-center justify-between text-[11px] text-amber-900">
                  <span>• {d.name}</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {d.collectionStatus}
                  </span>
                </div>
              ))}
          </div>

          <p className="text-[11px] text-muted-foreground font-medium">
            Please mark all documents as <strong>Received</strong> in Step 4 to activate handover.
          </p>
        </div>
      )}

      {/* STATE 3: Eligible for Handover */}
      {!isHandedOver && isEligible && (
        <div className="mt-5 p-5 rounded-xl border-2 border-emerald-500/40 bg-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
              <FileCheck className="size-6" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                100% Documentation Collected & Verified by Sales
              </h3>
              <p className="text-xs text-emerald-900 mt-0.5">
                This student loan case is fully prepared and ready for bank submission / processing login.
              </p>
            </div>
          </div>

          {canPerformHandover && (
            <Button
              onClick={handleOpenHandover}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20 shrink-0"
            >
              <Send className="mr-1.5 size-4" /> Ready for Processing — Handover Application
            </Button>
          )}
        </div>
      )}

      {/* MODAL: Handover Confirmation */}
      <Dialog open={handoverModalOpen} onOpenChange={setHandoverModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Send className="size-5 text-emerald-600" /> Confirm Handover to Processing
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Transferring file of <strong>{record.student}</strong> ({record.id}) to Credit Operations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmHandover} className="space-y-4 pt-2">
            {/* Summary Checklist */}
            <div className="p-3.5 rounded-lg border border-border bg-muted/40 space-y-2 text-xs">
              <p className="font-bold text-foreground">Document Collection Checklist:</p>
              <ul className="space-y-1">
                {docs.map((d) => (
                  <li key={d.name} className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-emerald-600" /> {d.name}
                    </span>
                    <span className="font-bold text-emerald-700">Received</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Assign Processing Officer <span className="text-primary">*</span>
              </Label>
              <select
                value={officer}
                onChange={(e) => setOfficer(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Nikhil V (Lead Loan Processing Officer)">Nikhil V (Lead Loan Processing Officer)</option>
                <option value="Swathi Sharma (Operations / Auditor)">Swathi Sharma (Operations / Auditor)</option>
                <option value="Venkatesh Kota (Managing Director)">Venkatesh Kota (Managing Director)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Handover Remarks / Lender Instructions <span className="text-primary">*</span>
              </Label>
              <Textarea
                placeholder="Important notes for the processing officer (e.g. Student prefers Avanse or Auxilo; father's salary credited in ICICI Bank; required sanction letter within 10 days for visa deadline...)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="mt-1.5 text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="p-2.5 rounded bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900">
              <strong>Notice:</strong> Once handed over, the file status will update to <em>Handed Over</em> and document collection will lock to read-only for Sales.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Confirm & Handover
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

