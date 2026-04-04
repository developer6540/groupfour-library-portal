import React from "react";
import "./page.scss"
import PageTitleBar from "@/components/common/PageTitleBar";
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import AccountDetails from "@/components/pages/Profile/AccountDetails";

export default function AccountDetailsPage() {

    return (
        <>
            <MainLayoutContent>
                <div className="container-fluid p-4">

                    <PageTitleBar title="My Account Details" />

                    <div className="row mb-4">
                        <div className="col-12">
                            <AccountDetails />
                        </div>
                    </div>

                </div>
            </MainLayoutContent>
        </>
    );
}