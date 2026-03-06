import React from "react";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import ValueBox from "@/components/pages/Dashboard/ValueBox";
import MemberInfo from "@/components/pages/Dashboard/MemberInfo";
import BookBorrowedList from "@/components/pages/Dashboard/BookBorrowedList";
import PenaltyDetails from "@/components/pages/Dashboard/PenaltyDetails";
import WelcomeBanner from "@/components/pages/Dashboard/WelcomeBanner";
import {getBaseUrl} from "@/lib/utility";
import PageTitleBar from "@/components/common/PageTitleBar";
import Logger from "@/lib/logger";
import BooksReserveLayout from "@/app/(pages)/books/reserve/layout";

export default async function BooksReservePage() {

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Reserve Books" />

                <div className="row mb-4">
                    <div className="col-12">

                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}