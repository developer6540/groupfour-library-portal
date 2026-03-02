
export function FirstNameOnly(fullName: string): string {
    return fullName.split(" ")[0];
}

export function TextLimit(txt: string, Limit: number = 10): string {
    return txt.length > 10 ? txt.substring(0, Limit) + "..." : txt;
}