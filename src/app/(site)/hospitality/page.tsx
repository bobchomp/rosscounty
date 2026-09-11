import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Hospitality" };

export default function HospitalityPage() {
  return (
    <PagePlaceholder
      title="Hospitality"
      intro="Matchday hospitality packages, suites and event/function room hire will be detailed here."
      sections={[
        "Matchday hospitality packages",
        "Executive boxes & suites",
        "Function room hire",
        "Enquiries & booking",
      ]}
    />
  );
}
