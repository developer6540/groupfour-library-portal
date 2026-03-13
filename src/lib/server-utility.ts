import { cookies } from "next/headers";

export async function getUserCode() {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get("user-info");

        if (!sessionCookie || !sessionCookie.value) return null;

        const userData = JSON.parse(sessionCookie.value);
        return userData?.U_CODE || null;
    } catch (error) {
        console.error("Server-side session error:", error);
        return null;
    }
}