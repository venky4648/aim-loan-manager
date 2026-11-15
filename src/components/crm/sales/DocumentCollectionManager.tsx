import React, { useState } from "react";
import { DemoCase } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import {
  DocCollectionStatus,
  calculateDocProgress,
  CaseDocumentItem,
} from "@/lib/sales-workflow-types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Edit3,
  ShieldCheck,
  ShieldAlert,
  Info,
  Lock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface DocumentCollectionManagerProps {
  record: DemoCase;
}

export function DocumentCollectionManager({
  record,
}: DocumentCollectionManagerProps) {
  const { user, role } = useAuth();
  const { updateDocumentStatus } = useCases();

  const isHandedOver = record.handover?.isHandedOver ?? false;
  const isSalesOrAdmin = role === "sales" || role === "admin";
  const isInterested = record.interestStatus === "Interested";
  const canEdit = isSalesOrAdmin && !isHandedOver && isInterested;

  const docs = record.workflowDocuments || [];
  const progress = calculateDocProgress(docs);

  // Edit Single Doc Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocumentItem | null>(null);
  const [collectionStatus, setCollectionStatus] = useState<DocCollectionStatus>("Received");
  const [docNotes, setDocNotes] = useState("");

  const handleOpenEdit = (doc: CaseDocumentItem) => {
    setSelectedDoc(doc);
    setCollectionStatus(doc.collectionStatus);
    setDocNotes(doc.comments || "");
    setEditModalOpen(true);
  };

  const handleSaveDocStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoc) return;

    updateDocumentStatus(record.id, selectedDoc.name, {
      collectionStatus,
      comments: docNotes.trim(),
      authorName: user?.name || "Staff",
    });

    setEditModalOpen(false);
    setSelectedDoc(null);
  };

  return (
    <section className="surface-card p-6 border-2 border-border shadow-sm rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Step 3: Document Collection Management
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collect applicant & co-applicant KYC, academic marks, and financial proofs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isInterested ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-500/30">
              <Lock className="size-3.5" /> Step Locked
            </span>
          ) : progress.isComplete ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5" /> 100% Documents Collected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-500/30">
              <Clock className="size-3.5" /> {progress.pending} Documents Pending
            </span>
          )}
        </div>
      </div>

      {/* GATED STATE: If Student is NOT interested yet */}
      {!isInterested ? (
        <div className="mt-5 p-6 rounded-xl border-2 border-dashed border-border bg-muted/20 text-center space-y-3">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Lock className="size-6 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Document Collection is Currently Locked
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              {record.interestStatus === "Not Interested"
                ? `The applicant was marked as "Not Interested" (Reason: ${record.notInterestedReason || "None recorded"}). Document collection is disabled.`
                : record.interestStatus === "Follow-up Required"
                ? "The applicant requested a follow-up call. Complete the follow-up in Step 2. Once interest is confirmed as Interested, document collection will unlock automatically."
                : "The applicant has not been contacted yet. Call the student in Step 1 and confirm they are Interested to unlock document collection."}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border text-xs font-semibold text-muted-foreground">
            Current Status:{" "}
            <span className="text-primary font-bold">
              {record.interestStatus || "Not Contacted"}
            </span>
          </div>
        </div>
      ) : (
        /* UNLOCKED: Full Interactive Document Collection UI */
        <>
          {progress.isComplete && !isHandedOver && (
            <div className="mt-4 p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-950">
                    All {progress.total} required documents collected!
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    File is ready for processing handover. Proceed to Step 4 below to hand over the case.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md shrink-0">
                Ready for Handover
              </span>
            </div>
          )}

          {/* Progress Metric Bar */}
          <div className="mt-5 p-4 rounded-xl border border-border bg-card/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-foreground">Overall Collection Progress</span>
              <span className="text-primary stat-figure text-sm font-extrabold">
                {progress.received} of {progress.total} Received ({progress.percentage}%)
              </span>
            </div>

            <Progress value={progress.percentage} className="h-2.5 rounded-full" />

            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/20">
                <span className="text-emerald-700 font-extrabold block text-sm">
                  {progress.received}
                </span>
                <span className="text-[11px] text-emerald-800 font-semibold">Received</span>
              </div>

              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20">
                <span className="text-amber-700 font-extrabold block text-sm">
                  {progress.partiallyReceived}
                </span>
                <span className="text-[11px] text-amber-800 font-semibold">Partially Received</span>
              </div>

              <div className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                <span className="text-rose-700 font-extrabold block text-sm">
                  {progress.notReceived}
                </span>
                <span className="text-[11px] text-rose-800 font-semibold">Not Received</span>
              </div>
            </div>
          </div>

          {/* Document Checklist Items */}
          <div className="mt-5 divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
            {docs.map((doc) => {
              const isReceived = doc.collectionStatus === "Received";
              const isPartial = doc.collectionStatus === "Partially Received";
              const isMissing = doc.collectionStatus === "Not Received";

              return (
                <div
                  key={doc.id || doc.name}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">
                        {doc.name}
                      </span>
                      {doc.required && (
                        <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Required
                        </span>
                      )}
                    </div>

                    {doc.comments && (
                      <p className="text-xs text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 font-medium">
                        <strong>Note:</strong> {doc.comments}
                      </p>
                    )}

                    <div className="flex items-center gap-3 text-[11px] text-muted-foreground pt-0.5">
                      <span>
                        Processing Verification:{" "}
                        <strong
                          className={
                            doc.verificationStatus === "Verified"
                              ? "text-emerald-600 font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {doc.verificationStatus || "Pending"}
                        </strong>
                      </span>
                      {doc.updatedAt && (
                        <span>· Updated by {doc.updatedBy || "Sales"}</span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge & Sales Action */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold border ${
                        isReceived
                          ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                          : isPartial
                          ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
                          : "bg-rose-500/15 text-rose-700 border-rose-500/30"
                      }`}
                    >
                      {doc.collectionStatus}
                    </span>

                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(doc)}
                        className="h-8 text-xs font-semibold gap-1 text-primary border-primary/40 hover:bg-primary/10"
                      >
                        <Edit3 className="size-3" /> Update
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* MODAL: Update Single Document Collection Status */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Update Document Collection Status
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Document: <strong>{selectedDoc?.name}</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveDocStatus} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Collection Status</Label>
              <div className="grid grid-cols-3 gap-2">
                {(["Received", "Partially Received", "Not Received"] as DocCollectionStatus[]).map(
                  (st) => {
                    const active = collectionStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setCollectionStatus(st)}
                        className={`p-2.5 rounded-lg text-xs font-bold border text-center transition-all ${
                          active
                            ? st === "Received"
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : st === "Partially Received"
                              ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                              : "bg-rose-600 text-white border-rose-600 shadow-sm"
                            : "bg-background text-foreground border-border hover:bg-accent"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="docNotes" className="text-xs font-semibold">
                Document Comments / Missing Remarks
              </Label>
              <Textarea
                id="docNotes"
                placeholder="e.g. Received front scan only; waiting for back page..."
                value={docNotes}
                onChange={(e) => setDocNotes(e.target.value)}
                className="text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold shadow-xs">
                Save Document Status
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}

