import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    const token = req.cookies.get("auth-session")?.value;
    const csrfCookie = req.cookies.get("X-CSRF-Token")?.value;

    const isApiRequest = pathname.startsWith("/api/");
    const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);

    const publicRoutes = [
        "/sign-in",
        "/register",
        "/forgot-password",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
    ];

    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

    // Create response early so we can attach cookies
    const response = NextResponse.next();

    // Ensure CSRF Cookie Exists
    if (!csrfCookie) {
        response.cookies.set("X-CSRF-Token", crypto.randomUUID(), {
            path: "/",
            httpOnly: false,
            secure: true,
            sameSite: "lax",
        });
    }

    // Redirect logged-in users away from sign-in
    if (pathname === "/sign-in" && token) {
        try {
            await jwtVerify(token, JWT_SECRET);
            return NextResponse.redirect(new URL("/", req.url));
        } catch {}
    }

    // CSRF Validation
    if (isApiRequest && isWriteMethod) {
        const headerToken = req.headers.get("X-CSRF-Token");

        if (!headerToken || !csrfCookie || headerToken !== csrfCookie) {
            return NextResponse.json(
                { message: "Invalid CSRF token" },
                { status: 403 }
            );
        }
    }

    // Auth Protection
    if (!token && !isPublicRoute) {
        if (isApiRequest) {
            return NextResponse.json(
                { message: "Unauthorized Access" },
                { status: 401 }
            );
        }

        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // -----------------------------
    // 5. Verify JWT
    // -----------------------------
    if (token && !isPublicRoute) {
        try {
            await jwtVerify(token, JWT_SECRET);
        } catch {
            const redirect = NextResponse.redirect(new URL("/sign-in", req.url));
            redirect.cookies.delete("auth-session");
            return redirect;
        }
    }

    return response;
}

export const config = {
    matcher: [
        /*
         Run middleware on all routes except static files
        */
        "/((?!_next/static|_next/image|favicon.ico|img|vdo).*)",
    ],
};