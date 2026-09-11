import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Club" };

export default function ClubPage() {
  return (
    <PagePlaceholder
      title="Club"
      intro="Club history, staff, stadium information and governance content will live here."
      sections={[
        "Club history",
        "Board & staff",
        "Stadium — Victoria Park",
        "Club badge & colours",
        "Community & charity",
        "Contact us",
      ]}
    />
  );
}
