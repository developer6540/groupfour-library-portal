import { NextRequest, NextResponse } from "next/server";
import { getDbConnection } from "@/lib/db";
import { verifyPassword } from "@/lib/passwordHasher";
import { errorResponse, successResponse } from "@/lib/response";
import Logger from "@/lib/logger";

const MAX_FAIL_COUNT = 5; // Lock account after 5 failed attempts

export async function POST(request: NextRequest) {
    try {
        const { userCode, password } = await request.json();

        if (!userCode || !password) {
            return NextResponse.json(errorResponse("User code and password are required", 400), { status: 400 });
        }

        const pool = await getDbConnection();
        const result = await pool.request()
            .input('code', userCode)
            .query(`SELECT * FROM M_TBLUSERS WHERE U_CODE = @code`);

        // Generic message to prevent user enumeration
        if (result.recordset.length === 0) {
            return NextResponse.json(errorResponse("Invalid user code or password", 401), { status: 401 });
        }

        const user = result.recordset[0];

        // 1. Check if account is active
        if (!user.U_ACTIVE) {
            return NextResponse.json(errorResponse("Your account is inactive. Please contact the library.", 403), { status: 403 });
        }

        // 2. Check if account is locked
        if (user.U_LOCKED) {
            const lockedAt = user.U_LOCKED_AT ? new Date(user.U_LOCKED_AT).toLocaleString() : "unknown time";
            return NextResponse.json(errorResponse(`Your account has been locked due to too many failed login attempts (since ${lockedAt}). Please contact the library.`, 403), { status: 403 });
        }

        // 3. Check membership status
        if (!user.U_MEMSTATUS) {
            return NextResponse.json(errorResponse("Your membership is not active. Please contact the library.", 403), { status: 403 });
        }

        // 4. Check subscription status
        if (!user.U_SUBSSTATUS) {
            return NextResponse.json(errorResponse("Your subscription is not active. Please renew your subscription.", 403), { status: 403 });
        }

        // 5. Check subscription expiry
        if (user.U_EXPIREDDATE) {
            const expiredDate = new Date(user.U_EXPIREDDATE);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (expiredDate < today) {
                return NextResponse.json(errorResponse(`Your subscription expired on ${expiredDate.toLocaleDateString()}. Please renew to continue.`, 403), { status: 403 });
            }
        }

        // 6. Verify password
        const isMatch = verifyPassword(password, user.U_PASSWORD);

        if (!isMatch) {
            // Increment fail count
            const newFailCount = (user.U_FAIL_COUNT || 0) + 1;
            const shouldLock = newFailCount >= MAX_FAIL_COUNT;

            await pool.request()
                .input('failCount', newFailCount)
                .input('locked', shouldLock ? 1 : 0)
                .input('lockedAt', shouldLock ? new Date() : null)
                .input('code', userCode)
                .query(`
                    UPDATE M_TBLUSERS 
                    SET U_FAIL_COUNT = @failCount,
                        U_LOCKED = @locked,
                        U_LOCKED_AT = CASE WHEN @locked = 1 THEN @lockedAt ELSE U_LOCKED_AT END,
                        M_DATE = GETDATE()
                    WHERE U_CODE = @code
                `);

            if (shouldLock) {
                return NextResponse.json(errorResponse("Your account has been locked after too many failed attempts. Please contact the library.", 403), { status: 403 });
            }

            const attemptsLeft = MAX_FAIL_COUNT - newFailCount;
            return NextResponse.json(errorResponse(`Invalid user code or password. ${attemptsLeft} attempt(s) remaining before account lockout.`, 401), { status: 401 });
        }

        // 7. Successful login — reset fail count
        await pool.request()
            .input('code', userCode)
            .query(`
                UPDATE M_TBLUSERS 
                SET U_FAIL_COUNT = 0,
                    U_TEMPDATETIME = GETDATE(),
                    M_DATE = GETDATE()
                WHERE U_CODE = @code
            `);

        // Remove sensitive fields from response
        delete user.U_PASSWORD;
        delete user.U_FAIL_COUNT;
        delete user.U_LOCKED_AT;

        return NextResponse.json(successResponse(user, "Login successful"));

    } catch (error: any) {
        Logger.error("Sign-in error: ", error);
        return NextResponse.json(errorResponse(error.message || "Login failed", 500), { status: 500 });
    }
}
