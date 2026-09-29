import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowRight, ShieldCheck, Headphones, FileText, Eye, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/permissions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In | Normiloans CRM" },
      { name: "description", content: "Sign in to the Normiloans education loan CRM to manage leads and cases." },
    ],
  }),
  component: AuthPage,
});

export function AuthPage() {
  const navigate = useNavigate();
  const { setRole } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("venkatesh.k@normiloans.com");
  const [password, setPassword] = useState("normi@2026");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // Default form login resolves to admin or matching email
    if (email.includes("praveen")) {
      performLogin("sales", email, "Praveen K");
    } else if (email.includes("nikhil")) {
      performLogin("processing", email, "Nikhil V");
    } else if (email.includes("swathi")) {
      performLogin("viewer", email, "Swathi Sharma");
    } else {
      performLogin("admin", email || "venkatesh.k@normiloans.com", name || "Venkatesh Kota");
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

      {/* Right Login Form Side */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md surface-card p-8 shadow-xl">
          <div className="mb-6 text-center lg:hidden">
            <NormiloansLogo variant="full-color" size="lg" showTagline={true} className="justify-center" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Sign in to CRM" : "Create team account"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Enter your credentials or choose a quick role test login below.
          </p>

          {/* Quick One-Click Demo Role Accounts */}
          <div className="mt-5 rounded-xl border border-border bg-muted/40 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <KeyRound className="size-3.5 text-primary" /> One-Click Role Logins (Demo Passwords)
            </p>

            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEmail("venkatesh.k@normiloans.com");
                  setPassword("admin@2026");
                  performLogin("admin", "venkatesh.k@normiloans.com", "Venkatesh Kota");
                }}
                className="flex items-center gap-2 rounded-lg border border-primary/20 bg-card p-2 text-left text-xs transition-all hover:bg-primary/10 hover:border-primary"
              >
                <ShieldCheck className="size-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">Admin / Owner</p>
                  <p className="text-[10px] text-muted-foreground">Pass: admin@2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("praveen.k@normiloans.com");
                  setPassword("sales@2026");
                  performLogin("sales", "praveen.k@normiloans.com", "Praveen K");
                }}
                className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-card p-2 text-left text-xs transition-all hover:bg-blue-500/10 hover:border-blue-500"
              >
                <Headphones className="size-4 shrink-0 text-blue-500" />
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">Sales / Telecaller</p>
                  <p className="text-[10px] text-muted-foreground">Pass: sales@2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("nikhil.v@normiloans.com");
                  setPassword("proc@2026");
                  performLogin("processing", "nikhil.v@normiloans.com", "Nikhil V");
                }}
                className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-card p-2 text-left text-xs transition-all hover:bg-emerald-500/10 hover:border-emerald-500"
              >
                <FileText className="size-4 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">Processing Exec</p>
                  <p className="text-[10px] text-muted-foreground">Pass: proc@2026</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmail("swathi.s@auditors.com");
                  setPassword("viewer@2026");
                  performLogin("viewer", "swathi.s@auditors.com", "Swathi Sharma");
                }}
                className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-card p-2 text-left text-xs transition-all hover:bg-amber-500/10 hover:border-amber-500"
              >
                <Eye className="size-4 shrink-0 text-amber-500" />
                <div className="min-w-0">
                  <p className="font-bold text-foreground truncate">Viewer (Auditor)</p>
                  <p className="text-[10px] text-muted-foreground">Pass: viewer@2026</p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Praveen Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="text"
                placeholder="venkatesh.k@normiloans.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full font-semibold shadow-lg shadow-primary/20" disabled={busy}>
              {busy ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  {mode === "signin" ? "Sign in to Dashboard" : "Create Account & Enter"}
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signin" ? "Need an account?" : "Already have access?"}{" "}
            <button
              type="button"
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
