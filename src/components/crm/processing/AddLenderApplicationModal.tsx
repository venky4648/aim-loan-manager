import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  CheckCircle2,
  Plus,
  Trash2,
  FileCheck2,
  IndianRupee,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { DemoCase } from "@/lib/demo-data";
import { createLoanApplicationsApi } from "@/lib/api-client";
import { toast } from "sonner";

const AVAILABLE_LENDERS = [
  { id: "HDFC Credila", name: "HDFC Credila", type: "NBFC", maxAmount: 10000000, speed: "Fast (3-5 days)" },
  { id: "Avanse Financial", name: "Avanse Financial Services", type: "NBFC", maxAmount: 8500000, speed: "Moderate (4-6 days)" },
  { id: "State Bank of India (SBI)", name: "State Bank of India (SBI)", type: "Public Bank", maxAmount: 15000000, speed: "Govt (10-15 days)" },
  { id: "Axis Bank", name: "Axis Bank Education Loans", type: "Private Bank", maxAmount: 7500000, speed: "Fast (4-5 days)" },
  { id: "Auxilo Finserve", name: "Auxilo Finserve", type: "NBFC", maxAmount: 6000000, speed: "Fast (3-4 days)" },
  { id: "InCred", name: "InCred Financial Services", type: "NBFC", maxAmount: 5000000, speed: "Express (2-3 days)" },
  { id: "ICICI Bank", name: "ICICI Bank", type: "Private Bank", maxAmount: 8000000, speed: "Standard (5-7 days)" },
  { id: "Tata Capital", name: "Tata Capital", type: "NBFC", maxAmount: 5000000, speed: "Standard (4-6 days)" },
];

interface AddLenderApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem?: DemoCase | null;
  allCases?: DemoCase[];
  onSuccess?: () => void;
}

