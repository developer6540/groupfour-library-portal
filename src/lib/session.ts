export async function setSession(name: string, data: any) {
    if (typeof window !== "undefined") {
        localStorage.setItem(name, data);
    }
}

export async function getSession(name: string) {
    if (typeof window !== "undefined") {
        return localStorage.getItem(name);
    }
    return null;
}