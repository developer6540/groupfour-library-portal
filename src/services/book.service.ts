import { getDbConnection } from "@/lib/db";
import { throwException } from "@/lib/exceptions";

// ─── Approval Record ────────────────────────────────────────────────────────

export interface ApprovalInsertDto {
    userCode:      string;
    userUid?:      string | null;
    name:          string;
    mobile?:       string | null;
    groupCode:     string;
    subType?:      string | null;
    paidAmt:       number;
    dueAmt:        number;
    paymentMethod?: string | null;
    referenceNo?:  string | null;
    approvedBy?:   string | null;
    apDate?:       Date;
    processed:     boolean;
    canceled:      boolean;
}

/**
 * Inserts a record into dbo.T_TBLAPPROVAL and returns the generated AP_ID.
 * Must be called inside an existing transaction.
 */
export async function insertApprovalRecord(dto: ApprovalInsertDto): Promise<string> {
    const pool = await getDbConnection();

    const idResult = await pool.request().query(`
        SELECT 'AP' + RIGHT('00000000' + CAST(
            ISNULL(MAX(TRY_CAST(SUBSTRING(AP_ID,3,8) AS INT)),0) + 1 AS VARCHAR(8)), 8)
        FROM dbo.T_TBLAPPROVAL WITH (UPDLOCK, HOLDLOCK)
        WHERE AP_ID LIKE 'AP[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
    `);

    const apId: string = Object.values(idResult.recordset[0])[0] as string ?? "AP00000001";

    await pool.request()
        .input("AP_ID",            apId)
        .input("AP_U_ID",          dto.userCode)
        .input("AP_U_UID",         dto.userUid         ?? null)
        .input("AP_NAME",          dto.name)
        .input("AP_MOBILE",        dto.mobile          ?? null)
        .input("AP_GROUP",         dto.groupCode)
        .input("AP_SUBSTYPE",      dto.subType         ?? null)
        .input("AP_PAIDAMT",       dto.paidAmt)
        .input("AP_DUEAMT",        dto.dueAmt)
        .input("AP_PAYMENTMETHOD", dto.paymentMethod   ?? null)
        .input("AP_REFERENCENO",   dto.referenceNo     ?? null)
        .input("AP_APPROVEDBY",    dto.approvedBy      ?? null)
        .input("AP_DATE",          dto.apDate ?? new Date())
        .input("AP_PROCCESS",      dto.processed ? 1 : 0)
        .input("AP_CALCEL",        dto.canceled  ? 1 : 0)
        .query(`
            INSERT INTO dbo.T_TBLAPPROVAL
                (AP_ID, AP_U_ID, AP_U_UID, AP_NAME, AP_MOBILE, AP_GROUP, AP_SUBSTYPE,
                 AP_PAIDAMT, AP_DUEAMT, AP_PAYMENTMETHOD, AP_REFERENCENO, AP_APPROVEDBY,
                 AP_DATE, AP_PROCCESS, AP_CALCEL)
            VALUES
                (@AP_ID, @AP_U_ID, @AP_U_UID, @AP_NAME, @AP_MOBILE, @AP_GROUP, @AP_SUBSTYPE,
                 @AP_PAIDAMT, @AP_DUEAMT, @AP_PAYMENTMETHOD, @AP_REFERENCENO, @AP_APPROVEDBY,
                 @AP_DATE, @AP_PROCCESS, @AP_CALCEL)
        `);

    return apId;
}

interface BooksResult {
    data: any[];
    total: number;
}

interface GetBooksOptions {
    page?: number;
    pageSize?: number;
    userCode: string;
}

