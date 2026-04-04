import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import { authenticateUser } from "@/services/auth.service";
import {setCsrfTokenServer, setSessionServer} from "@/lib/session-server";
import Logger from "@/lib/logger";
import {pushNotification} from "@/services/notification.service";

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

        // await pushNotification({
        //     title: "Login",
        //     message: "You have successfully logged in",
        // })

        // Success Response
        return NextResponse.json(
            successResponse(user, "Login successful", 201)
        );

    } catch (error: any) {

        Logger.error("Login API Failure:", error.message || error);

        // 402 — subscription expired / inactive → redirect to payment
        if (error.status === 402) {
            return NextResponse.json(
                {
                    status: "payment_required",
                    statusCode: 402,
                    message: error.message,
                    requiresPayment: true,
                    data: {
                        usercode:    error.usercode    || null,
                        name:        error.username    || null,
                        expiredDate: error.expiredDate || null,
                    },
                },
                { status: 402 }
            );
        }

        const status = error.status || 500;
        const message = status === 500 ? "Internal Server Error" : error.message;

        return NextResponse.json(
            errorResponse(message, status),
            { status }
        );
    }
}