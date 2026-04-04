'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './ChangeAccountDetails.scss';
import { getBaseUrl, getDateFormated } from "@/lib/client-utility";
import Link from "next/link";
import { alerts } from "@/lib/alerts";
import DatePickerInput from "@/components/common/DatePicker";
import moment from "moment";
import {getUserInfo, setUserInfo} from "@/lib/server-utility";
import {getCsrfToken} from "@/lib/session-client";

export default function ChangeAccountDetails() {

    const [user, setUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

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

    const [errors, setErrors] = useState({});

    // 1. Fetch User Data via Server Action
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const data = await getUserInfo();
                if (data) {
                    const parsedUser = typeof data === 'string' ? JSON.parse(data) : data;
                    setUser(parsedUser);
                    setFormData({
                        U_NAME: parsedUser.U_NAME || "",
                        U_DOB: parsedUser.U_DOB || "",
                        U_GENDER: parsedUser.U_GENDER || "",
                        U_ADDRESS: parsedUser.U_ADDRESS || "",
                        U_MOBILE: parsedUser.U_MOBILE || "",
                        U_EMAIL: parsedUser.U_EMAIL || "",
                        U_CODE: parsedUser.U_CODE || "",
                        U_NIC: parsedUser.U_NIC || "",
                    });
                }
            } catch (err) {
                console.error("Error fetching user:", err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const validate = (name, value) => {
        let error = "";
        if (name === "U_NAME" && (!value || value.trim().length < 3)) error = "Name must be at least 3 characters";
        if (name === "U_EMAIL" && (!value || !/^\S+@\S+\.\S+$/.test(value))) error = "Valid email is required";
        if (name === "U_MOBILE" && (!value || !/^\+?\d{10,15}$/.test(value))) error = "Mobile must be 10-15 digits";
        if (name === "U_ADDRESS" && (!value || value.trim().length < 5)) error = "Address must be at least 5 characters";
        if (name === "U_GENDER" && !value) error = "Please select gender";
        if (name === "U_DOB") {
            if (!value) error = "Date of Birth is required";
            else if (new Date(value) > new Date()) error = "Date of Birth cannot be in the future";
        }
        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setErrors(prev => ({ ...prev, [name]: validate(name, value) }));
    };

    const handleDateChange = (date) => {
        const isoDate = date ? moment(date).toISOString() : "";
        setFormData(prev => ({ ...prev, U_DOB: isoDate }));
        setErrors(prev => ({ ...prev, U_DOB: validate("U_DOB", isoDate) }));
    };

    const handleSave = async () => {
        const newErrors = {};
        let isValid = true;

        ["U_NAME","U_EMAIL","U_MOBILE","U_ADDRESS","U_GENDER","U_DOB"].forEach(field => {
            const error = validate(field, formData[field]);
            if (error) { newErrors[field] = error; isValid = false; }
        });

        setErrors(newErrors);
        if (!isValid) {
            alerts.error("Please correct the errors before submitting.");
            return;
        }

        setIsSaving(true);

        try {
            const editableFields = {
                U_NAME: formData.U_NAME,
                U_DOB: formData.U_DOB,
                U_GENDER: formData.U_GENDER,
                U_ADDRESS: formData.U_ADDRESS,
                U_MOBILE: formData.U_MOBILE,
                U_EMAIL: formData.U_EMAIL,
            };

            const response = await fetch(
                `${getBaseUrl()}/api/v1/user/${formData.U_CODE}/edit`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCsrfToken() || '',
                    },
                    body: JSON.stringify(editableFields),
                }
            );

            const data = await response.json();

            if (response.ok) {
                const updatedUser = {
                    ...user,
                    ...editableFields
                };
                setUser(updatedUser);
                await setUserInfo(updatedUser);
                alerts.success(data.message || "Changes saved successfully!");
            } else {
                alerts.error(data.message || "Failed to update user details");
            }
        } catch (error) {
            alerts.error("An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="p-5 text-center">Loading Account Details...</div>;

    const expiryDate = user?.U_EXPIREDDATE ? new Date(user?.U_EXPIREDDATE) : null;
    const isExpired = expiryDate ? expiryDate < new Date() : true;

    const hasErrors = Object.values(errors).some(err => err);
    const isSaveDisabled = hasErrors || isSaving;

    return (

        <div className="profile-card p-4 shadow-sm h-100">

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
                    {user?.U_ACTIVE && <span className="status-indicator active"></span>}
                </div>

                <h4 className="fw-bold mb-1 text-uppercase">{user?.U_NAME}</h4>

                <p className="text-muted fw-bold mb-3" style={{fontSize: "14px"}}>
                    CODE: {user?.U_CODE} | {user?.U_NIC}
                </p>

                <div className="d-flex justify-content-center fw-bold mb-0">
                    <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
                        {user?.U_ACTIVE ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            <div className="stats-container mt-4 mb-4 p-3 d-flex justify-content-around align-items-center">

                <div className="stat-item">
                    <span className="stat-label">Maximum Books Borrow Limit:</span>
                    <span className="stat-value ms-1">{user?.U_MAXBORROW}</span>
                </div>

                <div className="stat-divider"></div>

                <div className="stat-item">
                    <span className="stat-label">Membership Expiry Date:</span>
                    <span className={`stat-value ms-1 ${isExpired ? 'text-danger' : 'text-success'}`}>
                        {expiryDate ? getDateFormated(expiryDate, "YYYY-MM-DD") : 'N/A'}
                    </span>
                </div>

            </div>

            <div className="user-details">

                <div className="detail-row">
                    <span>Code</span>
                    <input type="text" disabled value={formData.U_CODE || ""} className="disabled"/>
                </div>

                <div className="detail-row">
                    <label>NIC Number</label>
                    <input type="text" disabled value={formData.U_NIC || ""} className="disabled"/>
                </div>

                <div className="detail-row">
                    <span>Registration Date</span>
                    <input
                        type="text"
                        disabled
                        value={user?.U_REGISTEREDATE ? getDateFormated(user.U_REGISTEREDATE, "YYYY-MM-DD") : 'N/A'}
                        className="disabled"
                    />
                </div>

                <div className="detail-row">
                    <label>Name</label>
                    <input
                        type="text"
                        name="U_NAME"
                        value={formData.U_NAME || ""}
                        onChange={handleChange}
                        className={`form-control ${errors.U_NAME ? 'is-invalid' : ''}`}
                    />
                    {errors.U_NAME && <div className="invalid-feedback">{errors.U_NAME}</div>}
                </div>

                <div className="detail-row">
                    <label>Date of Birth</label>
                    <DatePickerInput
                        value={formData.U_DOB}
                        maxDate={new Date()}
                        onChange={handleDateChange}
                    />
                    {errors.U_DOB && <div className="invalid-feedback d-block">{errors.U_DOB}</div>}
                </div>

                <div className="detail-row">
                    <label>Address</label>
                    <input
                        type="text"
                        name="U_ADDRESS"
                        value={formData.U_ADDRESS || ""}
                        onChange={handleChange}
                        className={`form-control ${errors.U_ADDRESS ? 'is-invalid' : ''}`}
                    />
                    {errors.U_ADDRESS && <div className="invalid-feedback">{errors.U_ADDRESS}</div>}
                </div>

                <div className="detail-row">
                    <label>Mobile</label>
                    <input
                        type="text"
                        name="U_MOBILE"
                        value={formData.U_MOBILE || ""}
                        onChange={handleChange}
                        className={`form-control ${errors.U_MOBILE ? 'is-invalid' : ''}`}
                    />
                    {errors.U_MOBILE && <div className="invalid-feedback">{errors.U_MOBILE}</div>}
                </div>

                <div className="detail-row">
                    <label>Email</label>
                    <input
                        type="email"
                        name="U_EMAIL"
                        value={formData.U_EMAIL || ""}
                        onChange={handleChange}
                        className={`form-control ${errors.U_EMAIL ? 'is-invalid' : ''}`}
                    />
                    {errors.U_EMAIL && <div className="invalid-feedback">{errors.U_EMAIL}</div>}
                </div>

                <div className="detail-row">
                    <label>Gender</label>
                    <select
                        name="U_GENDER"
                        value={formData.U_GENDER || ""}
                        onChange={handleChange}
                        className={`form-control ${errors.U_GENDER ? 'is-invalid' : ''}`}
                    >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>

                    {errors.U_GENDER && <div className="invalid-feedback">{errors.U_GENDER}</div>}
                </div>

            </div>

            <div className="d-flex justify-content-end mt-4">

                <Link href="/profile/account-details">
                    <button className="btn btn-dark m-2" disabled={isSaving}>
                        Back
                    </button>
                </Link>

                <button
                    className="btn btn-purple m-2"
                    onClick={handleSave}
                    disabled={isSaveDisabled}
                >
                    {isSaving ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>

            </div>

        </div>

    );
}