import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Admin route guard — commented out for local dev testing
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

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
