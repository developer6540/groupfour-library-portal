import { NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/response";
import { markAllNotificationsRead } from "@/services/notification.service";
import Logger from "@/lib/logger";

export async function POST() {
    try {
        const updatedNotifications = await markAllNotificationsRead();
        return NextResponse.json(
            successResponse(updatedNotifications, "All notifications marked as read")
        );
    } catch (error: any) {
        const status = error.status || 500;
        Logger.error(`API Error (markAllNotificationsRead): `, error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", status),
            { status }
        );
    }
}