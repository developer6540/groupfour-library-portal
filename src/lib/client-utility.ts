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

export function setCookie(name: string, value: string, days: number){
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
};

export function getCookie(name: string){
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
        const [key, value] = cookie.split("=");
        if (key === name) {
            return decodeURIComponent(value);
        }
    }
    return null;
};

export function deleteCookie(name: string){
    document.cookie = `${name}=; Max-Age=0; path=/`;
};
