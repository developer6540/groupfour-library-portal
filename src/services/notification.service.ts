import { cookies } from "next/headers";
import logger from "@/lib/logger";
import { getUserCode } from "@/lib/server-utility";

export type Notification = {
    user_code: string;
    title: string;
    message: string;
    status: boolean;
    time: string;
};

// Add new notification (MAIN)
export async function pushNotification(data: {
    title: string;
    message: string;
}): Promise<Notification[]> {
    try {
        if (!data.title?.trim() || !data.message?.trim()) {
            logger.error("Invalid notification data");
            return [];
        }

        const cookieStore = await cookies();
        const cookie = cookieStore.get("notifications");

        let existing: Notification[] = [];

        if (cookie?.value) {
            existing = JSON.parse(cookie.value);
        }

        const newNotification: Notification = {
            user_code: await getUserCode(),
            title: data.title.trim(),
            message: data.message.trim(),
            status: true,
            time: new Date().toISOString(),
        };

        // Prevent duplicates
        const updated = [
            newNotification,
            ...existing.filter(
                (n) =>
                    !(n.title === newNotification.title &&
                        n.message === newNotification.message)
            ),
        ].slice(0, 20);

        // Save cookie
        cookieStore.set("notifications", JSON.stringify(updated), {
            path: "/",
        });

        return updated;
    } catch (error) {
        logger.error("pushNotification error:", error);
        return [];
    }
}

// Only read notifications
export async function getNotifications(): Promise<Notification[]> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("notifications");

        if (!cookie?.value) return [];

        return JSON.parse(cookie.value);
    } catch (error) {
        logger.error("getNotifications error:", error);
        return [];
    }
}

// Mark all notifications read
export async function markAllNotificationsRead(): Promise<Notification[]> {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get("notifications");

        if (!cookie?.value) return [];

        let notifications: Notification[] = JSON.parse(cookie.value);

        // Set all status = false
        notifications = notifications.map(n => ({ ...n, status: false }));

        // Save updated notifications back to cookie
        cookieStore.set("notifications", JSON.stringify(notifications), {
            path: "/",
        });

        return notifications;
    } catch (error) {
        logger.error("markAllNotificationsRead error:", error);
        return [];
    }
}