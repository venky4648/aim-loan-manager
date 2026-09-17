import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In | Normiloans CRM" },
      { name: "description", content: "Sign in to the Normiloans education loan CRM to manage leads and cases." },
      { property: "og:title", content: "Sign In | Normiloans CRM" },
      { property: "og:description", content: "Direct access for sales, processing and management users." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const directLogin = (userEmail?: string, userName?: string) => {
    setBusy(true);
    const resolvedEmail = userEmail?.trim() || email.trim() || "admin@normiloans.com";
    const resolvedName = userName?.trim() || name.trim() || (mode === "signup" ? "Team Member" : "Admin User");

    localStorage.setItem(
      "crm_user",
      JSON.stringify({
        email: resolvedEmail,
        name: resolvedName,
        role: "admin",
        loggedInAt: new Date().toISOString(),
      })
    );

    toast.success(`Welcome to Normiloans, ${resolvedName}!`);
    setTimeout(() => {
      navigate({ to: "/dashboard", replace: true });
    }, 150);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    directLogin();
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
          <span className="inline-block rounded-full bg-primary/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary">
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
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm surface-card p-8 shadow-xl">
          <div className="mb-6 text-center lg:hidden">
            <NormiloansLogo variant="full-color" size="lg" showTagline={true} className="justify-center" />
          </div>

          <h1 className="text-2xl font-bold text-foreground">
            {mode === "signin" ? "Sign in to CRM" : "Create team account"}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {mode === "signin"
              ? "Access your leads, lender submissions, and payouts dashboard."
              : "Enter details to create an executive login."}
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
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
                placeholder="admin@normiloans.com"
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

          <p className="mt-6 text-center text-xs text-muted-foreground">
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
