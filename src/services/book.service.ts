import { getDbConnection } from "@/lib/db";
import { throwException } from "@/lib/exceptions";

interface BooksResult {
    data: any[];
    total: number;
}

interface GetBooksOptions {
    page?: number;
    pageSize?: number;
    userCode: string;
}

export async function getAllBooks(
    searchParams: URLSearchParams,
    options: GetBooksOptions
): Promise<BooksResult> {
    try {
        const pool = await getDbConnection();

        const title = searchParams.get("title")?.trim() || null;
        const author = searchParams.get("author")?.trim() || null;
        const isbn = searchParams.get("isbn")?.trim() || null;
        const category = searchParams.get("category")?.trim() || null;

        const userCode = options.userCode;

        const page = options.page && options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 12;
        const offset = (page - 1) * pageSize;

        const whereClause = `
            WHERE UL.UL_USERCODE = @UC
              AND (@T IS NULL OR B.B_TITLE LIKE '%' + @T + '%')
              AND (@A IS NULL OR ISNULL(B.B_AUTHOR,'') LIKE '%' + @A + '%')
              AND (@I IS NULL OR ISNULL(B.B_ISBN,'') LIKE '%' + @I + '%')
              AND (@C IS NULL OR B.B_CATEGORY = @C)
              AND B.B_ACTIVE = 1
              AND BI.BI_ACTIVE = 1
              AND UL.UL_ACTIVE = 1
              AND BI.BI_QTY > 0
        `;

        // DATA QUERY
        const request1 = pool.request();

        request1.input("T", title);
        request1.input("A", author);
        request1.input("I", isbn);
        request1.input("C", category);
        request1.input("UC", userCode);

        const dataQuery = `
            SELECT
                B.B_CODE,
                B.B_TITLE,
                B.B_AUTHOR,
                B.B_PUBLISHER,
                B.B_ISBN,
                C.BC_NAME AS B_CATEGORY,
                BI.BI_QTY,
                BI.BI_LOCCODE

            FROM M_TBLBOOKS B
            INNER JOIN T_TBLBOOKINVENTORY BI
               ON B.B_CODE = BI.BI_BOOKCODE
            INNER JOIN M_TBLUSERLOCATION UL
               ON BI.BI_LOCCODE = UL.UL_USERLOC
            INNER JOIN M_TBLBOOKCATEGORY C
               ON B.B_CATEGORY = C.BC_CODE

            ${whereClause}

            ORDER BY B.B_TITLE
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY
        `;

        const result = await request1.query(dataQuery);

        // COUNT QUERY
        const request2 = pool.request();

        request2.input("T", title);
        request2.input("A", author);
        request2.input("I", isbn);
        request2.input("C", category);
        request2.input("UC", userCode);

        const countQuery = `
            SELECT COUNT(*) AS total FROM (
                SELECT B.B_CODE
                FROM M_TBLBOOKS B

                INNER JOIN T_TBLBOOKINVENTORY BI 
                    ON B.B_CODE = BI.BI_BOOKCODE

                INNER JOIN M_TBLUSERLOCATION UL 
                    ON BI.BI_LOCCODE = UL.UL_USERLOC

                LEFT JOIN M_TBLBOOKCATEGORY C
                    ON B.B_CATEGORY = C.BC_CODE

                ${whereClause}

                GROUP BY B.B_CODE
                HAVING SUM(BI.BI_QTY) > 0
            ) AS X
        `;

        const countResult = await request2.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        return {
            data: result.recordset || [],
            total
        };

    } catch (error: any) {
        throw throwException(
            error.message || "Database error",
            error.status || 500
        );
    }
}

