import {getSession, setSession} from "@/lib/session";
import moment from "moment";

export function getBaseUrl(){
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}

export function FirstNameOnly(fullName: string): string {
    try {
        return fullName.split(" ")[0];
    }catch(err) {
        return "";
    }
}

export function capitalizeFirstLetter(text?: string) {
    try{
        if (!text) return "";
        return text.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
    }catch (e) {
        return "";
    }
}

export function TextLimit(txt: string, Limit: number = 10): string {
    try{
        return txt.length > 10 ? txt.substring(0, Limit) + "..." : txt;
    }catch (e) {
        return "";
    }
}

export function getCurrentTime(){
    try{
        const now = new Date();
        return now.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",  // e.g., Mar
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        });
    }catch (e) {
        return "";
    }
}

export function getDateFormated(date: string | Date, formatStr = "DD/MM/YYYY"): string {
    if (!date) return "";
    const m = moment(date);
    return m.isValid() ? m.format(formatStr.toUpperCase()) : "";
}

export function getDateISO(date: string | Date): string {
    if (!date) return "";
    const m = moment(date, ["DD/MM/YYYY", moment.ISO_8601]);
    return m.isValid() ? m.toISOString() : "";
}

export async function updateLoggedUser(user: any, id: string): Promise<any | null> {
    try {
        // Return session user if already provided
        if (!user) {
            const sessionUser = await getSession("user-info");
            if (sessionUser) {
                return JSON.parse(sessionUser);
            }
        }

        // Fetch latest user from API
        const response = await fetch(`${getBaseUrl()}/api/v1/user/${id}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
            console.error(`Failed to fetch user ${id}: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();
        const currentUser = data.data;

        // Update session
        await setSession("user-info", JSON.stringify(currentUser));

        return currentUser;
    } catch (error) {
        console.error("Update Logged User error:", error);
        return null;
    }
}