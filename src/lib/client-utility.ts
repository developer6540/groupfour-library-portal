'use client'

import moment from "moment";
import {getCsrfToken} from "@/lib/session-client";
import {alerts} from "@/lib/alerts";
import {useEffect, useRef} from "react";

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

export function useIdleLogout() {

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLoggingOut = useRef(false);
    const IDLE_TIME = 5 * 60 * 1000; // 5 min

    useEffect(() => {

        const logout = async () => {

            if (isLoggingOut.current) return;
            isLoggingOut.current = true;

            try {
                const res = await fetch(`${getBaseUrl()}/api/v1/auth/logout`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCsrfToken() || "",
                    },
                });

                if (res.ok) {
                    alerts.warning("Sorry! Session Expired", "Please login again....", 3000);
                } else {
                    console.log("Logout Failed");
                }

            } catch (error) {
                console.log("Logout Error");
            } finally {
                setTimeout(() => {
                    window.location.href = "/sign-in";
                }, 3000);
            }
        };

        const resetTimer = () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(logout, IDLE_TIME);
            console.log(IDLE_TIME);
        };

        const events = ["mousemove", "keydown", "click", "scroll"];

        events.forEach(event =>
            window.addEventListener(event, resetTimer)
        );

        resetTimer();

        return () => {
            events.forEach(event =>
                window.removeEventListener(event, resetTimer)
            );
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };

    }, []);
}

export const formatTimeAgo = (time: string): string => {
    if (!time) return "";

    const date = new Date(time);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const diff = now.getTime() - date.getTime(); // difference in milliseconds

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;
    if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
    return `${years} year${years > 1 ? "s" : ""} ago`;
};