import { NextResponse } from "next/server";

// Set NEXT_PUBLIC_SHOP_URL once the Shopify store link is available.
export function GET(request: Request) {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL;

  if (!shopUrl) {
    return NextResponse.redirect(new URL("/shop/not-configured", request.url));
  }

  return NextResponse.redirect(shopUrl);
}
