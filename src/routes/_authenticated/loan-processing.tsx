import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/crm/AppShell";
import { LoanProcessingDashboard } from "@/components/crm/processing/LoanProcessingDashboard";

export const Route = createFileRoute("/_authenticated/loan-processing")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Loan Processing Desk | Normiloans CRM" },
      {
        name: "description",
        content: "Independent multi-lender application submission, bank queries, credit sanctions and disbursement tracker.",
      },
      { property: "og:title", content: "Loan Processing Desk | Normiloans CRM" },
    ],
  }),
  component: LoanProcessingPage,
});

function LoanProcessingPage() {
  return (
    <AppShell
      title="Loan Processing Desk"
      subtitle="Multi-lender loan applications, credit sanctions & disbursement management"
    >
      <LoanProcessingDashboard />
    </AppShell>
  );
}