export function AddLenderApplicationModal({
  isOpen,
  onClose,
  caseItem,
  allCases = [],
  onSuccess,
}: AddLenderApplicationModalProps) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(caseItem?.id || "");
  const [selectedLenders, setSelectedLenders] = useState<
    Array<{ lender: string; requestedAmount: number; notes: string }>
  >([]);
  const [programType, setProgramType] = useState<string>("Stem Master's");
  const [loanProduct, setLoanProduct] = useState<string>("Unsecured Study Abroad");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active target student
  const activeCase: any = caseItem || allCases.find((c) => c.id === selectedCaseId);

  // Default requested loan amount from case if available
  const defaultAmount = activeCase?.amount || activeCase?.loanAmount || 4000000;

  const handleToggleLender = (lenderName: string) => {
    const existing = selectedLenders.find((l) => l.lender === lenderName);
    if (existing) {
      setSelectedLenders(selectedLenders.filter((l) => l.lender !== lenderName));
    } else {
      setSelectedLenders([
        ...selectedLenders,
        {
          lender: lenderName,
          requestedAmount: defaultAmount,
          notes: `Lender-specific application prepared for ${activeCase?.student || "student"}.`,
        },
      ]);
    }
  };

  const handleUpdateAmount = (lenderName: string, amount: number) => {
    setSelectedLenders(
      selectedLenders.map((item) =>
        item.lender === lenderName ? { ...item, requestedAmount: amount } : item
      )
    );
  };

  const handleUpdateNotes = (lenderName: string, notes: string) => {
    setSelectedLenders(
      selectedLenders.map((item) =>
        item.lender === lenderName ? { ...item, notes } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) {
      toast.error("Please select a student lead/case to prepare applications.");
      return;
    }

    if (selectedLenders.length === 0) {
      toast.error("Please select at least one lender for this student application.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createLoanApplicationsApi({
        leadId: activeCase.id,
        lenders: selectedLenders,
        programType,
        loanProduct,
        selectedDocumentIds: (activeCase.documents || []).map((d: any) => d.id),
      });

      if (res.success) {
        toast.success(
          `Successfully created ${selectedLenders.length} independent lender application(s) in Draft status.`
        );
        setSelectedLenders([]);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Something went wrong on the server.");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to communicate with backend.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">Prepare Lender Applications</DialogTitle>
              <DialogDescription>
                Select one or multiple partner lenders. Each bank application is prepared and tracked independently.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Student Profile Card */}
          {!caseItem && (
            <div className="space-y-2">
              <Label htmlFor="caseSelect">Select Student File</Label>
              <select
                id="caseSelect"
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
                required
              >
                <option value="">-- Choose verified student case --</option>
                {allCases.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.id} - {c.student} ({c.university || "University"}, {c.country})
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeCase && (
            <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Applicant Summary ({activeCase.id})
                  </span>
                  <h3 className="text-base font-bold">{activeCase.student}</h3>
                </div>
                <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-300">
                  {activeCase.stage || "Docs Verified"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Country</span>
                  <span className="font-medium">{activeCase.country || activeCase.studyCountry || "Global"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Course / Program</span>
                  <span className="font-medium truncate block">{activeCase.course || "Master's"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Target University</span>
                  <span className="font-medium truncate block">
                    {activeCase.university || activeCase.targetUniversity || "Not set"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Estimated Budget</span>
                  <span className="font-medium text-slate-900">₹{(activeCase.amount || 4000000).toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Reused Documents info badge */}
              <div className="pt-2 border-t flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <FileCheck2 className="w-4 h-4 text-slate-600" />
                  Existing documents from case file are automatically linked (no re-upload needed)
                </span>
                <span>{(activeCase.documents || []).length} verified file(s) available</span>
              </div>
            </div>
          )}

          {/* Loan Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="programType">Program Type</Label>
              <select
                id="programType"
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="Stem Master's">STEM Master's / Tech Degree</option>
                <option value="MBA / Business">MBA / Management Degree</option>
                <option value="Undergraduate">Undergraduate Program</option>
                <option value="Healthcare / Medicine">Medical / Healthcare</option>
                <option value="Other Higher Ed">Other Higher Education</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanProduct">Target Loan Product</Label>
              <select
                id="loanProduct"
                value={loanProduct}
                onChange={(e) => setLoanProduct(e.target.value)}
                className="w-full h-10 px-3 py-2 text-sm border rounded-md bg-background"
              >
                <option value="Unsecured Study Abroad">Unsecured Education Loan (No Collateral)</option>
                <option value="Secured Property Collateral">Secured Loan (Immovable Property)</option>
                <option value="Secured Liquid Security">Secured (FD / Insurance / Liquid)</option>
                <option value="Co-borrower Backed">Co-borrower Guaranteed</option>
              </select>
            </div>
          </div>

          {/* Select Lenders Multi-card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                Select Lenders ({selectedLenders.length} selected)
              </Label>
              <span className="text-xs text-muted-foreground">
                Click to add bank to submission batch
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {AVAILABLE_LENDERS.map((bank) => {
                const isSelected = selectedLenders.some((l) => l.lender === bank.name);
                return (
                  <div
                    key={bank.id}
                    onClick={() => handleToggleLender(bank.name)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                        : "border-border hover:border-muted-foreground/40 bg-card"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{bank.name}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-primary fill-primary/20" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                          {bank.type}
                        </Badge>
                        <span>TAT: {bank.speed}</span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">
                      Max ₹{(bank.maxAmount / 100000).toFixed(0)}L
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lender-wise Customized Amounts */}
          {selectedLenders.length > 0 && (
            <div className="space-y-4 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Lender-Specific Parameters (Independent per Bank)
                </Label>
                <span className="text-xs text-muted-foreground">
                  Adjust requested amount and notes for each bank independently
                </span>
              </div>

              <div className="space-y-3">
                {selectedLenders.map((item) => (
                  <div
                    key={item.lender}
                    className="p-3.5 rounded-lg border bg-background/60 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-primary" />
                        {item.lender}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLender(item.lender)}
                        className="text-slate-600 hover:text-slate-900 h-7 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Requested Amount (₹)</Label>
                        <div className="relative">
                          <IndianRupee className="w-3.5 h-3.5 absolute left-2.5 top-3 text-muted-foreground" />
                          <Input
                            type="number"
                            value={item.requestedAmount}
                            onChange={(e) =>
                              handleUpdateAmount(item.lender, Number(e.target.value) || 0)
                            }
                            className="pl-8 text-sm font-mono h-9"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">RM Special Notes / Justification</Label>
                        <Input
                          type="text"
                          value={item.notes}
                          onChange={(e) => handleUpdateNotes(item.lender, e.target.value)}
                          placeholder="e.g. Co-applicant ITR verified, GRE 325"
                          className="text-sm h-9"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedLenders.length === 0 || !activeCase}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isSubmitting
                ? "Preparing Applications..."
                : `Create ${selectedLenders.length} Application(s) (Draft)`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
