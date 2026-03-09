import { NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import {getAllBookCategories} from "@/services/categoy.service";

export async function GET() {
    try {
        const data = await getAllBookCategories();
        return NextResponse.json(
            successResponse(data, "Categories retrieved successfully")
        );
    } catch (error: any) {
        Logger.error("API Error (getAllBookCategories): ", error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}