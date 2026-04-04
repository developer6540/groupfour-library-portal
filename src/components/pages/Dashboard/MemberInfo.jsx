"use client";

import './MemberInfo.scss';
import Image from "next/image";
import { getDateFormated } from "@/lib/client-utility";
import Link from "next/link";
import React, {useEffect, useRef, useState} from "react";
import { getUserInfo } from "@/lib/server-utility";
import {getCsrfToken} from "@/lib/session-client";

export default function MemberInfo() {

    const [user, setUser] = useState(null);

    const hasTriggered = useRef(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserInfo();

                if (data) {
                    const parsedUser =
                        typeof data === "string" ? JSON.parse(data) : data;

                    setUser(parsedUser);

                    // 🔥 Trigger notification ONLY ONCE
                    if (!hasTriggered.current) {
                        await fetch("/api/v1/notification/update", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "X-CSRF-Token": getCsrfToken() || "",
                            },
                            body: JSON.stringify({
                                type: "MEMBERSHIP_EXPIRY",
                            }),
                        });

                        hasTriggered.current = true;
                    }
                }
            } catch (error) {
                console.error("Error fetching member info:", error);
            }
        };

        fetchUser();
    }, []);

    const now = new Date();
    const expiryDate = user?.U_EXPIREDDATE ? new Date(user.U_EXPIREDDATE) : null;

    const daysBeforeExpiry = expiryDate ? new Date(expiryDate) : null;
    if (daysBeforeExpiry) {
        daysBeforeExpiry.setDate(expiryDate.getDate() - 14);
    }

    const isWithinRenewalWindow = expiryDate && daysBeforeExpiry
        ? (now >= daysBeforeExpiry && now <= expiryDate)
        : false;

    const isExpired = expiryDate ? now > expiryDate : false;

    const boxClass = isExpired
        ? 'border-danger'
        : isWithinRenewalWindow
            ? 'border-danger'
            : 'border-success';

    const textClass = isExpired
        ? 'text-danger'
        : isWithinRenewalWindow
            ? 'text-danger'
            : 'text-success';

    return (
        <div className="member-card shadow-sm mb-1">
            <div className="member-card-header">
                <h5 className="mb-0">Member Information</h5>
            </div>

            <div className="member-card-body">

                <div className="profile-section">

                    <div className="profile-left">
                        <Image
                            src="/img/profile-image.jpg"
                            alt="Profile"
                            width={120}
                            height={120}
                            className="profile-image"
                        />

                        <div className="profile-info">
                            <h6 className="text-capitalize">
                                {user?.U_NAME?.toLowerCase()}
                            </h6>
                            <p>{user?.U_EMAIL?.toLowerCase()}</p>

                            <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
                                {user?.U_ACTIVE ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>

                    <div className={`member-expire-box ${boxClass}`}>
                        <div className="member-expire">

                            <div className={`label ms-1 ${textClass}`}>
                                Membership Expire On
                            </div>

                            <div className={`value ms-1 ${textClass}`}>
                                {getDateFormated(user?.U_EXPIREDDATE, "MMMM dd, yyyy")}
                            </div>

                            {isExpired && (
                                <div className="text-danger fw-bold mt-1">
                                    Expired
                                </div>
                            )}

                            {isWithinRenewalWindow && !isExpired && (
                                <div className="text-danger small mt-1">
                                    Expiring soon
                                </div>
                            )}

                            {(isWithinRenewalWindow || isExpired) && (
                                <Link
                                    href="/membership-payment"
                                    className="mt-2 fw-bold btn btn-sm text-white btn-danger"
                                >
                                    Renew Now
                                </Link>
                            )}

                        </div>
                    </div>

                    <Link className="profile-view" href="/profile/change-account-details">
                        <button className="btn btn-sm btn-purple">
                            Edit Profile Info &nbsp;
                            <i className="bi bi-pencil-square"></i>
                        </button>
                    </Link>

                </div>

                {/* Info Grid */}
                <div className="info-grid">

                    <div className="info-item">
                        <span className="label">Code</span>
                        <span className="value">{user?.U_CODE}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Mobile</span>
                        <span className="value">{user?.U_MOBILE}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Date of Birth</span>
                        <span className="value">
                            {getDateFormated(user?.U_DOB, 'YYYY-MM-DD')}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="label">Gender</span>
                        <span className="value">{user?.U_GENDER}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">NIC Number</span>
                        <span className="value">{user?.U_NIC}</span>
                    </div>

                    <div className="info-item full-width">
                        <span className="label">Address</span>
                        <span className="value">{user?.U_ADDRESS}</span>
                    </div>

                </div>

            </div>
        </div>
    );
}