
import { NextResponse } from 'next/server';


const protectedPaths = [
  '/documents/:path*',
    '/strata-roll/:path*',
    '/levies/:path*',
    '/budgets/:path*',
    '/api/maintenance/:path*',
    '/api/levy-payment/:path*',
    '/api/admin/:path*',
];


const adminPaths = [
  '/strata-roll',
  '/budgets',
  '/api/admin'
];

export function middleware(request) {
  const { pathname } = request.nextUrl;


  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path));


  if (isProtectedPath) {

    const token = request.cookies.get('auth_token')?.value;


    if (!token) {
      return redirectToLogin(request);
    }

    try {



      if (decodedToken.exp < Date.now()) {

        return redirectToLogin(request);
      }


      if (isAdminPath && decodedToken.role !== 'admin' && decodedToken.role !== 'committee') {

        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Token verification error:', error);

      return redirectToLogin(request);
    }
  }


  return NextResponse.next();
}


function redirectToLogin(request) {
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('from', request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}


export const config = {
  matcher: [
    
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};