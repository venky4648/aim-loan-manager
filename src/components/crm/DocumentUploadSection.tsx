import { useEffect, useState, type ChangeEvent } from "react";
import { CheckCircle2, FileText, Plus, Replace, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE_URL } from "@/lib/api-client";

export interface UploadedDocumentEntry {
  id: string;
  name: string;
  type: string;
  file?: File | undefined;
  fileName?: string | undefined;
  fileUrl?: string | undefined;
  mimeType?: string | undefined;
  size?: number | undefined;
  status: "Pending" | "Uploaded";
  collectionStatus?: "Not Received" | "Partially Received" | "Received" | undefined;
  category?: string | undefined;
  dynamic?: boolean | undefined;
}

export interface DocumentCategory {
  title: string;
  names: string[];
}

const DOCUMENT_TYPES = ["PDF", "Image", "Word", "Text", "Other"];
const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function createId(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
}

export function DocumentUploadSection({
  title,
  categories,
  documents,
  onChange,
}: {
  title: string;
  categories: DocumentCategory[];
  documents: UploadedDocumentEntry[];
  onChange: (documents: UploadedDocumentEntry[]) => void;
}) {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const urls: Record<string, string> = {};
    documents.forEach((document) => {
      if (document.file) urls[document.id] = URL.createObjectURL(document.file);
    });
    setPreviewUrls((previous) => {
      Object.values(previous).forEach((url) => URL.revokeObjectURL(url));
      return urls;
    });
    return () => Object.values(urls).forEach((url) => URL.revokeObjectURL(url));
  }, [documents]);

  const addPredefinedDocuments = () => {
    const existingKeys = new Set(
      documents
        .filter((document) => !document.dynamic)
        .map((document) => `${document.category || ""}::${document.name}`),
    );
    const entries = categories.flatMap((category) =>
      category.names
        .filter((name) => !existingKeys.has(`${category.title}::${name}`))
        .map((name) => ({
          id: createId(name),
          name,
          type: "",
          status: "Pending" as const,
          category: category.title,
        })),
    );
    if (entries.length > 0) onChange([...documents, ...entries]);
  };

  useEffect(() => {
    addPredefinedDocuments();
  }, [categories, documents]);

  const updateDocument = (id: string, patch: Partial<UploadedDocumentEntry>) => {
    onChange(documents.map((document) => document.id === id ? { ...document, ...patch } : document));
  };

  const handleFile = (document: UploadedDocumentEntry, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setValidationErrors((previous) => ({ ...previous, [document.id]: "Unsupported file format. Use PDF, JPG, PNG or Word." }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setValidationErrors((previous) => ({ ...previous, [document.id]: "File size must be 10 MB or less." }));
      return;
    }
    setValidationErrors((previous) => {
      const next = { ...previous };
      delete next[document.id];
      return next;
    });
    updateDocument(document.id, {
      file,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      status: "Uploaded",
    });
  };

  const removeDocument = (id: string) => {
    onChange(documents.filter((document) => document.id !== id));
  };

  const addDynamicDocument = (categoryTitle: string) => {
    onChange([
      ...documents,
      {
        id: `dynamic-${crypto.randomUUID()}`,
        name: "",
        type: "",
        status: "Pending",
        category: categoryTitle,
        dynamic: true,
      },
    ]);
  };

  return (
    <section className="space-y-4">
      <h3 className="border-b border-border pb-2 text-sm font-bold text-primary">{title}</h3>

      {categories.map((category) => (
        <div key={category.title} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{category.title}</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addDynamicDocument(category.title)}
            >
              <Plus className="mr-2 size-4" /> Add New Document
            </Button>
          </div>
          <div className="grid gap-3">
            {documents
              .filter((document) => document.category === category.title && !document.dynamic)
              .map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  previewUrl={previewUrls[document.id]}
                  error={validationErrors[document.id]}
                  onUpdate={(patch) => updateDocument(document.id, patch)}
                  onFile={(event) => handleFile(document, event)}
                  onRemove={() => removeDocument(document.id)}
                />
              ))}
            {documents
              .filter((document) => document.category === category.title && document.dynamic)
              .map((document) => (
                <DocumentRow
                  key={document.id}
                  document={document}
                  previewUrl={previewUrls[document.id]}
                  error={validationErrors[document.id]}
                  onUpdate={(patch) => updateDocument(document.id, patch)}
                  onFile={(event) => handleFile(document, event)}
                  onRemove={() => removeDocument(document.id)}
                  editableName
                />
              ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function DocumentRow({
  document,
  previewUrl,
  error,
  onUpdate,
  onFile,
  onRemove,
  editableName = false,
}: {
  document: UploadedDocumentEntry;
  previewUrl?: string | undefined;
  error?: string | undefined;
  onUpdate: (patch: Partial<UploadedDocumentEntry>) => void;
  onFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  editableName?: boolean;
}) {
  const previewLink = previewUrl
    || (document.fileUrl
      ? (document.fileUrl.startsWith("http")
        ? document.fileUrl
        : `${API_BASE_URL.replace(/\/api\/v1\/?$/, "")}${document.fileUrl}`)
      : undefined);
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="grid gap-3 md:grid-cols-[minmax(180px,1fr)_160px_minmax(180px,1fr)_auto] md:items-end">
        <div className="space-y-1.5">
          <Label>{editableName ? "Document Name" : "Document"}</Label>
          {editableName ? (
            <Input value={document.name} placeholder="Enter document name" onChange={(event) => onUpdate({ name: event.target.value })} />
          ) : (
            <div className="flex h-9 items-center rounded-md border border-input bg-muted/30 px-3 text-sm">{document.name}</div>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Document Type</Label>
          <select
            value={document.type}
            onChange={(event) => onUpdate({ type: event.target.value })}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Select type</option>
            {DOCUMENT_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>{document.status === "Uploaded" ? "Uploaded File" : "Upload Document"}</Label>
          <label className="flex h-9 cursor-pointer items-center justify-between gap-2 rounded-md border border-input px-3 text-sm">
            <span className="truncate text-muted-foreground">{document.fileName || "Choose file"}</span>
            {document.status === "Uploaded" ? <Replace className="size-4 shrink-0" /> : <UploadCloud className="size-4 shrink-0" />}
            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={onFile} />
          </label>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${document.name || "document"}`}>
          <Trash2 className="size-4 text-destructive" />
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
        {document.status === "Uploaded" ? (
          <span className="inline-flex items-center gap-1 text-emerald-700">
            <CheckCircle2 className="size-3.5" /> Uploaded
            {document.fileName && (
              previewLink ? (
                <a className="ml-1 underline" href={previewLink} target="_blank" rel="noreferrer">
                  Preview
                </a>
              ) : null
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-amber-700">
            <FileText className="size-3.5" /> Pending
          </span>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
