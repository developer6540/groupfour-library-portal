import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Return Books | GroupFour Library",
    description: "View your personal book return history",
};

export default function ReturnedBooksLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
