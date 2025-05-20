import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || path === '/api/auth/pin';
  
  // Get the authentication cookie directly
  const authenticated = request.cookies.get('authenticated')?.value === 'true';
  
  // Redirect unauthenticated users to login
  if (!isPublicPath && !authenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect authenticated users away from login
  if (isPublicPath && authenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - Images and other assets
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icons/|images/|.*\\.png$).*)',
  ],
};
