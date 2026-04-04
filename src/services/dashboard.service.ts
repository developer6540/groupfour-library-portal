import { throwException } from "@/lib/exceptions";
import { getDbConnection } from "@/lib/db";
import sql from "mssql";

// ✅ Types
type DashboardCount = {
    TotalReservedBooks: number;
    TotalBooksRead: number;
    TotalBooksOverdue: number;
    TotalOverdueFines: number;
    PendingFines: number;
};

type MonthlyRead = {
    MonthNumber: number;
    BookCount: number;
};

type QueryResult = {
    recordsets: [DashboardCount[], MonthlyRead[]];
};

export async function getDashboardCounts(code: string) {
    if (!code) {
        throwException("Invalid user code", 400);
    }

    try {
        const pool = await getDbConnection();

        const request = pool.request();
        request.input("userCode", sql.VarChar, code);

        const query = `
            -- Dashboard counts
            SELECT
                (
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
                ) AS TotalBooksOverdue,

                (
                    SELECT ISNULL(SUM(d.FD_AMOUNT), 0)
                    FROM dbo.T_TBLMEMBERFINE_H h
                    JOIN dbo.T_TBLMEMBERFINE_D d ON d.FD_DOCNO = h.FH_DOCNO
                    WHERE h.FH_MEMBERCODE = @userCode
                      AND d.FD_FINE_TYPE IN ('O','L','D')
                ) AS TotalOverdueFines,

                (
                    SELECT ISNULL(SUM(d.FD_AMOUNT), 0)
                    FROM dbo.T_TBLMEMBERFINE_H h
                    JOIN dbo.T_TBLMEMBERFINE_D d ON d.FD_DOCNO = h.FH_DOCNO
                    WHERE h.FH_MEMBERCODE = @userCode
                      AND h.FH_STATUS IN ('P','T')
                ) AS PendingFines;

            -- Monthly reads
            SELECT
                MONTH(h.M_DATE) AS MonthNumber,
                SUM(CAST(ISNULL(d.RD_RETURN_QTY, 0) AS INT)) AS BookCount
            FROM dbo.T_TBLBOOKRETURN_H h
            JOIN dbo.T_TBLBOOKRETURN_D d ON d.RD_DOCNO = h.RH_DOCNO
            WHERE h.RH_MEMBERCODE = @userCode
              AND YEAR(h.M_DATE) = YEAR(GETDATE())
            GROUP BY MONTH(h.M_DATE)
            ORDER BY MonthNumber;
        `;

        const result = await request.query(query) as unknown as QueryResult;

        return {
            dashboard_count: result.recordsets?.[0]?.[0] ?? {
                TotalReservedBooks: 0,
                TotalBooksRead: 0,
                TotalBooksOverdue: 0,
                TotalOverdueFines: 0,
                PendingFines: 0
            },
            monthly_reads: result.recordsets?.[1] ?? []
        };

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Database error";
        const status = (error as any)?.status || 500;
        throwException(message, status);
    }
}