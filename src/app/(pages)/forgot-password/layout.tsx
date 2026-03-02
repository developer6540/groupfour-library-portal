import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign in | GroupFour",
    description: "",
};

export default function SigninLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}