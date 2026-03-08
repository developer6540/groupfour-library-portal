import { getDbConnection } from "@/lib/db";
import {throwException} from "@/lib/exceptions";

export async function getAlBooks(code: string) {
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
