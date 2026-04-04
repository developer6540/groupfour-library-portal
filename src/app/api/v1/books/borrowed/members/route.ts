import { NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { getDbConnection } from "@/lib/db";

export async function GET() {
    try {
        const pool = await getDbConnection();
        const result = await pool.request().query(`
            SELECT DISTINCT h.BH_MEMBERCODE,
                ISNULL(u.U_NAME, h.BH_MEMBERCODE) AS U_NAME
            FROM dbo.T_TBLBOOKBORROW_H h
            LEFT JOIN dbo.M_TBLUSERS u ON u.U_CODE = h.BH_MEMBERCODE
            ORDER BY h.BH_MEMBERCODE
        `);
        return NextResponse.json(successResponse(result.recordset, "Members retrieved successfully"));
    } catch (error: any) {
        Logger.error("API Error (getBorrowMembers): ", error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", 500),
            { status: 500 }
        );
    }
}
