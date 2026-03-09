import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import {getAllBooks} from "@/services/book.service";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    try {
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

        const { data, total } = await getAllBooks(searchParams, { page, pageSize });

        return NextResponse.json(
            successResponse({ data, total, page, pageSize }, "Books retrieved successfully")
        );
    } catch (error: any) {
        Logger.error("API Error (getAllBooks): ", error);

        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}