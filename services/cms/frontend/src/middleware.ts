import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const isAuthPage = request.nextUrl.pathname === '/';

  console.log('accessToken:', accessToken, 'isAuthPage:', isAuthPage);

  if (!accessToken && !isAuthPage) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};