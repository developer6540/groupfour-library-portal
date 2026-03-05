'use client';

import {setSession} from "@/lib/session";

export function SetSession({ name, data }) {
    setSession(name, data)
    return null
}