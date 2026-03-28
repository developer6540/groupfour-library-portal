'use client';

import './Payment.scss';
import React, { useEffect, useState, useRef, useCallback } from "react";
import {getCsrfToken} from "@/lib/session-client";

export default function Payment() {
    const memberCodeRef = useRef("");
    const [loggedUser, setLoggedUser] = useState(null);
    const [userReady, setUserReady] = useState(false);
    const [loading, setLoading] = useState(true);

    const [fineSummary, setFineSummary] = useState({
        totalFine: 0,
        totalPaid: 0,
        totalBalance: 0
    });

    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            const user = stored ? JSON.parse(stored) : null;
            memberCodeRef.current = user?.U_CODE || "";
            setLoggedUser(user);
        } catch (err) {
            console.error("User parse error:", err);
        }
        setUserReady(true);
    }, []);

    const fetchFineSummary = useCallback(async () => {
        if (!userReady || !memberCodeRef.current) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({ member: memberCodeRef.current });
            const res = await fetch(`/api/v1/book/fine-summary?${params}`,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || '',
                },
            });
            const result = await res.json();

            if (res.ok && result.data) {
                setFineSummary(result.data);
            }
        } catch (err) {
            console.error("Error fetching fine summary:", err);
        } finally {
            setLoading(false);
        }
    }, [userReady]);

    useEffect(() => {
        fetchFineSummary();
    }, [fetchFineSummary]);

    const formattedBalance = fineSummary.totalBalance.toLocaleString('en-LK', {
        style: 'currency',
        currency: 'LKR'
    });

    return (
        <div className="payment-container">
            <div className={`payment-card ${loading ? 'loading' : ''}`}>

                {/* Header */}
                <div className="payment-header">
                    <h3>Membership Payment</h3>
                </div>

                {/* Summary Grid */}
                <div className="stats-grid">
                    <div className="stat-item highlighted">
                        <span className="label">Membership Amount</span>
                        <span className="value large">{formattedBalance}</span>
                    </div>
                </div>

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
                    <a
                        href={`http://localhost:3001/?amount=${fineSummary.totalBalance.toFixed(2)}&type=fine&locked=1&member=${encodeURIComponent(memberCodeRef.current)}&callback=${encodeURIComponent('http://localhost:3000/api/v1/book/fine-payment')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`pay-btn btn btn-purple ${fineSummary.totalBalance <= 0 ? 'disabled' : ''}`}
                    >
                        <span>Pay {formattedBalance}</span>
                        <i className="bi bi-arrow-right-short"></i>
                    </a>
                </div>
            </div>
        </div>
    );
}