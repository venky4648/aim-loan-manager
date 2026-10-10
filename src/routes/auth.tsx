import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowRight, CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/permissions";
import { loginUser, registerUser, requestPasswordReset } from "@/lib/api-client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In & Registration | Normiloans CRM" },
      { name: "description", content: "Sign in or register for the Normiloans education loan CRM." },
    ],
  }),
  component: AuthPage,
});

export function AuthPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("sales");

  const [busy, setBusy] = useState(false);
  const [registeredEmailSuccess, setRegisteredEmailSuccess] = useState<string | null>(null);
  const [forgotSuccessEmail, setForgotSuccessEmail] = useState<string | null>(null);

  const performLogin = (roleToSet: UserRole, userEmail: string, userName: string) => {
    setBusy(true);
    setRole(roleToSet);

    localStorage.setItem(
      "crm_user",
      JSON.stringify({
        email: userEmail,
        name: userName,
        role: roleToSet,
        loggedInAt: new Date().toISOString(),
      })
    );

    toast.success(`Signed in as ${userName} (${roleToSet.toUpperCase()} Mode)`);
    setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 200);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot") {
      if (!email || !email.trim()) {
        toast.error("Please enter your registered work email address.");
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid work email address format.");
        return;
      }

      setBusy(true);
      const res = await requestPasswordReset(email.trim());
      setBusy(false);

      if (res.success) {
        setForgotSuccessEmail(email.trim());
        toast.success("Password reset request submitted successfully.");
      } else {
        toast.error(res.error || "Failed to process password reset request.");
      }
      return;
    }

    if (mode === "signup") {
      if (!name || !name.trim()) {
        toast.error("Please enter your full name.");
        return;
      }

      if (!email || !email.trim()) {
        toast.error("Please enter a valid work email address.");
        return;
      }

      const emailRegex = /^\S+@\S+\.\S+$/;
      if (!emailRegex.test(email.trim())) {
        toast.error("Please enter a valid work email address format.");
        return;
      }

      setBusy(true);

      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        role: selectedRole,
      });

      setBusy(false);

      if (res.success) {
        setRegisteredEmailSuccess(res.email || email.trim());
        toast.success("Account registration initiated successfully!");
      } else {
        toast.error(res.error || "Registration failed. Please check your inputs.");
      }
    } else {
      // Sign In mode
      if (!email || !password) {
        toast.error("Please enter both work email and password.");
        return;
      }

      setBusy(true);

      const res = await loginUser({ email: email.trim(), password });

      if (res.success && res.user) {
        if (res.token) {
          localStorage.setItem("crm_token", res.token);
        }
        performLogin(res.user.role as UserRole, res.user.email, res.user.name);
      } else {
        // Check for quick role logins as fallback for demo accounts
        if (email.includes("praveen") && password === "sales@2026") {
          performLogin("sales", email, "Praveen K");
        } else if (email.includes("nikhil") && password === "proc@2026") {
          performLogin("processing", email, "Nikhil V");
        } else if (email.includes("swathi") && password === "viewer@2026") {
          performLogin("viewer", email, "Swathi Sharma");
        } else if (email.includes("venkatesh") && password === "admin@2026") {
          performLogin("admin", email, "Venkatesh Kota");
        } else {
          setBusy(false);
          toast.error(res.error || "Invalid credentials or pending registration.");
        }
      }
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left Branding Side */}
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-primary/10 blur-3xl" />

        <Link to="/" className="flex items-center">
          <NormiloansLogo variant="dark" size="xl" showTagline={true} />
        </Link>

        <div className="relative z-10 my-auto py-12">
          <span className="inline-block rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/30">
            Education Loan Aggregator CRM
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
            One pipeline from first lead to college joining.
          </h2>
          <p className="mt-4 max-w-md text-base text-sidebar-foreground/80 leading-relaxed">
            Eliminate manual spreadsheets and WhatsApp groups. Track student applications, bank logins, sanctions, disbursements, and commission payouts in one place.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-sidebar-foreground/60 border-t border-sidebar-border pt-4">
          <p>Normiloans · Hyderabad, Telangana</p>
          <p>Tier 1 & Tier 2 India Expansion</p>
        </div>
      </div>

      {/* Right Form Side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md surface-card p-8 shadow-xl">
          <div className="mb-6 text-center lg:hidden">
            <NormiloansLogo variant="full-color" size="lg" showTagline={true} className="justify-center" />
          </div>

          {registeredEmailSuccess ? (
            /* Success Tick Mark UI upon registration */
            <div className="py-6 text-center space-y-4 animate-in fade-in-50">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                <CheckCircle2 className="size-9" />
              </div>

              <h2 className="text-2xl font-bold text-foreground">Account registration initiated successfully</h2>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                An account activation link has been dispatched to:
              </p>

              <div className="mx-auto max-w-sm rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{registeredEmailSuccess}</span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed pt-2">
                Please check your email inbox and click <strong className="text-foreground">"Set Your Password"</strong> to activate your account.
              </p>

              <div className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full font-semibold"
                  onClick={() => {
                    setRegisteredEmailSuccess(null);
                    setMode("signin");
                  }}
                >
                  Return to Sign In
                </Button>
              </div>
            </div>
          ) : forgotSuccessEmail ? (
            /* Email Sent Success Screen for Forgot Password */
            <div className="py-6 text-center space-y-4 animate-in fade-in-50">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30">
                <CheckCircle2 className="size-9" />
              </div>

              <h2 className="text-2xl font-bold text-foreground">Check Your Email</h2>

              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                If an account exists for this email address, you will receive a password-reset link shortly.
              </p>

              <div className="mx-auto max-w-sm rounded-lg border border-primary/20 bg-primary/5 p-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{forgotSuccessEmail}</span>
              </div>

              <div className="pt-4">
                <Button
                  type="button"
                  className="w-full font-semibold"
                  onClick={() => {
                    setForgotSuccessEmail(null);
                    setMode("signin");
                  }}
                >
                  Back to Login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-foreground">
                {mode === "signin"
                  ? "Sign in to CRM"
                  : mode === "signup"
                  ? "Create team account"
                  : "Forgot Password?"}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {mode === "signin"
                  ? "Enter your credentials to access your workspace."
                  : mode === "signup"
                  ? "Fill in your details below to register your team account."
                  : "Enter your registered work email address and we'll send you a link to reset your password."}
              </p>

              <form onSubmit={submit} className="mt-5 space-y-4">
                {/* Full Name (Registration only) */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g. Praveen Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Work Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="venkatesh.k@normiloans.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {/* Role Selection Dropdown (Registration only) */}
                {mode === "signup" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="role">Assigned Role *</Label>
                    <select
                      id="role"
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="admin">Admin / Owner (Founder & Managing Director)</option>
                      <option value="sales">Sales Exec / Telecaller (Sales & Lead Gen)</option>
                      <option value="processing">Processing Officer (Credit & Operations)</option>
                      <option value="viewer">External Auditor / Viewer (Read-only)</option>
                    </select>
                  </div>
                )}

                {/* Password field & Forgot Password Link (Sign In only) */}
                {mode === "signin" && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password *</Label>
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={busy}>
                  {busy ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      {mode === "signin"
                        ? "Sign in to Dashboard"
                        : mode === "signup"
                        ? "Create Account"
                        : "Continue"}
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>

                {mode === "forgot" && (
                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode("signin")}
                      className="inline-flex items-center text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <ArrowLeft className="mr-1 size-3.5" /> Back to Login
                    </button>
                  </div>
                )}
              </form>

              {mode !== "forgot" && (
                <p className="mt-5 text-center text-xs text-muted-foreground">
                  {mode === "signin" ? "Need an account?" : "Already registered?"}{" "}
                  <button
                    type="button"
                    className="font-semibold text-primary hover:underline"
                    onClick={() => {
                      setMode(mode === "signin" ? "signup" : "signin");
                      setRegisteredEmailSuccess(null);
                      setForgotSuccessEmail(null);
                    }}
                  >
                    {mode === "signin" ? "Create one" : "Sign in"}
                  </button>
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
