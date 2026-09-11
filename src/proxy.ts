import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_HOST_PREFIX = "admin.";

/**
 * - On the `admin.` subdomain, rewrite requests into the /admin route tree
 *   so admin.<domain> and <domain>/admin serve the same pages. Point the
 *   admin subdomain at this same Vercel project and it works with no
 *   further config.
 * - Refreshes the Supabase auth session cookie on every request.
 */
export async function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";
  const isAdminHost = hostname.startsWith(ADMIN_HOST_PREFIX);

  const rewrittenUrl = request.nextUrl.clone();
  if (isAdminHost && !rewrittenUrl.pathname.startsWith("/admin")) {
    rewrittenUrl.pathname = `/admin${rewrittenUrl.pathname === "/" ? "" : rewrittenUrl.pathname}`;
  }

  const response =
    rewrittenUrl.pathname !== request.nextUrl.pathname
      ? NextResponse.rewrite(rewrittenUrl)
      : NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
