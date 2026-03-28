import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Borrow Books | GroupFour",
    description: "",
};

export default function BorrowedBooksLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
        </>
    );
}
