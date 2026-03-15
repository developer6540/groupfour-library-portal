import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    // 1. Extract values
    const token = req.cookies.get('auth-session')?.value;
    const csrfCookie = req.cookies.get('X-CSRF-Token')?.value;
    const isApiRequest = pathname.startsWith("/api/");
    const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);

    // 2. CSRF Validation for Write Methods
    if (isApiRequest && isWriteMethod) {
        const headerToken = req.headers.get("X-CSRF-Token");

        // Error 1111: Either missing header, missing cookie, or mismatch
        if (!headerToken || !csrfCookie || headerToken !== csrfCookie) {
            return NextResponse.json(
                { message: "Unauthorized Access 1111", debug: !csrfCookie ? "Missing Cookie" : "Mismatch" },
                { status: 403 }
            );
        }
    }

    // 3. Auth Logic: Redirect logged-in users away from sign-in
    if (pathname === "/sign-in" && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.redirect(new URL("/", req.url));
        } catch (e) {
            // Invalid token, allow sign-in
        }
    }

    // 4. Auth Protection for Private Routes
    const publicRoutes = ["/sign-in", "/api/v1/auth/login", "/api/v1/auth/register"];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    if (!token && !isPublicRoute) {
        if (isApiRequest) {
            return NextResponse.json({ message: "Unauthorized Access 2222" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // 5. Token verification
    if (token && !isPublicRoute) {
        try {
            await jwtVerify(token, JWT_SECRET);
        } catch (error) {
            const response = NextResponse.redirect(new URL("/sign-in", req.url));
            response.cookies.delete("auth-session");
            return response;
        }
    }

    // 6. Generate Response and Set CSRF if missing
    const response = NextResponse.next();

    if (!csrfCookie) {
        response.cookies.set("X-CSRF-Token", crypto.randomUUID(), {
            path: "/",
            httpOnly: false, // Must be false so Frontend JS can read it
            secure: true,    // Required for HTTPS (Railway)
            sameSite: "lax",
        });
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|img|vdo|favicon.ico|sign-in|register|forgot-password).*)',
    ],
};