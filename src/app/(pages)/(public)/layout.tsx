import React from 'react';
import type { Metadata } from "next";
import Chtast from "@/components/common/Chtast";

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