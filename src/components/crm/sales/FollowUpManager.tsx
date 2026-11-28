import React, { useState } from "react";
import { DemoCase } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import {
  FollowUpRecord,
  FollowUpStatus,
  formatDateTime,
  getEffectiveFollowUpStatus,
} from "@/lib/sales-workflow-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Plus,
  PhoneCall,
  RotateCcw,
  XCircle,
  History,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface FollowUpManagerProps {
  record: DemoCase;
}

export function FollowUpManager({ record }: FollowUpManagerProps) {
  const { user, role } = useAuth();
  const {
    scheduleFollowUp,
    completeFollowUp,
    rescheduleFollowUp,
    cancelFollowUp,
  } = useCases();

  const isHandedOver = record.handover?.isHandedOver ?? false;
  const isSalesOrAdmin = role === "telecom" || role === "superadmin";
  const canEdit = isSalesOrAdmin && !isHandedOver;

  const [activeTab, setActiveTab] = useState<"active" | "overdue" | "completed" | "all">("active");

  // Dialog States
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState<FollowUpRecord | null>(null);

  // Schedule Form State
  const todayStr = new Date().toISOString().split("T")[0]!;
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState("11:00");
  const [reminderNote, setReminderNote] = useState("");

  // Complete Form State
  const [completionNote, setCompletionNote] = useState("");

  // Reschedule Form State
  const [newDate, setNewDate] = useState(todayStr);
  const [newTime, setNewTime] = useState("14:30");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const followUps = record.followUps || [];

  // Grouped counts
  const classifiedFollowUps = followUps.map((f) => ({
    ...f,
    effectiveStatus: getEffectiveFollowUpStatus(f),
  }));

  const overdueList = classifiedFollowUps.filter((f) => f.effectiveStatus === "Overdue");
  const upcomingList = classifiedFollowUps.filter(
    (f) => f.effectiveStatus === "Upcoming" || f.effectiveStatus === "Overdue"
  );
  const completedList = classifiedFollowUps.filter((f) => f.status === "Completed");

  const filteredList =
    activeTab === "active"
      ? upcomingList
      : activeTab === "overdue"
      ? overdueList
      : activeTab === "completed"
      ? completedList
      : classifiedFollowUps;

  const handleOpenSchedule = () => {
    setDate(new Date().toISOString().split("T")[0]!);
    setTime("11:30");
    setReminderNote("");
    setScheduleModalOpen(true);
  };

  const handleConfirmSchedule = (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time) {
      toast.error("Please select a valid date and time.");
      return;
    }

    const scheduledIso = `${date}T${time}:00`;
    const scheduledTimestamp = new Date(scheduledIso).getTime();

    // Prevent past date/time scheduling (with 5 min grace)
    if (scheduledTimestamp < Date.now() - 5 * 60 * 1000) {
      toast.error("Cannot schedule follow-up in the past. Please select an upcoming date and time.");
      return;
    }

    if (!reminderNote.trim()) {
      toast.error("Please enter a reminder agenda or note.");
      return;
    }

    scheduleFollowUp(record.id, {
      scheduledAt: new Date(scheduledIso).toISOString(),
      reminderNote: reminderNote.trim(),
      authorName: user?.name || "Staff",
    });

    setScheduleModalOpen(false);
  };

  const handleOpenComplete = (f: FollowUpRecord) => {
    setSelectedFollowUp(f);
    setCompletionNote("");
    setCompleteModalOpen(true);
  };

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    completeFollowUp(record.id, selectedFollowUp.id, {
      completionNote: completionNote.trim(),
      authorName: user?.name || "Staff",
    });

    setCompleteModalOpen(false);
    setSelectedFollowUp(null);
  };

  const handleOpenReschedule = (f: FollowUpRecord) => {
    setSelectedFollowUp(f);
    setNewDate(new Date().toISOString().split("T")[0]!);
    setNewTime("15:00");
    setRescheduleReason("");
    setRescheduleModalOpen(true);
  };

  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFollowUp) return;

    const scheduledIso = `${newDate}T${newTime}:00`;
    const scheduledTimestamp = new Date(scheduledIso).getTime();

    if (scheduledTimestamp < Date.now() - 5 * 60 * 1000) {
      toast.error("Please pick a future date and time to reschedule.");
      return;
    }

    rescheduleFollowUp(record.id, selectedFollowUp.id, {
      newScheduledAt: new Date(scheduledIso).toISOString(),
      rescheduleReason: rescheduleReason.trim(),
      authorName: user?.name || "Staff",
    });

    setRescheduleModalOpen(false);
    setSelectedFollowUp(null);
  };

  const handleCancelFollowUp = (f: FollowUpRecord) => {
    if (confirm("Are you sure you want to cancel this scheduled follow-up?")) {
      cancelFollowUp(record.id, f.id, {
        reason: "Cancelled by sales executive.",
        authorName: user?.name || "Staff",
      });
    }
  };

  return (
    <section className="surface-card p-6 border-2 border-border shadow-sm rounded-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Step 2: Follow-up & Reminder Management
            </h2>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Schedule multiple reminders, track overdue items, and maintain full call history.
          </p>
        </div>

        {canEdit && (
          <Button
            size="sm"
            onClick={handleOpenSchedule}
            className="font-semibold shadow-xs"
          >
            <Plus className="mr-1.5 size-3.5" /> Schedule Follow-up
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {[
          { id: "active", label: "Upcoming & Due", count: upcomingList.length },
          { id: "overdue", label: "Overdue", count: overdueList.length, alert: overdueList.length > 0 },
          { id: "completed", label: "Completed", count: completedList.length },
          { id: "all", label: "All History", count: followUps.length },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === t.id
                ? "bg-primary text-white shadow-xs"
                : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === t.id
                  ? "bg-white/20 text-white"
                  : t.alert
                  ? "bg-rose-500 text-white font-extrabold"
                  : "bg-background text-foreground"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Follow-up Cards List */}
      <div className="mt-4 space-y-3">
        {filteredList.map((item) => {
          const effectiveStatus = getEffectiveFollowUpStatus(item);
          const isOverdue = effectiveStatus === "Overdue";
          const isCompleted = item.status === "Completed";
          const isCancelled = item.status === "Cancelled";

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all ${
                isOverdue
                  ? "border-slate-400 bg-slate-50 ring-1 ring-slate-400"
                  : isCompleted
                  ? "border-slate-300 bg-slate-50 opacity-80"
                  : "border-border bg-card/70 hover:bg-card"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1">
                      <Calendar className="size-3.5 text-slate-700" />
                      {formatDateTime(item.scheduledAt)}
                    </span>

                    {isOverdue && (
                      <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                        OVERDUE
                      </span>
                    )}

                    {effectiveStatus === "Upcoming" && (
                      <span className="rounded-full bg-slate-200 text-slate-900 px-2.5 py-0.5 text-[10px] font-bold border border-slate-300">
                        Scheduled
                      </span>
                    )}

                    {isCompleted && (
                      <span className="rounded-full bg-slate-100 text-slate-800 px-2.5 py-0.5 text-[10px] font-bold border border-slate-300 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Completed
                      </span>
                    )}

                    {isCancelled && (
                      <span className="rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-[10px] font-bold">
                        Cancelled
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-semibold text-foreground pt-1">
                    {item.reminderNote}
                  </p>

                  <p className="text-[11px] text-muted-foreground">
                    Created by <strong>{item.createdBy}</strong> on {formatDateTime(item.createdAt)}
                  </p>

                  {isCompleted && item.completionNote && (
                    <div className="mt-2 p-2.5 rounded bg-slate-100 border border-slate-200 text-xs text-slate-900">
                      <strong>Completion Outcome:</strong> {item.completionNote}
                    </div>
                  )}

                  {item.rescheduleReason && (
                    <p className="text-[11px] text-slate-600 font-medium">
                      Rescheduled note: {item.rescheduleReason}
                    </p>
                  )}
                </div>

                {/* Actions on active follow-ups */}
                {canEdit && !isCompleted && !isCancelled && (
                  <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 sm:pt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs font-semibold"
                      onClick={() => toast.success(`Simulating call to ${record.student} (${record.phone})...`)}
                    >
                      <PhoneCall className="mr-1 size-3" /> Call
                    </Button>

                    <Button
                      size="sm"
                      className="h-8 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
                      onClick={() => handleOpenComplete(item)}
                    >
                      <CheckCircle2 className="mr-1 size-3" /> Mark Done
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs font-semibold"
                      onClick={() => handleOpenReschedule(item)}
                    >
                      <RotateCcw className="mr-1 size-3" /> Reschedule
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                      onClick={() => handleCancelFollowUp(item)}
                    >
                      <XCircle className="size-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredList.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-xl">
            No follow-ups match this category.
          </div>
        )}
      </div>

      {/* MODAL: Schedule Follow-up */}
      <Dialog open={scheduleModalOpen} onOpenChange={setScheduleModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Clock className="size-5 text-primary" /> Schedule New Follow-up
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set reminder time and discussion agenda for {record.student}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmSchedule} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-foreground">
                  Follow-up Date <span className="text-primary">*</span>
                </Label>
                <Input
                  type="date"
                  min={todayStr}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-foreground">
                  Time Slot <span className="text-primary">*</span>
                </Label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Follow-up Agenda / Reminder Notes <span className="text-primary">*</span>
              </Label>
              <Textarea
                placeholder="e.g. Call parent regarding bank statement upload, explain interest rates, follow up on co-applicant ITR..."
                value={reminderNote}
                onChange={(e) => setReminderNote(e.target.value)}
                className="mt-1 text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setScheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold shadow-xs">
                Confirm Schedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Complete Follow-up */}
      <Dialog open={completeModalOpen} onOpenChange={setCompleteModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" /> Complete Follow-up Call
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record call outcome with {record.student}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmComplete} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-bold text-foreground">
                Call Outcome / Discussion Summary
              </Label>
              <Textarea
                placeholder="What was agreed during the call? (e.g. Student sent salary slips via WhatsApp, agreed to loan login with Auxilo...)"
                value={completionNote}
                onChange={(e) => setCompletionNote(e.target.value)}
                className="mt-1 text-xs min-h-[90px]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCompleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white font-semibold"
              >
                Mark as Completed
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL: Reschedule Follow-up */}
      <Dialog open={rescheduleModalOpen} onOpenChange={setRescheduleModalOpen}>
        <DialogContent className="max-w-md border-border bg-card shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <RotateCcw className="size-5 text-amber-600" /> Reschedule Follow-up
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Pick a new date and time requested by the student.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleConfirmReschedule} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-bold text-foreground">
                  New Date <span className="text-primary">*</span>
                </Label>
                <Input
                  type="date"
                  min={todayStr}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-foreground">
                  New Time <span className="text-primary">*</span>
                </Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="mt-1 text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-foreground">
                Reason for Rescheduling
              </Label>
              <Textarea
                placeholder="e.g. Student in college examination, parent requested evening call..."
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                className="mt-1 text-xs min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setRescheduleModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="font-semibold shadow-xs">
                Confirm Reschedule
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
