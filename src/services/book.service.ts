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
        const activeOnly = searchParams.get("active") === "true" ? 1 : 0;

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
              AND (@AO = 0 OR ISNULL(B.B_ACTIVE,0) = 1)
              AND B.B_ACTIVE = 1
              AND BI.BI_ACTIVE = 1
              AND UL.UL_ACTIVE = 1
              AND (C.BC_ACTIVE = 1 OR C.BC_ACTIVE IS NULL)
        `;

        // DATA QUERY
        const request1 = pool.request();

        request1.input("T", title);
        request1.input("A", author);
        request1.input("I", isbn);
        request1.input("C", category);
        request1.input("AO", activeOnly);
        request1.input("UC", userCode);

        const dataQuery = `
            SELECT 
                B.B_CODE,
                B.B_TITLE,
                B.B_AUTHOR,
                B.B_PUBLISHER,
                B.B_ISBN,
                C.BC_NAME AS B_CATEGORY,
                B.B_PRICE,
                B.B_REPLACEMENT_COST,
                SUM(BI.BI_QTY) AS TOTAL_AVAILABLE_QTY,
                COUNT(DISTINCT BI.BI_LOCCODE) AS BRANCH_COUNT

            FROM M_TBLBOOKS B

            INNER JOIN T_TBLBOOKINVENTORY BI 
                ON B.B_CODE = BI.BI_BOOKCODE

            INNER JOIN M_TBLUSERLOCATION UL 
                ON BI.BI_LOCCODE = UL.UL_USERLOC

            LEFT JOIN M_TBLBOOKCATEGORY C
                ON B.B_CATEGORY = C.BC_CODE

            ${whereClause}

            GROUP BY 
                B.B_CODE,
                B.B_TITLE,
                B.B_AUTHOR,
                B.B_PUBLISHER,
                B.B_ISBN,
                C.BC_NAME,
                B.B_PRICE,
                B.B_REPLACEMENT_COST

            HAVING SUM(BI.BI_QTY) > 0

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
        request2.input("AO", activeOnly);
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