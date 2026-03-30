'use client';

import './Payment.scss';
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {getCsrfToken} from "@/lib/session-client";
import {getUserInfo} from "@/lib/server-utility";

export default function Payment() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [membershipAmount, setMembershipAmount] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");
    const [user, setUser] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setErrorMessage("");

        try {
            const [userInfo, res] = await Promise.all([
                getUserInfo(),
                fetch(`/api/v1/user/membership-payment`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCsrfToken() || '',
                    },
                }),
            ]);

            setUser(userInfo);

            const result = await res.json().catch(() => ({}));

            if (!res.ok) {
                setErrorMessage(result?.message || "Unable to load membership amount. Please check your database connection.");
                return;
            }

            const amount = Number(result?.data?.UG_MEMBERSHIPAMT);
            if (!Number.isFinite(amount)) {
                setErrorMessage("Invalid membership amount returned from the server.");
                return;
            }

            setMembershipAmount(amount);
        } catch (err) {
            console.error("Error fetching data:", err);
            setErrorMessage("Unable to reach the server. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePay = () => {
        if (!membershipAmount || loading || errorMessage) return;
        const params = new URLSearchParams();
        if (user?.U_CODE) params.set("u", user.U_CODE);
        if (user?.U_NAME) params.set("n", user.U_NAME);
        params.set("a", String(membershipAmount));
        router.push(`/payment?${params.toString()}`);
    };

    const formattedBalance = membershipAmount.toLocaleString('en-LK', {
        style: 'currency',
        currency: 'LKR'
    });

    return (
        <div className="payment-container">
            <div className={`payment-card ${loading ? 'loading' : ''}`}>

                <div className="text-start mb-4">
                    <div className="text-center mb-0">
                        <img src="/img/logo.png" alt="Logo" style={{ width: "180px" }} />
                    </div>
                    <hr className="gradient-hr" />
                    <h2 className="h4 fw-bold text-secondary mb-2" style={{fontSize:"20px"}}>Membership Payment</h2>
                    <p className="text-muted mb-0" style={{fontSize:"15px"}}>Review your membership fee and proceed to payment</p>
                </div>

                {/* Summary Grid */}
                <div className="stats-grid">
                    <div className="stat-item highlighted">
                        <span className="label">Membership Amount</span>
                        <span className="value large">{formattedBalance}</span>
                    </div>
                </div>

                {errorMessage && (
                    <div className="error-banner" role="alert">
                        {errorMessage}
                    </div>
                )}

                {/* Info Notice */}
                <div className="info-banner">
                    <div className="icon-wrapper">
                        <i className="bi bi-shield-lock-fill"></i>
                    </div>
                    <div className="text-content">
                        <strong>Secure Redirect</strong>
                        <p>You'll be sent to our encrypted gateway to finalize the transaction.</p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="action-area">
                    <button
                        type="button"
                        onClick={handlePay}
                        disabled={membershipAmount <= 0 || loading || !!errorMessage}
                        className={`pay-btn btn btn-purple ${membershipAmount <= 0 || loading || !!errorMessage ? 'disabled' : ''}`}
                    >
                        <span>Pay {formattedBalance}</span>
                        <i className="bi bi-arrow-right-short"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}