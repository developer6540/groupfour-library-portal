import React, { Suspense } from "react";
import "./page.scss";
import Payment from "@/components/pages/MembershipPayment/Payment";

export default function MembershipPaymentPage() {
    return (
        <div className="payment-page-wrapper">
            <Suspense fallback={
                <div className="d-flex align-items-center justify-content-center vh-100">
                    <div className="spinner-border text-purple" role="status" />
                </div>
            }>
                <Payment />
            </Suspense>
        </div>
    );
}
