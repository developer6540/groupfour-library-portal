import React from 'react';
import type { Metadata } from "next";
import Chatbot from "@/components/common/Chatbot";

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