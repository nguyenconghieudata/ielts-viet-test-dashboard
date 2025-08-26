import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ROUTES, isApiRoute } from "./utils/route";

export function middleware(req: NextRequest) {
  // Skip middleware for API routes completely
  if (isApiRoute(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Skip middleware for the API test page
  if (req.nextUrl.pathname === ROUTES.API_TEST) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("isLogin");
  const url = req.nextUrl;
  if (cookie) {
    if (url.pathname !== ROUTES.HOME) {
      return NextResponse.redirect(new URL(ROUTES.HOME, url));
    }
  } else {
    if (url.pathname !== ROUTES.LOGIN) {
      return NextResponse.redirect(new URL(ROUTES.LOGIN, url));
    }
  }
  return NextResponse.next();
}

export const config = {
  // Explicitly exclude API routes and other static assets from middleware
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
};
