import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Commercial" };

export default function CommercialPage() {
  return (
    <PagePlaceholder
      title="Commercial"
      intro="Sponsorship, advertising and partnership opportunities for local and national businesses will be listed here."
      sections={[
        "Sponsorship packages",
        "Matchday advertising",
        "Current partners",
        "Get in touch",
      ]}
    />
  );
}
