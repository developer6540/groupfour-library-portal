import {getDbConnection} from "@/lib/db";
import {throwException} from "@/lib/exceptions";
import { hashPassword, verifyPassword } from "@/lib/passwordHasher";
import {getDateISO} from "@/lib/server-utility";

export async function getUserByCode(code: string) {
    const userCode = code;

    if (!userCode) {
        throwException("Invalid user code", 400);
    }

    try {
        const pool = await getDbConnection();
        const q = `SELECT *
                   FROM M_TBLUSERS
                   WHERE U_CODE = '${userCode.replace(/'/g, "''")}'`;

        const result = await pool.request().query(q);

        if (result.recordset.length === 0) {
            throwException("User not found", 400);
        }

        return result.recordset[0];

    } catch (error: unknown) {
        if (error instanceof Error) {
            const status = (error as any).status || 500;
            throwException(error.message, status);
        } else if (typeof error === "string") {
            throwException(error, 500);
        } else {
            throwException("Database error", 500);
        }
    }
}

interface UpdateUserInput {
    U_NAME?: string;
    U_DOB?: string | Date;
    U_GENDER?: string;
    U_ADDRESS?: string;
    U_MOBILE?: string;
    U_NIC?: string;
    U_EMAIL?: string;
}

export async function updateUserByCode(code: string, data: UpdateUserInput) {
    if (!code) throwException("Invalid user code", 400);

    try {
        const pool = await getDbConnection();

        const uName = data.U_NAME ? `'${data.U_NAME.replace(/'/g, "''")}'` : "NULL";
        const uDob = data.U_DOB ? `'${await getDateISO(data.U_DOB)}'` : "NULL";
        const uGender = data.U_GENDER ? `'${data.U_GENDER}'` : "NULL";
        const uAddress = data.U_ADDRESS ? `'${data.U_ADDRESS.replace(/'/g, "''")}'` : "NULL";
        const uMobile = data.U_MOBILE ? `'${data.U_MOBILE}'` : "NULL";
        const uNic = data.U_NIC ? `'${data.U_NIC}'` : "NULL";
        const uEmail = data.U_EMAIL ? `'${data.U_EMAIL}'` : "NULL";

        const query = `UPDATE M_TBLUSERS
                       SET U_NAME    = ${uName},
                           U_DOB     = ${uDob},
                           U_GENDER  = ${uGender},
                           U_ADDRESS = ${uAddress},
                           U_MOBILE  = ${uMobile},
                           U_EMAIL   = ${uEmail},
                           M_DATE    = GETDATE()
                       WHERE U_CODE = '${code}'
        `;

        await pool.request().query(query);

        const result = await pool
            .request()
            .query(`SELECT *
                    FROM M_TBLUSERS
                    WHERE U_CODE = '${code}'`);

        if (result.recordset.length === 0) {
            throwException("User not found", 400);
        }

        return result.recordset[0];

    } catch (error: any) {
        throwException(error.message || "Failed to update user", error.status || 500);
    }
}

export async function changePassword(code: string, data: { currentPassword?: string; newPassword?: string }) {

    if (!code) throwException("Invalid user code", 400);

    if (!data.currentPassword || !data.newPassword) {
        throwException("Current and new passwords are required", 400);
    }

    try {

        const pool = await getDbConnection();

        // fetch the user's current hashed password from the DB
        const userResult = await pool.request()
            .input('code', code)
            .query(`SELECT U_PASSWORD FROM M_TBLUSERS WHERE U_CODE = @code`);

        if (userResult.recordset.length === 0) {
            throwException("User not found", 404);
        }

        const dbPasswordHash = userResult.recordset[0].U_PASSWORD;

        // verify the current password
        const isMatch = await verifyPassword(data.currentPassword, dbPasswordHash);
        if (!isMatch) {
            throwException("The current password you entered is incorrect", 401);
        }

        // hash the new password
        const newHashedPassword = await hashPassword(data.newPassword);

        // update the database
        await pool.request()
            .input('newPassword', newHashedPassword)
            .input('code', code)
            .query(`
                UPDATE M_TBLUSERS 
                SET U_PASSWORD = @newPassword, 
                    M_DATE = GETDATE() 
                WHERE U_CODE = @code
            `);

        return [];

    } catch (error: any) {
        throwException(error.message || "Failed to change password", error.status || 500);
    }
}

interface ReservationInput {
    BR_USERCODE: string | number;
    BR_BOOKCODE: string;
    BR_QTY: number;
    BR_HOLD_DAYS: number;
    BR_REMARK?: string;
    BR_BORROW_LINENO: number;
}

