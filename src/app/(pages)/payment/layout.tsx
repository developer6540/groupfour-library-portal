import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Renew Subscription | GroupFour Library",
    description: "Renew your library subscription to continue accessing all features.",
};

export default function PaymentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
