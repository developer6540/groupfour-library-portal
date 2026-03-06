"use client";

import './MemberInfo.scss';
import Image from "next/image";
import {getDateFormated} from "@/lib/utility";

export default function MemberInfo({ user }) {

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
                    <div className="member-expire-box">
                        <div className="member-expire">
                            <div className="label">Membership Expire On</div>
                            <div className="value">
                                {getDateFormated(user?.U_EXPIREDDATE)}
                            </div>
                        </div>
                    </div>
                    <div className="profile-view">
                        <button className="btn btn-sm btn-purple">
                            Edit Profile Info
                        </button>
                    </div>

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
                        <span className="value">{getDateFormated(user?.U_DOB)}</span>
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