// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List your protected routes
const protectedRoutes = [
  "/pages/dashboard",
  "/pages/order-manually", 
  "/pages/ai-page",
  "/pages/po-sms-text",
  "/pages/po-sms-screenshot",
  "/pages/upload-pdf",
  "/pages/upload-voice"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for token in cookies (HTTP-only cookie)
    const token = request.cookies.get("token");
    
    if (!token || !token.value) {
      console.log(`No token found for protected route: ${pathname}`);
      // Create redirect URL to login page
      const redirectUrl = new URL("/", request.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Optional: Verify token validity here if needed
    // For now, just check if token exists
    console.log(`Token found for protected route: ${pathname}`);
  }

  return NextResponse.next();
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
}