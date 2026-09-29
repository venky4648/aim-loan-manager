import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { UserPlus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Features", to: "/features" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Pricing", to: "/pricing" },
  { label: "About Us", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export function PublicHeader() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 md:px-12 bg-white/95 backdrop-blur-md border-b border-[#DDE5F0] shadow-sm">
      <Link to="/" className="flex items-center">
        <NormiloansLogo variant="full-color" size="lg" showTagline={true} />
      </Link>

      {/* Navigation Menu */}
      <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#64748B]">
        {NAV_LINKS.map((link) => {
          const isActive = currentPath === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`transition-colors hover:text-[#F26500] ${
                isActive ? "text-[#F26500] font-semibold underline underline-offset-8" : ""
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full border-[#F26500]/50 text-[#F26500] font-semibold px-4 hover:bg-[#F26500]/10"
        >
          <Link to="/student-registration">
            <UserPlus className="mr-1.5 size-4" /> Student Registration
          </Link>
        </Button>

        <Button
          asChild
          size="sm"
          className="rounded-full bg-[#F26500] font-semibold px-5 shadow-md shadow-[#F26500]/25 hover:bg-[#F26500]/90 text-white"
        >
          <Link to="/auth">
            <ArrowRight className="mr-1.5 size-4" /> Sign in to CRM
          </Link>
        </Button>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-[#DDE5F0] bg-white pt-12 pb-8 text-xs text-[#64748B]">
      <div className="mx-auto max-w-7xl px-6 md:px-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-10 border-b border-[#DDE5F0]">
        
        {/* Column 1: Brand & Positioning */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center">
            <NormiloansLogo variant="full-color" size="md" showTagline={true} />
          </Link>
          <p className="text-xs text-[#64748B] leading-relaxed">
            New-age education lending aggregator building a digital platform for customer service and channel partners across India.
          </p>
          <p className="text-[11px] font-semibold text-[#0F2237]">
            Headquarters: Hyderabad, Telangana · Tier 1 & Tier 2 Expansion
          </p>
        </div>

        {/* Column 2: Company Navigation */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F2237]">Company</p>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-[#F26500] transition-colors">About Us</Link></li>
            <li><Link to="/how-it-works" className="hover:text-[#F26500] transition-colors">How It Works</Link></li>
            <li><Link to="/features" className="hover:text-[#F26500] transition-colors">Features & Workflow</Link></li>
            <li><Link to="/contact" className="hover:text-[#F26500] transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Column 3: Platform Access */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F2237]">Platform</p>
          <ul className="space-y-2">
            <li><Link to="/student-registration" className="hover:text-[#F26500] transition-colors">Student Loan Application</Link></li>
            <li><Link to="/auth" className="hover:text-[#F26500] transition-colors">Sign in to CRM Workspace</Link></li>
            <li><Link to="/pricing" className="hover:text-[#F26500] transition-colors">Partner Engagement</Link></li>
          </ul>
        </div>

        {/* Column 4: Business Model */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-[#0F2237]">B2B & B2C Ecosystem</p>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Connecting Students ↕ Normiloans ↕ Banks / NBFCs ↕ Channel Partners in one connected workflow.
          </p>
        </div>

      </div>

      <div className="mx-auto max-w-7xl px-6 md:px-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p>© 2026 Normiloans. Education Loan Lead-to-Disbursement Platform.</p>
        <p className="font-semibold text-[#0F2237]">Normiloans — Fuel Your Ambitions</p>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F2237] font-sans flex flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
