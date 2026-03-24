import React from "react";
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BorrowedBooks from "@/components/pages/Books/BorrowedBooks";

export default async function BorrowedBooksPage() {
    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Borrowed Books" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BorrowedBooks />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}
