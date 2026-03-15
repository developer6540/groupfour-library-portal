import { cookies } from "next/headers";

export async function setSessionServer(name: string, data: any, hours: number = 8) {
    const cookieStore = await cookies();
    const value = typeof data === 'object' ? JSON.stringify(data) : data;

    cookieStore.set({
        name: name,
        value: value,
        httpOnly: true, // Recommended for security
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * hours,
    });

}

export async function getSessionServer(name: string) {
    try {
        const cookieStore = await cookies();
        const cookie = cookieStore.get(name);
        return cookie?.value || null;
    } catch (error) {
        return null;
    }
}

export async function getCsrfToken() {
    let token = await getSessionServer("X-CSRF-Token");
    if (!token) {
        token = crypto.randomUUID();
        await setSessionServer("X-CSRF-Token", token);
    }
    return token;
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