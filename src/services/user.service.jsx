import { getDbConnection } from "../lib/db";
import {throwException} from "../lib/exceptions";

export async function getUserByCode(code) {

    const userCode = code;
    console.log("User Code:", userCode);

    if (userCode == null) {
        throwException("Invalid user code", 400);
    }

    try {
        const pool = await getDbConnection();
        const q = `SELECT * FROM M_TBLUSERS WHERE U_CODE = '${userCode}'`;

        const result = await pool
            .request()
            .query(q);

        if (result.recordset.length === 0) {
            throwException("User not found", 400);
        }
        return result.recordset[0];

    } catch (error) {
        throwException(error.message || "Database error", error.status || 500);
    }
}