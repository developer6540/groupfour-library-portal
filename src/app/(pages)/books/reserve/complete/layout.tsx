import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Books Reserved | GroupFour",
    description: "",
};

export default function BooksReserveCompleteLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            {/*<Chatbot />*/}
        </>
    );
}