import { auth } from "@/server/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that should redirect to dashboard if authenticated
const authPaths = ["/auth", "/register"];

export default async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // Check if this is an auth path
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isAuthPath && session) {
    // Redirect to dashboard if accessing auth routes while authenticated
    const redirectUrl = new URL("/chat", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on auth routes
  matcher: ["/auth/:path*", "/register/:path*"],
}; 