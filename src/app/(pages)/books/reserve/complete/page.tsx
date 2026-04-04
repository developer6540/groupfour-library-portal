import React from "react";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BookReservationComplete from "@/components/pages/Books/BookReservationComplete";

export default async function BooksReserveCompletePage() {

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Books Reserved" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BookReservationComplete />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}