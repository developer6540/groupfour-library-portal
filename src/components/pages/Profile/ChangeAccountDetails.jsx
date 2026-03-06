'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './ChangeAccountDetails.scss';
import {getBaseUrl, getDateFormated} from "@/lib/utility";
import {getSession, setSession} from "@/lib/session";
import Link from "next/link";
import {alerts} from "@/lib/alerts";
import DatePickerInput from "@/components/common/DatePicker";
import moment from "moment";

export default function ChangeAccountDetails() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        U_NAME: "",
        U_DOB: "",
        U_GENDER: "",
        U_ADDRESS: "",
        U_MOBILE: "",
        U_NIC: "",
        U_EMAIL: "",
        U_CODE: "",
    });

    // Load user session on mount
    useEffect(() => {
        getSession("user-info").then(res => {
            if (!res) return;
            const data = JSON.parse(res);
            setUser(data);
            setFormData({
                U_NAME: data.U_NAME,
                U_DOB: data.U_DOB,
                U_GENDER: data.U_GENDER,
                U_ADDRESS: data.U_ADDRESS,
                U_MOBILE: data.U_MOBILE,
                U_NIC: data.U_NIC,
                U_EMAIL: data.U_EMAIL,
                U_CODE: data.U_CODE,
            });
        });
    }, []);

    // input change handler for all fields
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Save changes handler
    const handleSave = async () => {
        try {
            const editableFields = {
                U_NAME: formData.U_NAME,
                U_DOB: formData.U_DOB,
                U_GENDER: formData.U_GENDER,
                U_ADDRESS: formData.U_ADDRESS,
                U_MOBILE: formData.U_MOBILE,
                U_NIC: formData.U_NIC,
                U_EMAIL: formData.U_EMAIL,
            };

            // Make API call to update user details
            const response = await fetch(`${getBaseUrl()}api/v1/user/${formData.U_CODE}/edit`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editableFields),
            });

            const data = await response.json();

            if (response.ok) {
                alerts.success(response.message || "Changes saved successfully!");
                setUser(prev => ({ ...prev, ...editableFields }));
                setFormData(prev => ({ ...prev, ...editableFields }));
                setSession('user-info', JSON.stringify({ ...user, ...editableFields }));
            } else {
                alerts.error(`Error: ${data.message}`);
            }
        } catch (error) {
            alerts.error(`Error saving changes: ${error.message || error}`);
        }
    };

    const expiryDate = user?.U_EXPIREDDATE ? new Date(user?.U_EXPIREDDATE) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : true;

    return (
        <div className="profile-card p-4 shadow-sm h-100">

            {/* Profile Header */}
            <div className="text-center profile-short-info">
                <div className="profile-image-wrapper mb-3">
                    <Image
                        src="/img/profile-image.jpg"
                        alt={user?.U_NAME || "Profile"}
                        width={120}
                        height={120}
                        className="profile-image shadow-sm"
                        priority
                    />
                    {formData?.U_ACTIVE && <span className="status-indicator active"></span>}
                </div>
                <h4 className="fw-bold mb-1 text-uppercase">{user?.U_NAME}</h4>
                <p className="text-muted small fw-bold mb-3">
                    CODE: {user?.U_CODE} | {user?.U_NIC}
                </p>
                <div className="d-flex justify-content-center fw-bold mb-3">
          <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
            {user?.U_ACTIVE ? "Active" : "Inactive"}
          </span>
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
                        {expiryDate ? getDateFormated(expiryDate) : 'N/A'}
                    </span>
                </div>
            </div>

            {/* Editable Fields */}
            <div className="user-details">
                <div className="detail-row">
                    <span>Code</span>
                    <p className="mt-2">{user?.U_CODE}</p>
                </div>

                <div className="detail-row">
                    <label>Name</label>
                    <input
                        type="text"
                        name="U_NAME"
                        value={formData.U_NAME || ""}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter full name"
                    />
                </div>

                <div className="detail-row">
                    <label>Date of Birth</label>
                    {/*<input*/}
                    {/*    type="text"*/}
                    {/*    name="U_DOB"*/}
                    {/*    value={getDateFormated(formData.U_DOB, "DD MMM YYYY") || ""}*/}
                    {/*    onChange={handleChange}*/}
                    {/*    className="form-control"*/}
                    {/*    placeholder="DD-MMM-YYYY"*/}
                    {/*/>*/}
                    <DatePickerInput
                        value={formData.U_DOB}
                        maxDate={new Date()}
                        onChange={(date) =>
                            setFormData(prev => ({
                                ...prev,
                                U_DOB: date ? moment(date).toISOString() : null, // store ISO string for API
                            }))
                        }
                    />
                </div>

                <div className="detail-row">
                    <label>Address</label>
                    <input
                        type="text"
                        name="U_ADDRESS"
                        value={formData.U_ADDRESS || ""}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter address"
                    />
                </div>

                <div className="detail-row">
                    <label>Mobile</label>
                    <input
                        type="text"
                        name="U_MOBILE"
                        value={formData.U_MOBILE || ""}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter mobile number"
                    />
                </div>

                <div className="detail-row">
                    <label>NIC Number</label>
                    <input
                        type="text"
                        name="U_NIC"
                        value={formData.U_NIC || ""}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter NIC"
                    />
                </div>

                <div className="detail-row">
                    <label>Email</label>
                    <input
                        type="email"
                        name="U_EMAIL"
                        value={formData.U_EMAIL || ""}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter email"
                    />
                </div>

                <div className="detail-row">
                    <label>Gender</label>
                    <select
                        name="U_GENDER"
                        value={formData?.U_GENDER || ""}
                        onChange={handleChange}
                        className="form-control"
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div className="detail-row">
                    <span>Registration Date</span>
                    <p className="mt-2">{user?.U_REGISTEREDATE ? getDateFormated(user.U_REGISTEREDATE, "YYYY-MM-DD") : 'N/A'}</p>
                </div>
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end mt-4">
                <Link href="/profile/account-details">
                    <button className="btn btn-dark m-2">Back</button>
                </Link>
                <button className="btn btn-purple m-2" onClick={handleSave}>Save Changes</button>
            </div>
        </div>
    );
}