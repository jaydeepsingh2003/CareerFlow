import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicPaths = ['/login', '/register', '/forgot-password'];
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // If the user is authenticated and tries to access login/register, redirect to dashboard
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If the user is NOT authenticated and tries to access protected routes, redirect to login
    const protectedPaths = ['/dashboard', '/profile', '/jobs/feed', '/readiness'];
    const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

    if (!token && isProtectedPath) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
