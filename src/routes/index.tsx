import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  GraduationCap,
  LineChart,
  Landmark,
  Wallet,
  ArrowRight,
  UserPlus,
  ArrowUpRight,
  CheckCircle2,
  Check,
  Users,
  ShieldCheck,
  FileText,
  BadgeIndianRupee,
  Send,
  Building2,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Normiloans — Education Loan Lead to Disbursement Platform" },
      {
        name: "description",
        content:
          "Normiloans CRM manages every education loan case from lead capture to lender sanction, disbursement and college joining.",
      },
      { property: "og:title", content: "Normiloans — Education Loan Aggregator Platform" },
      {
        property: "og:description",
        content: "One connected platform for students, channel partners and lender partners across India.",
      },
      { property: "og:image", content: "/normiloans-logo.png" },
    ],
  }),
  component: SinglePageWebsite,
});

const NAV_ITEMS = [
  { label: "Home", id: "home" },
  { label: "About Us", id: "about" },
  { label: "Features", id: "features" },
  { label: "How It Works", id: "how-it-works" },
  { label: "Contact", id: "contact" },
];

const LIFECYCLE_STEPS = [
  { icon: Users, label: "Lead", sub: "Capture & Assign" },
  { icon: FileText, label: "Student Details", sub: "Profile & Academics" },
  { icon: Landmark, label: "Lender Matching", sub: "Eligibility & Fit" },
  { icon: ArrowRight, label: "Application", sub: "Submission" },
  { icon: ShieldCheck, label: "Verification", sub: "Docs & KYC" },
  { icon: LineChart, label: "Processing", sub: "Queries & Review" },
  { icon: CheckCircle2, label: "Sanction / Rejection", sub: "Offer & Terms" },
  { icon: BadgeIndianRupee, label: "Disbursement", sub: "Tranches Released" },
  { icon: GraduationCap, label: "College Joining", sub: "Confirmation" },
];

