import { NextRequest, NextResponse } from "next/server";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {getNotifications} from "@/services/notification.service";

export async function GET() {
    try {
        const notifications = await getNotifications();
        return NextResponse.json(
            successResponse(notifications, "Notifications retrieved successfully")
        );
    } catch (error: any) {
        const status = error.status || 500;
        Logger.error(`API Error (getNotifications): `, error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", status),
            { status }
        );
    }
}