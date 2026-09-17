import { useState, type ChangeEvent } from "react";
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
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  UploadCloud,
  X,
  FileCheck,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export interface StudentRegistrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Data Types
export interface RegistrationFormData {
  // Step 1: Basic
  fullName: string;
  mobile: string;
  email: string;

  // Step 2: Study Details
  country: string;
  university: string;
  course: string;

  // Step 3: Academic Background
  tenthScore: string;
  tenthYear: string;
  twelfthScore: string;
  twelfthYear: string;
  gradDegree: string;
  gradBranch: string;
  gradCollege: string;
  gradScore: string;
  gradYear: string;

  // Step 4: Standard Tests (Optional)
  greScore: string;
  gmatScore: string;
  satScore: string;
  ieltsScore: string;
  toeflScore: string;
  duolingoScore: string;

  // Step 5: Work Experience
  isExperienced: "Fresher" | "Experienced";
  workExperienceYears: string;

  // Step 6: Loan Requirement
  loanAmount: string;
  loanType: "Secured" | "Unsecured" | "";

  // Step 7: Primary Co-applicant
  coApplicantName: string;
  coApplicantContact: string;
  coApplicantEmail: string;
  coApplicantEmployment: "Salaried" | "Self-employed" | "";
  coApplicantOrg: string;
  coApplicantWorkplace: string;
  coApplicantVintage: string;
  coApplicantMonthlyIncome: string;
  coApplicantAnnualIncome: string;
  coApplicantObligations: string;
  coApplicantCurrentAddress: string;
  coApplicantPermanentAddress: string;

  // Step 8: Additional Co-applicant / Guarantor (Optional)
  hasGuarantor: "Yes" | "No";
  guarantorName: string;
  guarantorContact: string;
  guarantorEmail: string;
  guarantorEmployment: "Salaried" | "Self-employed" | "";
  guarantorOrg: string;
  guarantorWorkplace: string;
  guarantorVintage: string;
  guarantorMonthlyIncome: string;
  guarantorAnnualIncome: string;
  guarantorObligations: string;
  guarantorCurrentAddress: string;
  guarantorPermanentAddress: string;

  // Step 9: Security / Collateral (Optional)
  hasCollateral: "Yes" | "No";
  propertyType: "House" | "Building" | "Flat" | "Open Land" | "Other" | "";
  propertyLocation: string;
  propertyMarketValue: string;
  propertyOwner: string;
  cashCollateralDetails: string;

  // Step 10: Documents (Frontend state)
  documents: {
    idProof?: string;
    addressProof?: string;
    academicDocs?: string;
    admissionLetter?: string;
    incomeProof?: string;
  };
}

export type FormErrors = Partial<Record<keyof RegistrationFormData, string>>;

const INITIAL_FORM_DATA: RegistrationFormData = {
  fullName: "",
  mobile: "",
  email: "",
  country: "",
  university: "",
  course: "",
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
  isExperienced: "Fresher",
  workExperienceYears: "",
  loanAmount: "",
  loanType: "",
  coApplicantName: "",
  coApplicantContact: "",
  coApplicantEmail: "",
  coApplicantEmployment: "",
  coApplicantOrg: "",
  coApplicantWorkplace: "",
  coApplicantVintage: "",
  coApplicantMonthlyIncome: "",
  coApplicantAnnualIncome: "",
  coApplicantObligations: "",
  coApplicantCurrentAddress: "",
  coApplicantPermanentAddress: "",
  hasGuarantor: "No",
  guarantorName: "",
  guarantorContact: "",
  guarantorEmail: "",
  guarantorEmployment: "",
  guarantorOrg: "",
  guarantorWorkplace: "",
  guarantorVintage: "",
  guarantorMonthlyIncome: "",
  guarantorAnnualIncome: "",
  guarantorObligations: "",
  guarantorCurrentAddress: "",
  guarantorPermanentAddress: "",
  hasCollateral: "No",
  propertyType: "",
  propertyLocation: "",
  propertyMarketValue: "",
  propertyOwner: "",
  cashCollateralDetails: "",
  documents: {},
};

const STEP_TITLES = [
  "Basic Registration",
  "Student & Study Details",
  "Academic Background",
  "Standard Test Scores",
  "Work Experience",
  "Loan Requirement",
  "Co-applicant Details",
  "Guarantor Details",
  "Security / Collateral",
  "Documents Upload",
  "Review Application",
  "Frontend Confirmation",
];

