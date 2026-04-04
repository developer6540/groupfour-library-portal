import { getDbConnection } from "@/lib/db";
import { throwException } from "@/lib/exceptions";
import Logger from "@/lib/logger";

export interface FeedbackPayload {
    FB_USER_ID: string;
    FB_BOOK_ID: string;
    FB_TYPE: string;
    FB_RATING: number;
    FB_SUBJECT: string;
    FB_MESSAGE: string;
}

export async function createFeedback(payload: FeedbackPayload) {
    const pool = await getDbConnection();

    const { FB_USER_ID, FB_BOOK_ID, FB_TYPE, FB_RATING, FB_SUBJECT, FB_MESSAGE } = payload;

    // Basic validation
    if (!FB_USER_ID || !FB_BOOK_ID || !FB_TYPE || !FB_RATING || !FB_SUBJECT || !FB_MESSAGE) {
        throwException("All feedback fields are required", 400);
    }

    if (FB_RATING < 1 || FB_RATING > 5) {
        throwException("Rating must be between 1 and 5", 400);
    }

    const transaction = pool.transaction();
    const now = new Date();

    try {
        await transaction.begin();

        await transaction.request()
            .input("FB_USER_ID", FB_USER_ID)
            .input("FB_BOOK_ID", FB_BOOK_ID)
            .input("FB_TYPE", FB_TYPE)
            .input("FB_RATING", FB_RATING)
            .input("FB_SUBJECT", FB_SUBJECT)
            .input("FB_MESSAGE", FB_MESSAGE)
            .input("FB_DATE", now.toISOString())
            .query(`
                INSERT INTO M_TBLFEEDBACK
                (
                  FB_USER_ID, FB_BOOK_ID, FB_TYPE, FB_RATING, FB_SUBJECT, FB_MESSAGE, FB_DATE
                )
                VALUES
                (
                  @FB_USER_ID, @FB_BOOK_ID, @FB_TYPE, @FB_RATING, @FB_SUBJECT, @FB_MESSAGE, @FB_DATE
                )
             `);

        await transaction.commit();

        return {};
    } catch (err: any) {
        await transaction.rollback();
        Logger.error("Error in createFeedback:", err);
        throwException("Failed to submit feedback. Please try again.", err.status || 500);
    }
}