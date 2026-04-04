import React from "react";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BookReservation from "@/components/pages/Books/BookReservation";

export default async function BooksReservePage() {

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Reserve Books" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BookReservation />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}