'use server'

import { cookies } from "next/headers";
import {setSessionServer} from "@/lib/session-server";
import moment from "moment/moment";

export async function getBaseUrl(){
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export async function getDateISO(date: string | Date): Promise<string | null> {
    if (!date) return null;
    const m = moment(date, ["DD/MM/YYYY", moment.ISO_8601], true);
    if (!m.isValid()) {
        console.error("Invalid date encountered:", date);
        return null;
    }
    const sqlFriendlyDate = m.format('YYYY-MM-DD');
    console.log('Formatted for SQL:', sqlFriendlyDate);
    return sqlFriendlyDate;
}

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

export async function getUserInfo() {
    const cookieStore = await cookies();
    const userInfo = cookieStore.get('user-info');

    if (!userInfo) {
        return null;
    }

    try {
        return JSON.parse(userInfo.value);
    } catch (e) {
        return userInfo.value;
    }
}

export async function setUserInfo(updatedData: any) {
    try {
        const cookieValue = typeof updatedData === 'string'
            ? updatedData
            : JSON.stringify(updatedData);

        await setSessionServer("user-info", cookieValue);
        return { success: true, message: "Session updated successfully" };
    } catch (error) {
        console.error("Error setting user info cookie:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

export async function generateStrongPassword(length: number = 10): Promise<string> {
    if (length < 8) length = 8;
    if (length > 20) length = 20;

    const lower = "abcdefghijklmnopqrstuvwxyz";
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    const specials = "!@#$%^&*()_+";

    const all = lower + upper + numbers + specials;

    // Secure random helper
    const getRandomChar = (charset: string) => {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return charset[array[0] % charset.length];
    };

    let password = [
        getRandomChar(lower),   // ensure lowercase
        getRandomChar(upper),   // ensure uppercase
        getRandomChar(numbers), // ensure number
        getRandomChar(specials) // ensure special char
    ];

    // Fill remaining length
    for (let i = password.length; i < length; i++) {
        password.push(getRandomChar(all));
    }

    // Fisher-Yates shuffle (secure shuffle)
    for (let i = password.length - 1; i > 0; i--) {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        const j = array[0] % (i + 1);
        [password[i], password[j]] = [password[j], password[i]];
    }

    return password.join("");
}