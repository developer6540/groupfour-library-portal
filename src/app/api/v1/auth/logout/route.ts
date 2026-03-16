// src/app/api/v1/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { successResponse, errorResponse } from "@/lib/response";

export async function POST() {
    try {
        const cookieStore = await cookies();

        // 1. Delete the security and user info cookies
        cookieStore.delete("auth-session");
        cookieStore.delete("user-info");
        cookieStore.delete("cart-items");
        cookieStore.delete("X-CSRF-Token");

        // 2. Return a success response
        return NextResponse.json(
            successResponse(null, "Logged out successfully")
        );
    } catch (error: any) {
        return NextResponse.json(
            errorResponse("Failed to logout", 500),
            { status: 500 }
        );
    }
}