import React from "react";
import "./page.scss"
import Logger from "@/lib/logger";
import {getBaseUrl} from "@/lib/client-utility";
import {getUserCode} from "@/lib/server-utility";
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import ValueBox from "@/components/pages/Dashboard/ValueBox";
import MemberInfo from "@/components/pages/Dashboard/MemberInfo";
import BookBorrowedList from "@/components/pages/Dashboard/BookBorrowedList";
import PenaltyDetails from "@/components/pages/Dashboard/PenaltyDetails";
import WelcomeBanner from "@/components/pages/Dashboard/WelcomeBanner";
import PageTitleBar from "@/components/common/PageTitleBar";
import BooksReadChart from "@/components/pages/Dashboard/ReadProgressChart";
import BookStatusChart from "@/components/pages/Dashboard/BookStatusChart";

export default async function DashboardPage() {

    let user = null;
    let dashboardStats = null;
    //const userCode = await getUserCode();
    const userCode = '00005';

    try {
        // Fetch User Profile/Info (Existing)
        const userRes = await fetch(`${getBaseUrl()}/api/v1/user/${userCode}`, { cache: 'no-store' });
        if(userRes.ok){
            const userData = await userRes.json();
            console.log(userData)
            user = userData.data;
        }

        // Fetch Dashboard Counts (New)
        const statsRes = await fetch(`${getBaseUrl()}/api/v1/user/${userCode}/dashboard/counts`, { cache: 'no-store' });
        if(statsRes.ok){
            const statsData = await statsRes.json();
            dashboardStats = statsData.data;
        }

    } catch (error) {
        Logger.error("Dashboard Fetch Error:", error);
    }

    return <>
        <MainLayoutContent user={user}>
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
                        <ValueBox data={dashboardStats} />
                    </div>
                </div>

                <div className="dashboard-row d-flex flex-wrap gap-4">
                    <div className="dashboard-col flex-fill mb-4">
                        <BooksReadChart />
                    </div>
                    <div className="dashboard-col flex-fill mb-4">
                        <BookStatusChart data={dashboardStats} />
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