export async function reserveBook(reservations: ReservationInput[]) {
    if (!reservations || reservations.length === 0) {
        throwException("No reservation data provided", 400);
    }

    const pool = await getDbConnection();
    const transaction = pool.transaction();

    try {
        await transaction.begin();

        const bookCodes: string[] = [];

        for (const item of reservations) {

            const holdDays = Math.min(item.BR_HOLD_DAYS, 3);

            const expiresOn = new Date();
            expiresOn.setDate(expiresOn.getDate() + holdDays);

            // Get user location
            const locRequest = transaction.request();
            locRequest.input("userCode", item.BR_USERCODE);

            const locResult = await locRequest.query(`
                SELECT TOP 1 UL_USERLOC
                FROM M_TBLUSERLOCATION
                WHERE UL_USERCODE = @userCode AND UL_ACTIVE = 1
                ORDER BY M_DATE DESC
            `);

            const userLocation = locResult.recordset?.[0]?.UL_USERLOC || "00001";

            // Insert reservation
            const request = transaction.request();
            request.input("userCode", item.BR_USERCODE);
            request.input("bookCode", item.BR_BOOKCODE);
            request.input("qty", item.BR_QTY);
            request.input("holdDays", holdDays);
            request.input("expiresOn", expiresOn);
            request.input("remark", item.BR_REMARK || "");
            request.input("lineNo", item.BR_BORROW_LINENO);
            request.input("locCode", userLocation);

            await request.query(`
                INSERT INTO T_TBLBOOKRESERVATIONS (
                    BR_USERCODE,
                    BR_BOOKCODE,
                    BR_LOCCODE,
                    BR_QTY,
                    BR_HOLD_DAYS,
                    BR_REQ_DATE,
                    BR_REMARK,
                    M_DATE,
                    BR_PROC_BY,
                    BR_PROC_AT,
                    BR_BORROW_LINENO
                )
                VALUES (
                    @userCode,
                    @bookCode,
                    @locCode,
                    @qty,
                    @holdDays,
                    GETDATE(),
                    @remark,
                    GETDATE(),
                    @userCode,
                    GETDATE(),
                    @lineNo
                )
            `);

            // collect book codes
            bookCodes.push(item.BR_BOOKCODE);
        }

        // Fetch book details AFTER inserts
        const booksRequest = transaction.request();

        const uniqueCodes = [...new Set(bookCodes)];

        booksRequest.input("codes", uniqueCodes.join(","));

        const booksResult = await booksRequest.query(`
            SELECT B_CODE, B_TITLE
            FROM M_TBLBOOKS
            WHERE B_CODE IN (${uniqueCodes.map((_, i) => `'${uniqueCodes[i]}'`).join(",")})
        `);

        await transaction.commit();

        return booksResult.recordset || [];

    } catch (error: any) {
        if (transaction) await transaction.rollback();
        throwException(error.message || "Failed to process reservations", 500);
    }
}

export async function membershipPayment() {
    try {
        const pool = await getDbConnection();

        const result = await pool.request().query(`
            SELECT UG_MEMBERSHIPAMT
            FROM M_TBLUSERGROUPS
            WHERE UG_NAME = 'USER'
        `);

        return result.recordset[0] || null;

    } catch (error: any) {
        throwException(error.message || "Failed to fetch membership payment", error.status || 500);
    }
}

export async function checkUserCodeExist(code: string) {

    if (!code) {
        throwException("Invalid user code", 400);
    }

    try {
        const pool = await getDbConnection();

        const result = await pool.request()
            .input('code', code)
            .query(`
                SELECT U_CODE 
                FROM M_TBLUSERS 
                WHERE U_CODE = @code
            `);

        return {
            exists: (result.recordset.length > 0)
        };

    } catch (error: any) {
        throwException(error.message || "Failed to check user code", error.status || 500);
    }
}

export async function checkUserEligibility(code: string) {

    if (!code) throwException("Invalid user code", 400);

    try {
        const pool = await getDbConnection();

        const query = `
            SELECT
                U_CODE,
                U_MAXBORROW,

                ISNULL((
                           SELECT SUM(bd.BD_QTY - bd.BD_RETURNED_QTY)
                           FROM T_TBLBOOKBORROW_H bh
                                    JOIN T_TBLBOOKBORROW_D bd ON bh.BH_DOCNO = bd.BD_DOCNO
                           WHERE bh.BH_MEMBERCODE = u.U_CODE
                             AND bd.BD_STATUS IN ('O', 'P')
                       ), 0) AS CURRENT_BORROW_COUNT,

                ISNULL((
                           SELECT COUNT(*)
                           FROM T_TBLBOOKRESERVATIONS br
                           WHERE br.BR_USERCODE = u.U_CODE
                             AND br.BR_STATUS IN ('P', 'A')
                       ), 0) AS CURRENT_RESERVE_COUNT

            FROM M_TBLUSERS u
            WHERE u.U_CODE = @code
        `;

        const result = await pool.request()
            .input('code', code)
            .query(query);

        if (!result.recordset.length) {
            throwException("User not found", 404);
        }

        const stats = result.recordset[0];

        const maxReservationLimit = parseInt(process.env.MAX_RESERVATION_COUNT || "2");

        const currentBorrowed = stats.CURRENT_BORROW_COUNT;
        const currentReservations = stats.CURRENT_RESERVE_COUNT;

        // CORE RULES
        const hasReservationSlot = currentReservations < maxReservationLimit;

        const totalAfterReservation = currentBorrowed + currentReservations;
        const hasBorrowSlot = totalAfterReservation < stats.U_MAXBORROW;

        const isEligible = hasReservationSlot && hasBorrowSlot;

        let message = "Eligible";

        if (!hasReservationSlot) {
            message = `You have already added ${maxReservationLimit} reservations. Please borrow them first`;
        } else if (!hasBorrowSlot) {
            message = `You’ve reached your maximum borrowing limit (Max Limit: ${stats.U_MAXBORROW}). Please return some books to continue.`;
        }

        return {
            uCode: stats.U_CODE,
            isEligible,
            currentBorrowed,
            currentReservations,
            maxLimit: stats.U_MAXBORROW,
            maxResLimit: maxReservationLimit,
            message
        };

    } catch (error: any) {
        throwException(error.message || "Eligibility check failed", 500);
    }
}