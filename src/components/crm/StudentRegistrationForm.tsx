import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, UserCheck } from "lucide-react";
import { toast } from "sonner";

export interface StudentRegistrationFormData {
  fullName: string;
  mobile: string;
  email: string;
  country: string;
  university: string;
  course: string;
}

export type FormErrors = Partial<Record<keyof StudentRegistrationFormData, string>>;

const INITIAL_DATA: StudentRegistrationFormData = {
  fullName: "",
  mobile: "",
  email: "",
  country: "",
  university: "",
  course: "",
};

export function StudentRegistrationForm() {
  const [formData, setFormData] = useState<StudentRegistrationFormData>(INITIAL_DATA);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const updateField = (field: keyof StudentRegistrationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: FormErrors = {};

    // Section 1 Validation
    if (!formData.fullName.trim()) {
      errs.fullName = "Full name is required";
    }

    if (!formData.mobile.trim()) {
      errs.mobile = "Mobile number is required";
    } else if (!/^[0-9+\-\s]{8,15}$/.test(formData.mobile.trim())) {
      errs.mobile = "Enter a valid mobile number";
    }

    if (!formData.email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = "Enter a valid email address";
    }

    // Section 2 Validation
    if (!formData.country) {
      errs.country = "Please select target country";
    }

    if (!formData.university.trim()) {
      errs.university = "College / University name is required";
    }

    if (!formData.course) {
      errs.course = "Please select target course";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsSubmitted(true);
      toast.success("Registration details submitted successfully.");
    } else {
      toast.error("Please fill in all required fields correctly.");
    }
  };

  const handleReset = () => {
    setFormData(INITIAL_DATA);
    setErrors({});
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="surface-card p-8 sm:p-10 text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
          <CheckCircle2 className="size-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Registration details submitted successfully.
          </h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
            Thank you, <span className="font-semibold text-foreground">{formData.fullName}</span>! Your education loan registration request has been submitted.
          </p>
        </div>

        <div className="pt-2">
          <Button onClick={handleReset} variant="outline" size="sm" className="font-semibold">
            Submit Another Registration
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="surface-card p-6 sm:p-8 space-y-8 shadow-xl">
      <div className="border-b border-border pb-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
          <UserCheck className="size-4" />
          <span>Student Loan Registration</span>
        </div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Start Your Loan Application
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
          Enter your contact details and target study information below.
        </p>
      </div>

      {/* SECTION 1 — BASIC REGISTRATION */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2">
          Section 1 — Basic Registration
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="fullName" className="font-medium">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="e.g. Sai Charan Reddy"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className={errors.fullName ? "border-destructive focus-visible:ring-destructive" : ""}
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
              value={formData.mobile}
              onChange={(e) => updateField("mobile", e.target.value)}
              className={errors.mobile ? "border-destructive focus-visible:ring-destructive" : ""}
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
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
          </div>
        </div>
      </div>

      {/* SECTION 2 — STUDENT & STUDY DETAILS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60 pb-2">
          Section 2 — Student & Study Details
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="country" className="font-medium">
              Target Country <span className="text-destructive">*</span>
            </Label>
            <select
              id="country"
              value={formData.country}
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
              value={formData.course}
              onChange={(e) => updateField("course", e.target.value)}
              className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring ${
                errors.course ? "border-destructive" : ""
              }`}
            >
              <option value="">Select Course Type</option>
              <option value="MS">MS</option>
              <option value="MBA">MBA</option>
              <option value="UG">UG</option>
              <option value="Medicine">Medicine</option>
              <option value="Other">Other</option>
            </select>
            {errors.course && <p className="text-xs text-destructive">{errors.course}</p>}
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="university" className="font-medium">
              College / University Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="university"
              placeholder="e.g. Arizona State University / University of Manchester"
              value={formData.university}
              onChange={(e) => updateField("university", e.target.value)}
              className={errors.university ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {errors.university && <p className="text-xs text-destructive">{errors.university}</p>}
          </div>
        </div>
      </div>

      {/* Submit Action */}
      <div className="pt-4 border-t border-border">
        <Button
          type="submit"
          size="lg"
          className="w-full font-bold shadow-lg shadow-primary/20 text-base"
        >
          Submit Registration
        </Button>
      </div>
    </form>
  );
}
