import React, { Suspense } from "react";
import "./page.scss";
import PaymentPage from "@/components/pages/Payment/PaymentPage";

export default function PaymentRoute() {
    return (
        <div className="payment-page-wrapper">
            <Suspense fallback={
                <div className="d-flex align-items-center justify-content-center vh-100">
                    <div className="spinner-border text-purple" role="status" />
                </div>
            }>
                <PaymentPage />
            </Suspense>
        </div>
    );
}
