// Middleware for authentication and protection of routes
import { NextResponse } from 'next/server';

// Define protected paths that require authentication
const protectedPaths = [
  '/documents/:path*',
    '/strata-roll/:path*',
    '/levies/:path*',
    '/budgets/:path*',
    '/api/maintenance/:path*',
    '/api/levy-payment/:path*',
    '/api/admin/:path*',
];

// Define admin-only paths
const adminPaths = [
  '/strata-roll',
  '/budgets',
  '/api/admin'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));

  // If it's a protected path, check for authentication
  if (isProtectedPath) {
    // Get the auth token from the cookies
    const token = request.cookies.get('auth_token')?.value;

    // If no token, redirect to login page
    if (!token) {
      return redirectToLogin(request);
    }

    try {
      // Decode and verify the token
      // In a real app, you would use a JWT library to verify the token
      const decodedToken = JSON.parse(atob(token));

      // Check if the token is expired
      if (decodedToken.exp < Date.now()) {
        // Token expired, redirect to login
        return redirectToLogin(request);
      }

      // For admin paths, check if the user has admin role
      if (isAdminPath && decodedToken.role !== 'admin' && decodedToken.role !== 'committee') {
        // Not authorized, redirect to unauthorized page
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      // User is authenticated, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      console.error('Token verification error:', error);
      // Invalid token, redirect to login
      return redirectToLogin(request);
    }
  }

  // Not a protected path, allow the request to proceed
  return NextResponse.next();
}

// Helper function to redirect to login page
function redirectToLogin(request) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};