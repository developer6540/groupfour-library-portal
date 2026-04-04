import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { getAllReturnBooks, processBookReturn } from "@/services/book.service";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    try {
        const userCode = searchParams.get("userCode") || "";
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

        const { data, total } = await getAllReturnBooks(searchParams, { userCode, page, pageSize });

        return NextResponse.json(
            successResponse({ data, total, page, pageSize }, "Returned books retrieved successfully")
        );
    } catch (error: any) {
        Logger.error("API Error (getAllReturnBooks): ", error);

        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { docNo, lineNo, memberCode } = body;

        if (!docNo || lineNo === undefined || !memberCode) {
            return NextResponse.json(
                errorResponse("docNo, lineNo and memberCode are required", 400),
                { status: 400 }
            );
        }

        await processBookReturn(String(docNo), Number(lineNo), String(memberCode));

        return NextResponse.json(
            successResponse(null, "Book returned successfully")
        );
    } catch (error: any) {
        Logger.error("API Error (processBookReturn): ", error);

        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", error.status || 500),
            { status: error.status || 500 }
        );
    }
}