export function StudentRegistrationModal({
  open,
  onOpenChange,
}: StudentRegistrationModalProps) {
  const [step, setStep] = useState<number>(1);
  const [data, setData] = useState<RegistrationFormData>(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [, setIsCompleted] = useState<boolean>(false);

  const updateField = (field: keyof RegistrationFormData, value: any) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateDoc = (docType: keyof RegistrationFormData["documents"], fileName: string) => {
    setData((prev) => ({
      ...prev,
      documents: { ...prev.documents, [docType]: fileName },
    }));
  };

  const removeDoc = (docType: keyof RegistrationFormData["documents"]) => {
    setData((prev) => {
      const nextDocs = { ...prev.documents };
      delete nextDocs[docType];
      return { ...prev, documents: nextDocs };
    });
  };

  // Frontend Validation
  const validateCurrentStep = (): boolean => {
    const errs: FormErrors = {};

    if (step === 1) {
      if (!data.fullName.trim()) errs.fullName = "Full name is required";
      if (!data.mobile.trim()) errs.mobile = "Mobile number is required";
      else if (!/^[0-9+\-\s]{8,15}$/.test(data.mobile.trim()))
        errs.mobile = "Enter a valid mobile number";

      if (!data.email.trim()) errs.email = "Email address is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim()))
        errs.email = "Enter a valid email address";
    }

    if (step === 2) {
      if (!data.country) errs.country = "Please select target country";
      if (!data.course) errs.course = "Please select target course";
      if (!data.university.trim()) errs.university = "College / University name is required";
    }

    if (step === 3) {
      if (!data.tenthScore.trim()) errs.tenthScore = "10th score is required";
      if (!data.twelfthScore.trim()) errs.twelfthScore = "12th score is required";
      if (!data.gradDegree.trim()) errs.gradDegree = "Graduation degree is required";
    }

    if (step === 5 && data.isExperienced === "Experienced") {
      if (!data.workExperienceYears.trim())
        errs.workExperienceYears = "Specify years of work experience";
    }

    if (step === 7) {
      if (!data.coApplicantName.trim()) errs.coApplicantName = "Co-applicant name is required";
      if (!data.coApplicantContact.trim())
        errs.coApplicantContact = "Co-applicant contact number is required";
    }

    if (step === 8 && data.hasGuarantor === "Yes") {
      if (!data.guarantorName.trim()) errs.guarantorName = "Guarantor name is required";
      if (!data.guarantorContact.trim()) errs.guarantorContact = "Guarantor contact number is required";
    }

    if (step === 9 && data.hasCollateral === "Yes") {
      if (!data.propertyType) errs.propertyType = "Property type is required";
      if (!data.propertyLocation.trim()) errs.propertyLocation = "Property location is required";
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error("Please fill in the required fields highlighted in red.");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step === 11) {
        setIsCompleted(true);
        setStep(12);
        toast.success("Application details review completed!");
      } else {
        setStep((prev) => Math.min(prev + 1, 12));
      }
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const jumpToStep = (targetStep: number) => {
    setStep(targetStep);
  };

  const handleReset = () => {
    setData(INITIAL_FORM_DATA);
    setErrors({});
    setStep(1);
    setIsCompleted(false);
  };

  const progressPercent = Math.round((step / 12) * 100);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden border-border bg-card shadow-2xl rounded-2xl">
        {/* Header Bar */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                Step {step} of 12
              </span>
              <DialogTitle className="mt-1 text-xl font-bold tracking-tight text-foreground">
                {STEP_TITLES[step - 1]}
              </DialogTitle>
            </div>
            <DialogDescription className="hidden sm:block text-xs text-muted-foreground">
              Normiloans Lead-to-Disbursement Registration
            </DialogDescription>
          </div>
          {/* Progress Bar */}
          <div className="mt-3.5">
            <Progress value={progressPercent} className="h-2 rounded-full bg-muted" />
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* STEP 1: Basic Registration */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/80 leading-relaxed">
                Start your education loan application. Enter student basic contact details.
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="fullName" className="font-medium">
                    Student Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    placeholder="e.g. Sai Charan Reddy"
                    value={data.fullName}
                    onChange={(e) => updateField("fullName", e.target.value)}
                    className={errors.fullName ? "border-destructive" : ""}
                  />
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="font-medium">
                    Mobile Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="mobile"
                    placeholder="+91 98490 21188"
                    value={data.mobile}
                    onChange={(e) => updateField("mobile", e.target.value)}
                    className={errors.mobile ? "border-destructive" : ""}
                  />
                  {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="font-medium">
                    Email Address <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="student@example.com"
                    value={data.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Student & Study Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="country" className="font-medium">
                    Country Planning to Study <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="country"
                    value={data.country}
                    onChange={(e) => updateField("country", e.target.value)}
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.country ? "border-destructive" : ""
                    }`}
                  >
                    <option value="">Select Target Country</option>
                    <option value="UK">UK</option>
                    <option value="USA">USA</option>
                    <option value="Australia">Australia</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Ireland">Ireland</option>
                    <option value="India">India</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.country && <p className="text-xs text-destructive">{errors.country}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="course" className="font-medium">
                    Course Planning to Study <span className="text-destructive">*</span>
                  </Label>
                  <select
                    id="course"
                    value={data.course}
                    onChange={(e) => updateField("course", e.target.value)}
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${
                      errors.course ? "border-destructive" : ""
                    }`}
                  >
                    <option value="">Select Course Type</option>
                    <option value="MS Computer Science">MS (Master of Science)</option>
                    <option value="MBA">MBA (Master of Business Administration)</option>
                    <option value="UG / Bachelors">UG (Undergraduate / Bachelors)</option>
                    <option value="Medicine / MBBS">Medicine / MBBS</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="university" className="font-medium">
                    Target College / University <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="university"
                    placeholder="e.g. Arizona State University / University of Manchester"
                    value={data.university}
                    onChange={(e) => updateField("university", e.target.value)}
                    className={errors.university ? "border-destructive" : ""}
                  />
                  {errors.university && <p className="text-xs text-destructive">{errors.university}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Academic Background */}
          {step === 3 && (
            <div className="space-y-5">
              {/* 10th Standard */}
              <div className="surface-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  10th Standard Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="tenthScore" className="text-xs font-medium">
                      10th Score / CGPA / % <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="tenthScore"
                      placeholder="e.g. 9.4 CGPA or 88%"
                      value={data.tenthScore}
                      onChange={(e) => updateField("tenthScore", e.target.value)}
                      className={errors.tenthScore ? "border-destructive" : ""}
                    />
                    {errors.tenthScore && <p className="text-xs text-destructive">{errors.tenthScore}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="tenthYear" className="text-xs font-medium">Passing Year</Label>
                    <Input
                      id="tenthYear"
                      placeholder="e.g. 2018"
                      value={data.tenthYear}
                      onChange={(e) => updateField("tenthYear", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 12th Standard */}
              <div className="surface-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  12th Standard Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="twelfthScore" className="text-xs font-medium">
                      12th Score / % <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="twelfthScore"
                      placeholder="e.g. 91%"
                      value={data.twelfthScore}
                      onChange={(e) => updateField("twelfthScore", e.target.value)}
                      className={errors.twelfthScore ? "border-destructive" : ""}
                    />
                    {errors.twelfthScore && <p className="text-xs text-destructive">{errors.twelfthScore}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="twelfthYear" className="text-xs font-medium">Passing Year</Label>
                    <Input
                      id="twelfthYear"
                      placeholder="e.g. 2020"
                      value={data.twelfthYear}
                      onChange={(e) => updateField("twelfthYear", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Graduation Details */}
              <div className="surface-card p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
                  Graduation / Highest Degree Details
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="gradDegree" className="text-xs font-medium">
                      Degree / Course <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="gradDegree"
                      placeholder="e.g. B.Tech / B.Sc / B.Com / MBBS"
                      value={data.gradDegree}
                      onChange={(e) => updateField("gradDegree", e.target.value)}
                      className={errors.gradDegree ? "border-destructive" : ""}
                    />
                    {errors.gradDegree && <p className="text-xs text-destructive">{errors.gradDegree}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gradBranch" className="text-xs font-medium">Branch / Specialization</Label>
                    <Input
                      id="gradBranch"
                      placeholder="e.g. Computer Science / Finance"
                      value={data.gradBranch}
                      onChange={(e) => updateField("gradBranch", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label htmlFor="gradCollege" className="text-xs font-medium">College / University Name</Label>
                    <Input
                      id="gradCollege"
                      placeholder="e.g. JNTU Hyderabad / Osmania University"
                      value={data.gradCollege}
                      onChange={(e) => updateField("gradCollege", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gradScore" className="text-xs font-medium">Graduation Score / CGPA</Label>
                    <Input
                      id="gradScore"
                      placeholder="e.g. 8.2 CGPA"
                      value={data.gradScore}
                      onChange={(e) => updateField("gradScore", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gradYear" className="text-xs font-medium">Passing Year</Label>
                    <Input
                      id="gradYear"
                      placeholder="e.g. 2024"
                      value={data.gradYear}
                      onChange={(e) => updateField("gradYear", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Standard Test Scores */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                All test scores are optional. Enter only the tests applicable to your application.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="greScore" className="font-medium">GRE Score (Optional)</Label>
                  <Input
                    id="greScore"
                    placeholder="e.g. 318 / 340"
                    value={data.greScore}
                    onChange={(e) => updateField("greScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="gmatScore" className="font-medium">GMAT Score (Optional)</Label>
                  <Input
                    id="gmatScore"
                    placeholder="e.g. 680 / 800"
                    value={data.gmatScore}
                    onChange={(e) => updateField("gmatScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="satScore" className="font-medium">SAT Score (Optional)</Label>
                  <Input
                    id="satScore"
                    placeholder="e.g. 1420 / 1600"
                    value={data.satScore}
                    onChange={(e) => updateField("satScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="ieltsScore" className="font-medium">IELTS Band (Optional)</Label>
                  <Input
                    id="ieltsScore"
                    placeholder="e.g. 7.5 Band"
                    value={data.ieltsScore}
                    onChange={(e) => updateField("ieltsScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="toeflScore" className="font-medium">TOEFL iBT Score (Optional)</Label>
                  <Input
                    id="toeflScore"
                    placeholder="e.g. 104 / 120"
                    value={data.toeflScore}
                    onChange={(e) => updateField("toeflScore", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="duolingoScore" className="font-medium">Duolingo Score (Optional)</Label>
                  <Input
                    id="duolingoScore"
                    placeholder="e.g. 130 / 160"
                    value={data.duolingoScore}
                    onChange={(e) => updateField("duolingoScore", e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Work Experience */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">Work Experience Status</Label>
                <div className="flex gap-4">
                  <label
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      data.isExperienced === "Fresher"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceStatus"
                      value="Fresher"
                      checked={data.isExperienced === "Fresher"}
                      onChange={() => updateField("isExperienced", "Fresher")}
                      className="sr-only"
                    />
                    Fresher / No Work Experience
                  </label>
                  <label
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      data.isExperienced === "Experienced"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="experienceStatus"
                      value="Experienced"
                      checked={data.isExperienced === "Experienced"}
                      onChange={() => updateField("isExperienced", "Experienced")}
                      className="sr-only"
                    />
                    Experienced
                  </label>
                </div>
              </div>

              {data.isExperienced === "Experienced" && (
                <div className="space-y-1.5 animate-in fade-in duration-200">
                  <Label htmlFor="workExperienceYears" className="font-medium">
                    Number of Years of Work Experience <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="workExperienceYears"
                    placeholder="e.g. 2.5 Years"
                    value={data.workExperienceYears}
                    onChange={(e) => updateField("workExperienceYears", e.target.value)}
                    className={errors.workExperienceYears ? "border-destructive" : ""}
                  />
                  {errors.workExperienceYears && (
                    <p className="text-xs text-destructive">{errors.workExperienceYears}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Loan Requirement */}
          {step === 6 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Enter your estimated loan requirements. Fields are simple and flexible.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="loanAmount" className="font-medium">
                    Estimated Loan Requirement (₹ Amount)
                  </Label>
                  <Input
                    id="loanAmount"
                    placeholder="e.g. 40,00,000 (₹40 Lakhs)"
                    value={data.loanAmount}
                    onChange={(e) => updateField("loanAmount", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="loanType" className="font-medium">Loan Type Preference</Label>
                  <select
                    id="loanType"
                    value={data.loanType}
                    onChange={(e) => updateField("loanType", e.target.value as any)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select Loan Preference (Optional)</option>
                    <option value="Unsecured">Unsecured (No Collateral)</option>
                    <option value="Secured">Secured (With Property/FD Collateral)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Primary Co-applicant / Co-borrower */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="coApplicantName" className="font-medium">
                    Co-applicant Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="coApplicantName"
                    placeholder="e.g. Ramesh Reddy (Father)"
                    value={data.coApplicantName}
                    onChange={(e) => updateField("coApplicantName", e.target.value)}
                    className={errors.coApplicantName ? "border-destructive" : ""}
                  />
                  {errors.coApplicantName && (
                    <p className="text-xs text-destructive">{errors.coApplicantName}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantContact" className="font-medium">
                    Contact Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="coApplicantContact"
                    placeholder="+91 98480 12345"
                    value={data.coApplicantContact}
                    onChange={(e) => updateField("coApplicantContact", e.target.value)}
                    className={errors.coApplicantContact ? "border-destructive" : ""}
                  />
                  {errors.coApplicantContact && (
                    <p className="text-xs text-destructive">{errors.coApplicantContact}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantEmail" className="font-medium">Email ID</Label>
                  <Input
                    id="coApplicantEmail"
                    type="email"
                    placeholder="coapplicant@gmail.com"
                    value={data.coApplicantEmail}
                    onChange={(e) => updateField("coApplicantEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantEmployment" className="font-medium">Employment Type</Label>
                  <select
                    id="coApplicantEmployment"
                    value={data.coApplicantEmployment}
                    onChange={(e) => updateField("coApplicantEmployment", e.target.value as any)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select Employment</option>
                    <option value="Salaried">Salaried</option>
                    <option value="Self-employed">Self-employed / Business</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantOrg" className="font-medium">Organisation / Business Name</Label>
                  <Input
                    id="coApplicantOrg"
                    placeholder="e.g. BHEL Ramachandrapuram"
                    value={data.coApplicantOrg}
                    onChange={(e) => updateField("coApplicantOrg", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantWorkplace" className="font-medium">Place of Work / City</Label>
                  <Input
                    id="coApplicantWorkplace"
                    placeholder="e.g. Hyderabad, Telangana"
                    value={data.coApplicantWorkplace}
                    onChange={(e) => updateField("coApplicantWorkplace", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantVintage" className="font-medium">Work / Business Vintage</Label>
                  <Input
                    id="coApplicantVintage"
                    placeholder="e.g. 15 Years in Service"
                    value={data.coApplicantVintage}
                    onChange={(e) => updateField("coApplicantVintage", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantMonthlyIncome" className="font-medium">Monthly Income (₹)</Label>
                  <Input
                    id="coApplicantMonthlyIncome"
                    placeholder="e.g. ₹95,000"
                    value={data.coApplicantMonthlyIncome}
                    onChange={(e) => updateField("coApplicantMonthlyIncome", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="coApplicantAnnualIncome" className="font-medium">Annual Income (₹)</Label>
                  <Input
                    id="coApplicantAnnualIncome"
                    placeholder="e.g. ₹11,40,000"
                    value={data.coApplicantAnnualIncome}
                    onChange={(e) => updateField("coApplicantAnnualIncome", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="coApplicantObligations" className="font-medium">Existing Loan Obligations (₹/month)</Label>
                  <Input
                    id="coApplicantObligations"
                    placeholder="e.g. ₹15,000 EMI"
                    value={data.coApplicantObligations}
                    onChange={(e) => updateField("coApplicantObligations", e.target.value)}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="coApplicantCurrentAddress" className="font-medium">Current Address</Label>
                  <Textarea
                    id="coApplicantCurrentAddress"
                    placeholder="Current residential address"
                    value={data.coApplicantCurrentAddress}
                    onChange={(e) => updateField("coApplicantCurrentAddress", e.target.value)}
                    rows={2}
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="coApplicantPermanentAddress" className="font-medium">Permanent Address</Label>
                  <Textarea
                    id="coApplicantPermanentAddress"
                    placeholder="Permanent residential address"
                    value={data.coApplicantPermanentAddress}
                    onChange={(e) => updateField("coApplicantPermanentAddress", e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Additional Co-applicant / Guarantor */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">Do you have an additional co-applicant / guarantor?</Label>
                <div className="flex gap-4">
                  <label
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      data.hasGuarantor === "No"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasGuarantor"
                      value="No"
                      checked={data.hasGuarantor === "No"}
                      onChange={() => updateField("hasGuarantor", "No")}
                      className="sr-only"
                    />
                    No
                  </label>
                  <label
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      data.hasGuarantor === "Yes"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasGuarantor"
                      value="Yes"
                      checked={data.hasGuarantor === "Yes"}
                      onChange={() => updateField("hasGuarantor", "Yes")}
                      className="sr-only"
                    />
                    Yes
                  </label>
                </div>
              </div>

              {data.hasGuarantor === "Yes" && (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in duration-200">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="guarantorName" className="font-medium">
                      Guarantor Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="guarantorName"
                      placeholder="e.g. Suresh Kumar (Uncle / Guarantor)"
                      value={data.guarantorName}
                      onChange={(e) => updateField("guarantorName", e.target.value)}
                      className={errors.guarantorName ? "border-destructive" : ""}
                    />
                    {errors.guarantorName && (
                      <p className="text-xs text-destructive">{errors.guarantorName}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guarantorContact" className="font-medium">
                      Contact Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="guarantorContact"
                      placeholder="+91 98490 99999"
                      value={data.guarantorContact}
                      onChange={(e) => updateField("guarantorContact", e.target.value)}
                      className={errors.guarantorContact ? "border-destructive" : ""}
                    />
                    {errors.guarantorContact && (
                      <p className="text-xs text-destructive">{errors.guarantorContact}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guarantorEmail" className="font-medium">Email ID</Label>
                    <Input
                      id="guarantorEmail"
                      type="email"
                      placeholder="guarantor@gmail.com"
                      value={data.guarantorEmail}
                      onChange={(e) => updateField("guarantorEmail", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guarantorEmployment" className="font-medium">Employment Type</Label>
                    <select
                      id="guarantorEmployment"
                      value={data.guarantorEmployment}
                      onChange={(e) => updateField("guarantorEmployment", e.target.value as any)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      <option value="">Select Employment</option>
                      <option value="Salaried">Salaried</option>
                      <option value="Self-employed">Self-employed / Business</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guarantorOrg" className="font-medium">Organisation / Business Name</Label>
                    <Input
                      id="guarantorOrg"
                      placeholder="e.g. IT Park Business"
                      value={data.guarantorOrg}
                      onChange={(e) => updateField("guarantorOrg", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guarantorWorkplace" className="font-medium">Place of Work</Label>
                    <Input
                      id="guarantorWorkplace"
                      placeholder="e.g. Hyderabad"
                      value={data.guarantorWorkplace}
                      onChange={(e) => updateField("guarantorWorkplace", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="guarantorMonthlyIncome" className="font-medium">Monthly Income (₹)</Label>
                    <Input
                      id="guarantorMonthlyIncome"
                      placeholder="e.g. ₹80,000"
                      value={data.guarantorMonthlyIncome}
                      onChange={(e) => updateField("guarantorMonthlyIncome", e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 9: Security / Collateral */}
          {step === 9 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="font-medium">Do you have security / collateral?</Label>
                <div className="flex gap-4">
                  <label
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      data.hasCollateral === "No"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasCollateral"
                      value="No"
                      checked={data.hasCollateral === "No"}
                      onChange={() => updateField("hasCollateral", "No")}
                      className="sr-only"
                    />
                    No
                  </label>
                  <label
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl border p-4 cursor-pointer transition-all ${
                      data.hasCollateral === "Yes"
                        ? "border-primary bg-primary/10 font-bold text-primary"
                        : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasCollateral"
                      value="Yes"
                      checked={data.hasCollateral === "Yes"}
                      onChange={() => updateField("hasCollateral", "Yes")}
                      className="sr-only"
                    />
                    Yes
                  </label>
                </div>
              </div>

              {data.hasCollateral === "Yes" && (
                <div className="grid gap-4 sm:grid-cols-2 animate-in fade-in duration-200">
                  <div className="space-y-1.5">
                    <Label htmlFor="propertyType" className="font-medium">
                      Property Type <span className="text-destructive">*</span>
                    </Label>
                    <select
                      id="propertyType"
                      value={data.propertyType}
                      onChange={(e) => updateField("propertyType", e.target.value as any)}
                      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${
                        errors.propertyType ? "border-destructive" : ""
                      }`}
                    >
                      <option value="">Select Property Type</option>
                      <option value="House">House</option>
                      <option value="Building">Building</option>
                      <option value="Flat">Flat</option>
                      <option value="Open Land">Open Land / Plot</option>
                      <option value="Other">Other Property</option>
                    </select>
                    {errors.propertyType && (
                      <p className="text-xs text-destructive">{errors.propertyType}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="propertyLocation" className="font-medium">
                      Property Location <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="propertyLocation"
                      placeholder="e.g. Gachibowli, Hyderabad"
                      value={data.propertyLocation}
                      onChange={(e) => updateField("propertyLocation", e.target.value)}
                      className={errors.propertyLocation ? "border-destructive" : ""}
                    />
                    {errors.propertyLocation && (
                      <p className="text-xs text-destructive">{errors.propertyLocation}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="propertyMarketValue" className="font-medium">Current Market Value (₹)</Label>
                    <Input
                      id="propertyMarketValue"
                      placeholder="e.g. ₹65,00,000"
                      value={data.propertyMarketValue}
                      onChange={(e) => updateField("propertyMarketValue", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="propertyOwner" className="font-medium">Property Owner Details</Label>
                    <Input
                      id="propertyOwner"
                      placeholder="e.g. Jointly owned by Father"
                      value={data.propertyOwner}
                      onChange={(e) => updateField("propertyOwner", e.target.value)}
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="cashCollateralDetails" className="font-medium">
                      Cash Collateral / Fixed Deposit Details (If applicable)
                    </Label>
                    <Textarea
                      id="cashCollateralDetails"
                      placeholder="e.g. ₹5 Lakhs Fixed Deposit in SBI Bank"
                      value={data.cashCollateralDetails}
                      onChange={(e) => updateField("cashCollateralDetails", e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 10: Documents Upload (Frontend State UI) */}
          {step === 10 && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Upload your document copies digitally (maintained in frontend application state).
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: "idProof", label: "ID Proof (PAN / Aadhaar / Passport)" },
                  { key: "addressProof", label: "Address Proof (Electricity Bill / Passport)" },
                  { key: "academicDocs", label: "Academic Documents (10th, 12th, Degree)" },
                  { key: "admissionLetter", label: "Admission Letter / University Offer" },
                  { key: "incomeProof", label: "Co-applicant Income Proof (ITR / Pay Slip)" },
                ].map((doc) => {
                  const docKey = doc.key as keyof RegistrationFormData["documents"];
                  const uploadedName = data.documents[docKey];
                  return (
                    <div
                      key={doc.key}
                      className="surface-card p-4 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <p className="text-xs font-bold text-foreground">{doc.label}</p>
                        {uploadedName ? (
                          <p className="mt-1 text-xs text-success font-medium inline-flex items-center gap-1">
                            <FileCheck className="size-3.5" /> {uploadedName}
                          </p>
                        ) : (
                          <p className="mt-1 text-xs text-muted-foreground">PDF, JPG or PNG format</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold cursor-pointer hover:bg-accent hover:text-accent-foreground">
                          <UploadCloud className="size-3.5" />
                          {uploadedName ? "Replace File" : "Select File"}
                          <input
                            type="file"
                            className="sr-only"
                            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                updateDoc(docKey, file.name);
                                toast.success(`Selected ${file.name}`);
                              }
                            }}
                          />
                        </label>
                        {uploadedName ? (
                          <button
                            type="button"
                            onClick={() => removeDoc(docKey)}
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                            title="Remove file"
                          >
                            <X className="size-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 11: Review Application */}
          {step === 11 && (
            <div className="space-y-6">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs font-medium text-foreground leading-relaxed">
                Review all details before submitting. Click any "Edit" button to modify specific step info.
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* 1. Basic Registration */}
                <div className="surface-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">1. Basic Details</h4>
                    <button
                      onClick={() => jumpToStep(1)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{data.fullName || "—"}</p>
                  <p className="text-xs text-muted-foreground">Mobile: {data.mobile || "—"}</p>
                  <p className="text-xs text-muted-foreground">Email: {data.email || "—"}</p>
                </div>

                {/* 2. Study Details */}
                <div className="surface-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">2. Target Study Details</h4>
                    <button
                      onClick={() => jumpToStep(2)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{data.country || "—"} · {data.course || "—"}</p>
                  <p className="text-xs text-muted-foreground">{data.university || "—"}</p>
                </div>

                {/* 3. Academic Background */}
                <div className="surface-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">3. Academic Scores</h4>
                    <button
                      onClick={() => jumpToStep(3)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">10th: {data.tenthScore || "—"} ({data.tenthYear || "N/A"})</p>
                  <p className="text-xs text-muted-foreground">12th: {data.twelfthScore || "—"} ({data.twelfthYear || "N/A"})</p>
                  <p className="text-xs text-muted-foreground">Graduation: {data.gradDegree || "—"} - {data.gradScore || "—"}</p>
                </div>

                {/* 4. Test Scores */}
                <div className="surface-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">4. Test Scores</h4>
                    <button
                      onClick={() => jumpToStep(4)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">GRE: {data.greScore || "N/A"} · IELTS: {data.ieltsScore || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">GMAT: {data.gmatScore || "N/A"} · TOEFL: {data.toeflScore || "N/A"}</p>
                </div>

                {/* 5. Work Experience */}
                <div className="surface-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">5. Work Experience</h4>
                    <button
                      onClick={() => jumpToStep(5)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-foreground font-semibold">{data.isExperienced}</p>
                  {data.isExperienced === "Experienced" && (
                    <p className="text-xs text-muted-foreground">Vintage: {data.workExperienceYears}</p>
                  )}
                </div>

                {/* 6. Loan Requirement */}
                <div className="surface-card p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">6. Loan Requirement</h4>
                    <button
                      onClick={() => jumpToStep(6)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-foreground">Required Amount: {data.loanAmount || "Not specified"}</p>
                  <p className="text-xs text-muted-foreground">Preference: {data.loanType || "Flexible"}</p>
                </div>

                {/* 7. Co-applicant */}
                <div className="surface-card p-4 space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h4 className="text-xs font-bold uppercase text-primary">7. Primary Co-applicant</h4>
                    <button
                      onClick={() => jumpToStep(7)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    >
                      <Edit3 className="size-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{data.coApplicantName || "—"}</p>
                  <p className="text-xs text-muted-foreground">Contact: {data.coApplicantContact || "—"} · Email: {data.coApplicantEmail || "—"}</p>
                  <p className="text-xs text-muted-foreground">Employment: {data.coApplicantEmployment || "—"} ({data.coApplicantOrg || "—"})</p>
                  <p className="text-xs text-muted-foreground">Income: Monthly ₹{data.coApplicantMonthlyIncome || "—"}</p>
                </div>

                {/* 8. Additional Guarantor */}
                {data.hasGuarantor === "Yes" && (
                  <div className="surface-card p-4 space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-xs font-bold uppercase text-primary">8. Guarantor Details</h4>
                      <button
                        onClick={() => jumpToStep(8)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Edit3 className="size-3" /> Edit
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{data.guarantorName}</p>
                    <p className="text-xs text-muted-foreground">Contact: {data.guarantorContact}</p>
                  </div>
                )}

                {/* 9. Collateral */}
                {data.hasCollateral === "Yes" && (
                  <div className="surface-card p-4 space-y-2 sm:col-span-2">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h4 className="text-xs font-bold uppercase text-primary">9. Security / Collateral</h4>
                      <button
                        onClick={() => jumpToStep(9)}
                        className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                      >
                        <Edit3 className="size-3" /> Edit
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-foreground">{data.propertyType} in {data.propertyLocation}</p>
                    <p className="text-xs text-muted-foreground">Market Value: ₹{data.propertyMarketValue || "—"}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 12: Frontend Confirmation */}
          {step === 12 && (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                Your registration details have been completed successfully.
              </h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
                Thank you, <span className="font-semibold text-foreground">{data.fullName}</span>! Your loan application request has been received on the frontend workspace pipeline.
              </p>
              <div className="pt-4 flex flex-wrap justify-center gap-3">
                <Button onClick={handleReset} variant="outline" size="sm">
                  <RotateCcw className="mr-1.5 size-4" /> Start New Application
                </Button>
                <Button onClick={() => onOpenChange(false)} size="sm" className="font-semibold shadow-md shadow-primary/20">
                  Close & View Pipeline
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {step < 12 && (
          <div className="border-t border-border bg-card px-6 py-4 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              size="sm"
            >
              <ArrowLeft className="mr-1.5 size-4" /> Back
            </Button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground font-medium">
                {step === 11 ? "Final Step" : `Next: ${STEP_TITLES[step]}`}
              </span>
              <Button
                type="button"
                onClick={handleNext}
                size="sm"
                className="font-semibold shadow-md shadow-primary/20"
              >
                {step === 11 ? (
                  <span className="inline-flex items-center gap-1.5">
                    Submit Registration <CheckCircle2 className="size-4" />
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    Next Step <ArrowRight className="size-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
