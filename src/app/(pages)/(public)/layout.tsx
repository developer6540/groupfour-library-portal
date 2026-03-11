import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard | GroupFour",
    description: "",
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}