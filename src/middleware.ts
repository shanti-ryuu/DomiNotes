import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Get the path of the request
  const path = request.nextUrl.pathname;
  
  // Define public paths that don't require authentication - handle trailing slashes
  const isPublicPath = 
    path === '/login' || 
    path === '/login/' || 
    path.startsWith('/api/auth/pin') || 
    path === '/_next' || 
    path.startsWith('/_next/');
  
  // Get the authentication cookie directly
  const authenticated = request.cookies.get('authenticated')?.value === 'true';
  
  // Only apply middleware logic to relevant paths
  // Skip static files, API routes, etc.
  if (!path.startsWith('/api/') && !path.includes('.') && !path.startsWith('/_next/')) {
    // Redirect unauthenticated users to login
    if (!isPublicPath && !authenticated) {
      return NextResponse.redirect(new URL('/login/', request.url));
    }
    
    // Redirect authenticated users away from login
    if ((path === '/login' || path === '/login/') && authenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /api routes (except /api/auth/pin which needs special handling)
     * - /_next (static files, images, etc.)
     * - favicon.ico, manifest.json, sw.js (PWA related files)
     * - Files with extensions (.svg, .jpg, etc)
     * - Static asset folders
     */
    '/((?!api/(?!auth/pin)|_next|favicon\.ico|manifest\.json|sw\.js|\.[^/]+$|icons/|images/).*)',
    '/api/auth/pin/:path*',
  ],
};
