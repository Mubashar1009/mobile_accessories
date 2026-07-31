import { NextResponse, type NextRequest } from "next/server";

/**
 * proxy — lightweight request pass-through.
 * Replaces the old Supabase-dependent middleware.
 * Admin route protection is commented out for testing.
 */
export function proxy(request: NextRequest): NextResponse {
  // Admin route guard — commented out for testing
  /*
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");
  if (isDashboardRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/404";
    return NextResponse.rewrite(url);
  }
  */

  return NextResponse.next({ request });
}
