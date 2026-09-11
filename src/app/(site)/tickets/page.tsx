import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Tickets" };

export default function TicketsPage() {
  return (
    <PagePlaceholder
      title="Tickets"
      intro="Match tickets, season tickets and pricing will be managed here once the ticketing provider is confirmed."
      sections={[
        "Upcoming home fixtures",
        "Season tickets",
        "Ticket prices & concessions",
        "Away travel",
        "Accessibility & disabled supporters",
        "FAQs",
      ]}
    />
  );
}
