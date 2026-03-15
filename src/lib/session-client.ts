// src/lib/session-client.ts

export function setSessionClient(name: string, data: any, days: number = 7) {
    if (typeof window === "undefined") return;

    const value = typeof data === 'object' ? JSON.stringify(data) : data;
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));

    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

export function getSessionClient(name: string) {
    if (typeof window === "undefined") return null;
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
        }
    }
    return null;
}

export function removeSessionClient(name: string) {
    if (typeof window === "undefined") return;
    document.cookie = `${name}=; Max-Age=-99999999; path=/;`;
}

export function getCsrfToken() {
    return getSessionClient("X-CSRF-Token");
}