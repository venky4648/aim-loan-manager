import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { useCases } from "@/lib/cases-context";
import { getStoredToken, publicRegisterStudentApi } from "@/lib/api-client";
import {
  DocumentUploadSection,
  type UploadedDocumentEntry,
} from "@/components/crm/DocumentUploadSection";

const STUDENT_DOCUMENT_CATEGORIES = [
  { title: "KYC Details", names: ["Aadhaar Card", "PAN Card", "Bank Passbook", "Passport"] },
  { title: "Academic Details", names: ["10th Class Certificate / Marks Memo", "Intermediate Certificate / Marks Memo", "Graduation Certificate / Marks Memo"] },
];
const PARENT_DOCUMENT_CATEGORIES = [
  { title: "Parent KYC Details", names: ["Aadhaar Card", "PAN Card", "Bank Passbook / Bank Details"] },
  { title: "Salary / Income Details", names: ["Salary Certificate", "Payslips", "Form 16", "Income Tax Returns (ITR)", "Bank Statements", "Business Registration Certificate"] },
];
const PROPERTY_DOCUMENT_CATEGORIES = [
  { title: "Property Ownership Details", names: ["Sale Deed", "Linked Documents"] },
  { title: "Income Tax Documents", names: ["Income Tax Documents"] },
];
const RELATIONSHIP_OPTIONS = ["Parent","Father","Mother","Spouse","Brother","Sister","Son","Daughter","Grandfather","Grandmother","Father-in-law","Mother-in-law","Brother-in-law","Sister-in-law","Guardian","Relative","Friend","Other"];
const PROFESSION_OPTIONS = ["Salaried","Self-Employed / Business","Agriculture"];

const EMPTY_DATA = {
  fullName: "",
  email: "",
  mobile: "",
  alternativePhone: "",
  planningCountry: "",
  studyCountry: "",
  university: "",
  loanRequirement: "",
  loanAmount: "",
  loanType: "" as "" | "Secured" | "Unsecured",
  tenthScore: "",
  tenthYear: "",
  twelfthScore: "",
  twelfthYear: "",
  degree: "",
  branch: "",
  college: "",
  graduationScore: "",
  graduationYear: "",
  greScore: "",
  gmatScore: "",
  satScore: "",
  ieltsScore: "",
  toeflScore: "",
  duolingoScore: "",
  workExperience: "",
  coApplicantName: "",
  coApplicantRelation: "",
  coApplicantPhone: "",
  coApplicantAlternativePhone: "",
  coApplicantEmail: "",
  coApplicantEmployment: "",
  coApplicantOrganisation: "",
  coApplicantWorkplace: "",
  coApplicantVintage: "",
  coApplicantIncome: "",
  coApplicantAnnualIncome: "",
  coApplicantObligations: "",
  coApplicantAddress: "",
  coApplicantCurrentAddress: "",
  coApplicantPermanentAddress: "",
  studentDocuments: [] as UploadedDocumentEntry[],
  parentDocuments: [] as UploadedDocumentEntry[],
  propertyDocuments: [] as UploadedDocumentEntry[],
  propertyType: "",
  propertyLocation: "",
  propertyMarketValue: "",
  propertyOwner: "",
  hasGuarantor: "No" as "Yes" | "No",
  guarantorName: "",
  guarantorRelation: "",
  guarantorPhone: "",
  guarantorAlternativePhone: "",
  guarantorEmail: "",
  guarantorEmployment: "",
  guarantorOrganisation: "",
  guarantorWorkplace: "",
  guarantorVintage: "",
  guarantorIncome: "",
  guarantorAnnualIncome: "",
  guarantorObligations: "",
  guarantorAddress: "",
  guarantorCurrentAddress: "",
  guarantorPermanentAddress: "",
};

type FormData = typeof EMPTY_DATA;

function numberValue(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : 0;
}

