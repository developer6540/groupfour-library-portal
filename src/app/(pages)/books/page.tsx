import React from "react";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BookCatalog from "@/components/pages/Books/BookCatalog";

export default async function BooksPage() {

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Our Books Store" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BookCatalog />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}