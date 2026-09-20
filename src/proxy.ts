import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { AppRoutes } from "@/types/enums/routes";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`. This file
 * MUST live at `src/proxy.ts` — the same level as `app/` — or it is never
 * executed. (It previously sat at `src/utils/proxy.ts`, where Next never
 * looked for it, so none of it ran.)
 *
 * Two jobs, in order:
 *
 * 1. Refresh the Supabase auth session. `@supabase/ssr` stores the session
 *    in cookies and refreshes an expiring access token by writing new ones.
 *    Server Components cannot set cookies, so without a proxy doing this on
 *    every request the tokens eventually go stale and users are silently
 *    signed out mid-session. Calling `getUser()` is what triggers the
 *    refresh; the result is also used for (2).
 *
 * 2. Bounce clearly-unauthenticated visitors off `/dashboard`. This is an
 *    optimistic check only — deliberately NOT the authorization decision.
 *    Next's own guidance is that proxy shouldn't be a full authorization
 *    solution (it can be served from a CDN edge and can't be trusted with
 *    the last word), so `checkIsAdmin()` in `app/dashboard/layout.tsx` and
 *    each page below it remains authoritative and still runs. The admin
 *    ROLE check is left there too: it needs a database read, which is
 *    exactly the kind of work that does not belong in a proxy.
 */
export async function proxy(request: NextRequest) {
  // Must be the object that is ultimately returned: `createServerClient`
  // writes refreshed auth cookies onto it, and building a different response
  // later would drop them and log the user out on the next request.
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  // Without Supabase configured there is no session to refresh and no way to
  // identify a user. Fall through rather than throwing: the storefront is
  // fully usable unauthenticated, and `/dashboard`'s own server-side
  // `checkIsAdmin()` still fails closed.
  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // `getUser()` revalidates the token against Supabase, unlike `getSession()`
  // which trusts whatever the cookie claims. Do not swap it for the cheaper
  // call: the cookie is client-supplied.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith(AppRoutes.DASHBOARD)) {
    const loginUrl = new URL(AppRoutes.LOGIN, request.nextUrl.origin);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Every path except the ones that can't benefit from a session refresh:
     * Next's build output, the image optimizer, the favicon and static image
     * files. `/api/proxy-image` is excluded too — it takes no session and is
     * hit once per cart image during PDF export.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/proxy-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
