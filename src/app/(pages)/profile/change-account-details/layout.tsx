import React from 'react';
import type { Metadata } from "next";
import Chatbot from "@/components/common/Chatbot";

export const metadata: Metadata = {
    title: "Change Account Details | GroupFour",
    description: "",
};

export default function ChangeAccountDetailsLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}