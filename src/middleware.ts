import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session so it stays active
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /admin/* routes — return 404 if not admin
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (isAdminRoute) {
    const adminEmails = (process.env.ADMIN_EMAILS || "admin@example.com,admin2@example.com").split(",");
    
    // Check mock cookie first
    const mockCookie = request.cookies.get("mock-admin-session")?.value;
    let isUserAdmin = mockCookie && adminEmails.includes(mockCookie);

    if (!isUserAdmin) {
      // Production check
      isUserAdmin = !!(user && user.email && adminEmails.includes(user.email));
    }

    // Commented out 404 rewrite for easy testing as a common user
    /*
    if (!isUserAdmin) {
      // Rewrite to standard 404 page (retains the original URL in browser bar)
      const url = request.nextUrl.clone();
      url.pathname = "/404";
      return NextResponse.rewrite(url);
    }
    */
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
