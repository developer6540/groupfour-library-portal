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

export function TextLimit(txt: string, Limit: number = 10): string {
    try{
        return txt.length > 10 ? txt.substring(0, Limit) + "..." : txt;
    }catch (e) {
        return "";
    }
}