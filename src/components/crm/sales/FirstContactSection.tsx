import React, { useState } from "react";
import { DemoCase } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import {
  ContactStatus,
  InterestStatus,
} from "@/lib/sales-workflow-types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PhoneCall,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  HelpCircle,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface FirstContactSectionProps {
  record: DemoCase;
}

const COMMON_NOT_INTERESTED_REASONS = [
  "High rate of interest compared to local bank offers",
  "Opted for self-funding / family sponsorship",
  "Chose another education loan lender or aggregator",
  "Admission or visa application deferred to next year",
  "Collateral security / co-applicant criteria not meeting",
  "Other personal reasons",
];

export function FirstContactSection({ record }: FirstContactSectionProps) {
  const { user, role } = useAuth();
  const { updateFirstContact, reactivateLead, updateInterestStatus } = useCases();

  const isHandedOver = record.handover?.isHandedOver ?? false;
  const isSalesOrAdmin = role === "telecom" || role === "superadmin";
  const canEdit = isSalesOrAdmin && !isHandedOver;

  // Dialog State
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [reactivateModalOpen, setReactivateModalOpen] = useState(false);

  // Form State
  const [contactStatus, setContactStatus] = useState<ContactStatus>(
    record.contactStatus || "Not Contacted"
  );
  const [interestStatus, setInterestStatus] = useState<InterestStatus>(
    record.interestStatus || "Not Contacted"
  );
  const [notInterestedReason, setNotInterestedReason] = useState(
    record.notInterestedReason || COMMON_NOT_INTERESTED_REASONS[0]!
  );
  const [customReason, setCustomReason] = useState("");
  const [comment, setComment] = useState("");

  // Reactivate State
  const [reactivateStatus, setReactivateStatus] = useState<InterestStatus>("Interested");
  const [reactivateNote, setReactivateNote] = useState("");

  const handleOpenUpdate = () => {
    setContactStatus(record.contactStatus || "Contacted");
    setInterestStatus(record.interestStatus || "Interested");
    setNotInterestedReason(record.notInterestedReason || COMMON_NOT_INTERESTED_REASONS[0]!);
    setCustomReason("");
    setComment("");
    setUpdateModalOpen(true);
  };

  const handleSaveUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason =
      notInterestedReason === "Other personal reasons" && customReason.trim()
        ? customReason.trim()
        : notInterestedReason;

    updateFirstContact(record.id, {
      contactStatus,
      interestStatus,
      comment: comment.trim(),
      notInterestedReason: interestStatus === "Not Interested" ? finalReason : undefined,
      authorName: user?.name || "Staff",
    });
    setUpdateModalOpen(false);
  };

  const handleConfirmReactivate = (e: React.FormEvent) => {
    e.preventDefault();
    reactivateLead(record.id, {
      newInterestStatus: reactivateStatus,
      comment: reactivateNote.trim() || "Student changed mind / reopened loan enquiry.",
      authorName: user?.name || "Staff",
    });
    setReactivateModalOpen(false);
  };

  const currentInterest = record.interestStatus || "Not Contacted";

  return (
    <section className="surface-card p-6 border-2 border-border shadow-sm rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary" />
            <h2 className="text-base font-bold text-foreground">
              Step 1: First Contact & Student Interest Qualification
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Record interaction outcome, verify student interest, or log rejection reasons.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            {currentInterest === "Not Interested" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setReactivateModalOpen(true)}
                className="font-bold border-emerald-500/50 text-emerald-700 bg-emerald-500/10 hover:bg-emerald-500/20"
              >
                <RotateCcw className="mr-1.5 size-3.5" /> Reactivate Lead
              </Button>
            ) : null}

            <Button
              size="sm"
              onClick={handleOpenUpdate}
              className="font-semibold shadow-xs"
            >
              <PhoneCall className="mr-1.5 size-3.5" /> Update Interaction
            </Button>
          </div>
        )}

        {!canEdit && isHandedOver && (
          <span className="text-xs font-semibold text-muted-foreground bg-muted px-2.5 py-1 rounded-md flex items-center gap-1">
            <ShieldAlert className="size-3 text-amber-500" /> Locked (Handed Over)
          </span>
        )}
      </div>

      {/* Current Interaction Status Cards */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Contact Status Card */}
        <div className="p-4 rounded-xl border border-border bg-card/60">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Contact Status
          </p>
          <div className="mt-2 flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PhoneCall className="size-4" />
            </span>
            <div>
              <p className="text-sm font-bold text-foreground">
                {record.contactStatus || "Not Contacted"}
              </p>
              <p className="text-xs text-muted-foreground">
                Phone: {record.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Student Interest Status Card */}
        <div className="p-4 rounded-xl border border-border bg-card/60">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Student Interest Confirmation
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {currentInterest === "Interested" && (
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-700">
                  <CheckCircle2 className="size-5" />
                </span>
              )}
              {currentInterest === "Not Interested" && (
                <span className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-700">
                  <XCircle className="size-5" />
                </span>
              )}
              {currentInterest === "Follow-up Required" && (
                <span className="flex size-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-700">
                  <Clock className="size-5" />
                </span>
              )}
              {currentInterest === "Not Contacted" && (
                <span className="flex size-8 items-center justify-center rounded-lg bg-slate-500/15 text-slate-700">
                  <HelpCircle className="size-5" />
                </span>
              )}

              <div>
                <p className="text-sm font-bold text-foreground">
                  {currentInterest}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentInterest === "Interested"
                    ? "Proceeding with document collection"
                    : currentInterest === "Not Interested"
                    ? "Application closed in sales bucket"
                    : currentInterest === "Follow-up Required"
                    ? "Further call scheduled"
                    : "Awaiting first phone discussion"}
                </p>
              </div>
            </div>

            {currentInterest === "Interested" && (
              <span className="hidden sm:inline-flex text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ready for Docs
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Interested Confirmation Banner */}
      {currentInterest === "Interested" && (
        <div className="mt-4 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-950">
                Interest Confirmed — Student is Interested in Loan Assistance!
              </p>
              <p className="text-[11px] text-emerald-800">
                Step 3 (Document Collection) is now unlocked below. Collect applicant and co-applicant documents.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md shrink-0">
            Step 1 Complete ✓
          </span>
        </div>
      )}

      {/* Not Interested Alert Banner */}
      {currentInterest === "Not Interested" && (
        <div className="mt-4 p-4 rounded-xl border-2 border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <XCircle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-rose-900">
                Student Marked as Not Interested
              </p>
              <p className="text-xs text-rose-800 mt-0.5">
                <strong>Reason:</strong>{" "}
                {record.notInterestedReason || "No specific reason provided."}
              </p>
            </div>
          </div>

          {canEdit && (
            <Button
              size="sm"
              onClick={() => setReactivateModalOpen(true)}
              className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs shrink-0"
            >
              <RotateCcw className="mr-1.5 size-3.5" /> Reactivate Lead
            </Button>
          )}
        </div>
      )}

      {/* Follow-up Required Prompt Banner */}
      {currentInterest === "Follow-up Required" && (
        <div className="mt-4 p-4 rounded-xl border-2 border-amber-500/30 bg-amber-500/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Clock className="size-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-900 font-medium">
              Student requested a callback before confirming loan interest. See the Follow-up Manager below to schedule or complete calls.
            </p>
          </div>
        </div>
      )}

      {/* MODAL 1: Update Interaction & Interest */}
      <Dialog open={updateModalOpen} onOpenChange={setUpdateModalOpen}>
        <DialogContent className="max-w-lg border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Update Student Interaction & Interest
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Log phone call notes and determine whether student is interested in loan assistance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveUpdate} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-bold text-foreground">
                Contact Status
              </Label>
              <select
                value={contactStatus}
                onChange={(e) => setContactStatus(e.target.value as ContactStatus)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="Contacted">Contacted (Spoke with Student / Parent)</option>
                <option value="Call Attempted - No Answer">Call Attempted - No Answer / Switched Off</option>
                <option value="Call Rescheduled">Call Rescheduled by Student</option>
                <option value="Not Contacted">Not Contacted</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Student Interest Status
              </Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: "Interested", label: "Interested", icon: CheckCircle2, color: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10" },
                  { id: "Follow-up Required", label: "Follow-up Required", icon: Clock, color: "text-amber-600 border-amber-500/40 bg-amber-500/10" },
                  { id: "Not Interested", label: "Not Interested", icon: XCircle, color: "text-rose-600 border-rose-500/40 bg-rose-500/10" },
                  { id: "Not Contacted", label: "Not Contacted", icon: HelpCircle, color: "text-slate-600 border-slate-500/40 bg-slate-500/10" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setInterestStatus(item.id as InterestStatus)}
                    className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-bold transition-all ${
                      interestStatus === item.id
                        ? `${item.color} ring-2 ring-primary/40`
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                    }`}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* If Not Interested: Ask Reason */}
            {interestStatus === "Not Interested" && (
              <div className="space-y-2 p-3.5 rounded-lg border border-rose-500/30 bg-rose-500/5 animate-in fade-in-50">
                <Label className="text-xs font-bold text-rose-900">
                  Reason for Not Interested <span className="text-rose-600">*</span>
                </Label>
                <select
                  value={notInterestedReason}
                  onChange={(e) => setNotInterestedReason(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                >
                  {COMMON_NOT_INTERESTED_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {notInterestedReason === "Other personal reasons" && (
                  <input
                    type="text"
                    placeholder="Specify other reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium"
                    required
                  />
                )}
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-foreground">
                Interaction Remarks / Notes
              </Label>
              <Textarea
                placeholder="Details of what was discussed, student preferences, timeline..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1.5 text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setUpdateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold shadow-xs">
                Save Updates
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: Reactivate Lead */}
      <Dialog open={reactivateModalOpen} onOpenChange={setReactivateModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="size-5 text-emerald-600" /> Reactivate Lead
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Re-open this lead if the student has reached out again or reconsidered.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReactivate} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-bold text-foreground">
                New Interest Status
              </Label>
              <select
                value={reactivateStatus}
                onChange={(e) => setReactivateStatus(e.target.value as InterestStatus)}
                className="mt-1.5 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium"
              >
                <option value="Interested">Interested (Proceed to Document Collection)</option>
                <option value="Follow-up Required">Follow-up Required (Schedule Discussion)</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Reactivation Reason / Notes
              </Label>
              <Textarea
                placeholder="Why is this application being reopened? (e.g. Received new admission offer, father agreed to loan terms...)"
                value={reactivateNote}
                onChange={(e) => setReactivateNote(e.target.value)}
                className="mt-1.5 text-xs min-h-[80px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReactivateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                Confirm Reactivation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