export async function getAllReturnBooks(
    searchParams: URLSearchParams,
    options: GetBooksOptions
): Promise<BooksResult> {
    try {
        const pool = await getDbConnection();

        const title = searchParams.get("title")?.trim() || null;
        const author = searchParams.get("author")?.trim() || null;
        const isbn = searchParams.get("isbn")?.trim() || null;
        const category = searchParams.get("category")?.trim() || null;

        const userCode = options.userCode;

        const page = options.page && options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 12;
        const offset = (page - 1) * pageSize;

        const whereClause = `
            WHERE H.RH_MEMBERCODE = @UC
              AND (@T IS NULL OR B.B_TITLE LIKE '%' + @T + '%')
              AND (@A IS NULL OR ISNULL(B.B_AUTHOR,'') LIKE '%' + @A + '%')
              AND (@I IS NULL OR ISNULL(B.B_ISBN,'') LIKE '%' + @I + '%')
              AND (@C IS NULL OR B.B_CATEGORY = @C)
              AND B.B_ACTIVE = 1
        `;

        const request1 = pool.request();

        request1.input("T", title);
        request1.input("A", author);
        request1.input("I", isbn);
        request1.input("C", category);
        request1.input("UC", userCode);

        const dataQuery = `
            SELECT
                B.B_CODE,
                B.B_TITLE,
                B.B_AUTHOR,
                B.B_PUBLISHER,
                B.B_ISBN,
                C.BC_NAME AS B_CATEGORY
             FROM dbo.T_TBLBOOKRETURN_H H
             INNER JOIN dbo.T_TBLBOOKRETURN_D D
                ON H.RH_DOCNO = D.RD_DOCNO
             INNER JOIN dbo.M_TBLBOOKS B
                ON D.RD_BOOKCODE = B.B_CODE
             LEFT JOIN dbo.M_TBLBOOKCATEGORY C
                ON B.B_CATEGORY = C.BC_CODE

                ${whereClause}

             GROUP BY
                B.B_CODE,
                B.B_TITLE,
                B.B_AUTHOR,
                B.B_PUBLISHER,
                B.B_ISBN,
                C.BC_NAME

             ORDER BY B.B_TITLE
             OFFSET @OFFSET ROWS FETCH NEXT @PAGE_SIZE ROWS ONLY
        `;

        request1.input("OFFSET", offset);
        request1.input("PAGE_SIZE", pageSize);

        const result = await request1.query(dataQuery);

        const request2 = pool.request();

        request2.input("T", title);
        request2.input("A", author);
        request2.input("I", isbn);
        request2.input("C", category);
        request2.input("UC", userCode);

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM (SELECT B.B_CODE
                  FROM dbo.T_TBLBOOKRETURN_H H
                           INNER JOIN dbo.T_TBLBOOKRETURN_D D
                                      ON H.RH_DOCNO = D.RD_DOCNO
                           INNER JOIN dbo.M_TBLBOOKS B
                                      ON D.RD_BOOKCODE = B.B_CODE
                           INNER JOIN dbo.M_TBLUSERLOCATION UL
                                      ON H.RH_LOCCODE = UL.UL_USERLOC
                           LEFT JOIN dbo.M_TBLBOOKCATEGORY C
                                     ON B.B_CATEGORY = C.BC_CODE
                      ${whereClause}

                  GROUP BY B.B_CODE) AS X
        `;

        const countResult = await request2.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        return {
            data: result.recordset || [],
            total
        };

    } catch (error: any) {
        throw throwException(
            error.message || "Database error",
            error.status || 500
        );
    }
}

export async function getBorrowedBooks(
    searchParams: URLSearchParams,
    options: GetBooksOptions
): Promise<BooksResult> {
    try {
        const pool = await getDbConnection();
        const request = pool.request();

        const searchTerm = searchParams.get("t")?.trim() || null;
        const memberCode = searchParams.get("member")?.trim() || null;

        const page = options.page && options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 12;
        const offset = (page - 1) * pageSize;

        request.input("T", searchTerm);
        request.input("MC", memberCode);

        const whereClause = `
            WHERE (@T IS NULL
                   OR b.B_TITLE LIKE '%' + @T + '%'
                   OR b.B_AUTHOR LIKE '%' + @T + '%'
                   OR ISNULL(b.B_ISBN,'') LIKE '%' + @T + '%')
              AND (@MC IS NULL OR h.BH_MEMBERCODE = @MC)
        `;

        const dataQuery = `
            SELECT
                h.BH_DOCNO,
                h.BH_MEMBERCODE,
                h.BH_BORROWDATE,
                h.BH_STATUS         AS BH_STATUS,
                d.BD_LINENO,
                d.BD_BOOKCODE,
                d.BD_QTY,
                d.BD_RETURNED_QTY,
                d.BD_DUEDATE,
                d.BD_STATUS         AS BD_STATUS,
                d.BD_REMARK,
                b.B_TITLE,
                b.B_AUTHOR,
                b.B_PUBLISHER,
                b.B_ISBN,
                c.BC_NAME           AS B_CATEGORY,
                ISNULL(
                    (SELECT CAST(AVG(CAST(f.FB_RATING AS FLOAT)) AS DECIMAL(3,1))
                     FROM dbo.M_TBLFEEDBACK f
                     WHERE TRY_CAST(f.FB_BOOK_ID AS VARCHAR) = b.B_CODE
                        OR f.FB_BOOK_ID = TRY_CAST(b.B_CODE AS INT)), 0
                ) AS AVG_RATING,
                ISNULL(
                    (SELECT COUNT(*)
                     FROM dbo.M_TBLFEEDBACK f
                     WHERE TRY_CAST(f.FB_BOOK_ID AS VARCHAR) = b.B_CODE
                        OR f.FB_BOOK_ID = TRY_CAST(b.B_CODE AS INT)), 0
                ) AS RATING_COUNT
            FROM dbo.T_TBLBOOKBORROW_H h
            INNER JOIN dbo.T_TBLBOOKBORROW_D d ON d.BD_DOCNO = h.BH_DOCNO
            INNER JOIN dbo.M_TBLBOOKS b          ON b.B_CODE  = d.BD_BOOKCODE
            LEFT  JOIN dbo.M_TBLBOOKCATEGORY c   ON c.BC_CODE = b.B_CATEGORY
            ${whereClause}
            ORDER BY h.BH_BORROWDATE DESC, h.BH_DOCNO, d.BD_LINENO
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
        `;

        const countQuery = `
            SELECT COUNT(*) AS total
            FROM dbo.T_TBLBOOKBORROW_H h
            INNER JOIN dbo.T_TBLBOOKBORROW_D d ON d.BD_DOCNO = h.BH_DOCNO
            INNER JOIN dbo.M_TBLBOOKS b          ON b.B_CODE  = d.BD_BOOKCODE
            ${whereClause}
        `;

        const result = await request.query(dataQuery);
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        return { data: result.recordset || [], total };

    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}

export async function getMemberFineSummary(memberCode: string): Promise<{
    totalFine: number;
    totalPaid: number;
    totalBalance: number;
    records: any[];
}> {
    try {
        if (!memberCode?.trim()) return { totalFine: 0, totalPaid: 0, totalBalance: 0, records: [] };

        const pool = await getDbConnection();
        const request = pool.request();
        request.input("MC", memberCode.trim());

        const result = await request.query(`
            SELECT
                ISNULL(SUM(FH_TOTAL),   0) AS totalFine,
                ISNULL(SUM(FH_PAID),    0) AS totalPaid,
                ISNULL(SUM(CASE WHEN FH_BALANCE > 0 THEN FH_BALANCE ELSE 0 END), 0) AS totalBalance
            FROM dbo.T_TBLMEMBERFINE_H
            WHERE FH_MEMBERCODE = @MC
        `);

        const row = result.recordset[0];
        return {
            totalFine:    parseFloat(row?.totalFine    || 0),
            totalPaid:    parseFloat(row?.totalPaid    || 0),
            totalBalance: parseFloat(row?.totalBalance || 0),
            records: [],
        };
    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}

export async function recordFinePayment(
    memberCode: string,
    amount: number,
    payMode: string,
    refNo: string | null
): Promise<{ applied: number; finesSettled: number }> {
    try {
        if (!memberCode?.trim() || amount <= 0)
            throw throwException("Invalid member or amount", 400);

        const pool = await getDbConnection();

        // 1. Fetch all outstanding fine headers for this member, oldest first
        const outstanding = await pool.request()
            .input("MC", memberCode.trim())
            .query(`
                SELECT FH_DOCNO, FH_BALANCE
                FROM dbo.T_TBLMEMBERFINE_H
                WHERE FH_MEMBERCODE = @MC AND FH_BALANCE > 0
                ORDER BY FH_FINE_DATE ASC
            `);

        let remaining   = amount;
        let finesSettled = 0;

        for (const row of outstanding.recordset) {
            if (remaining <= 0) break;

            const applyAmount = Math.min(remaining, parseFloat(row.FH_BALANCE));
            remaining        -= applyAmount;

            // 2. Insert payment record
            await pool.request()
                .input("DOCNO",   row.FH_DOCNO)
                .input("AMOUNT",  applyAmount)
                .input("MODE",    payMode || "CARD")
                .input("REFNO",   refNo || null)
                .query(`
                    INSERT INTO dbo.T_TBLMEMBERFINE_PAYMENTS
                        (FP_FINE_DOCNO, FP_PAY_DATE, FP_PAY_MODE, FP_AMOUNT, FP_REFNO, FP_STATUS, FP_RECEIVED_BY, M_DATE)
                    VALUES
                        (@DOCNO, GETDATE(), @MODE, @AMOUNT, @REFNO, 'P', 'PORTAL', GETDATE())
                `);

            // 3. Update fine header balance
            await pool.request()
                .input("DOCNO",  row.FH_DOCNO)
                .input("AMOUNT", applyAmount)
                .query(`
                    UPDATE dbo.T_TBLMEMBERFINE_H
                    SET FH_PAID    = FH_PAID + @AMOUNT,
                        FH_BALANCE = FH_BALANCE - @AMOUNT,
                        FH_STATUS  = CASE WHEN (FH_BALANCE - @AMOUNT) <= 0 THEN 'D' ELSE FH_STATUS END,
                        M_DATE     = GETDATE()
                    WHERE FH_DOCNO = @DOCNO
                `);

            if (parseFloat(row.FH_BALANCE) - applyAmount <= 0) finesSettled++;
        }

        return { applied: amount - remaining, finesSettled };
    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}

export async function getDueNotifications(memberCode: string): Promise<any[]> {
    try {
        if (!memberCode?.trim()) return [];
        const pool = await getDbConnection();
        const result = await pool.request()
            .input("MC", memberCode.trim())
            .query(`
                SELECT
                    h.BH_DOCNO,
                    d.BD_BOOKCODE,
                    d.BD_DUEDATE,
                    d.BD_STATUS,
                    b.B_TITLE,
                    b.B_AUTHOR,
                    DATEDIFF(day, GETDATE(), d.BD_DUEDATE) AS DAYS_LEFT
                FROM dbo.T_TBLBOOKBORROW_H h
                JOIN dbo.T_TBLBOOKBORROW_D d ON d.BD_DOCNO = h.BH_DOCNO
                JOIN dbo.M_TBLBOOKS b         ON b.B_CODE   = d.BD_BOOKCODE
                WHERE h.BH_MEMBERCODE = @MC
                  AND d.BD_STATUS NOT IN ('R','C')
                  AND DATEDIFF(day, GETDATE(), d.BD_DUEDATE) <= 7
                ORDER BY d.BD_DUEDATE ASC
            `);
        return result.recordset || [];
    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}