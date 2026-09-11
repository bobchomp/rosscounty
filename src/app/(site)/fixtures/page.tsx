import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "Fixtures & League Table" };

export default function FixturesPage() {
  return (
    <PagePlaceholder
      title="Fixtures & League Table"
      intro="Upcoming fixtures, recent results and the live league table will be pulled in here once the data source is connected."
      sections={[
        "Next match",
        "Fixture list",
        "Results",
        "League table",
        "Head-to-head history",
      ]}
    />
  );
}
