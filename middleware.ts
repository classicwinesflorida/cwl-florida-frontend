// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// List your protected routes (adjust as needed)
const protectedRoutes = [
  "/pages/dashboard",
  "/pages/order-manually",
  "/pages/ai-page",
  "/pages/po-sms-text",
  "/pages/po-sms-screenshot",
  "/pages/upload-pdf",
  "/pages/upload-voice"
  // Add more as needed
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path is protected
  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    // Check for token in cookies
    const token = request.cookies.get("token");
    if (!token) {
      // Redirect to login page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}