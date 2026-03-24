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