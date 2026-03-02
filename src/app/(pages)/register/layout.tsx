import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register | GroupFour",
    description: "",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}