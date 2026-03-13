import { cookies } from "next/headers";

export async function getSessionServer(name: string) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(name);
        return cookie?.value || null;
    } catch (error) {
        return null;
    }
}

export async function getUserCodeServer() {
    const data = await getSessionServer("user-info");
    if (!data) return null;
    try {
        const parsed = JSON.parse(data);
        return parsed?.U_CODE || null;
    } catch {
        return null;
    }
}