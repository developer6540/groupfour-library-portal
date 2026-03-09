import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Change Password Details | GroupFour",
    description: "",
};

export default function ChangePasswordLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}