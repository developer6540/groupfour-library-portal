import React from "react";
import "./page.scss"
import PageTitleBar from "@/components/common/PageTitleBar";
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import ChangePassword from "@/components/pages/Profile/ChangePassword";

export default function ChangePasswordPage() {

    return (
        <>
            <MainLayoutContent>
                <div className="container-fluid p-4">

                    <PageTitleBar title="Change My Account Password" />

                    <div className="row mb-4">
                        <div className="col-12">
                            <ChangePassword />
                        </div>
                    </div>

                </div>
            </MainLayoutContent>
        </>
    );
}