interface GetBooksBorrowOptions {
    page?: number;
    pageSize?: number;
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
                BI.BI_LOCCODE,
                ISNULL((
                   SELECT CAST(AVG(CAST(FB_RATING AS DECIMAL(10))) AS DECIMAL(10))
                   FROM M_TBLFEEDBACK
                   WHERE FB_BOOK_ID = B.B_CODE
                ), 0) AS STAR_RATE

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
    options: GetBooksBorrowOptions
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
              -- Exclude cancelled / bulk-uploaded records; only show real borrow activity
              AND d.BD_STATUS IN ('O', 'L', 'R')
              -- Exclude rows where the borrow date is missing or invalid
              AND h.BH_BORROWDATE IS NOT NULL
              -- Exclude rows where due date precedes the borrow date (data-entry errors)
              AND (d.BD_DUEDATE IS NULL OR d.BD_DUEDATE >= h.BH_BORROWDATE)
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
): Promise<{ applied: number; finesSettled: number; approvalId: string | null }> {
    try {
        if (!memberCode?.trim() || amount <= 0)
            throw throwException("Invalid member or amount", 400);

        const pool = await getDbConnection();

        // 0. Fetch member info for the approval record
        const memberResult = await pool.request()
            .input("MC", memberCode.trim())
            .query(`
                SELECT U_CODE, U_NAME, U_MOBILE, U_GROUP, U_SUBSTYPE
                FROM dbo.M_TBLUSERS
                WHERE U_CODE = @MC
            `);
        const member = memberResult.recordset[0];

        // 1. Fetch all outstanding fine headers for this member, oldest first
        const outstanding = await pool.request()
            .input("MC", memberCode.trim())
            .query(`
                SELECT FH_DOCNO, FH_BALANCE
                FROM dbo.T_TBLMEMBERFINE_H
                WHERE FH_MEMBERCODE = @MC AND FH_BALANCE > 0
                ORDER BY FH_FINE_DATE ASC
            `);

        let remaining    = amount;
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

        const applied = amount - remaining;

        // 4. Insert approval record for the payment
        let approvalId: string | null = null;
        if (applied > 0 && member) {
            approvalId = await insertApprovalRecord({
                userCode:      member.U_CODE,
                userUid:       member.U_CODE,
                name:          member.U_NAME,
                mobile:        member.U_MOBILE ?? null,
                groupCode:     member.U_GROUP  ?? "USER",
                subType:       member.U_SUBSTYPE ?? null,
                paidAmt:       applied,
                dueAmt:        0,
                paymentMethod: payMode || "CARD",
                referenceNo:   refNo   ?? null,
                approvedBy:    "PORTAL",
                apDate:        new Date(),
                processed:     true,
                canceled:      false,
            });
        }

        return { applied, finesSettled, approvalId };
    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}

export async function processBookReturn(
    docNo: string,
    lineNo: number,
    memberCode: string
): Promise<void> {
    try {
        const pool = await getDbConnection();

        const check = await pool.request()
            .input("DOCNO", docNo)
            .input("LINENO", lineNo)
            .input("MC", memberCode.trim())
            .query(`
                SELECT d.BD_STATUS, d.BD_QTY
                FROM dbo.T_TBLBOOKBORROW_D d
                INNER JOIN dbo.T_TBLBOOKBORROW_H h ON h.BH_DOCNO = d.BD_DOCNO
                WHERE d.BD_DOCNO = @DOCNO
                  AND d.BD_LINENO = @LINENO
                  AND h.BH_MEMBERCODE = @MC
            `);

        if (!check.recordset.length) {
            throw throwException("Borrow record not found", 404);
        }

        const { BD_STATUS, BD_QTY } = check.recordset[0];

        if (BD_STATUS === 'R' || BD_STATUS === 'C') {
            throw throwException("Book has already been returned or cancelled", 400);
        }

        await pool.request()
            .input("DOCNO", docNo)
            .input("LINENO", lineNo)
            .input("QTY", BD_QTY)
            .query(`
                UPDATE dbo.T_TBLBOOKBORROW_D
                SET BD_STATUS = 'R',
                    BD_RETURNED_QTY = @QTY,
                    M_DATE = GETDATE()
                WHERE BD_DOCNO = @DOCNO AND BD_LINENO = @LINENO
            `);

        await pool.request()
            .input("DOCNO", docNo)
            .query(`
                UPDATE dbo.T_TBLBOOKBORROW_H
                SET BH_STATUS = 'R', M_DATE = GETDATE()
                WHERE BH_DOCNO = @DOCNO
                  AND NOT EXISTS (
                      SELECT 1 FROM dbo.T_TBLBOOKBORROW_D
                      WHERE BD_DOCNO = @DOCNO AND BD_STATUS NOT IN ('R', 'C')
                  )
            `);

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