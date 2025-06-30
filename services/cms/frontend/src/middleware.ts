import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken');
  const isAuthPage = request.nextUrl.pathname === '/';
  const userRole = request.cookies.get("userRole");
  console.log('accessToken:', accessToken, 'isAuthPage:', isAuthPage);

  if (!accessToken && !isAuthPage) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (accessToken && userRole?.value !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};