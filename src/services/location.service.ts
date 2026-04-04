import {getDbConnection} from "@/lib/db";
import {throwException} from "@/lib/exceptions";

export async function getLocations() {

    try {
        const pool = await getDbConnection();
        const q = `SELECT * FROM M_LOCATION`;

        const result = await pool.request().query(q);

        if (result.recordset.length === 0) {
            throwException("Locations not found", 400);
        }

        return result.recordset;

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
