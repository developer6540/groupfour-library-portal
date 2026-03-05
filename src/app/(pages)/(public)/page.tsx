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

export default async function DashboardPage() {

    let user = null;

    try {
        const response = await fetch(`${getBaseUrl()}/api/v1/user/00005`, {
            cache: "no-store"
        });
        console.log(response);
        if(response.status == 200){
            const data = await response.json();
            user = data.data;
        }
    } catch (error) {
        Logger.error(error)
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