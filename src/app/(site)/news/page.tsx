import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/ui/page-placeholder";

export const metadata: Metadata = { title: "News" };

export default function NewsPage() {
  return (
    <PagePlaceholder
      title="News"
      intro="Club news, match reports and press releases will appear here, managed from the admin panel."
      sections={[
        "Latest headlines",
        "Match reports",
        "Press releases",
        "Interviews",
        "Categories & archive",
      ]}
    />
  );
}
