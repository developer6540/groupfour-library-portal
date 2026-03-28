import { NextRequest, NextResponse } from "next/server";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";
import { getDbConnection } from "@/lib/db";
import { throwException } from "@/lib/exceptions";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { usercode, amount } = body;

        if (!usercode) {
            return NextResponse.json(errorResponse("usercode is required", 400), { status: 400 });
        }

        if (!amount || Number(amount) <= 0) {
            return NextResponse.json(errorResponse("A valid payment amount is required", 400), { status: 400 });
        }

        const pool = await getDbConnection();

        // Check user exists
        const userResult = await pool.request()
            .input("usercode", usercode)
            .query(`SELECT U_CODE, U_NAME FROM M_TBLUSERS WHERE U_CODE = @usercode`);

        if (userResult.recordset.length === 0) {
            throwException("User not found", 404);
        }

        // Activate membership: set subscription active, reset expiry to 1 year from now
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        await pool.request()
            .input("usercode", usercode)
            .input("expiredDate", expiryDate)
            .query(`
                UPDATE M_TBLUSERS
                SET U_MEMSTATUS  = 1,
                    U_SUBSSTATUS = 1,
                    U_ACTIVE     = 1,
                    U_EXPIREDDATE = @expiredDate,
                    M_DATE       = GETDATE()
                WHERE U_CODE = @usercode
            `);

        Logger.info(`Membership payment processed for user: ${usercode}, amount: ${amount}`);

        return NextResponse.json(
            successResponse({ usercode, amount }, "Payment successful. Membership activated.")
        );
    } catch (error: any) {
        const status = error.status || 500;
        Logger.error("API Error (payment/subscribe)", error);
        return NextResponse.json(
            errorResponse(error.message || "Internal Server Error", status),
            { status }
        );
    }
}
