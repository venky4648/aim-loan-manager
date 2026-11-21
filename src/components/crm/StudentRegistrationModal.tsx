import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useCases } from "@/lib/cases-context";
import { REFERRAL_SOURCES } from "@/lib/demo-data";
import {
  DocumentUploadSection,
  type UploadedDocumentEntry,
} from "@/components/crm/DocumentUploadSection";

export interface StudentRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}


const RELATIONSHIP_OPTIONS = [
  "Parent",
  "Father",
  "Mother",
  "Spouse",
  "Brother",
  "Sister",
  "Son",
  "Daughter",
  "Grandfather",
  "Grandmother",
  "Father-in-law",
  "Mother-in-law",
  "Brother-in-law",
  "Sister-in-law",
  "Guardian",
  "Relative",
  "Friend",
  "Other",
];

const PROFESSION_OPTIONS = [
  "Salaried",
  "Self-Employed / Business",
  "Agriculture",
];

export interface RegistrationFormData {
  fullName: string;
  email: string;
  mobile: string;
  alternativePhone: string;
  planningCountry: string;
  studyCountry: string;
  university: string;
  loanRequirement: string;
  loanAmount: string;
  loanType: "" | "Secured" | "Unsecured";
  source: string;
  sourceName: string;

  tenthScore: string;
  tenthYear: string;
  twelfthScore: string;
  twelfthYear: string;
  gradDegree: string;
  gradBranch: string;
  gradCollege: string;
  gradScore: string;
  gradYear: string;
  greScore: string;
  gmatScore: string;
  satScore: string;
  ieltsScore: string;
  toeflScore: string;
  duolingoScore: string;
  workExperience: string;

  coApplicantName: string;
  coApplicantRelation: string;
  coApplicantPhone: string;
  coApplicantAlternativePhone: string;
  coApplicantEmail: string;
  coApplicantEmployment: string;
  coApplicantOrganisation: string;
  coApplicantWorkplace: string;
  coApplicantVintage: string;
  coApplicantMonthlyIncome: string;
  coApplicantAnnualIncome: string;
  coApplicantObligations: string;
  coApplicantAddress: string;
  coApplicantCurrentAddress: string;
  coApplicantPermanentAddress: string;

  studentDocuments: UploadedDocumentEntry[];
  parentDocuments: UploadedDocumentEntry[];
  propertyDocuments: UploadedDocumentEntry[];

  hasCollateral: "Yes" | "No" | "";
  propertyType: string;
  propertyLocation: string;
  propertyMarketValue: string;
  propertyOwner: string;

  hasGuarantor: "Yes" | "No";
  guarantorName: string;
  guarantorRelation: string;
  guarantorPhone: string;
  guarantorAlternativePhone: string;
  guarantorEmail: string;
  guarantorEmployment: string;
  guarantorOrganisation: string;
  guarantorWorkplace: string;
  guarantorVintage: string;
  guarantorMonthlyIncome: string;
  guarantorAnnualIncome: string;
  guarantorObligations: string;
  guarantorAddress: string;
  guarantorCurrentAddress: string;
  guarantorPermanentAddress: string;
}

const INITIAL_DATA: RegistrationFormData = {
  fullName: "",
  email: "",
  mobile: "",
  alternativePhone: "",
  planningCountry: "",
  studyCountry: "",
  university: "",
  loanRequirement: "",
  loanAmount: "",
  loanType: "",
  source: "Customer reference",
  sourceName: "",
  tenthScore: "",
  tenthYear: "",
  twelfthScore: "",
  twelfthYear: "",
  gradDegree: "",
  gradBranch: "",
  gradCollege: "",
  gradScore: "",
  gradYear: "",
  greScore: "",
  gmatScore: "",
  satScore: "",
  ieltsScore: "",
  toeflScore: "",
  duolingoScore: "",
  workExperience: "",
  coApplicantName: "",
  coApplicantRelation: "Parent",
  coApplicantPhone: "",
  coApplicantAlternativePhone: "",
  coApplicantEmail: "",
  coApplicantEmployment: "",
  coApplicantOrganisation: "",
  coApplicantWorkplace: "",
  coApplicantVintage: "",
  coApplicantMonthlyIncome: "",
  coApplicantAnnualIncome: "",
  coApplicantObligations: "",
  coApplicantAddress: "",
  coApplicantCurrentAddress: "",
  coApplicantPermanentAddress: "",
  studentDocuments: [],
  parentDocuments: [],
  propertyDocuments: [],
  hasCollateral: "",
  propertyType: "",
  propertyLocation: "",
  propertyMarketValue: "",
  propertyOwner: "",
  hasGuarantor: "No",
  guarantorName: "",
  guarantorRelation: "",
  guarantorPhone: "",
  guarantorAlternativePhone: "",
  guarantorEmail: "",
  guarantorEmployment: "",
  guarantorOrganisation: "",
  guarantorWorkplace: "",
  guarantorVintage: "",
  guarantorMonthlyIncome: "",
  guarantorAnnualIncome: "",
  guarantorObligations: "",
  guarantorAddress: "",
  guarantorCurrentAddress: "",
  guarantorPermanentAddress: "",
};

