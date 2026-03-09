import { getDbConnection } from "@/lib/db";
import { throwException } from "@/lib/exceptions";

export async function getAllBookCategories() {
    try {
        const pool = await getDbConnection();
        const request = pool.request();

        const query = `
            SELECT 
                BC_CODE, 
                BC_NAME
            FROM dbo.M_TBLBOOKCATEGORY
            WHERE ISNULL(BC_ACTIVE, 0) = 1
            ORDER BY BC_NAME;
        `;

        const result = await request.query(query);

        if (!result.recordset || result.recordset.length === 0) {
            // It's often better to return an empty array for categories
            // than to throw a 404, so the UI can still render.
            return [];
        }

        return result.recordset;

    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}