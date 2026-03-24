import React from "react";
import "./page.scss"
import Logger from "@/lib/logger";
import {getBaseUrl} from "@/lib/server-utility";
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
import {getCsrfToken, getSessionServer} from "@/lib/session-server";

export default async function DashboardPage() {

    let dashboardStats = null;
    const baseUrl = await getBaseUrl();
    const userCode = await getUserCode();
    const session = await getSessionServer("auth-session")
    const csrfToken = await getCsrfToken();
    console.log("userCode", userCode);

    // console.log("HELOOOOOO");
    // await fetch(`${baseUrl}/api/v1/send-email`, {
    //     method: "POST",
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'Cookie': `auth-session=${session}; X-CSRF-Token=${csrfToken}`,
    //         'X-CSRF-Token': csrfToken || '',
    //     },
    //     body: JSON.stringify({
    //         to: "developer6540@gmail.com",
    //         subject: "Test Railway",
    //         html: "<h1>Hello from Railway 🚀</h1>",
    //     }),
    // });

    try {

        // Fetch Dashboard Counts
        const statsRes = await fetch(`${baseUrl}/api/v1/user/${userCode}/dashboard/counts`, {
            method: 'GET',
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `auth-session=${session}; X-CSRF-Token=${csrfToken}`,
                'X-CSRF-Token': csrfToken || '',
            }
        });

        if(statsRes.ok){
            const statsData = await statsRes.json();
            dashboardStats = statsData.data;
        }

    } catch (error) {
        Logger.error("Fetch dashboard counts error:", error);
    }

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Dashboard" />

                <div className="row mb-4">
                    <div className="col-12">
                        <WelcomeBanner />
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
                        <MemberInfo />
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