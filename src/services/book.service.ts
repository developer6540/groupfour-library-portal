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

        const clean = (val: string | null) => (val ? val.replace(/^'|'$/g, "") : "");

        const title = clean(searchParams.get("title")) || "";
        const author = clean(searchParams.get("author")) || "";
        const isbn = clean(searchParams.get("isbn")) || "";
        const category = clean(searchParams.get("category")) || null;

        const page = options.page && options.page > 0 ? options.page : 1;
        const pageSize = options.pageSize && options.pageSize > 0 ? options.pageSize : 12;
        const offset = (page - 1) * pageSize;

        request.input("title", `%${title}%`);
        request.input("author", `%${author}%`);
        request.input("isbn", `%${isbn}%`);
        if (category) request.input("category", category);

        let query = `
            SELECT
                B.B_CODE,
                B.B_TITLE,
                B.B_AUTHOR,
                B.B_PUBLISHER,
                B.B_ISBN,
                C.BC_NAME AS CATEGORY,
                B.B_PRICE,
                B.B_ACTIVE,
                B.M_DATE
            FROM LibraryMS.dbo.M_TBLBOOKS B
                     LEFT JOIN LibraryMS.dbo.M_TBLBOOKCATEGORY C ON B.B_CATEGORY = C.BC_CODE
            WHERE B.B_TITLE LIKE @title
              AND B.B_AUTHOR LIKE @author
              AND B.B_ISBN LIKE @isbn
        `;

        if (category) query += ` AND B.B_CATEGORY = @category`;

        // Using parameters for pagination
        query += ` ORDER BY B.B_TITLE
                   OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY;`;

        // =============== DEBUG QUERY ==========================
        const values = {
            title: `%${title}%`,
            author: `%${author}%`,
            isbn: `%${isbn}%`,
            category: category
        };
        let debugQuery = query;
        Object.keys(values).forEach(key => {
            const val = values[key as keyof typeof values];
            const formattedVal = typeof val === 'string' ? `'${val}'` : val;
            debugQuery = debugQuery.replace(new RegExp(`@${key}`, 'g'), formattedVal ?? 'NULL');
        });
        console.log(debugQuery);
        // =============== DEBUG QUERY ==========================

        const result = await request.query(query);

        let countQuery = `
            SELECT COUNT(*) AS total
            FROM LibraryMS.dbo.M_TBLBOOKS B
            WHERE B.B_TITLE LIKE @title
              AND B.B_AUTHOR LIKE @author
              AND B.B_ISBN LIKE @isbn
        `;
        if (category) countQuery += ` AND B.B_CATEGORY = @category`;

        const countResult = await request.query(countQuery);
        const total = countResult.recordset[0]?.total || 0;

        if (!result.recordset || result.recordset.length === 0) {
            // We explicitly throw here so TS knows this path is handled
            throw throwException("Books not found", 404);
        }

        return { data: result.recordset, total };

    } catch (error: any) {
        // Re-throwing or calling a function that throws satisfies the return type requirement
        throw throwException(error.message || "Database error", error.status || 500);
    }
}