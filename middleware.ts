import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(
  async function middleware(request: NextRequestWithAuth) {
    const token = await getToken({ req: request });
    const isAuth = !!token;
    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
    const isApiAuthRoute =
      request.nextUrl.pathname.startsWith("/api/auth");

    // Allow API authentication routes
    if (isApiAuthRoute) {
      return NextResponse.next();
    }

    // Redirect authenticated users away from auth pages
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(
          new URL("/dashboard", request.url)
        );
      }
      return NextResponse.next();
    }

    // Protect dashboard and other authenticated routes
    if (!isAuth) {
      let from = request.nextUrl.pathname;
      if (request.nextUrl.search) {
        from += request.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(
          `/auth/signin?from=${encodeURIComponent(from)}`,
          request.url
        )
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => true
      // We'll handle authorization in the middleware function
    }
  }
);

// Specify which routes to protect
export const config = {
  matcher: [
    // Protect these routes
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/links/:path*",
    "/analytics/:path",
    // Protect auth routes from authenticated users
    "/auth/:path*",

    // Optional: Protect api routes
    "/api/:path*"

    // Add any other protected routes here
  ]
};
