import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Books Return | GroupFour",
    description: "",
};

export default function BooksReturnLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
           {children}
        </>
    );
}