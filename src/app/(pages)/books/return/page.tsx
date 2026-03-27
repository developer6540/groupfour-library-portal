import React from "react";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BookCatalog from "@/components/pages/Books/BookCatalog";
import BooksReturn from "@/components/pages/Books/BooksReturn";

export default async function BooksReturnPage() {

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Returned Books" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BooksReturn />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}