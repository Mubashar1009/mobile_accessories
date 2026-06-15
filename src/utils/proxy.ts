import { NextResponse, type NextRequest } from "next/server";

/**
 * proxy — lightweight request pass-through.
 * Replaces the old Supabase-dependent middleware.
 * Admin route protection is commented out for testing.
 */
export function proxy(request: NextRequest): NextResponse {
  // Admin route guard — commented out for testing
  /*
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }
  */

  return NextResponse.next({ request });
}
