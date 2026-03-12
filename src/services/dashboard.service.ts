import {throwException} from "@/lib/exceptions";
import {getDbConnection} from "@/lib/db";

export async function getDashboardCounts(code: string) {
    if (!code) {
        throwException("Invalid user code", 400);
    }

    try {
        const pool = await getDbConnection();
        const request = pool.request();

        request.input('userCode', code);

        // fetch all Dashboard Counts in parallel for efficiency
        const query = `
            SELECT (
                SELECT ISNULL(SUM(BR_QTY), 0)
                FROM dbo.T_TBLBOOKRESERVATIONS
                WHERE BR_USERCODE = @userCode
                  AND BR_STATUS = 'A'
                  AND BR_EXPIRES_ON >= CONVERT(date, SYSDATETIME())
            ) AS TotalReservedBooks,
            (
                SELECT ISNULL(SUM(d.RD_RETURN_QTY), 0)
                FROM dbo.T_TBLBOOKRETURN_H h
                JOIN dbo.T_TBLBOOKRETURN_D d ON d.RD_DOCNO = h.RH_DOCNO
                WHERE h.RH_MEMBERCODE = @userCode
            ) AS TotalBooksRead,
            (
                SELECT ISNULL(SUM(d.RD_RETURN_QTY), 0)
                FROM dbo.T_TBLBOOKRETURN_H h
                JOIN dbo.T_TBLBOOKRETURN_D d ON d.RD_DOCNO = h.RH_DOCNO
                WHERE h.RH_MEMBERCODE = @userCode
                  AND d.RD_CONDITION IN ('O', 'P')
                  AND ISNULL(d.RD_RETURN_QTY, 0) > 0
            ) AS TotalBooksOverdue
        `;

        const result = await request.query(query);
        return result.recordset[0];

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Database error";
        const status = (error as any)?.status || 500;
        throwException(message, status);
    }
}