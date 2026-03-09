import React from 'react';
import type { Metadata } from "next";
import Chtast from "@/components/common/Chtast";

export const metadata: Metadata = {
    title: "Books Catalog | GroupFour",
    description: "",
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
           {children}
        </>
    );
}