function SinglePageWebsite() {
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // IntersectionObserver to set active navigation tab based on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const handleIntersect: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleEnquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitted(true);
    toast.success("Thank you! Your enquiry has been sent to Normiloans.");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F2237] font-sans scroll-smooth">
      {/* 1. HEADER & SMOOTH SCROLL NAVBAR */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 md:px-12 bg-white/95 backdrop-blur-md border-b-2 border-[#CBD5E1] shadow-sm">
        <Link to="/" onClick={() => scrollToSection("home")} className="flex items-center">
          <NormiloansLogo variant="full-color" size="lg" showTagline={true} />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#0F2237]">
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition-all py-1 border-b-2 font-bold ${isActive
                    ? "text-[#F26500] border-[#F26500]"
                    : "text-[#0F2237] border-transparent hover:text-[#F26500]"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden lg:flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="rounded-full border-2 border-[#F26500] text-[#F26500] font-bold px-4.5 hover:bg-[#F26500] hover:text-white transition-colors shadow-xs"
          >
            <Link to="/student-registration">
              <UserPlus className="mr-1.5 size-4" /> Student Registration
            </Link>
          </Button>

          <Button
            asChild
            size="sm"
            className="rounded-full border-2 border-[#F26500] bg-[#F26500] font-bold px-5 shadow-md shadow-[#F26500]/25 hover:bg-[#E05B00] hover:border-[#E05B00] text-white transition-colors"
          >
            <Link to="/auth">
              <ArrowRight className="mr-1.5 size-4" /> Sign in to CRM
            </Link>
          </Button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 text-[#0F2237] hover:text-[#F26500]"
        >
          {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[73px] z-30 bg-white border-b-2 border-[#CBD5E1] p-6 space-y-4 shadow-xl">
          <div className="flex flex-col space-y-3 font-semibold text-sm">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-left py-2 px-3 rounded-lg ${activeSection === item.id ? "bg-[#F26500]/10 text-[#F26500]" : "text-[#0F2237]"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-3 border-t border-[#CBD5E1] flex flex-col gap-2">
            <Button asChild variant="outline" size="sm" className="w-full border-2 border-[#F26500] text-[#F26500] font-bold hover:bg-[#F26500] hover:text-white transition-colors">
              <Link to="/student-registration">Student Registration</Link>
            </Button>
            <Button asChild size="sm" className="w-full border-2 border-[#F26500] bg-[#F26500] font-bold text-white">
              <Link to="/auth">Sign in to CRM</Link>
            </Button>
          </div>
        </div>
      )}

      {/* 2. HERO SECTION (#home) */}
      <section id="home" className="scroll-mt-24 relative pt-10 pb-16 md:pt-14 md:pb-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-10 grid lg:grid-cols-12 gap-8 items-center">

          {/* LEFT COLUMN: Main Headline & Actions */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F26500]/10 border-2 border-[#F26500]/30 px-3.5 py-1 text-xs font-bold text-[#F26500]">
              Education Loan Aggregator Platform · B2C + B2B
            </span>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#0F2237] sm:text-5xl lg:text-6xl leading-[1.12]">
              Lead to Disbursement, <br />
              Without <span className="text-[#F26500]">Spreadsheets.</span>
            </h1>

            <p className="max-w-md text-base text-[#64748B] leading-relaxed font-medium">
              A purpose-built education loan platform that brings student cases, lender submissions, document processing, sanctions, disbursements and commission tracking into one connected workflow.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Button
                asChild
                size="lg"
                className="rounded-xl border-2 border-[#F26500] bg-[#F26500] font-bold text-white px-7 shadow-lg shadow-[#F26500]/30 hover:bg-[#E05B00] hover:border-[#E05B00] text-base"
              >
                <Link to="/student-registration">
                  Start Your Loan Application <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-2 border-[#CBD5E1] bg-white font-bold text-[#0F2237] px-6 hover:bg-slate-100 text-base shadow-xs"
              >
                <Link to="/auth">
                  Open Workspace <ArrowUpRight className="ml-1.5 size-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Increased Image Width + Tracking Card Top Right + Dream Text Below Card */}
          <div className="lg:col-span-7 flex flex-col md:flex-row items-center gap-6 justify-center lg:justify-end">

            {/* Student Image Container */}
            <div className="relative shrink-0">
              <div className="relative overflow-hidden rounded-t-[120px] rounded-b-3xl border-4 border-white bg-white shadow-xl">
                <img
                  src="/student-hero.jpg"
                  alt="Normiloans Student Hero"
                  className="w-[320px] sm:w-[380px] md:w-[420px] lg:w-[440px] h-[400px] sm:h-[450px] md:h-[480px] object-cover object-top"
                />
              </div>
            </div>

            {/* Beside Column: Top = Tracking Card | Below = Dream Study Text */}
            <div className="flex flex-col items-center md:items-start gap-6 shrink-0">

              {/* Top: Your Loan Journey Card */}
              <div className="w-64 sm:w-72 rounded-2xl bg-white p-5 shadow-xl border-2 border-[#CBD5E1]">
                <p className="text-xs font-bold text-[#0F2237] border-b-2 border-[#CBD5E1] pb-2 mb-3">
                  Your Loan Journey
                </p>

                <div className="relative space-y-3.5 text-[11px]">
                  {/* Connected Orange Vertical Line */}
                  <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-[#F26500]" />

                  {[
                    { title: "Lead Captured", date: "12 Mar 2025" },
                    { title: "Document Verification", date: "15 Mar 2025" },
                    { title: "Lender Submission", date: "18 Mar 2025" },
                    { title: "Sanctioned", date: "25 Mar 2025" },
                    { title: "Disbursed", date: "02 Apr 2025" },
                  ].map((step) => (
                    <div key={step.title} className="relative flex items-center justify-between z-10 bg-white pl-0.5">
                      <span className="flex items-center gap-2 font-semibold text-[#0F2237]">
                        <span className="flex size-4 items-center justify-center rounded-full bg-[#F26500] text-white text-[9px] font-extrabold shrink-0 shadow-xs">
                          ✓
                        </span>
                        {step.title}
                      </span>
                      <span className="text-[10px] text-[#64748B] font-mono">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Below Card: Cursive Handwritten Quote */}
              <div className="text-left font-['Caveat'] text-3xl sm:text-4xl font-bold text-[#0F2237] leading-[1.15] pl-2">
                <p className="transform -rotate-2">
                  Dream <br />
                  &nbsp;&nbsp;Study <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;Build Your <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#0F2237]">Future</span>
                </p>
                {/* Curved Vector Underline */}
                <svg className="w-28 h-4 text-[#F26500] mt-1 ml-6" viewBox="0 0 120 16" fill="none">
                  <path d="M4 12 Q 60 2 116 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* FLOATING STATS BAR (Matches Reference Layout) */}
      <div className="mx-auto max-w-7xl px-6 md:px-12 -mt-6 mb-16 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white rounded-3xl p-6 md:p-7 shadow-xl border-2 border-[#CBD5E1]">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EDF3FD] text-[#0F2237] border border-[#CBD5E1] shrink-0">
              <Users className="size-6 text-[#F26500]" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#0F2237]">5,000+</p>
              <p className="text-xs text-[#64748B] font-medium">Students Helped</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EDF3FD] text-[#0F2237] border border-[#CBD5E1] shrink-0">
              <Landmark className="size-6 text-[#F26500]" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#0F2237]">50+</p>
              <p className="text-xs text-[#64748B] font-medium">Partner Banks & NBFCs</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EDF3FD] text-[#0F2237] border border-[#CBD5E1] shrink-0">
              <ShieldCheck className="size-6 text-[#F26500]" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#0F2237]">98%</p>
              <p className="text-xs text-[#64748B] font-medium">Success Rate</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#EDF3FD] text-[#0F2237] border border-[#CBD5E1] shrink-0">
              <Building2 className="size-6 text-[#F26500]" />
            </span>
            <div>
              <p className="font-display text-2xl font-extrabold text-[#0F2237]">500+</p>
              <p className="text-xs text-[#64748B] font-medium">Active Channel Partners</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ABOUT US SECTION (#about) */}
      <section id="about" className="scroll-mt-24 py-16 bg-white border-t-2 border-b-2 border-[#CBD5E1]">
        <div className="mx-auto max-w-7xl px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">

          <div className="lg:col-span-7 space-y-5 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F26500]">About Normiloans</span>
            <h2 className="font-display text-3xl font-extrabold text-[#0F2237] md:text-4xl">
              Building a Connected Education Lending Journey
            </h2>

            <p className="text-sm text-[#0F2237] font-semibold leading-relaxed">
              Normiloans is a new-age education lending aggregator focused on creating a structured digital journey for students, channel partners and lending teams.
            </p>

            <p className="text-xs text-[#64748B] leading-relaxed">
              The platform brings lead capture, student information, document management, lender submission, processing, sanction, disbursement and commission tracking into one connected workflow.
            </p>

            <p className="text-xs text-[#64748B] leading-relaxed">
              Currently operating from <strong className="text-[#0F2237]">Hyderabad, Telangana</strong> with expansion building toward Tier 1 and Tier 2 locations across India, Normiloans is designed to support both B2C and B2B education-lending workflows, helping teams manage student cases from initial enquiry through university joining.
            </p>
          </div>

          {/* Connected Education Lending Flow (Clean Symmetrical Alignment) */}
          <div className="lg:col-span-5 p-6 sm:p-7 rounded-3xl bg-[#EDF3FD]/80 border-2 border-[#CBD5E1] space-y-5 shadow-sm">
            <h3 className="text-xs font-bold text-[#0F2237] uppercase tracking-wider text-center border-b-2 border-[#CBD5E1] pb-3">
              Connected Education Lending Flow
            </h3>

            <div className="space-y-3.5 text-xs font-bold text-[#0F2237]">
              {/* Row 1: Students */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-[#CBD5E1] shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#F26500]/10 text-[#F26500] shrink-0">
                    <Users className="size-4" />
                  </span>
                  <span className="truncate text-[#0F2237]">Students & Applicants</span>
                </div>
                <span className="text-[#F26500] font-mono text-sm font-extrabold shrink-0 px-1">⇄</span>
                <span className="rounded-lg bg-[#0F2237] px-3 py-1.5 text-[11px] font-extrabold text-white shrink-0 tracking-wide">
                  NORMILOANS
                </span>
              </div>

              {/* Row 2: Channel Partners */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-[#CBD5E1] shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#F26500]/10 text-[#F26500] shrink-0">
                    <Building2 className="size-4" />
                  </span>
                  <span className="truncate text-[#0F2237]">Channel Partners</span>
                </div>
                <span className="text-[#F26500] font-mono text-sm font-extrabold shrink-0 px-1">⇄</span>
                <span className="rounded-lg bg-[#0F2237] px-3 py-1.5 text-[11px] font-extrabold text-white shrink-0 tracking-wide">
                  NORMILOANS
                </span>
              </div>

              {/* Row 3: Banks & NBFCs */}
              <div className="p-3.5 rounded-xl bg-white border-2 border-[#CBD5E1] shadow-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[#F26500]/10 text-[#F26500] shrink-0">
                    <Landmark className="size-4" />
                  </span>
                  <span className="truncate text-[#0F2237]">Banks & NBFC Panel</span>
                </div>
                <span className="text-[#F26500] font-mono text-sm font-extrabold shrink-0 px-1">⇄</span>
                <span className="rounded-lg bg-[#0F2237] px-3 py-1.5 text-[11px] font-extrabold text-white shrink-0 tracking-wide">
                  NORMILOANS
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FEATURES SECTION (#features - 2-Column Layout matching Reference Image) */}
      <section id="features" className="scroll-mt-24 py-16 mx-auto max-w-7xl px-6 md:px-12">
        <div className="mb-10 text-left">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F26500]">Our Platform</span>
          <h2 className="mt-1 font-display text-3xl font-extrabold text-[#0F2237] md:text-4xl">
            End-to-End Education Loan Management
          </h2>
          <p className="mt-2 text-sm text-[#64748B]">
            From lead capture to commission reconciliation, everything you need in one powerful platform.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 7 Columns: 2x2 Feature Cards Grid */}
          <div className="lg:col-span-7 grid sm:grid-cols-2 gap-5">
            {[
              {
                icon: Users,
                title: "Lead Capture & Assignment",
                desc: "Tele-calling, website, partner and walk-in leads with owner, source and follow-up history.",
              },
              {
                icon: FileText,
                title: "Student & Document File",
                desc: "Applicant, co-applicant, guarantor, collateral and a document checklist ready for lender submission.",
              },
              {
                icon: BadgeIndianRupee,
                title: "Disbursement & Commission",
                desc: "Tranche-wise disbursement, college joining confirmation and payout reconciliation per case.",
              },
              {
                icon: LineChart,
                title: "Owner Dashboard",
                desc: "Pipeline, sanctioned and disbursed value, conversion funnel and lender scorecards.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-5.5 rounded-2xl bg-white border-2 border-[#CBD5E1] shadow-sm hover:shadow-md hover:border-[#F26500]/50 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-[#F26500]/10 text-[#F26500] group-hover:bg-[#F26500] group-hover:text-white transition-colors">
                    <feature.icon className="size-5.5" />
                  </span>
                  <ArrowRight className="size-4 text-slate-400 group-hover:text-[#F26500] group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F2237] group-hover:text-[#F26500] transition-colors">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right 5 Columns: Dark Navy "Why Choose Normiloans?" Card (Reference Matching) */}
          <div className="lg:col-span-5 relative overflow-hidden rounded-3xl bg-[#0F2237] p-7 md:p-8 text-white shadow-xl flex flex-col justify-between border-2 border-slate-700">
            <div className="relative z-10 space-y-6">
              <span className="inline-block rounded-full bg-[#F26500]/20 px-3.5 py-1 text-[11px] font-bold text-[#F26500] border border-[#F26500]/40">
                Built for Growth
              </span>

              <h3 className="font-display text-2xl font-extrabold text-white">Why Choose Normiloans?</h3>

              <ul className="space-y-3.5 text-xs text-slate-200 font-medium">
                {[
                  "End-to-end loan pipeline management",
                  "Real-time tracking & status updates",
                  "Multi-lender comparison & submission",
                  "Transparent commission reconciliation",
                  "Powerful analytics & reporting",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="flex size-4.5 items-center justify-center rounded-full bg-[#F26500] text-white text-[10px] font-extrabold shrink-0">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rising Trend Chart Graphic on the bottom right */}
            <div className="mt-8 pt-4 border-t border-slate-700/80 flex items-end justify-between relative z-10">
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white">100% Digital Workflow</p>
                <p className="text-[11px]">Designed for Indian Banks & NBFCs</p>
              </div>

              {/* Vector Bar Chart Graphic */}
              <div className="flex items-end gap-1.5 h-12 pr-2">
                <div className="w-2.5 h-4 bg-[#F26500]/40 rounded-t" />
                <div className="w-2.5 h-6 bg-[#F26500]/60 rounded-t" />
                <div className="w-2.5 h-8 bg-[#F26500]/80 rounded-t" />
                <div className="w-2.5 h-11 bg-[#F26500] rounded-t shadow-md shadow-[#F26500]/50" />
                <TrendingUp className="size-6 text-[#F26500] ml-1 mb-6" />
              </div>
            </div>

            {/* Background Glow Effect */}
            <div className="absolute -right-16 -bottom-16 size-48 rounded-full bg-[#F26500]/10 blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION (#how-it-works) */}
      <section id="how-it-works" className="scroll-mt-24 py-16 bg-[#EDF3FD]/80 border-t-2 border-b-2 border-[#CBD5E1]">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="mb-12 text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-[#F26500]">Case Workflow</span>
            <h2 className="mt-1 font-display text-3xl font-extrabold text-[#0F2237] md:text-4xl">
              From Lead to College Joining
            </h2>
            <p className="mt-2 text-sm text-[#64748B]">
              How an education-loan case moves step-by-step through the Normiloans platform.
            </p>
          </div>

          {/* Horizontal Step Grid with Icon Highlight on Hover */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 gap-4 text-center">
            {LIFECYCLE_STEPS.map((step, idx) => (
              <div
                key={step.label}
                className="group flex flex-col items-center bg-white p-3.5 rounded-2xl border-2 border-[#CBD5E1] shadow-xs transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-[#F26500]/50 cursor-pointer"
              >
                <span className="text-[10px] font-bold text-[#F26500] mb-1 group-hover:scale-105 transition-transform">Step 0{idx + 1}</span>
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#F26500]/10 text-[#F26500] group-hover:bg-[#F26500] group-hover:text-white transition-all duration-200 shadow-xs mb-2">
                  <step.icon className="size-5" />
                </div>
                <p className="text-xs font-bold text-[#0F2237] group-hover:text-[#F26500] transition-colors">{step.label}</p>
                <p className="text-[10px] text-[#64748B] mt-0.5">{step.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT / ENQUIRY SECTION (#contact) */}
      <section id="contact" className="scroll-mt-24 py-16 mx-auto max-w-3xl px-6">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border-2 border-[#CBD5E1] shadow-xl">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="size-16 text-[#F26500] mx-auto" />
              <h2 className="text-2xl font-bold text-[#0F2237]">Enquiry Received!</h2>
              <p className="text-xs text-[#64748B] max-w-sm mx-auto">
                Thank you for contacting Normiloans. Our education lending team will get back to you shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="rounded-xl border-2 border-[#CBD5E1]"
              >
                Send another enquiry
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEnquirySubmit} className="space-y-5 text-left">
              <div className="text-center space-y-2 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F26500]">Get In Touch</span>
                <h2 className="text-3xl font-extrabold text-[#0F2237]">Have an Enquiry?</h2>
                <p className="text-xs text-[#64748B]">
                  Share your details with the Normiloans team and we will get back to you regarding your enquiry.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="text-xs font-semibold text-[#0F2237]">Full Name *</Label>
                <Input
                  id="contactName"
                  placeholder="e.g. Ramesh Kumar"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="rounded-xl border-2 border-[#CBD5E1]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactEmail" className="text-xs font-semibold text-[#0F2237]">Email Address *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="ramesh@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="rounded-xl border-2 border-[#CBD5E1]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contactMessage" className="text-xs font-semibold text-[#0F2237]">Description *</Label>
                <Textarea
                  id="contactMessage"
                  placeholder="Describe your enquiry or student loan assistance request..."
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  className="rounded-xl border-2 border-[#CBD5E1]"
                  required
                />
              </div>

              <Button type="submit" className="w-full rounded-xl border-2 border-[#F26500] bg-[#F26500] font-bold text-white shadow-lg shadow-[#F26500]/25 hover:bg-[#E05B00] hover:border-[#E05B00]">
                <Send className="mr-2 size-4" /> Send Enquiry
              </Button>
            </form>
          )}
        </div>
      </section>

      {/* 7. PREMIUM SOLID DARK NAVY FOOTER (#0F2237 - Clean layout without white background hover conversion) */}
      <footer className="bg-[#0F2237] text-white pt-14 pb-10 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6 md:px-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-slate-800">

          {/* Column 1: Brand & Headquarters */}
          <div className="space-y-4">
            <Link to="/" onClick={() => scrollToSection("home")} className="inline-block">
              <NormiloansLogo variant="dark" size="lg" showTagline={true} />
            </Link>
            <p className="text-xs text-slate-300 leading-relaxed">
              New-age education lending aggregator building a digital platform for customer service and channel partners across India.
            </p>
            <p className="text-[11px] font-semibold text-[#F26500]">
              Headquarters: Hyderabad, Telangana · Tier 1 & Tier 2 Expansion
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">Navigation</p>
            <ul className="space-y-2 text-xs text-slate-300">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="hover:text-[#F26500] transition-colors font-medium text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact Details */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">Contact Us</p>
            <div className="space-y-2 text-xs text-slate-300">
              <p><strong className="text-white">Email:</strong> support@normiloans.com</p>
              <p><strong className="text-white">Phone:</strong> +91 40 8899 7700</p>
              <p><strong className="text-white">Location:</strong> Banjara Hills, Hyderabad, Telangana 500034</p>
            </div>
          </div>

          {/* Column 4: Ecosystem Summary */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-200">B2B & B2C Ecosystem</p>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connecting Students ↕ Normiloans ↕ Banks / NBFCs ↕ Channel Partners in one connected workflow.
            </p>
          </div>

        </div>

        {/* Bottom Footer Bar */}
        <div className="mx-auto max-w-7xl px-6 md:px-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs text-slate-400">
          <p>© 2026 Normiloans. Education Loan Lead-to-Disbursement Platform. All rights reserved.</p>
          <p className="font-semibold text-white">Normiloans — Fuel Your Ambitions</p>
        </div>
      </footer>
    </div>
  );
}
