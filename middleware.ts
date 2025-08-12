import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const protectedRoutes = [  "/pages/dashboard",
  "/pages/order-manually", 
  "/pages/ai-page",
  "/pages/po-sms-text",
  "/pages/po-sms-screenshot",
  "/pages/upload-pdf",
  "/pages/upload-voice"];

// Define public routes that should redirect to dashboard if user is logged in
const publicRoutes = ['/', '/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token from cookies (we'll need to modify login to use cookies instead of localStorage)
  const token = request.cookies.get('token')?.value;
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // If accessing a protected route without a token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }
  
  // If accessing a public route with a token, redirect to dashboard
  if (isPublicRoute && token) {
    const dashboardUrl = new URL('/pages/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};