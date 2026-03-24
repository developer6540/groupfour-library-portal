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

        return { message: "Password updated successfully" };

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

        for (const item of reservations) {
            // Validate hold days (max 3 as per your requirement)
            const holdDays = Math.min(item.BR_HOLD_DAYS, 3);

            // Calculate expiry date (Request Date + Hold Days)
            const expiresOn = new Date();
            expiresOn.setDate(expiresOn.getDate() + holdDays);

            const request = transaction.request();

            request.input('userCode', item.BR_USERCODE);
            request.input('bookCode', item.BR_BOOKCODE);
            request.input('qty', item.BR_QTY);
            request.input('holdDays', holdDays);
            request.input('expiresOn', expiresOn);
            request.input('remark', item.BR_REMARK || "");
            request.input('lineNo', item.BR_BORROW_LINENO);

            const query = `
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
                    '00001', 
                    @qty, 
                    @holdDays, 
                    GETDATE(), 
                    @remark, 
                    GETDATE(), 
                    @userCode, 
                    GETDATE(), 
                    @lineNo
                )
            `;

            await request.query(query);
        }

        await transaction.commit();
        return { success: true, message: "Reservations created successfully" };

    } catch (error: any) {
        if (transaction) await transaction.rollback();
        throwException(error.message || "Failed to process reservations", 500);
    }
}