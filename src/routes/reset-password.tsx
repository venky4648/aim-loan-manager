import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Loader2, ArrowRight, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";
import { resetPasswordWithToken, verifyResetToken } from "@/lib/api-client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password | Normiloans CRM" },
      { name: "description", content: "Reset your Normiloans CRM account password." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token as string) || "",
      email: (search.email as string) || "",
    };
  },
  component: ResetPasswordPage,
});

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token, email } = Route.useSearch();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [validatingToken, setValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function checkToken() {
      if (!token || !email) {
        setTokenError("Missing password reset token or email address in link.");
        setValidatingToken(false);
        return;
      }

      const res = await verifyResetToken(token, email);
      if (res.success && res.valid) {
        setTokenValid(true);
      } else {
        setTokenError(res.error || "Password reset link is invalid, expired, or has already been used.");
      }
      setValidatingToken(false);
    }

    checkToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match. Please verify.");
      return;
    }

    setSubmitting(true);

    const res = await resetPasswordWithToken(token, email, password);

    if (res.success) {
      setIsSuccess(true);
      toast.success("Password updated successfully! Redirecting to login...");
      setTimeout(() => {
        navigate({ to: "/auth", replace: true });
      }, 2500);
    } else {
      setSubmitting(false);
      toast.error(res.error || "Failed to reset password.");
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-background">
      {/* Left Side Branding */}
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex relative overflow-hidden">
        <div className="absolute -right-20 -top-20 size-80 rounded-full bg-primary/10 blur-3xl" />

        <Link to="/" className="flex items-center">
          <NormiloansLogo variant="dark" size="xl" showTagline={true} />
        </Link>

        <div className="relative z-10 my-auto py-12">
          <span className="inline-block rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary border border-primary/30">
            Password Security
          </span>
          <h2 className="mt-4 font-display text-4xl font-bold leading-tight text-white">
            Choose a new secure password.
          </h2>
          <p className="mt-4 max-w-md text-base text-sidebar-foreground/80 leading-relaxed">
            Update your account password to restore access to your Normiloans CRM dashboard.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-sidebar-foreground/60 border-t border-sidebar-border pt-4">
          <p>Normiloans · Hyderabad, Telangana</p>
          <p>Secure Password Reset</p>
        </div>
      </div>

      {/* Right Side Reset Password Form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md surface-card p-8 shadow-xl">
          <div className="mb-6 text-center lg:hidden">
            <NormiloansLogo variant="full-color" size="lg" showTagline={true} className="justify-center" />
          </div>

          {validatingToken ? (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="mx-auto size-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-muted-foreground">Verifying reset token...</p>
            </div>
          ) : !tokenValid ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                <AlertTriangle className="size-7" />
              </div>
              <h1 className="text-xl font-bold text-foreground">Reset Link Invalid</h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {tokenError}
              </p>
              <div className="pt-4">
                <Button asChild variant="outline" size="sm" className="rounded-full">
                  <Link to="/auth">Return to Sign In</Link>
                </Button>
              </div>
            </div>
          ) : isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 animate-in zoom-in-50">
                <CheckCircle2 className="size-9" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Password Reset Successful</h1>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
                Your password has been updated successfully. You can now log in using your new password.
              </p>
              <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                Redirecting to Sign In page in a moment...
              </div>
              <div className="pt-4">
                <Button asChild className="w-full font-semibold shadow-md shadow-primary/20">
                  <Link to="/auth">
                    Back to Login <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-1 mb-6">
                <h1 className="text-2xl font-bold text-foreground">Reset Your Password</h1>
                <p className="text-xs text-muted-foreground">
                  Choose a new password for <span className="font-semibold text-foreground">{email}</span>.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">Set Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={submitting}>
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldCheck className="size-4" /> Reset Password
                    </span>
                  )}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
