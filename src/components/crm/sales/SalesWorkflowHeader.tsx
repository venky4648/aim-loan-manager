import React from "react";
import { DemoCase } from "@/lib/demo-data";
import {
  CheckCircle2,
  Clock,
  FileCheck,
  Send,
  UserCheck,
  AlertCircle,
  HelpCircle,
  XCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { calculateDocProgress } from "@/lib/sales-workflow-types";

interface SalesWorkflowHeaderProps {
  record: DemoCase;
}

export function SalesWorkflowHeader({ record }: SalesWorkflowHeaderProps) {
  const interest = record.interestStatus || "Not Contacted";
  const docs = record.workflowDocuments || [];
  const docProgress = calculateDocProgress(docs);
  const isHandedOver = record.handover?.isHandedOver ?? false;

  // Determine current active step (1 to 4)
  let activeStep = 1;
  if (isHandedOver) {
    activeStep = 4;
  } else if (interest === "Interested" && docProgress.isComplete) {
    activeStep = 4;
  } else if (interest === "Interested") {
    activeStep = 3;
  } else if (interest === "Follow-up Required") {
    activeStep = 2;
  } else {
    activeStep = 1;
  }

  const steps = [
    {
      num: 1,
      title: "Step 1: Qualification",
      isComplete: interest === "Interested",
      isCurrent: activeStep === 1 && interest !== "Interested",
      subSteps: [
        {
          label: "1.1 First Contact",
          value:
            record.contactStatus === "Contacted"
              ? "Contacted ✓"
              : record.contactStatus === "Call Attempted - No Answer"
              ? "No Answer"
              : record.contactStatus === "Call Rescheduled"
              ? "Rescheduled"
              : "Not Contacted",
          isDone: record.contactStatus === "Contacted",
          isAlert: false,
        },
        {
          label: "1.2 Interest Status",
          value:
            interest === "Interested"
              ? "Interested ✓"
              : interest === "Not Interested"
              ? "Not Interested"
              : interest === "Follow-up Required"
              ? "Follow-up Req"
              : "Pending",
          isDone: interest === "Interested",
          isAlert: interest === "Not Interested",
        },
      ],
    },
    {
      num: 2,
      title: "Step 2: Follow-up",
      isComplete:
        interest === "Interested" ||
        (Array.isArray(record.followUps) && record.followUps.some((f) => f.status === "Completed")),
      isCurrent: activeStep === 2,
      subSteps: [
        {
          label: "2.1 Scheduled",
          value:
            (record.followUps?.length || 0) > 0
              ? `${record.followUps?.length} Logged`
              : "None Scheduled",
          isDone: (record.followUps?.length || 0) > 0,
          isAlert: false,
        },
        {
          label: "2.2 Call Action",
          value:
            interest === "Follow-up Required"
              ? "Action Due"
              : record.followUps?.some((f) => f.status === "Completed")
              ? "Call Done ✓"
              : "In Queue",
          isDone: record.followUps?.some((f) => f.status === "Completed") ?? false,
          isAlert: interest === "Follow-up Required",
        },
      ],
    },
    {
      num: 3,
      title: "Step 3: Document Collection",
      isComplete: interest === "Interested" && docProgress.isComplete,
      isCurrent: activeStep === 3,
      subSteps: [
        {
          label: "3.1 Received",
          value:
            interest !== "Interested"
              ? "Locked"
              : `${docProgress.received}/${docProgress.total} Files`,
          isDone: docProgress.received > 0,
          isAlert: false,
        },
        {
          label: "3.2 Completion",
          value:
            interest !== "Interested"
              ? "Locked"
              : docProgress.isComplete
              ? "100% Ready ✓"
              : `${docProgress.percentage}% Done`,
          isDone: docProgress.isComplete,
          isAlert: interest === "Interested" && !docProgress.isComplete && docProgress.received > 0,
        },
      ],
    },
    {
      num: 4,
      title: "Step 4: Bank Handover",
      isComplete: isHandedOver,
      isCurrent: activeStep === 4,
      subSteps: [
        {
          label: "4.1 Eligibility",
          value: docProgress.isComplete ? "Eligible ✓" : "Incomplete",
          isDone: docProgress.isComplete,
          isAlert: false,
        },
        {
          label: "4.2 Operations",
          value: isHandedOver ? "Handed Over ✓" : "Ready to Send",
          isDone: isHandedOver,
          isAlert: false,
        },
      ],
    },
  ];

  return (
    <div className="surface-card p-5 border-2 border-border/80 shadow-xs rounded-xl bg-card">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3.5">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Linear Sales Workflow Tracker
          </span>
          <h3 className="text-base font-bold text-foreground mt-0.5 flex items-center gap-2">
            Student Application Progress Pipeline
          </h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {interest === "Interested" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-500/30">
              <CheckCircle2 className="size-3.5" /> Interested Student
            </span>
          )}
          {interest === "Not Interested" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-500/30">
              <XCircle className="size-3.5" /> Not Interested
            </span>
          )}
          {interest === "Follow-up Required" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-500/30">
              <Clock className="size-3.5" /> Follow-up Required
            </span>
          )}
          {interest === "Not Contacted" && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/15 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-500/30">
              <HelpCircle className="size-3.5" /> Not Contacted
            </span>
          )}

          {isHandedOver && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary border border-primary/30">
              <Send className="size-3.5" /> Handed Over to Operations
            </span>
          )}
        </div>
      </div>

      {/* Main Steps & Small Sub-Steps Side-by-Side */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {steps.map((st) => {
          const isPassed = st.isComplete;
          const isCurrent = st.isCurrent;

          return (
            <div
              key={st.num}
              className={`rounded-xl p-4 transition-all border flex flex-col justify-between ${
                isCurrent
                  ? "bg-primary/5 border-primary shadow-xs ring-2 ring-primary/20"
                  : isPassed
                  ? "bg-emerald-500/5 border-emerald-500/30"
                  : "bg-background/50 border-border/60 opacity-80"
              }`}
            >
              {/* Main Step Header */}
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                      isPassed
                        ? "bg-emerald-600 text-white"
                        : isCurrent
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground border border-border"
                    }`}
                  >
                    {isPassed ? "✓" : st.num}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {st.title}
                  </span>
                </div>
                {isPassed ? (
                  <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Done
                  </span>
                ) : isCurrent ? (
                  <span className="text-[10px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded animate-pulse">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    Next
                  </span>
                )}
              </div>

              {/* Small Sub-Steps Side-by-Side */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {st.subSteps.map((sub, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-colors ${
                      sub.isAlert
                        ? "bg-rose-500/10 border-rose-500/30"
                        : sub.isDone
                        ? "bg-card border-border/80"
                        : "bg-muted/40 border-border/40"
                    }`}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide truncate block">
                      {sub.label}
                    </span>
                    <span
                      className={`text-xs font-bold mt-1 truncate block ${
                        sub.isAlert
                          ? "text-rose-600 font-extrabold"
                          : sub.isDone
                          ? "text-emerald-700"
                          : "text-foreground/80"
                      }`}
                      title={sub.value}
                    >
                      {sub.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
