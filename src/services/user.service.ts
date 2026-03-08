import { getDbConnection } from "@/lib/db";
import {throwException} from "@/lib/exceptions";

export async function getUserByCode(code: string) {
    const userCode = code;

    if (!userCode) {
        throwException("Invalid user code", 400);
    }

    try {
        const pool = await getDbConnection();
        const q = `SELECT * FROM M_TBLUSERS WHERE U_CODE = '${userCode.replace(/'/g, "''")}'`;

        const result = await pool.request().query(q);

        if (result.recordset.length === 0) {
            throwException("User not found", 400);
        }

        return result.recordset[0];

    } catch (error: unknown) {
        if (error instanceof Error) {
            // Optional: if your Error has a custom status property
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
        const uDob = data.U_DOB ? `'${new Date(data.U_DOB).toISOString()}'` : "NULL";
        const uGender = data.U_GENDER ? `'${data.U_GENDER}'` : "NULL";
        const uAddress = data.U_ADDRESS ? `'${data.U_ADDRESS.replace(/'/g, "''")}'` : "NULL";
        const uMobile = data.U_MOBILE ? `'${data.U_MOBILE}'` : "NULL";
        const uNic = data.U_NIC ? `'${data.U_NIC}'` : "NULL";
        const uEmail = data.U_EMAIL ? `'${data.U_EMAIL}'` : "NULL";

        const query = `UPDATE M_TBLUSERS
          SET
            U_NAME = ${uName},
            U_DOB = ${uDob},
            U_GENDER = ${uGender},
            U_ADDRESS = ${uAddress},
            U_MOBILE = ${uMobile},
            U_NIC = ${uNic},
            U_EMAIL = ${uEmail},
            M_DATE = GETDATE()
          WHERE U_CODE = '${code}'
        `;

        // Execute update
        await pool.request().query(query);

        // Return updated user
        const result = await pool
            .request()
            .query(`SELECT * FROM M_TBLUSERS WHERE U_CODE = '${code}'`);

        if (result.recordset.length === 0) {
            throwException("User not found", 400);
        }

        return result.recordset[0];

    } catch (error: any) {
        throwException(error.message || "Failed to update user", error.status || 500);
    }
}