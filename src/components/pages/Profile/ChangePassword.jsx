'use client';

import React, {useEffect, useState} from "react";
import Image from "next/image";
import "./ChangePassword.scss";
import {getBaseUrl} from "@/lib/utility";
import {getSession} from "@/lib/session";
import Link from "next/link";
import {alerts} from "@/lib/alerts";

export default function ChangeAccountDetails() {

    const [user, setUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        getSession("user-info").then(res => {
            if (!res) return;
            setUser(JSON.parse(res));
        });
    }, []);

    const validate = (name, value, allValues) => {
        let error = "";

        if (name === "currentPassword" && !value) {
            error = "Current password is required";
        }

        if (name === "newPassword") {
            if (!value) error = "New password is required";
            else if (value.length < 6) error = "Password must be at least 6 characters";
            else if (value === allValues.currentPassword)
                error = "New password cannot be the same as current password";
        }

        if (name === "confirmPassword") {
            if (!value) error = "Confirm password is required";
            else if (value !== allValues.newPassword) error = "Passwords do not match";
        }

        return error;
    };

    const handleChange = (e) => {

        const {name, value} = e.target;

        const newFormData = {
            ...formData,
            [name]: value
        };

        setFormData(newFormData);

        const error = validate(name, value, newFormData);

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));

        if (name === "newPassword" && newFormData.confirmPassword) {

            const confirmError = validate(
                "confirmPassword",
                newFormData.confirmPassword,
                newFormData
            );

            setErrors(prev => ({
                ...prev,
                confirmPassword: confirmError
            }));
        }
    };

    const handleSave = async () => {

        const newErrors = {};
        let isValid = true;

        Object.keys(formData).forEach(key => {

            const error = validate(key, formData[key], formData);

            if (error) {
                newErrors[key] = error;
                isValid = false;
            }

        });

        setErrors(newErrors);

        if (!isValid) {
            alerts.error("Please correct the errors before submitting.");
            return;
        }

        setIsSaving(true);

        try {

            const response = await fetch(
                `${getBaseUrl()}api/v1/user/${user?.U_CODE}/change-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alerts.success("Password updated successfully!");

                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });

            } else {

                alerts.error(data.message || "Failed to update password");

            }

        } catch (error) {

            alerts.error("An unexpected error occurred.");

        } finally {

            setIsSaving(false);

        }
    };

    const hasEmptyFields = ["currentPassword", "newPassword", "confirmPassword"]
        .some(field => !formData[field] || formData[field].trim() === "");
    const hasErrors = Object.values(errors).some(err => err);
    const isSaveDisabled = isSaving || hasErrors || hasEmptyFields;

    return (

        <div className="change-password">

            <div className="profile-card shadow-sm">

                {/* PROFILE HEADER */}
                <div className="profile-short-info text-center">

                    <div className="profile-image-wrapper mb-3">

                        <Image
                            src="/img/profile-image.jpg"
                            alt={user?.U_NAME || "Profile"}
                            width={120}
                            height={120}
                            className="profile-image"
                            priority
                        />

                    </div>

                    <h4 className="fw-bold text-uppercase">
                        {user?.U_NAME || "Loading..."}
                    </h4>

                    <p className="text-muted fw-bold small mb-2">
                        CODE: {user?.U_CODE} | {user?.U_NIC}
                    </p>

                    <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
                        {user?.U_ACTIVE ? "Active" : "Inactive"}
                    </span>

                </div>

                {/* SECURITY HEADER */}

                <div className="security-header text-center mt-4 mb-3">

                    <h4>Security Settings</h4>
                    <p>Update your password to keep your account secure.</p>

                </div>

                {/* PASSWORD FORM */}

                <div className="row align-items-start">

                    <div className="col-md-5 text-center mb-3">
                        <Image
                            src="/img/pass-change.png"
                            alt={user?.U_NAME || "Profile"}
                            width={150}
                            height={150}
                            priority
                            style={{ width: '100%', height: 'auto' }}
                        />
                        {user?.U_ACTIVE && <span className="status-indicator active"></span>}
                    </div>

                    <div className="col-md-7">
                        <div className="user-details">

                            {/* Current Password */}
                            <div className="form-group mb-3">
                                <label>Current Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        name="currentPassword"
                                        className={`form-control ${errors.currentPassword ? "is-invalid" : ""}`}
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <span className="eye-icon-btn" onClick={() => setShowCurrent(!showCurrent)}>
                                        <i className={`bi ${showCurrent ? "bi-eye-slash" : "bi-eye"}`}></i>
                                      </span>
                                </div>
                                {errors.currentPassword && (
                                    <div className="invalid-feedback d-block">{errors.currentPassword}</div>
                                )}
                            </div>

                            {/* New Password */}
                            <div className="form-group mb-3">
                                <label>New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        name="newPassword"
                                        className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
                                        value={formData.newPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <span className="eye-icon-btn" onClick={() => setShowNew(!showNew)}>
            <i className={`bi ${showNew ? "bi-eye-slash" : "bi-eye"}`}></i>
          </span>
                                </div>
                                {errors.newPassword && (
                                    <div className="invalid-feedback d-block">{errors.newPassword}</div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="form-group mb-3">
                                <label>Confirm New Password</label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        name="confirmPassword"
                                        className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                    />
                                    <span className="eye-icon-btn" onClick={() => setShowConfirm(!showConfirm)}>
            <i className={`bi ${showConfirm ? "bi-eye-slash" : "bi-eye"}`}></i>
          </span>
                                </div>
                                {errors.confirmPassword && (
                                    <div className="invalid-feedback d-block">{errors.confirmPassword}</div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>

                {/* BUTTONS */}

                <div className="d-flex justify-content-end mt-4">

                    <Link href="/profile/account-details">

                        <button className="btn btn-dark me-2" disabled={isSaving}>
                            Back
                        </button>

                    </Link>

                    <button
                        className="btn btn-purple"
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

        </div>
    );
}