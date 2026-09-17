import { createFileRoute, Link } from "@tanstack/react-router";
import { GraduationCap, LineChart, FileCheck2, Landmark, Wallet, ArrowRight, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Normiloans CRM — Education Loan Lead to Disbursement" },
      {
        name: "description",
        content:
          "Normiloans CRM manages every education loan case from lead capture to lender sanction, disbursement and commission payout.",
      },
      { property: "og:title", content: "Normiloans CRM — Education Loan Lead to Disbursement" },
      {
        property: "og:description",
        content: "One platform for students, channel partners and lender partners across India.",
      },
      { property: "og:image", content: "/normiloans-logo.png" },
      { property: "og:image:secure_url", content: "/normiloans-logo.png" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:image", content: "/normiloans-logo.png" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: GraduationCap, title: "Lead capture & assignment", body: "Tele-calling, website, partner and walk-in leads with owner, source and follow-up history." },
  { icon: FileCheck2, title: "Student & document file", body: "Applicant, co-applicant, guarantor, collateral and a document checklist ready for lender submission." },
  { icon: Landmark, title: "Lender submission tracking", body: "Login, query, sanction, rejection and re-submission across your bank and NBFC panel." },
  { icon: Wallet, title: "Disbursement & commission", body: "Tranche-wise disbursement, college joining confirmation and payout reconciliation per case." },
  { icon: LineChart, title: "Owner dashboard", body: "Pipeline, sanctioned and disbursed value, conversion funnel and lender scorecards." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-6 md:px-12 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-20">
        <Link to="/" className="flex items-center">
          <NormiloansLogo variant="full-color" size="lg" showTagline={true} />
        </Link>
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="font-semibold border-primary text-primary hover:bg-primary/10"
          >
            <Link to="/student-registration">
              <UserPlus className="mr-1.5 size-4" /> Student Registration
            </Link>
          </Button>
          <Button asChild size="sm" className="font-semibold shadow-md shadow-primary/20">
            <Link to="/auth">Sign in to CRM</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24">
        <span className="inline-flex rounded-full bg-primary/10 border border-primary/20 px-3.5 py-1 text-xs font-bold text-primary">
          Education Lending Aggregator Platform · B2C + B2B
        </span>
        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground md:text-6xl">
          Lead to disbursement, without spreadsheets.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">
          A purpose-built CRM for the Normiloans pipeline — student cases, lender submissions, sanctions,
          disbursements and commissions in one place for your sales, processing and management teams.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            asChild
            size="lg"
            className="font-semibold shadow-lg shadow-primary/20"
          >
            <Link to="/student-registration">
              Start Your Loan Application <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/auth">Open Workspace</Link>
          </Button>
        </div>
      </section>

      {/* 6 Cards Grid (5 Feature Cards + 1 Navy Blue Card) */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <article key={f.title} className="surface-card p-6 transition-all hover:shadow-md">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-base font-bold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </article>
          ))}
          {/* 6th Card with Navy Blue background (#001A33 / #0F2237) */}
          <article className="surface-card flex flex-col justify-between bg-[#0F2237] border-[#1E3A5F] p-6 text-white transition-all hover:shadow-md">
            <div>
              <span className="inline-flex rounded-full bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-bold text-primary">
                Hyderabad Base
              </span>
              <h3 className="mt-4 font-display text-xl font-bold text-white">Built for Hyderabad. Ready for Tier 1 & 2.</h3>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Role-based access for owners, sales, tele-callers, processing and viewers as you expand across markets.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 text-center text-xs text-muted-foreground">
        <p>© 2026 Normiloans. Education Loan Lead-to-Disbursement CRM.</p>
      </footer>
    </div>
  );
}
