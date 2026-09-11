import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GraduationCap, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  const google = () => {
    directLogin("google.user@normiloans.com", "Google Account User");
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="size-5" />
          </span>
          <span className="font-display text-lg font-semibold">Normiloans</span>
        </Link>
        <div>
          <h2 className="font-display text-3xl font-semibold leading-tight">
            One pipeline from first call to college joining.
          </h2>
          <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
            No more notebooks, WhatsApp threads and spreadsheets. Every lead, document, sanction, disbursement and
            commission in a single place your team can trust.
          </p>
        </div>
        <p className="text-xs text-sidebar-foreground/50">Hyderabad, Telangana · Expanding to Tier 1 & Tier 2 India</p>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">{mode === "signin" ? "Sign in" : "Create your account"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Enter anything to jump directly into the workspace."
              : "Enter any name to continue."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin@normiloans.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Any password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
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

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" className="w-full" onClick={google} disabled={busy}>
            Continue with Google
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "Need an account?" : "Already have access?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
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
