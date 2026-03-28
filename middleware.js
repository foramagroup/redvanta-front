import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const superadminToken = request.cookies.get("sa_token")?.value;
  const isSuperadminLogin = pathname === "/superadmin/login";
  const isSuperadminRoute = pathname.startsWith("/superadmin");

  if (!isSuperadminRoute) {
    return NextResponse.next();
  }

  if (!superadminToken && !isSuperadminLogin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/superadmin/login";
    loginUrl.search = `?next=${encodeURIComponent(`${pathname}${search || ""}`)}`;
    return NextResponse.redirect(loginUrl);
  }

  if (superadminToken && isSuperadminLogin) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/superadmin";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/superadmin/:path*"],
};
