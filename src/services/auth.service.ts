import { getDbConnection } from "@/lib/db";
import {hashPassword, verifyPassword} from "@/lib/passwordHasher";
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

    // Verify password with fail-count tracking
    const isValid = verifyPassword(pass, storedAuth.U_PASSWORD);
    const failCount = storedAuth.U_FAIL_COUNT || 0;
    const maxAttempts = 5;

    if (!isValid) {
        const newFailCount = failCount + 1;

        // Increment fail count
        await pool.request()
            .input("usercode", usercode)
            .input("failCount", newFailCount)
            .query(`
                UPDATE M_TBLUSERS
                SET U_FAIL_COUNT = @failCount
                WHERE U_CODE = @usercode
            `);

        const attemptsLeft = maxAttempts - newFailCount;

        // Auto-lock if failCount >= maxAttempts
        if (newFailCount >= maxAttempts) {

            // Lock the user account
            await pool.request()
                .input("usercode", usercode)
                .query(`
                    UPDATE M_TBLUSERS
                    SET
                        U_LOCKED = 1,
                        U_LOCKED_AT = GETDATE()
                    WHERE U_CODE = @usercode
                `);

            // Insert into user lock approval table
            await pool.request()
                .input("usercode", usercode)
                .query(`INSERT INTO T_TBLUSERLOCKAPPROVAL
                            (UL_ID, UL_USERCODE, UL_DATE, UL_STATUS, M_DATE)
                            VALUES
                                (
                                    'UL' + CONVERT(VARCHAR(14), GETDATE(), 112)
                                        + REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '')
                                        + RIGHT('000' + CAST(ABS(CHECKSUM(NEWID())) % 1000 AS VARCHAR(3)), 3),
                                    @usercode,
                                    GETDATE(),
                                    'P',
                                    GETDATE()
                                )`);
            throwException(
                "Account locked due to multiple failed login attempts. Please contact the librarian to unlock.",
                403
            );
        }

        // Throw message with remaining attempts
        throwException(
            `Invalid login credentials. You have ${attemptsLeft} out of ${maxAttempts} attempts left.`,
            401
        );
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
    if (user.U_LOCKED) throwException("Account is locked. Please contact the library.", 403);
    if (!user.U_ACTIVE) throwException("Your account has been deactivated. Please contact the library.", 403);

    // Subscription / Payment checks — 402 Payment Required
    const isExpired = user.U_EXPIREDDATE && new Date(user.U_EXPIREDDATE) < new Date();
    if (!user.U_SUBSSTATUS || !user.U_MEMSTATUS || isExpired) {
        const msg = isExpired
            ? `Your subscription expired on ${new Date(user.U_EXPIREDDATE).toLocaleDateString("en-GB")}. Please renew to continue.`
            : "Your subscription is inactive. Please renew to access the library.";
        const err = new Error(msg) as any;
        err.status        = 402;
        err.requiresPayment = true;
        err.usercode      = usercode;
        err.username      = user.U_NAME;
        err.expiredDate   = user.U_EXPIREDDATE || null;
        throw err;
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