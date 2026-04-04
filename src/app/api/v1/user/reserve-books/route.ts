import { NextRequest, NextResponse } from "next/server";
import { reserveBook } from "@/services/user.service";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import {pushNotification} from "@/services/notification.service";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validation: Ensure body is an array and not empty
        if (!Array.isArray(body) || body.length === 0) {
            return NextResponse.json(
                errorResponse("Invalid reservation data provided", 400),
                { status: 400 }
            );
        }

        const result = await reserveBook(body);

        // Push notification per book
        if (result?.length) {
            for (const book of result) {
                await pushNotification({
                    title: "Reservation Request",
                    message: `Book reservation request for " ${book.B_TITLE} " sent for approval`
                });
            }
        }

        return NextResponse.json(
            successResponse(result, "Reservations submitted successfully", 201)
        );

    } catch (error: any) {

        Logger.error("API Error (reserveBook): ", error);

        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}