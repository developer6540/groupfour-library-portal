import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";

const PLANS: Record<string, { months: number; label: string }> = {
    MONTHLY: { months: 1,  label: "Monthly" },
    ANNUAL:  { months: 12, label: "Annual"  },
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { usercode, plan } = body;

        if (!usercode || !plan) {
            return NextResponse.json(
                errorResponse("usercode and plan are required", 400),
                { status: 400 }
            );
        }

        if (!PLANS[plan]) {
            return NextResponse.json(
                errorResponse("Invalid plan. Choose MONTHLY or ANNUAL", 400),
                { status: 400 }
            );
        }

        const pool = await getDbConnection();

        // Verify user exists
        const userResult = await pool.request()
            .input("code", usercode)
            .query(`SELECT U_CODE, U_NAME FROM M_TBLUSERS WHERE U_CODE = @code AND U_GROUP = 'USER'`);

        if (!userResult.recordset[0]) {
            return NextResponse.json(
                errorResponse("User not found", 404),
                { status: 404 }
            );
        }

        // Calculate new expiry date
        const newExpiry = new Date();
        newExpiry.setMonth(newExpiry.getMonth() + PLANS[plan].months);

        // Update subscription in DB
        await pool.request()
            .input("code",    usercode)
            .input("plan",    plan)
            .input("expiry",  newExpiry)
            .query(`
                UPDATE M_TBLUSERS
                SET U_SUBSSTATUS = 1,
                    U_MEMSTATUS  = 1,
                    U_ACTIVE     = 1,
                    U_SUBSTYPE   = @plan,
                    U_EXPIREDDATE = @expiry,
                    M_DATE       = GETDATE()
                WHERE U_CODE = @code
            `);

        Logger.info(`Subscription renewed: ${usercode} → ${plan} until ${newExpiry.toLocaleDateString("en-GB")}`);

        return NextResponse.json(
            successResponse(
                { usercode, plan: PLANS[plan].label, expiryDate: newExpiry },
                `Subscription renewed successfully until ${newExpiry.toLocaleDateString("en-GB")}`
            )
        );

    } catch (error: any) {
        Logger.error("Payment API Error:", error);
        return NextResponse.json(
            errorResponse(error.message || "Payment processing failed", 500),
            { status: 500 }
        );
    }
}