export function StudentRegistrationForm() {
  const navigate = useNavigate();
  const { addCase } = useCases();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<FormData>(EMPTY_DATA);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  const update = (field: keyof FormData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const submit = async () => {
    const payload = {
      student: formData.fullName || "Student Applicant",
      phone: formData.mobile,
      alternativePhone: formData.alternativePhone,
      email: formData.email,
      planningCountry: formData.planningCountry,
      country: formData.studyCountry,
      studyCountry: formData.studyCountry,
      university: formData.university,
      course: "",
      amount: numberValue(formData.loanAmount),
      loanRequirement: formData.loanRequirement,
      loanType: formData.loanType || "Unsecured",
      coApplicant: {
        name: formData.coApplicantName,
        relation: formData.coApplicantRelation || "Parent",
        contact: formData.coApplicantPhone,
        phone: formData.coApplicantPhone,
        alternativePhone: formData.coApplicantAlternativePhone,
        email: formData.coApplicantEmail,
        employment: formData.coApplicantEmployment || "Salaried",
        organisation: formData.coApplicantOrganisation,
        workplace: formData.coApplicantWorkplace,
        vintage: formData.coApplicantVintage,
        monthlyIncome: numberValue(formData.coApplicantIncome),
        annualIncome: numberValue(formData.coApplicantAnnualIncome),
        obligations: numberValue(formData.coApplicantObligations),
        city: formData.coApplicantAddress,
        currentAddress: formData.coApplicantCurrentAddress,
        permanentAddress: formData.coApplicantPermanentAddress,
      },
      academics: {
        tenth: formData.tenthScore,
        twelfth: formData.twelfthScore,
        graduation: [formData.degree, formData.branch, formData.college, formData.graduationScore, formData.graduationYear].filter(Boolean).join(" - "),
        tests: "",
        greScore: formData.greScore,
        gmatScore: formData.gmatScore,
        satScore: formData.satScore,
        ieltsScore: formData.ieltsScore,
        toeflScore: formData.toeflScore,
        duolingoScore: formData.duolingoScore,
        experience: formData.workExperience,
      },
      guarantor: formData.hasGuarantor === "Yes" ? {
        hasGuarantor: "Yes" as const,
        name: formData.guarantorName,
        relation: formData.guarantorRelation,
        contact: formData.guarantorPhone,
        phone: formData.guarantorPhone,
        alternativePhone: formData.guarantorAlternativePhone,
        email: formData.guarantorEmail,
        employment: formData.guarantorEmployment,
        organisation: formData.guarantorOrganisation,
        workplace: formData.guarantorWorkplace,
        vintage: formData.guarantorVintage,
        monthlyIncome: numberValue(formData.guarantorIncome),
        annualIncome: numberValue(formData.guarantorAnnualIncome),
        obligations: numberValue(formData.guarantorObligations),
        address: formData.guarantorAddress,
        currentAddress: formData.guarantorCurrentAddress,
        permanentAddress: formData.guarantorPermanentAddress,
      } : undefined,
      collateral: {
        hasCollateral: (formData.propertyType || formData.propertyLocation ? "Yes" : "No") as "Yes" | "No",
        type: formData.propertyType,
        location: formData.propertyLocation,
        marketValue: numberValue(formData.propertyMarketValue),
        owner: formData.propertyOwner,
      },
      studentDocuments: formData.studentDocuments,
      parentDocuments: formData.parentDocuments,
      propertyDocuments: formData.propertyDocuments,
    };

    if (getStoredToken()) {
      const created = addCase({
        ...payload,
        stage: "New Lead",
        interestStatus: "Not Contacted",
        contactStatus: "Not Contacted",
        handover: {
          isHandedOver: false,
        },
      });
      setCreatedCaseId(created.id);
      setSubmitted(true);
      toast.success("Student lead registered successfully.");
    } else {
      setSubmitting(true);
      try {
        const res = await publicRegisterStudentApi(payload);
        if (res.success) {
          setSubmitted(true);
          toast.success("Student registration submitted successfully!");
        } else {
          toast.error(res.error || "Failed to submit registration. Please verify details.");
        }
      } catch {
        toast.error("Unable to submit registration. Backend may be offline.");
      } finally {
        setSubmitting(false);
      }
    }
  };

  if (submitted) {
    return (
      <div className="surface-card p-8 text-center space-y-3">
        <CheckCircle2 className="mx-auto size-14 text-success" />
        <h2 className="mt-4 text-2xl font-bold">Student Lead Registered Successfully</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The lead has been added to your Sales pipeline. Contact the student to collect their documents, then handover the verified file to the Relationship Manager in Step 4.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {createdCaseId && (
            <Button
              onClick={() => navigate({ to: `/cases/${createdCaseId}` })}
              className="bg-primary hover:bg-primary/90 text-white font-bold gap-2"
            >
              Open Application File (Manage Case) <ArrowRight className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => {
              setFormData(EMPTY_DATA);
              setStep(1);
              setSubmitted(false);
              setCreatedCaseId(null);
            }}
          >
            Submit Another Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => { event.preventDefault(); submit(); }}
      className="surface-card space-y-6 p-6 shadow-xl sm:p-8"
    >
      <div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">Step {step} of 2</span>
        <h2 className="mt-2 text-xl font-bold">{step === 1 ? "Student Details" : "Supporting Application Details"}</h2>
        <p className="mt-1 text-sm text-muted-foreground">All fields are optional.</p>
        <Progress value={step * 50} className="mt-3 h-2" />
      </div>

      {step === 1 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Student Name" id="fullName" value={formData.fullName} onChange={(value) => update("fullName", value)} />
          <FormField label="Email" id="email" type="email" value={formData.email} onChange={(value) => update("email", value)} />
          <FormField label="Phone Number" id="mobile" value={formData.mobile} onChange={(value) => update("mobile", value)} />
          <FormField label="Alternative Number" id="alternativePhone" value={formData.alternativePhone} onChange={(value) => update("alternativePhone", value)} />
          <FormField label="Country of Planning" id="planningCountry" value={formData.planningCountry} onChange={(value) => update("planningCountry", value)} />
          <FormField label="Country to Study" id="studyCountry" value={formData.studyCountry} onChange={(value) => update("studyCountry", value)} />
          <FormField label="Target University" id="university" value={formData.university} onChange={(value) => update("university", value)} />
          <FormField label="Loan Requirement" id="loanRequirement" value={formData.loanRequirement} onChange={(value) => update("loanRequirement", value)} />
          <FormField label="Loan Amount" id="loanAmount" value={formData.loanAmount} onChange={(value) => update("loanAmount", value)} />
          <div className="space-y-1.5">
            <Label htmlFor="loanType" className="font-medium">Loan Type Preference</Label>
            <select
              id="loanType"
              value={formData.loanType}
              onChange={(event) => update("loanType", event.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">Select Loan Preference (Optional)</option>
              <option value="Unsecured">Unsecured (No Collateral)</option>
              <option value="Secured">Secured (With Property/FD Collateral)</option>
            </select>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <Section title="Academic Details">
            <FormField label="10th Score" id="tenthScore" value={formData.tenthScore} onChange={(value) => update("tenthScore", value)} />
            <FormField label="10th Passing Year" id="tenthYear" value={formData.tenthYear} onChange={(value) => update("tenthYear", value)} />
            <FormField label="12th Score" id="twelfthScore" value={formData.twelfthScore} onChange={(value) => update("twelfthScore", value)} />
            <FormField label="12th Passing Year" id="twelfthYear" value={formData.twelfthYear} onChange={(value) => update("twelfthYear", value)} />
            <FormField label="Degree / Course" id="degree" value={formData.degree} onChange={(value) => update("degree", value)} />
            <FormField label="Branch / Specialization" id="branch" value={formData.branch} onChange={(value) => update("branch", value)} />
            <FormField label="College / University" id="college" value={formData.college} onChange={(value) => update("college", value)} />
            <FormField label="Graduation Score" id="graduationScore" value={formData.graduationScore} onChange={(value) => update("graduationScore", value)} />
            <FormField label="Passing Year" id="graduationYear" value={formData.graduationYear} onChange={(value) => update("graduationYear", value)} />
            <FormField label="GRE" id="greScore" value={formData.greScore} onChange={(value) => update("greScore", value)} />
            <FormField label="GMAT" id="gmatScore" value={formData.gmatScore} onChange={(value) => update("gmatScore", value)} />
            <FormField label="SAT" id="satScore" value={formData.satScore} onChange={(value) => update("satScore", value)} />
            <FormField label="IELTS" id="ieltsScore" value={formData.ieltsScore} onChange={(value) => update("ieltsScore", value)} />
            <FormField label="TOEFL" id="toeflScore" value={formData.toeflScore} onChange={(value) => update("toeflScore", value)} />
            <FormField label="Duolingo" id="duolingoScore" value={formData.duolingoScore} onChange={(value) => update("duolingoScore", value)} />
            <FormField label="Work Experience" id="workExperience" value={formData.workExperience} onChange={(value) => update("workExperience", value)} />
          </Section>

          <Section title="Co-applicant Details">
            <FormField label="Co-applicant Full Name" id="coApplicantName" value={formData.coApplicantName} onChange={(value) => update("coApplicantName", value)} />
            <SelectField label="Relationship" id="coApplicantRelation" value={formData.coApplicantRelation} options={RELATIONSHIP_OPTIONS} placeholder="Select relationship" onChange={(value) => update("coApplicantRelation", value)} />
            <FormField label="Contact Number" id="coApplicantContact" value={formData.coApplicantPhone} onChange={(value) => update("coApplicantPhone", value)} />
            <FormField label="Alternative Mobile Number" id="coApplicantAlternativePhone" value={formData.coApplicantAlternativePhone} onChange={(value) => update("coApplicantAlternativePhone", value)} />
            <FormField label="Email ID" id="coApplicantEmail" type="email" value={formData.coApplicantEmail} onChange={(value) => update("coApplicantEmail", value)} />
            <SelectField label="Profession" id="coApplicantEmployment" value={formData.coApplicantEmployment} options={PROFESSION_OPTIONS} placeholder="Select Profession" onChange={(value) => update("coApplicantEmployment", value)} />
            <FormField label="Organisation / Business Name" id="coApplicantOrg" value={formData.coApplicantOrganisation} onChange={(value) => update("coApplicantOrganisation", value)} />
            <FormField label="Place of Work / City" id="coApplicantWorkplace" value={formData.coApplicantWorkplace} onChange={(value) => update("coApplicantWorkplace", value)} />
            <FormField label="Work / Business Vintage" id="coApplicantVintage" value={formData.coApplicantVintage} onChange={(value) => update("coApplicantVintage", value)} placeholder="e.g. 5 years" />
            <FormField label="Monthly Income (₹)" id="coApplicantMonthlyIncome" value={formData.coApplicantIncome} onChange={(value) => update("coApplicantIncome", value)} />
            <FormField label="Annual Income (₹)" id="coApplicantAnnualIncome" value={formData.coApplicantAnnualIncome} onChange={(value) => update("coApplicantAnnualIncome", value)} />
            <FormField label="Existing Loan Obligations (₹/month)" id="coApplicantObligations" value={formData.coApplicantObligations} onChange={(value) => update("coApplicantObligations", value)} />
            <div className="sm:col-span-2"><FormField label="Place of Work / City" id="coApplicantAddress" value={formData.coApplicantAddress} onChange={(value) => update("coApplicantAddress", value)} /></div>
            <TextareaField label="Current Address" id="coApplicantCurrentAddress" value={formData.coApplicantCurrentAddress} onChange={(value) => update("coApplicantCurrentAddress", value)} />
            <TextareaField label="Permanent Address" id="coApplicantPermanentAddress" value={formData.coApplicantPermanentAddress} onChange={(value) => update("coApplicantPermanentAddress", value)} />
          </Section>

          <DocumentUploadSection
            title="Student Documents"
            categories={STUDENT_DOCUMENT_CATEGORIES}
            documents={formData.studentDocuments}
            onChange={(documents) => setFormData((previous) => ({ ...previous, studentDocuments: documents }))}
          />
          <DocumentUploadSection
            title="Parent Documents"
            categories={PARENT_DOCUMENT_CATEGORIES}
            documents={formData.parentDocuments}
            onChange={(documents) => setFormData((previous) => ({ ...previous, parentDocuments: documents }))}
          />

          <Section title="Property Documents">
            <FormField label="Property Owner" id="propertyOwner" value={formData.propertyOwner} onChange={(value) => update("propertyOwner", value)} />
            <FormField label="Property Type" id="propertyType" value={formData.propertyType} onChange={(value) => update("propertyType", value)} />
            <FormField label="Property Location" id="propertyLocation" value={formData.propertyLocation} onChange={(value) => update("propertyLocation", value)} />
            <FormField label="Market Value" id="propertyMarketValue" value={formData.propertyMarketValue} onChange={(value) => update("propertyMarketValue", value)} />
            <div className="sm:col-span-2">
              <DocumentUploadSection
                title="Property Documents"
                categories={PROPERTY_DOCUMENT_CATEGORIES}
                documents={formData.propertyDocuments}
                onChange={(documents) => setFormData((previous) => ({ ...previous, propertyDocuments: documents }))}
              />
            </div>
          </Section>

          <Section title="Guarantor Details">
            <div className="sm:col-span-2 space-y-2">
              <Label>Would you like to provide guarantor details?</Label>
              <div className="flex gap-3">
                {(["Yes", "No"] as const).map((option) => (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm ${
                      formData.hasGuarantor === option
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border bg-background"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasGuarantor"
                      value={option}
                      checked={formData.hasGuarantor === option}
                      onChange={() => setFormData((previous) => ({ ...previous, hasGuarantor: option }))}
                      className="accent-primary"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
            {formData.hasGuarantor === "Yes" && (
              <>
                <FormField label="Guarantor Full Name" id="guarantorName" value={formData.guarantorName} onChange={(value) => update("guarantorName", value)} />
                <SelectField label="Relationship" id="guarantorRelation" value={formData.guarantorRelation} options={RELATIONSHIP_OPTIONS} placeholder="Select relationship" onChange={(value) => update("guarantorRelation", value)} />
                <FormField label="Contact Number" id="guarantorContact" value={formData.guarantorPhone} onChange={(value) => update("guarantorPhone", value)} />
                <FormField label="Alternative Mobile Number" id="guarantorAlternativePhone" value={formData.guarantorAlternativePhone} onChange={(value) => update("guarantorAlternativePhone", value)} />
                <FormField label="Email ID" id="guarantorEmail" type="email" value={formData.guarantorEmail} onChange={(value) => update("guarantorEmail", value)} />
                <SelectField label="Profession" id="guarantorEmployment" value={formData.guarantorEmployment} options={PROFESSION_OPTIONS} placeholder="Select Profession" onChange={(value) => update("guarantorEmployment", value)} />
                <FormField label="Organisation / Business Name" id="guarantorOrg" value={formData.guarantorOrganisation} onChange={(value) => update("guarantorOrganisation", value)} />
                <FormField label="Place of Work / City" id="guarantorWorkplace" value={formData.guarantorWorkplace} onChange={(value) => update("guarantorWorkplace", value)} />
                <FormField label="Work / Business Vintage" id="guarantorVintage" value={formData.guarantorVintage} onChange={(value) => update("guarantorVintage", value)} placeholder="e.g. 5 years" />
                <FormField label="Monthly Income (₹)" id="guarantorMonthlyIncome" value={formData.guarantorIncome} onChange={(value) => update("guarantorIncome", value)} />
                <FormField label="Annual Income (₹)" id="guarantorAnnualIncome" value={formData.guarantorAnnualIncome} onChange={(value) => update("guarantorAnnualIncome", value)} />
                <FormField label="Existing Loan Obligations (₹/month)" id="guarantorObligations" value={formData.guarantorObligations} onChange={(value) => update("guarantorObligations", value)} />
                <div className="sm:col-span-2"><FormField label="Place of Work / City" id="guarantorAddress" value={formData.guarantorAddress} onChange={(value) => update("guarantorAddress", value)} /></div>
                <TextareaField label="Current Address" id="guarantorCurrentAddress" value={formData.guarantorCurrentAddress} onChange={(value) => update("guarantorCurrentAddress", value)} />
                <TextareaField label="Permanent Address" id="guarantorPermanentAddress" value={formData.guarantorPermanentAddress} onChange={(value) => update("guarantorPermanentAddress", value)} />
              </>
            )}
          </Section>
        </div>
      )}

      <div className="flex justify-between border-t border-border pt-4">
        {step === 2 ? (
          <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft className="mr-2 size-4" />Back</Button>
        ) : (
          <span />
        )}
        {step === 1 ? (
          <Button type="button" onClick={() => setStep(2)}>Next<ArrowRight className="ml-2 size-4" /></Button>
        ) : (
          <Button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Application"}
            <CheckCircle2 className="ml-2 size-4" />
          </Button>
        )}
      </div>
    </form>
  );
}

function FormField({
  label,
  id,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
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
    <section className="space-y-4">
      <h3 className="border-b border-border pb-2 text-sm font-bold text-primary">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
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
    <div className="sm:col-span-2 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
