import React from "react";
import "./page.scss"
import PageTitleBar from "@/components/common/PageTitleBar";
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import ChangeAccountDetailsLayout from "@/app/(pages)/profile/change-account-details/layout";

export default function ChangeAccountDetailsPage() {

    return (
        <>
            <MainLayoutContent>
                <div className="container-fluid p-4">

                    <PageTitleBar title="Change My Account Details" />

                    <div className="row mb-4">
                        <div className="col-12">

                        </div>
                    </div>

                </div>
            </MainLayoutContent>
        </>
    );
}