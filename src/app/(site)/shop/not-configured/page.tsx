import type { Metadata } from "next";

export const metadata: Metadata = { title: "Shop" };

export default function ShopNotConfiguredPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-2xl font-bold text-club-navy">Shop</h1>
      <p className="mt-4 text-neutral-600">
        The club shop link hasn&apos;t been configured yet. Once the Shopify
        store URL is added as the <code>NEXT_PUBLIC_SHOP_URL</code>{" "}
        environment variable, this page will redirect straight there.
      </p>
    </div>
  );
}
