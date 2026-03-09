import React from 'react';
import type { Metadata } from "next";
import Chtast from "@/components/common/Chtast";

export const metadata: Metadata = {
    title: "Books Reserve | GroupFour",
    description: "",
};

export default function BooksReserveLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            {/*<Chatbot />*/}
        </>
    );
}