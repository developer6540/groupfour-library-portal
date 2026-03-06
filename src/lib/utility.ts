import dynamic from "next/dynamic";

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

export function getDateFormated(date: Date) {
    try {
        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    } catch (e) {
        return "";
    }
}