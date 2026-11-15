import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const isHttps = request.nextUrl.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
    const hasSecureCookie = request.cookies.has('__Secure-next-auth.session-token');
    const secret = process.env.NEXTAUTH_SECRET || 'freshbasket-secret-key-32characterslongmin123456';

    let token = await getToken({
        req: request,
        secret,
        secureCookie: hasSecureCookie || isHttps,
        cookieName: hasSecureCookie ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
    });

    if (!token && hasSecureCookie) {
        token = await getToken({
            req: request,
            secret,
            secureCookie: true,
            cookieName: '__Secure-next-auth.session-token',
        });
    }

    if (!token && !hasSecureCookie) {
        token = await getToken({
            req: request,
            secret,
            secureCookie: false,
            cookieName: 'next-auth.session-token',
        });
    }
    const { pathname } = request.nextUrl;

    // Admin routes protection
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
        if (token.role !== 'ADMIN') {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Protected user routes
    if (pathname.startsWith('/orders') || pathname.startsWith('/checkout')) {
        if (!token) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('callbackUrl', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

    // Blocked user check
    if (token?.blocked) {
        return NextResponse.redirect(new URL('/auth/blocked', request.url));
    }

    // Rate limiting headers
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', '100');

    return response;
}

export const config = {
    matcher: ['/admin/:path*', '/orders/:path*', '/checkout/:path*'],
};
