import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import { authenticateUser } from "@/services/auth.service";
import {setCsrfTokenServer, setSessionServer} from "@/lib/session-server"; // Path to your functions
import Logger from "@/lib/logger";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { usercode, password } = body;

        // Basic Input Validation
        if (!usercode || !password) {
            return NextResponse.json(
                errorResponse("User Code and Password are required", 400),
                { status: 400 }
            );
        }

        // Authenticate (SQL, Crypto, and Status checks)
        const { user, token } = await authenticateUser(usercode, password);

        // Set Auth Session (JWT) for middleware/security
        await setSessionServer("auth-session", token);

        // Store user info
        await setSessionServer("user-info", user);

        // Create CSRF token
        await setCsrfTokenServer();

        // Success Response
        return NextResponse.json(
            successResponse(user, "Login successful")
        );

    } catch (error: any) {

        Logger.error("Login API Failure:", error.message || error);

        const status = error.status || 500;
        const message = status === 500 ? "Internal Server Error" : error.message;

        return NextResponse.json(
            errorResponse(message, status),
            { status }
        );
    }
}