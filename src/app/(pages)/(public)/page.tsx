import React from "react";
import axios from "axios";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import ValueBox from "@/components/pages/Dashboard/ValueBox";
import MemberInfo from "@/components/pages/Dashboard/MemberInfo";
import BookBorrowedList from "@/components/pages/Dashboard/BookBorrowedList";
import PenaltyDetails from "@/components/pages/Dashboard/PenaltyDetails";
import WelcomeBanner from "@/components/pages/Dashboard/WelcomeBanner";
import {getBaseUrl} from "@/lib/helper";
import PageTitleBar from "@/components/common/PageTitleBar";

export default async function DashboardPage() {

    let user = null;

    try {
        const response = await axios.get(`${getBaseUrl()}/api/v1/user/00005`);
        user = response.data.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.log("Dashboard data fetch failed:", error.message);
        } else {
            console.log("An unknown error occurred", error);
        }
    }

    const dataArr = { user };

    return <>
        <MainLayoutContent dataArr={dataArr}>
            <div className="container-fluid p-4">

                <PageTitleBar title="Dashboard" />

                {/* Welcome Banner */}
                <div className="row mb-4">
                    <div className="col-12">
                        <WelcomeBanner user={user} />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <ValueBox />
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-12 mb-4 col-md-12">
                        <MemberInfo user={user}  />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <BookBorrowedList />
                    </div>
                </div>

                <div className="row">
                    <div className="col-12">
                        <PenaltyDetails />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}