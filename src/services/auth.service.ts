import { getDbConnection } from "@/lib/db";
import { verifyPassword } from "@/lib/passwordHasher";
import { SignJWT } from 'jose';
import { throwException } from "@/lib/exceptions";
import logger from "@/lib/logger";

export async function authenticateUser(usercode: string, pass: string) {
    const pool = await getDbConnection();

    // 1. Verify Password
    const authResult = await pool.request()
        .input("usercode", usercode)
        .query(`SELECT U_PASSWORD FROM [LibraryMS].[dbo].[M_TBLUSERS] WHERE U_GROUP = 'USER' AND U_CODE = @usercode`);

    const storedAuth = authResult.recordset[0];

    // Check if user exists at all
    if (!storedAuth) {
        throwException("Sorry! This portal is for members only.", 403);
    }

    // Verify Password
    if (!verifyPassword(pass, storedAuth.U_PASSWORD)) {
        throwException("Invalid login credentials", 401);
    }

    // 2. Fetch User Details
    const userResult = await pool.request()
        .input("usercode", usercode)
        .query(`
            SELECT 
                [U_CODE], [U_NAME], [U_ACTIVE], [U_GROUP], [U_MOBILE], 
                [U_DOB], [U_ADDRESS], [U_NIC], [M_DATE], [U_UID],
                [U_GENDER], [U_MEMSTATUS], [U_SUBSSTATUS], [U_EMAIL],
                [U_REGISTEREDATE], [U_SUBSTYPE], [U_EXPIREDDATE],
                [U_MAXBORROW], [U_FAIL_COUNT], [U_LOCKED], [U_LOCKED_AT],
                [U_GRACEDATE], [U_TEMPDATETIME]
            FROM [LibraryMS].[dbo].[M_TBLUSERS] 
            WHERE U_CODE = @usercode
        `);

    const user = userResult.recordset[0];

    // 3. Validations
    if (!user) throwException("User details not found", 404);
    if (!user.U_ACTIVE) throwException("Your account is inactive.", 403);
    if (user.U_LOCKED) throwException("Account is locked.", 403);

    if (user.U_EXPIREDDATE && new Date(user.U_EXPIREDDATE) < new Date()) {
        throwException("Your membership has expired.", 403);
    }

    // 4. Generate Token with 'jose'
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        logger.error("JWT_SECRET is not defined")
        throwException("Oops! Some error occurred, Please try again later", 401);
    }

    // jose requires the secret to be an encoded Uint8Array
    const secret = new TextEncoder().encode(secretKey);

    const token = await new SignJWT({ ...user })
        .setProtectedHeader({ alg: 'HS256' }) // Algorithm is required
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(secret);

    return { user, token };
}