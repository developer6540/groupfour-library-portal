import { NextRequest, NextResponse } from "next/server";
import {errorResponse, successResponse} from "@/lib/response";
import Logger from "@/lib/logger";
import {getLocations} from "@/services/location.service";

export async function GET() {
    try {
        const user = await getLocations();
        return NextResponse.json(successResponse(user, "Locations retrieved successfully"));
    } catch (error: any) {
        Logger.error("API Error (getLocations): ", error);
        return NextResponse.json(errorResponse(error.message, error.status || 500), {
            status: error.status || 500,
        });
    }
}