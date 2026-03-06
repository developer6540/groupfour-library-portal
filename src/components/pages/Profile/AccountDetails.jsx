'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './AccountDetails.scss';
import { getDateFormated } from "@/lib/utility";
import { getSession } from "@/lib/session";
import Link from "next/link";

export default function AccountDetails() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        getSession("user-info").then(res => {
            setUser(JSON.parse(res));
        });
    }, []);

    const expiryDate = user?.U_EXPIREDDATE ? new Date(user?.U_EXPIREDDATE) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : true;

    return (
        <div className="profile-card p-4 text-center shadow-sm h-100">

            <div className="profile-short-info">

                {/* Profile Image */}
                <div className="profile-image-wrapper mb-3">
                    <Image
                        src="/img/profile-image.jpg"
                        alt={user?.U_NAME || "Profile"}
                        width={120}
                        height={120}
                        className="profile-image shadow-sm"
                        priority
                    />

                    {user?.U_ACTIVE && <span className="status-indicator active"></span>}
                </div>

                {/* Name */}
                <h4 className="fw-bold mb-1 text-uppercase">{user?.U_NAME}</h4>

                <p className="text-muted small  fw-bold mb-3">
                    CODE: {user?.U_CODE} | {user?.U_NIC}
                </p>

                {/* Status */}
                <div className="d-flex justify-content-center fw-bold mb-3">
                <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
                    {user?.U_ACTIVE ? "Active" : "Inactive"}
                </span>
                </div>

                {/* Edit Button */}
                <div className="mb-3 profile-view">
                    <Link
                        href="/profile/change-account-details"
                        className="btn btn-sm btn-purple"
                    >
                        Edit Profile Info &nbsp;
                        <i className="bi bi-pencil-square"></i>
                    </Link>
                </div>
            </div>
            {/* Stats */}
            <div className="stats-container mt-4 mb-4 p-3 d-flex justify-content-around align-items-center">
                <div className="stat-item">
                    <span className="stat-label">Maximum Books Borrow Limit:</span>
                    <span className="stat-value ms-1">{user?.U_MAXBORROW}</span>
                </div>

                <div className="stat-divider"></div>

                <div className="stat-item">
                    <span className="stat-label">Membership Expiry Date:</span>
                    <span className={`stat-value ms-1 ${isExpired ? 'text-danger' : ''}`}>
                        {expiryDate ? getDateFormated(expiryDate, "YYYY-MM-DD") : 'N/A'}
                    </span>
                </div>
            </div>

            {/* User Details */}
            <div className="user-details">
                <div className="detail-row">
                    <span>Code</span>
                    <p className="mt-2">{user?.U_CODE}</p>
                </div>
                <div className="detail-row">
                    <span>Name</span>
                    <p className="mt-2">{user?.U_NAME}</p>
                </div>
                <div className="detail-row">
                    <span>Date of Birth</span>
                    <p className="mt-2">{getDateFormated(user?.U_DOB, "YYYY-MM-DD")}</p>
                </div>
                <div className="detail-row">
                    <span>Gender</span>
                    <p className="mt-2">{user?.U_GENDER}</p>
                </div>
                <div className="detail-row">
                    <span>Address</span>
                    <p className="mt-2">{user?.U_ADDRESS}</p>
                </div>
                <div className="detail-row">
                    <span>Mobile</span>
                    <p className="mt-2">{user?.U_MOBILE}</p>
                </div>
                <div className="detail-row">
                    <span>NIC Number</span>
                    <p className="mt-2">{user?.U_NIC}</p>
                </div>
                <div className="detail-row">
                    <span>Email</span>
                    <p className="mt-2">{user?.U_EMAIL}</p>
                </div>
                <div className="detail-row">
                    <span>Registration Date</span>
                    <p className="mt-2">{user?.U_REGISTEREDATE ? getDateFormated(user.U_REGISTEREDATE, "YYYY-MM-DD") : 'N/A'}</p>
                </div>
            </div>

        </div>
    );
}