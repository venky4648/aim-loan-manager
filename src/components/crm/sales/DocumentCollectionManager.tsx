import React, { useState } from "react";
import { DemoCase } from "@/lib/demo-data";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { DocCollectionStatus } from "@/lib/sales-workflow-types";
import { Button } from "@/components/ui/button";
import { FileText, Edit3, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface DocumentCollectionManagerProps {
  record: DemoCase;
}

type SectionKey = "student" | "parent" | "property";

const SECTION_CONFIG: Array<{
  key: SectionKey;
  title: string;
  statusField:
    | "studentDocumentsStatus"
    | "parentDocumentsStatus"
    | "propertyDocumentsStatus";
}> = [
  { key: "student", title: "Student Documents", statusField: "studentDocumentsStatus" },
  { key: "parent", title: "Parent Documents", statusField: "parentDocumentsStatus" },
  { key: "property", title: "Property Documents", statusField: "propertyDocumentsStatus" },
];

function statusStyle(status: DocCollectionStatus) {
  if (status === "Received") {
    return "border-slate-800 bg-slate-900 text-white font-semibold";
  }
  if (status === "Partially Received") {
    return "border-slate-400 bg-slate-200 text-slate-900 font-semibold";
  }
  return "border-slate-300 bg-slate-100 text-slate-700 font-medium";
}

function statusIcon(status: DocCollectionStatus) {
  if (status === "Received") return <CheckCircle2 className="size-4" />;
  if (status === "Partially Received") return <Clock className="size-4" />;
  return <AlertCircle className="size-4" />;
}

export function DocumentCollectionManager({
  record,
}: DocumentCollectionManagerProps) {
  const { user, role } = useAuth();
  const { updateDocumentSectionStatus } = useCases();
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const [draftStatus, setDraftStatus] = useState<DocCollectionStatus>("Not Received");

  const canEdit =
    !record.handover?.isHandedOver &&
    (role === "telecom" || role === "superadmin");

  const startEditing = (section: SectionKey, status: DocCollectionStatus) => {
    setEditingSection(section);
    setDraftStatus(status);
  };

  const cancelEditing = () => {
    setEditingSection(null);
  };

  const saveStatus = async (section: SectionKey) => {
    const saved = await updateDocumentSectionStatus(
      record.id,
      section,
      draftStatus,
      user?.name || "Staff",
    );
    if (saved) setEditingSection(null);
  };

  return (
    <section className="surface-card border-2 border-border p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3 border-b border-border pb-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">
            Document Collection Status
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Update the overall status of each document section.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4">
        {SECTION_CONFIG.map((section) => {
          const currentStatus =
            (record[section.statusField] as DocCollectionStatus | undefined) ||
            "Not Received";
          const isEditing = editingSection === section.key;

          return (
            <article
              key={section.key}
              className="rounded-xl border-2 border-border bg-card p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
                {!isEditing && canEdit && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEditing(section.key, currentStatus)}
                    className="h-9 shrink-0 text-xs font-semibold"
                  >
                    <Edit3 className="mr-1.5 size-3.5" />
                    Update Status
                  </Button>
                )}
              </div>

              {isEditing ? (
                <div className="mt-4 space-y-3">
                  <div className="flex flex-col gap-2">
                    {(["Not Received", "Partially Received", "Received"] as DocCollectionStatus[]).map(
                      (status) => (
                        <label
                          key={status}
                          className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                            draftStatus === status
                              ? "border-slate-900 bg-slate-900 text-white"
                              : "border-border bg-background text-foreground hover:bg-slate-100"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`status-${section.key}`}
                            checked={draftStatus === status}
                            onChange={() => setDraftStatus(status)}
                            className="accent-current"
                          />
                          {status}
                        </label>
                      ),
                    )}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={cancelEditing}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => saveStatus(section.key)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Current Status
                  </p>
                  <div
                    className={`mt-2 flex min-h-12 w-full items-center gap-2 rounded-lg border px-3 text-sm font-bold ${statusStyle(currentStatus)}`}
                  >
                    {statusIcon(currentStatus)}
                    {currentStatus}
                  </div>
                  {record.documentStatusesUpdatedAt && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Updated
                      {record.documentStatusesUpdatedBy
                        ? ` by ${record.documentStatusesUpdatedBy}`
                        : ""}
                      {` · ${new Date(record.documentStatusesUpdatedAt).toLocaleString("en-IN")}`}
                    </p>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
