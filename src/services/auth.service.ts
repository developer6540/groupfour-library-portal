import { getDbConnection } from "@/lib/db";
import {hashPassword, verifyPassword} from "@/lib/passwordHasher";
import { SignJWT } from 'jose';
import { throwException } from "@/lib/exceptions";
import logger from "@/lib/logger";
import {generateStrongPassword} from "@/lib/server-utility";
import {sendEmail} from "@/services/email.service";
import {getBaseUrl} from "@/lib/server-utility";
import {forgotPasswordEmailTemplate} from "@/lib/emailTemplates";

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
    if (!user) throwException("User details not found", 400);
    if (!user.U_ACTIVE) throwException("Your account is inactive.", 400);
    if (user.U_LOCKED) throwException("Account is locked.", 400);

    if (user.U_EXPIREDDATE && new Date(user.U_EXPIREDDATE) < new Date()) {
        throwException("Your membership has expired.", 400);
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

export interface RegisterPayload {
    U_CODE: string;
    U_NAME: string;
    U_MOBILE: string;
    U_DOB: string;
    U_ADDRESS?: string;
    U_PASSWORD: string;
    U_NIC?: string;
    U_GENDER: string;
    U_EMAIL?: string;
    U_LOCATION?: string;
}

export async function registerUser(payload: RegisterPayload) {
    const pool = await getDbConnection();

    const {
        U_CODE,
        U_NAME,
        U_MOBILE,
        U_DOB,
        U_ADDRESS,
        U_PASSWORD,
        U_NIC,
        U_GENDER,
        U_EMAIL,
        U_LOCATION,
    } = payload;

    // NIC Validation
    if (U_NIC) {
        const oldNic = /^[0-9]{9}[VXvx]$/;
        const newNic = /^[0-9]{12}$/;
        if (!oldNic.test(U_NIC) && !newNic.test(U_NIC)) {
            throwException(
                "Invalid NIC format. Old: 9 digits + V/X, New: 12 digits",
                400
            );
        }
    }

    // Check duplicate user code
    const exists = await pool.request()
        .input("usercode", U_CODE)
        .query(`SELECT U_CODE FROM M_TBLUSERS WHERE U_CODE = @usercode`);

    if (exists.recordset.length > 0) {
        throwException(`User code '${U_CODE}' already exists. Choose another.`, 400);
    }

    const hashedPassword = hashPassword(U_PASSWORD);
    const now = new Date();
    const expireDate = new Date(now);
    expireDate.setFullYear(expireDate.getFullYear() + 1);

    const transaction = pool.transaction();

    try {
        await transaction.begin();

        await transaction.request()
            .input("U_CODE", U_CODE)
            .input("U_NAME", U_NAME)
            .input("U_ACTIVE", 0)
            .input("U_GROUP", "USER")
            .input("U_MOBILE", U_MOBILE)
            .input("U_DOB", U_DOB)
            .input("U_ADDRESS", U_ADDRESS || null)
            .input("U_PASSWORD", hashedPassword)
            .input("U_NIC", U_NIC || null)
            .input("M_DATE", now.toISOString())
            .input("U_UID", U_CODE)
            .input("U_GENDER", U_GENDER)
            .input("U_MEMSTATUS", 1)
            .input("U_SUBSSTATUS", 1)
            .input("U_EMAIL", U_EMAIL || null)
            .input("U_REGISTEREDATE", now.toISOString())
            .input("U_SUBSTYPE", "00003")
            .input("U_EXPIREDDATE", expireDate.toISOString())
            .input("U_MAXBORROW", 2)
            .query(`
                INSERT INTO M_TBLUSERS
                (
                    U_CODE, U_NAME, U_ACTIVE, U_GROUP, U_MOBILE, U_DOB, U_ADDRESS,
                    U_PASSWORD, U_NIC, M_DATE, U_UID, U_GENDER, U_MEMSTATUS,
                    U_SUBSSTATUS, U_EMAIL, U_REGISTEREDATE, U_SUBSTYPE,
                    U_EXPIREDDATE, U_MAXBORROW
                )
                VALUES
                (
                    @U_CODE, @U_NAME, @U_ACTIVE, @U_GROUP, @U_MOBILE, @U_DOB, @U_ADDRESS,
                    @U_PASSWORD, @U_NIC, @M_DATE, @U_UID, @U_GENDER, @U_MEMSTATUS,
                    @U_SUBSSTATUS, @U_EMAIL, @U_REGISTEREDATE, @U_SUBSTYPE,
                    @U_EXPIREDDATE, @U_MAXBORROW
                )
            `);

        if (U_LOCATION) {
            await transaction.request()
                .input("UL_USERCODE", U_CODE)
                .input("UL_USERLOC", U_LOCATION)
                .input("UL_ACTIVE", 1)
                .input("M_DATE", now.toISOString())
                .query(`
                    INSERT INTO M_TBLUSERLOCATION
                    (
                        UL_USERCODE, UL_USERLOC, UL_ACTIVE, M_DATE
                    )
                    VALUES
                    (
                        @UL_USERCODE, @UL_USERLOC, @UL_ACTIVE, @M_DATE
                    )
                `);
        }
        await transaction.commit();
        return { message: "Registration successful", U_CODE, U_NAME };

    } catch (err) {
        await transaction.rollback();
        logger.error("Error registering user", err);
        throwException("Failed to register user. Please try again.", 500);
    }
}

export interface ForgotPasswordPayload {
    U_CODE: string;
}

export async function forgotPassword(payload: ForgotPasswordPayload) {
    const pool = await getDbConnection();
    const { U_CODE } = payload;

    if (!U_CODE) {
        throwException("Invalid user code", 400);
    }

    const transaction = pool.transaction();

    try {
        await transaction.begin();

        // 1. Check user exists
        const userResult = await transaction.request()
            .input("usercode", U_CODE)
            .query(`
                SELECT U_CODE, U_NAME, U_EMAIL, U_ACTIVE
                FROM M_TBLUSERS
                WHERE U_CODE = @usercode AND U_GROUP = 'USER'
            `);

        const user = userResult.recordset[0];

        if (!user) {
            throwException("User account not found", 404);
        }

        if (!user.U_ACTIVE) {
            throwException("Your account is inactive", 400);
        }

        // 2. Generate strong temp password
        const tempPassword = await generateStrongPassword(10);
        const hashedPassword = hashPassword(tempPassword);

        // 3. Update password
        await transaction.request()
            .input("usercode", U_CODE)
            .input("password", hashedPassword)
            .query(`
                UPDATE M_TBLUSERS
                SET U_PASSWORD = @password,
                    U_FAIL_COUNT = 0,
                    U_LOCKED = 0,
                    U_LOCKED_AT = NULL
                WHERE U_CODE = @usercode
            `);

        const baseUrl = await getBaseUrl();

        // Send email
        const html = forgotPasswordEmailTemplate({
            userName: user.U_NAME,
            tempPassword: tempPassword,
            actionUrl: `${baseUrl}sign-in`,
        });

        await sendEmail({
            to: user.U_EMAIL,
            subject: "Your Temporary Password - GroupFour Library",
            html
        });

        await transaction.commit();

        return {
            message: "Temporary password sent to your email. Please sign in and change it immediately.",
        };

    } catch (err: any) {
        await transaction.rollback();
        logger.error("Error in forgotPassword", err);
        throwException(err.message || "Failed to process forgot password", err.status || 500);
    }
}