const STUDENT_DOCUMENT_CATEGORIES = [
  {
    title: "KYC Details",
    names: ["Aadhaar Card", "PAN Card", "Bank Passbook", "Passport"],
  },
  {
    title: "Academic Details",
    names: ["10th Class Certificate / Marks Memo", "Intermediate Certificate / Marks Memo", "Graduation Certificate / Marks Memo"],
  },
];

const PARENT_DOCUMENT_CATEGORIES = [
  {
    title: "Parent KYC Details",
    names: ["Aadhaar Card", "PAN Card", "Bank Passbook / Bank Details"],
  },
  {
    title: "Salary / Income Details",
    names: ["Salary Certificate", "Payslips", "Form 16", "Income Tax Returns (ITR)", "Bank Statements", "Business Registration Certificate"],
  },
];

const PROPERTY_DOCUMENT_CATEGORIES = [
  {
    title: "Property Ownership Details",
    names: ["Sale Deed", "Linked Documents"],
  },
  {
    title: "Income Tax Documents",
    names: ["Income Tax Documents"],
  },
];

function parseNumber(value: string): number {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function StudentRegistrationModal({
  open,
  onOpenChange,
}: StudentRegistrationModalProps) {
  const { addCase } = useCases();
  const [step, setStep] = useState<1 | 2>(1);
  const [data, setData] = useState<RegistrationFormData>(INITIAL_DATA);
  const [submitted, setSubmitted] = useState(false);

  const updateField = <K extends keyof RegistrationFormData>(
    field: K,
    value: RegistrationFormData[K],
  ) => {
    setData((previous) => ({ ...previous, [field]: value }));
  };

  const reset = () => {
    setData(INITIAL_DATA);
    setStep(1);
    setSubmitted(false);
  };

  const submit = () => {
    addCase({
      student: data.fullName,
      phone: data.mobile,
      alternativePhone: data.alternativePhone,
      email: data.email,
      source: data.source || "Customer reference",
      sourceName: data.sourceName,
      planningCountry: data.planningCountry,
      country: data.studyCountry,
      studyCountry: data.studyCountry,
      university: data.university,
      course: "",
      amount: parseNumber(data.loanAmount),
      loanRequirement: data.loanRequirement,
      loanType: data.loanType || "Unsecured",
      coApplicant: {
        name: data.coApplicantName,
        relation: data.coApplicantRelation,
        contact: data.coApplicantPhone,
        phone: data.coApplicantPhone,
        alternativePhone: data.coApplicantAlternativePhone,
        email: data.coApplicantEmail,
        employment: data.coApplicantEmployment || "Salaried",
        organisation: data.coApplicantOrganisation,
        workplace: data.coApplicantWorkplace,
        vintage: data.coApplicantVintage,
        monthlyIncome: parseNumber(data.coApplicantMonthlyIncome),
        annualIncome: parseNumber(data.coApplicantAnnualIncome),
        obligations: parseNumber(data.coApplicantObligations),
        city: data.coApplicantAddress,
        currentAddress: data.coApplicantCurrentAddress,
        permanentAddress: data.coApplicantPermanentAddress,
      },
      academics: {
        tenth: data.tenthScore
          ? `${data.tenthScore}${data.tenthYear ? ` (${data.tenthYear})` : ""}`
          : "",
        twelfth: data.twelfthScore
          ? `${data.twelfthScore}${data.twelfthYear ? ` (${data.twelfthYear})` : ""}`
          : "",
        graduation: [
          data.gradDegree,
          data.gradBranch,
          data.gradCollege,
          data.gradScore,
          data.gradYear,
        ].filter(Boolean).join(" - "),
        tests: "",
        greScore: data.greScore,
        gmatScore: data.gmatScore,
        satScore: data.satScore,
        ieltsScore: data.ieltsScore,
        toeflScore: data.toeflScore,
        duolingoScore: data.duolingoScore,
        experience: data.workExperience,
      },
      guarantor: data.hasGuarantor === "Yes" ? {
        hasGuarantor: "Yes",
        name: data.guarantorName,
        relation: data.guarantorRelation,
        contact: data.guarantorPhone,
        phone: data.guarantorPhone,
        alternativePhone: data.guarantorAlternativePhone,
        email: data.guarantorEmail,
        employment: data.guarantorEmployment,
        organisation: data.guarantorOrganisation,
        workplace: data.guarantorWorkplace,
        vintage: data.guarantorVintage,
        monthlyIncome: parseNumber(data.guarantorMonthlyIncome),
        annualIncome: parseNumber(data.guarantorAnnualIncome),
        obligations: parseNumber(data.guarantorObligations),
        address: data.guarantorAddress,
        currentAddress: data.guarantorCurrentAddress,
        permanentAddress: data.guarantorPermanentAddress,
      } : undefined,
      collateral: {
        hasCollateral: data.hasCollateral,
        type: data.propertyType,
        location: data.propertyLocation,
        marketValue: parseNumber(data.propertyMarketValue),
        owner: data.propertyOwner,
      },
      studentDocuments: data.studentDocuments,
      parentDocuments: data.parentDocuments,
      propertyDocuments: data.propertyDocuments,
    });

    setSubmitted(true);
    toast.success("Student lead registered successfully.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-hidden rounded-2xl border-border bg-card p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <span className="inline-flex w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            Step {step} of 2
          </span>
          <DialogTitle className="text-xl">
            {submitted ? "Lead Registered" : step === 1 ? "Student Details" : "Application & Supporting Details"}
          </DialogTitle>
          <DialogDescription>
            All fields are optional. Add only the information you have.
          </DialogDescription>
          <Progress value={submitted ? 100 : step * 50} className="mt-3 h-2" />
        </DialogHeader>

        {submitted ? (
          <div className="px-6 py-10 text-center">
            <CheckCircle2 className="mx-auto size-14 text-success" />
            <h3 className="mt-4 text-2xl font-bold">Student lead registered</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              The lead and available details have been added to the CRM pipeline.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="outline" onClick={reset}>Add Another Lead</Button>
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        ) : (
          <>
            <div className="max-h-[62vh] overflow-y-auto px-6 py-6">
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Student Name" id="fullName" value={data.fullName} onChange={(value) => updateField("fullName", value)} placeholder="Student full name" />
                    <Field label="Email" id="email" type="email" value={data.email} onChange={(value) => updateField("email", value)} placeholder="student@example.com" />
                    <Field label="Phone Number" id="mobile" value={data.mobile} onChange={(value) => updateField("mobile", value)} placeholder="+91..." />
                    <Field label="Alternative Number" id="alternativePhone" value={data.alternativePhone} onChange={(value) => updateField("alternativePhone", value)} placeholder="+91..." />
                    <Field label="Country of Planning" id="planningCountry" value={data.planningCountry} onChange={(value) => updateField("planningCountry", value)} placeholder="e.g. India" />
                    <Field label="Country to Study" id="studyCountry" value={data.studyCountry} onChange={(value) => updateField("studyCountry", value)} placeholder="e.g. United States" />
                    <Field label="Target University" id="university" value={data.university} onChange={(value) => updateField("university", value)} placeholder="University or college name" />
                    <Field label="Loan Requirement" id="loanRequirement" value={data.loanRequirement} onChange={(value) => updateField("loanRequirement", value)} placeholder="Tuition, living expenses, travel..." />
                    <Field label="Loan Amount" id="loanAmount" value={data.loanAmount} onChange={(value) => updateField("loanAmount", value)} placeholder="e.g. 3500000" />
                    <div className="space-y-1.5">
                      <Label htmlFor="loanType" className="font-medium">Loan Type Preference</Label>
                      <select
                        id="loanType"
                        value={data.loanType}
                        onChange={(event) => updateField("loanType", event.target.value as RegistrationFormData["loanType"])}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                      >
                        <option value="">Select Loan Preference (Optional)</option>
                        <option value="Unsecured">Unsecured (No Collateral)</option>
                        <option value="Secured">Secured (With Property/FD Collateral)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="source">Sourcing Channel</Label>
                      <select
                        id="source"
                        value={data.source}
                        onChange={(event) => updateField("source", event.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        {REFERRAL_SOURCES.map((source) => (
                          <option key={source} value={source}>{source}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label htmlFor="sourceName">Source Name / Referrer Detail</Label>
                      <Input id="sourceName" value={data.sourceName} onChange={(event) => updateField("sourceName", event.target.value)} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <Section title="Academic Details">
                    <Field label="10th Score" id="tenthScore" value={data.tenthScore} onChange={(value) => updateField("tenthScore", value)} />
                    <Field label="10th Passing Year" id="tenthYear" value={data.tenthYear} onChange={(value) => updateField("tenthYear", value)} />
                    <Field label="12th Score" id="twelfthScore" value={data.twelfthScore} onChange={(value) => updateField("twelfthScore", value)} />
                    <Field label="12th Passing Year" id="twelfthYear" value={data.twelfthYear} onChange={(value) => updateField("twelfthYear", value)} />
                    <Field label="Degree / Course" id="gradDegree" value={data.gradDegree} onChange={(value) => updateField("gradDegree", value)} />
                    <Field label="Branch / Specialization" id="gradBranch" value={data.gradBranch} onChange={(value) => updateField("gradBranch", value)} />
                    <Field label="College / University" id="gradCollege" value={data.gradCollege} onChange={(value) => updateField("gradCollege", value)} />
                    <Field label="Graduation Score" id="gradScore" value={data.gradScore} onChange={(value) => updateField("gradScore", value)} />
                    <Field label="Passing Year" id="gradYear" value={data.gradYear} onChange={(value) => updateField("gradYear", value)} />
                    <Field label="Work Experience" id="workExperience" value={data.workExperience} onChange={(value) => updateField("workExperience", value)} placeholder="Fresher or years of experience" />
                    <Field label="GRE" id="greScore" value={data.greScore} onChange={(value) => updateField("greScore", value)} />
                    <Field label="GMAT" id="gmatScore" value={data.gmatScore} onChange={(value) => updateField("gmatScore", value)} />
                    <Field label="SAT" id="satScore" value={data.satScore} onChange={(value) => updateField("satScore", value)} />
                    <Field label="IELTS" id="ieltsScore" value={data.ieltsScore} onChange={(value) => updateField("ieltsScore", value)} />
                    <Field label="TOEFL" id="toeflScore" value={data.toeflScore} onChange={(value) => updateField("toeflScore", value)} />
                    <Field label="Duolingo" id="duolingoScore" value={data.duolingoScore} onChange={(value) => updateField("duolingoScore", value)} />
                  </Section>

                  <Section title="Co-applicant Details">
                    <Field label="Co-applicant Full Name" id="coApplicantName" value={data.coApplicantName} onChange={(value) => updateField("coApplicantName", value)} />
                    <SelectField
                      label="Relationship"
                      id="coApplicantRelation"
                      value={data.coApplicantRelation}
                      options={RELATIONSHIP_OPTIONS}
                      placeholder="Select relationship"
                      onChange={(value) => updateField("coApplicantRelation", value)}
                    />
                    <Field label="Contact Number" id="coApplicantContact" value={data.coApplicantPhone} onChange={(value) => updateField("coApplicantPhone", value)} />
                    <Field label="Alternative Mobile Number" id="coApplicantAlternativePhone" value={data.coApplicantAlternativePhone} onChange={(value) => updateField("coApplicantAlternativePhone", value)} />
                    <Field label="Email ID" id="coApplicantEmail" type="email" value={data.coApplicantEmail} onChange={(value) => updateField("coApplicantEmail", value)} />
                    <SelectField
                      label="Profession"
                      id="coApplicantEmployment"
                      value={data.coApplicantEmployment}
                      options={PROFESSION_OPTIONS}
                      placeholder="Select Profession"
                      onChange={(value) => updateField("coApplicantEmployment", value)}
                    />
                    <Field label="Organisation / Business Name" id="coApplicantOrg" value={data.coApplicantOrganisation} onChange={(value) => updateField("coApplicantOrganisation", value)} />
                    <Field label="Place of Work / City" id="coApplicantWorkplace" value={data.coApplicantWorkplace} onChange={(value) => updateField("coApplicantWorkplace", value)} />
                    <Field label="Work / Business Vintage" id="coApplicantVintage" value={data.coApplicantVintage} onChange={(value) => updateField("coApplicantVintage", value)} placeholder="e.g. 5 years" />
                    <Field label="Monthly Income (₹)" id="coApplicantMonthlyIncome" value={data.coApplicantMonthlyIncome} onChange={(value) => updateField("coApplicantMonthlyIncome", value)} />
                    <Field label="Annual Income (₹)" id="coApplicantAnnualIncome" value={data.coApplicantAnnualIncome} onChange={(value) => updateField("coApplicantAnnualIncome", value)} />
                    <Field label="Existing Loan Obligations (₹/month)" id="coApplicantObligations" value={data.coApplicantObligations} onChange={(value) => updateField("coApplicantObligations", value)} />
                    <div className="sm:col-span-2">
                      <Field label="Place of Work / City" id="coApplicantAddress" value={data.coApplicantAddress} onChange={(value) => updateField("coApplicantAddress", value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <TextareaField label="Current Address" id="coApplicantCurrentAddress" value={data.coApplicantCurrentAddress} onChange={(value) => updateField("coApplicantCurrentAddress", value)} />
                    </div>
                    <div className="sm:col-span-2">
                      <TextareaField label="Permanent Address" id="coApplicantPermanentAddress" value={data.coApplicantPermanentAddress} onChange={(value) => updateField("coApplicantPermanentAddress", value)} />
                    </div>
                  </Section>

                  <DocumentUploadSection
                    title="Student Documents"
                    categories={STUDENT_DOCUMENT_CATEGORIES}
                    documents={data.studentDocuments}
                    onChange={(documents) => updateField("studentDocuments", documents)}
                  />

                  <DocumentUploadSection
                    title="Parent Documents"
                    categories={PARENT_DOCUMENT_CATEGORIES}
                    documents={data.parentDocuments}
                    onChange={(documents) => updateField("parentDocuments", documents)}
                  />

                  <Section title="Property Details and Documents">
                    <div className="sm:col-span-2 grid gap-4 sm:grid-cols-2">
                      <Field label="Property Owner" id="propertyOwner" value={data.propertyOwner} onChange={(value) => updateField("propertyOwner", value)} />
                      <Field label="Property Type" id="propertyType" value={data.propertyType} onChange={(value) => updateField("propertyType", value)} placeholder="House, flat, land..." />
                      <Field label="Property Location" id="propertyLocation" value={data.propertyLocation} onChange={(value) => updateField("propertyLocation", value)} />
                      <Field label="Market Value" id="propertyMarketValue" value={data.propertyMarketValue} onChange={(value) => updateField("propertyMarketValue", value)} />
                    </div>
                    <DocumentUploadSection
                      title="Property Documents"
                      categories={PROPERTY_DOCUMENT_CATEGORIES}
                      documents={data.propertyDocuments}
                      onChange={(documents) => updateField("propertyDocuments", documents)}
                    />
                  </Section>

                  <Section title="Guarantor Details">
                    <div className="sm:col-span-2 space-y-2">
                      <Label>Would you like to provide guarantor details?</Label>
                      <div className="flex gap-3">
                        {(["Yes", "No"] as const).map((option) => (
                          <label
                            key={option}
                            className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm ${
                              data.hasGuarantor === option
                                ? "border-primary bg-primary/10 font-semibold text-primary"
                                : "border-border bg-background"
                            }`}
                          >
                            <input
                              type="radio"
                              name="hasGuarantor"
                              value={option}
                              checked={data.hasGuarantor === option}
                              onChange={() => updateField("hasGuarantor", option)}
                              className="accent-primary"
                            />
                            {option}
                          </label>
                        ))}
                      </div>
                    </div>
                    {data.hasGuarantor === "Yes" && (
                      <>
                        <Field label="Name" id="guarantorName" value={data.guarantorName} onChange={(value) => updateField("guarantorName", value)} />
                        <SelectField label="Relationship" id="guarantorRelation" value={data.guarantorRelation} options={RELATIONSHIP_OPTIONS} placeholder="Select relationship" onChange={(value) => updateField("guarantorRelation", value)} />
                        <Field label="Contact Number" id="guarantorContact" value={data.guarantorPhone} onChange={(value) => updateField("guarantorPhone", value)} />
                        <Field label="Alternative Mobile Number" id="guarantorAlternativePhone" value={data.guarantorAlternativePhone} onChange={(value) => updateField("guarantorAlternativePhone", value)} />
                        <Field label="Email ID" id="guarantorEmail" type="email" value={data.guarantorEmail} onChange={(value) => updateField("guarantorEmail", value)} />
                        <SelectField label="Profession" id="guarantorEmployment" value={data.guarantorEmployment} options={PROFESSION_OPTIONS} placeholder="Select Profession" onChange={(value) => updateField("guarantorEmployment", value)} />
                        <Field label="Organisation / Business Name" id="guarantorOrg" value={data.guarantorOrganisation} onChange={(value) => updateField("guarantorOrganisation", value)} />
                        <Field label="Place of Work / City" id="guarantorWorkplace" value={data.guarantorWorkplace} onChange={(value) => updateField("guarantorWorkplace", value)} />
                        <Field label="Work / Business Vintage" id="guarantorVintage" value={data.guarantorVintage} onChange={(value) => updateField("guarantorVintage", value)} placeholder="e.g. 5 years" />
                        <Field label="Monthly Income (₹)" id="guarantorMonthlyIncome" value={data.guarantorMonthlyIncome} onChange={(value) => updateField("guarantorMonthlyIncome", value)} />
                        <Field label="Annual Income (₹)" id="guarantorAnnualIncome" value={data.guarantorAnnualIncome} onChange={(value) => updateField("guarantorAnnualIncome", value)} />
                        <Field label="Existing Loan Obligations (₹/month)" id="guarantorObligations" value={data.guarantorObligations} onChange={(value) => updateField("guarantorObligations", value)} />
                    <div className="sm:col-span-2">
                      <Field label="Place of Work / City" id="guarantorAddress" value={data.guarantorAddress} onChange={(value) => updateField("guarantorAddress", value)} />
                    </div>
                        <div className="sm:col-span-2">
                          <TextareaField label="Current Address" id="guarantorCurrentAddress" value={data.guarantorCurrentAddress} onChange={(value) => updateField("guarantorCurrentAddress", value)} />
                        </div>
                        <div className="sm:col-span-2">
                          <TextareaField label="Permanent Address" id="guarantorPermanentAddress" value={data.guarantorPermanentAddress} onChange={(value) => updateField("guarantorPermanentAddress", value)} />
                        </div>
                      </>
                    )}
                  </Section>
                </div>
              )}
            </div>
            <div className="flex justify-between border-t border-border px-6 py-4">
              {step === 1 ? (
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 size-4" /> Back
                </Button>
              )}
              {step === 1 ? (
                <Button type="button" onClick={() => setStep(2)}>
                  Next <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button type="button" onClick={submit}>
                  Submit Lead <CheckCircle2 className="ml-2 size-4" />
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-border pb-2 text-sm font-bold text-primary">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SelectField({
  label,
  id,
  value,
  options,
  placeholder,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function TextareaField({
  label,
  id,
  value,
  onChange,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
