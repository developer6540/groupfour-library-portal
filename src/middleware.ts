import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import logger from "@/lib/logger";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {

    const { pathname } = req.nextUrl;
    const token = req.cookies.get('auth-session')?.value;
    const csrfCookie = req.cookies.get('X-CSRF-Token')?.value;

    // Redirect logged-in users away from sign-in
    if (pathname === "/sign-in" && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.redirect(new URL("/", req.url));
        } catch {

        }
    }

    // CSRF Validation for all POST/PUT/DELETE/PATCH
    const isApiRequest = pathname.startsWith("/api/");
    const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);

    if (isApiRequest && isWriteMethod) {
        const headerToken = req.headers.get("X-CSRF-Token");
        if (!headerToken || !csrfCookie || headerToken !== csrfCookie) {
            logger.error("CSRF Validation Failed Unauthorized access");
            return NextResponse.json({ message: "Unauthorized Access" }, { status: 403 });
        }
    }

    // Auth Protection
    const publicRoutes = ["/sign-in", "/api/v1/auth/login", "/api/v1/auth/register"];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    if (!token && !isPublicRoute) {
        if (isApiRequest) {
            return NextResponse.json({ message: "Unauthorized Access" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Token verification for protected routes
    if (token && !isPublicRoute) {
        try {
            await jwtVerify(token, JWT_SECRET);
        } catch (error) {
            const response = NextResponse.redirect(new URL("/sign-in", req.url));
            response.cookies.delete("auth-session");
            return response;
        }
    }

    // Generate CSRF Cookie if missing
    const response = NextResponse.next();
    if (!csrfCookie) {
        response.cookies.set("X-CSRF-Token", crypto.randomUUID(), {
            path: "/",
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
        });
    }

    return response;
}

export const config = {
    matcher: [
        //Match all request paths except for the ones starting with:
        '/((?!_next/static|_next/image|img|vdo|favicon.ico|sign-in|register|forgot-password).*)',
    ],
};