import React from "react";
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BorrowedBooks from "@/components/pages/Books/BorrowedBooks";
import { getUserCode } from "@/lib/server-utility";

export default async function BorrowedBooksPage() {
    const memberCode = await getUserCode() || "";
    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Borrowed Books" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BorrowedBooks memberCode={memberCode} />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}
