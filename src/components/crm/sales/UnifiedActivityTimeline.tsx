import React, { useState, useRef } from "react";
import { DemoCase } from "@/lib/demo-data";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { ActivityItem, formatDateTime } from "@/lib/sales-workflow-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  History,
  MessageSquare,
  Send,
  PhoneCall,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  UserCheck,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

interface UnifiedActivityTimelineProps {
  record: DemoCase;
}

export function UnifiedActivityTimeline({
  record,
}: UnifiedActivityTimelineProps) {
  const { user, role } = useAuth();
  const { addComment } = useCases();

  const [newComment, setNewComment] = useState("");
  const [filter, setFilter] = useState<"all" | "comments" | "system">("all");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);

  const activities = record.activities || [];

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (filter === "comments") return act.type === "comment";
    if (filter === "system") return act.type !== "comment";
    return true;
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error("Please enter a remark or comment.");
      return;
    }

    addComment(record.id, {
      comment: newComment.trim(),
      authorName: user.name,
    });

    setNewComment("");
    setIsComposerOpen(false);
    toast.success("Remark added to activity timeline.");
  };

  const scrollTrack = (direction: "left" | "right") => {
    if (trackRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      trackRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const getActivityStyle = (type: ActivityItem["type"]) => {
    switch (type) {
      case "first_contact":
        return {
          icon: <PhoneCall className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "First Contact",
        };
      case "interest_change":
        return {
          icon: <CheckCircle2 className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Interest Qualified",
        };
      case "not_interested":
        return {
          icon: <AlertCircle className="size-3.5 text-slate-700" />,
          badge: "bg-slate-200 text-slate-800 border-slate-300",
          label: "Not Interested",
        };
      case "reactivation":
        return {
          icon: <RotateCcw className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Reactivated Lead",
        };
      case "followup_created":
      case "followup_rescheduled":
        return {
          icon: <Clock className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Follow-up Call",
        };
      case "followup_completed":
        return {
          icon: <CheckCircle2 className="size-3.5 text-slate-700" />,
          badge: "bg-slate-900 text-white border-slate-900",
          label: "Call Completed",
        };
      case "document_update":
        return {
          icon: <FileText className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Document Change",
        };
      case "ready_for_processing":
        return {
          icon: <CheckCircle2 className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Ready for Handover",
        };
      case "handover":
        return {
          icon: <Send className="size-3.5 text-slate-700" />,
          badge: "bg-slate-900 text-white border-slate-900",
          label: "Handed Over",
        };
      case "comment":
        return {
          icon: <MessageSquare className="size-3.5 text-slate-700" />,
          badge: "bg-slate-100 text-slate-800 border-slate-300",
          label: "Staff Remark",
        };
      default:
        return {
          icon: <History className="size-3.5 text-slate-500" />,
          badge: "bg-slate-100 text-slate-700 border-slate-300",
          label: "System Event",
        };
    }
  };

  return (
    <section className="surface-card p-5 sm:p-6 border-2 border-border shadow-xs rounded-xl bg-card">
      {/* Top Header Bar with Filter Tabs and Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="size-5 text-primary" />
            <h2 className="text-base font-bold text-foreground">
              Unified Activity Timeline & Audit History
            </h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {filteredActivities.length} Events
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Horizontal event timeline tracking tele-calling interactions, reminders, document stages, and staff remarks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg">
            {[
              { id: "all", label: "All Events" },
              { id: "comments", label: "Remarks" },
              { id: "system", label: "Workflow Logs" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  filter === tab.id
                    ? "bg-card text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Toggle Remark Composer */}
          <Button
            size="sm"
            variant="outline"
            className="text-xs font-semibold gap-1.5 shadow-xs"
            onClick={() => setIsComposerOpen((prev) => !prev)}
          >
            <PlusCircle className="size-3.5 text-primary" />
            {isComposerOpen ? "Close Composer" : "Add Remark"}
          </Button>

          {/* Horizontal Track Scroll Arrows */}
          <div className="hidden sm:flex items-center gap-1 border-l border-border pl-2">
            <button
              onClick={() => scrollTrack("left")}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-xs"
              title="Scroll timeline left"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => scrollTrack("right")}
              className="p-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shadow-xs"
              title="Scroll timeline right"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Quick Remark Form */}
      {isComposerOpen && (
        <form onSubmit={handlePostComment} className="mt-4 p-4 rounded-xl border border-primary/30 bg-primary/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-primary" /> Post Remark or Sales Note
            </span>
            <span className="text-[11px] text-muted-foreground">
              Author: <strong>{user.name}</strong> ({role.toUpperCase()})
            </span>
          </div>
          <Textarea
            placeholder="Type your interaction remarks, student discussion note, or co-applicant feedback here..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-xs min-h-[65px] bg-background"
            autoFocus
            required
          />
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsComposerOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="font-semibold shadow-xs">
              <Send className="mr-1.5 size-3.5" /> Save Remark
            </Button>
          </div>
        </form>
      )}

      {/* Horizontal Activity Timeline Track */}
      <div className="mt-5">
        <div
          ref={trackRef}
          className="flex overflow-x-auto gap-4 pb-3 pt-1 px-1 scroll-smooth snap-x no-scrollbar"
        >
          {filteredActivities.map((act) => {
            const isComment = act.type === "comment";
            const style = getActivityStyle(act.type);

            return (
              <div
                key={act.id}
                className={`min-w-[280px] sm:min-w-[320px] max-w-[340px] shrink-0 snap-start p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isComment
                    ? "bg-primary/5 border-primary/25 shadow-xs ring-1 ring-primary/10"
                    : "bg-card border-border hover:border-primary/40 shadow-xs"
                }`}
              >
                <div>
                  {/* Card Header: Type Badge + Date */}
                  <div className="flex items-center justify-between gap-2 border-b border-border/50 pb-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold border ${style.badge}`}
                    >
                      {style.icon}
                      {style.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {formatDateTime(act.timestamp)}
                    </span>
                  </div>

                  {/* Activity Description */}
                  <p className="mt-2.5 text-xs font-semibold text-foreground leading-snug">
                    {act.description}
                  </p>

                  {/* Previous / New value state change chip */}
                  {act.previousValue && act.newValue && (
                    <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/60 px-2 py-1 rounded-md border border-border/50">
                      <span className="line-through truncate max-w-[90px]">{act.previousValue}</span>
                      <span>→</span>
                      <strong className="text-foreground truncate max-w-[120px]">{act.newValue}</strong>
                    </div>
                  )}

                  {/* Comment / Remarks Text Block */}
                  {act.comment && (
                    <div className="mt-2.5 p-2.5 rounded-lg bg-background/90 border-l-4 border-l-primary border-t border-r border-b border-border/60 text-xs text-foreground italic leading-relaxed">
                      "{act.comment}"
                    </div>
                  )}
                </div>

                {/* Footer Staff Attribution */}
                <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium">
                    <UserCheck className="size-3 text-primary" /> {act.updatedBy}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/70">
                    Logged
                  </span>
                </div>
              </div>
            );
          })}

          {filteredActivities.length === 0 && (
            <div className="w-full py-8 text-center text-xs text-muted-foreground border-2 border-dashed border-border/80 rounded-xl p-6 bg-muted/20">
              No activity logs match this filter. Use the <strong>"Add Remark"</strong> button above to log the first customer note.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
