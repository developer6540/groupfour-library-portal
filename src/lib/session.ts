
export async function setSession(name: any, data: any) {
    localStorage.setItem(name, data);
}

export async function getSession(name: any) {
    return localStorage.getItem(name);
}