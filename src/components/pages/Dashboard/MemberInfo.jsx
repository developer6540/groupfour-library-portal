"use client";

import './MemberInfo.scss';
import Image from "next/image";
import {getDateFormated} from "@/lib/client-utility";
import Link from "next/link";
import React, {useEffect, useState} from "react";
import {getUserInfo} from "@/lib/server-utility";

export default function MemberInfo() {

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await getUserInfo();
                if (data) {
                    const parsedUser = typeof data === 'string' ? JSON.parse(data) : data;
                    setUser(parsedUser);
                }
            } catch (error) {
                console.error("Error fetching member info:", error);
            }
        };
        fetchUser();
    }, []);


    const now = new Date();
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(now.getDate() + 14);

    const expiryDate = user?.U_EXPIREDDATE ? new Date(user?.U_EXPIREDDATE) : null;

    const isExpiringSoon = expiryDate
        ? (expiryDate > now && expiryDate <= twoWeeksFromNow)
        : false;

    console.log("Checking against threshold:", twoWeeksFromNow.toDateString());
    console.log("Is Expiring Soon?", isExpiringSoon);

    return (
        <div className="member-card shadow-sm mb-1">
            <div className="member-card-header">
                <h5 className="mb-0">Member Information</h5>
            </div>

            <div className="member-card-body">

                {/* Profile Section */}
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
                            <p>
                                {user?.U_EMAIL?.toLowerCase()}
                            </p>
                            <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
                                {user?.U_ACTIVE ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                    <div className={`member-expire-box ${isExpiringSoon ? 'border-danger' : 'border-success'}`}>
                        <div className="member-expire">
                            <div className={`label ms-1 ${isExpiringSoon ? 'text-danger' : 'text-success'}`}>Membership Expire On</div>
                            <div className={`value ms-1 ${isExpiringSoon ? 'text-danger' : 'text-success'}`}>
                                {getDateFormated(user?.U_EXPIREDDATE, "MMMM dd, yyyy")}
                            </div>
                            {isExpiringSoon}
                            <Link href="/membership-payment" className="mt-2 fw-bold btn btn-sm text-white btn-warning">Renew Now</Link>
                        </div>
                    </div>
                    <Link className="profile-view" href="/profile/change-account-details">
                        <button className="btn btn-sm btn-purple">
                            Edit Profile Info &nbsp; <i className="bi bi-pencil-square"></i>
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
                        <span className="value">{getDateFormated(user?.U_DOB, 'YYYY-MM-DD')}</span>
                    </div>

                    <div className="info-item">
                        <span className="label">Gender</span>
                        <span className="value">
                            {user?.U_GENDER}
                        </span>
                    </div>

                    <div className="info-item">
                        <span className="label"> NIC Number</span>
                        <span className="value">
                            {user?.U_NIC}
                        </span>
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