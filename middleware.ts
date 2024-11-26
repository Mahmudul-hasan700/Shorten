import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default withAuth(async function middleware(
  request: NextRequestWithAuth
) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute =
    request.nextUrl.pathname.startsWith("/api/auth");

  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  if (isAuthPage) {
    if (isAuth) {
      return NextResponse.redirect(
        new URL("/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  if (!isAuth) {
    const callbackUrl =
      request.nextUrl.pathname + request.nextUrl.search;

    return NextResponse.redirect(
      new URL(
        `/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        request.url
      )
    );
  }

  return NextResponse.next();
});

// Specify which routes to protect
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/links/:path*",
    "/analytics/:path*",
    "/auth/:path*",
    "/api/user/:path*",
    "/api/settings/:path*"
  ]
};
