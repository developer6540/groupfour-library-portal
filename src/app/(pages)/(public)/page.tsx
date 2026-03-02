import React from "react";
import axios from "axios";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import ValueBox from "@/components/pages/Dashboard/ValueBox";
import StudentInfo from "@/components/pages/Dashboard/StudentInfo";
import BookBorrowedList from "@/components/pages/Dashboard/BookBorrowedList";
import PenaltyDetails from "@/components/pages/Dashboard/PenaltyDetails";
import WelcomeBanner from "@/components/pages/Dashboard/WelcomeBanner";

export default async function DashboardPage() {

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    let user = null;

    try {
        const response = await axios.get(`${baseUrl}/api/v1/user/00005`);
        user = response.data.data;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Dashboard data fetch failed:", error.message);
        } else {
            console.error("An unknown error occurred", error);
        }
    }

    const dataArr = { user };

    return <>
        <MainLayoutContent dataArr={dataArr}>
            <div className="container-fluid p-4">
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
                    <div className="col-12">
                        <StudentInfo />
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