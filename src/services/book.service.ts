import { getDbConnection } from "@/lib/db";
import { throwException } from "@/lib/exceptions";

interface BooksResult {
    data: any[];
    total: number;
}

interface GetBooksOptions {
    page?: number;
    pageSize?: number;
}

export async function getAllBooks(
    searchParams: URLSearchParams,
    options: GetBooksOptions = {}
): Promise<BooksResult> {
    try {
        const pool = await getDbConnection();
        const request = pool.request();

        // Extract and Clean Inputs
        // search term (code, title, or isbn)
        const searchTerm = searchParams.get("t")?.trim() || null;
        const category = searchParams.get("category")?.trim() || null;
        // 'activeOnly' - assuming 1 for active, 0 for all
        const activeOnly = searchParams.get("active") === "true" ? 1 : 0;

        const page = options.page && options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 12;
        const offset = (page - 1) * pageSize;

        // Set SQL Inputs
        request.input("T", searchTerm);
        request.input("C", category);
        request.input("AO", activeOnly);

        // Define Base Filter (to keep code DRY)
        const whereClause = `
            WHERE (@T IS NULL OR b.B_CODE LIKE '%' + @T + '%' 
                             OR b.B_TITLE LIKE '%' + @T + '%' 
                             OR ISNULL(b.B_ISBN,'') LIKE '%' + @T + '%')
              AND (@C IS NULL OR b.B_CATEGORY = @C)
              AND (@AO = 0 OR ISNULL(b.B_ACTIVE, 0) = 1)
        `;

        // Execute Data Query
        const dataQuery = `
            SELECT
                b.B_CODE, b.B_TITLE, b.B_AUTHOR, b.B_PUBLISHER, b.B_ISBN,
                c.BC_NAME AS 'B_CATEGORY', ISNULL(b.B_PRICE, 0) AS B_PRICE, ISNULL(b.B_ACTIVE, 0) AS B_ACTIVE
            FROM dbo.M_TBLBOOKS b
                     LEFT JOIN dbo.M_TBLBOOKCATEGORY c ON c.BC_CODE = b.B_CATEGORY
                ${whereClause}
            ORDER BY b.B_TITLE
            OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;
        `;

        const result = await request.query(dataQuery);

        // Execute Count Query for Pagination
        const countQuery = `SELECT COUNT(*) AS total FROM dbo.M_TBLBOOKS b ${whereClause}`;
        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        if (!result.recordset || result.recordset.length === 0) {
            throw throwException("No books found matching your criteria", 404);
        }

        return { data: result.recordset, total };

    } catch (error: any) {
        throw throwException(error.message || "Database error", error.status || 500);
    }
}