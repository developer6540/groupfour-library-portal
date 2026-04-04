import { NextRequest, NextResponse } from "next/server";
import {errors, jwtVerify} from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

const usedJtiStore = new Set<string>();

export async function middleware(req: NextRequest) {

    const { pathname } = req.nextUrl;

    // Retrieve authentication token from cookies (used for verifying logged-in user)
    const token = req.cookies.get("auth-session")?.value;
    // Retrieve CSRF token from cookies (used for CSRF protection validation)
    const csrfCookie = req.cookies.get("X-CSRF-Token")?.value;

    const isApiRequest = pathname.startsWith("/api/");
    const isWriteMethod = ["POST", "PUT", "DELETE", "PATCH"].includes(req.method);

    // Define routes that do NOT require authentication (publicly accessible)
    const publicRoutes = [
        "/sign-in",
        "/register",
        "/forgot-password",
        "/payment-gateway",
        "/membership-payment",
        "/api/v1/auth/login",
        "/api/v1/auth/register",
        "/api/v1/locations",
        "/api/v1/auth/forgot-password",
        "/api/v1/user/membership-payment",
        "/api/v1/payment/subscribe",
        "/api/v1/books/fine-payment",
    ];

    const dynamicPublicRoutes = [
        /^\/api\/v1\/user\/[^/]+\/exist$/,
    ];

    const isPublicRoute =
        publicRoutes.some((route) => pathname === route) ||
        dynamicPublicRoutes.some((pattern) => pattern.test(pathname));

    // Create response early so we can attach cookies
    const response = NextResponse.next();

    // Ensure a CSRF token cookie is present for the client
    if (!csrfCookie) {
        // If the CSRF cookie does not exist, generate a new token
        // Using crypto.randomUUID() ensures a strong, unpredictable value
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
    // Apply CSRF protection only for API requests that modify data
    if (isApiRequest && isWriteMethod) {
        // Extract CSRF token sent from client via request header
        const headerToken = req.headers.get("X-CSRF-Token");
        // Validate CSRF token:
        // 1. Header token must exist
        // 2. CSRF cookie must exist
        // 3. Both values must match (double submit cookie pattern)
        if (!headerToken || !csrfCookie || headerToken !== csrfCookie) {
            console.log("CSRF Not Allowed");
            // Reject request if CSRF validation fails
            return NextResponse.json(
                { message: "Unauthorized Access" },
                { status: 401 }
            );
        }
    }

    // Auth Protection
    // Check if request is accessing a protected route without a valid auth token
    if (!token && !isPublicRoute) {
        // If it's an API request, return JSON response instead of redirect
        if (isApiRequest) {
            console.log("Token Not Allowed");
            // Reject API request with 401 Unauthorized
            return NextResponse.json(
                { message: "Unauthorized Access" },
                { status: 401 }
            );
        }
        // For non-API (UI) requests, redirect user to sign-in page
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    // Verify JWT
    if (token && !isPublicRoute) {
        try {
            /*
            It automatically validates:
              1. Signature
              2. Expiration (exp)
              3. Not-before (nbf) if present
            */
            await jwtVerify(token, JWT_SECRET);
            return response;
        } catch (err) {
            if (err instanceof errors.JWTExpired) {
                console.log("Token expired: ", err);
            } else {
                console.log("Invalid token: ", err);
            }

            const redirect = NextResponse.redirect(new URL("/sign-in", req.url));
            redirect.cookies.delete("auth-session");
            return redirect;
        }
    }

    return response;
}

export const config = {
    matcher: [
        // Run middleware on all routes except static files
        "/((?!_next/static|_next/image|favicon.ico|img|vdo).*)",
    ],
};