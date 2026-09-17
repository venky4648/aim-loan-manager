import { createFileRoute, Link } from "@tanstack/react-router";
import { NormiloansLogo } from "@/components/crm/NormiloansLogo";
import { StudentRegistrationForm } from "@/components/crm/StudentRegistrationForm";

export const Route = createFileRoute("/student-registration")({
  head: () => ({
    meta: [
      { title: "Student Registration | Normiloans CRM" },
      {
        name: "description",
        content: "Direct student registration form for education loan application.",
      },
      { property: "og:title", content: "Student Registration | Normiloans CRM" },
      {
        property: "og:description",
        content: "Direct student registration form for education loan application.",
      },
      { property: "og:image", content: "/normiloans-logo.png" },
      { property: "og:image:secure_url", content: "/normiloans-logo.png" },
      { property: "og:image:type", content: "image/png" },
      { name: "twitter:image", content: "/normiloans-logo.png" },
    ],
  }),
  component: StudentRegistrationPage,
});

function StudentRegistrationPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Brand Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur px-6 py-4 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <NormiloansLogo variant="full-color" size="md" showTagline={true} />
        </Link>
        <div className="text-xs font-semibold text-muted-foreground hidden sm:block">
          Direct Lead Registration
        </div>
      </header>

      {/* Main Registration Form Container */}
      <main className="flex-1 mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
        <StudentRegistrationForm />
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-border bg-card py-6 text-center text-xs text-muted-foreground mt-auto">
        <p>© 2026 Normiloans. Education Loan Lead-to-Disbursement Platform.</p>
      </footer>
    </div>
  );
}
