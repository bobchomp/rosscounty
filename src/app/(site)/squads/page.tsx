import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Squads" };

export default function SquadsPage() {
  return (
    <PagePlaceholder
      title="Squads"
      intro="First team, women's, academy and youth squad profiles will be managed from the admin panel and shown here."
      sections={[
        "First team",
        "Coaching staff",
        "Women's team",
        "Academy",
        "Youth teams",
        "Player of the season",
      ]}
    />
  );
}
