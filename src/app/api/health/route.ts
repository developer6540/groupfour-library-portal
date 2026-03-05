import { getDbConnection } from "@/lib/db";
import logger from "@/lib/logger";
import {errorResponse, successResponse} from "@/lib/response";
import {NextResponse} from "next/server";

export async function GET(req: Request) {
    try {
        const pool = await getDbConnection();
        const result = await pool.request().query("SELECT 1 AS healthCheck");

        logger.info("Health check successful");
        return NextResponse.json(successResponse({db:result.recordset[0]}, "Health check successful"));

    } catch (error: any) {
        logger.error(`Health check failed: ${error.message}`);
        return NextResponse.json(errorResponse(error.message, error.status || 500));
    }
}