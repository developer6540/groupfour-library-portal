
export async function setSession(name: string, data: any) {
    try {
        const value = typeof data === 'object' ? JSON.stringify(data) : data;
        localStorage.setItem(name, value);
    } catch {
    }
}

export async function getSession(name: string) {
    const store = localStorage.getItem(name);
    if (!store) return null;
    try {
        return JSON.parse(store);
    } catch {
        return store;
    }
}