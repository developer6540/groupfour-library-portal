import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Account Details | GroupFour",
    description: "",
};

export default function AccountDetailsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}