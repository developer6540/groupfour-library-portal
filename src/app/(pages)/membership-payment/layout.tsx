import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Membership Payment | GroupFour Library",
    description: "",
};

export default function MembershipPaymentLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
