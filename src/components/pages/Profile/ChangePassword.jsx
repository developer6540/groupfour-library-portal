'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import "./ChangePassword.scss";
import { getBaseUrl } from "@/lib/client-utility";
import { getUserInfo } from "@/lib/server-utility";
import Link from "next/link";
import { alerts } from "@/lib/alerts";
import { getCsrfToken } from "@/lib/session-client";

export default function ChangePassword() {
    const [user, setUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getUserInfo();
                if (data) {
                    setUser(typeof data === 'string' ? JSON.parse(data) : data);
                }
            } catch (error) {
                console.error("Failed to load user info:", error);
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // ✅ Strong validation (same as login)
    const validate = (name, value, allValues) => {
        let error = "";
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

        if (name === "currentPassword") {
            if (!value) error = "Current password is required";
        }

        if (name === "newPassword") {
            if (!value) {
                error = "New password is required";
            } else if (value.length < 8) {
                error = "Minimum 8 characters required";
            } else if (value.length > 20) {
                error = "Maximum 20 characters allowed";
            } else if (!passwordRegex.test(value)) {
                error = "Password must include at least 1 uppercase letter, 1 number, and 1 special character (@$!%*?&)";
            } else if (value === allValues.currentPassword) {
                error = "New password cannot be the same as current password";
            }
        }

        if (name === "confirmPassword") {
            if (!value) {
                error = "Confirm password is required";
            } else if (value !== allValues.newPassword) {
                error = "Passwords do not match";
            }
        }

        return error;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const newFormData = { ...formData, [name]: value };

        setFormData(newFormData);

        setErrors(prev => ({
            ...prev,
            [name]: validate(name, value, newFormData)
        }));

        // Re-validate confirm password when new password changes
        if (name === "newPassword" && newFormData.confirmPassword) {
            setErrors(prev => ({
                ...prev,
                confirmPassword: validate("confirmPassword", newFormData.confirmPassword, newFormData)
            }));
        }
    };

    // ✅ onBlur validation
    const handleBlur = (e) => {
        const { name, value } = e.target;
        setErrors(prev => ({
            ...prev,
            [name]: validate(name, value, formData)
        }));
    };

    const handleSave = async () => {
        if (isSaving) return; // ✅ prevent double submit

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
            alerts.error("Validation Error", "Please correct the errors before submitting.");
            return;
        }

        setIsSaving(true);

        try {
            const response = await fetch(
                `${getBaseUrl()}/api/v1/user/${user?.U_CODE}/change-password`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCsrfToken() || '',
                    },
                    body: JSON.stringify({
                        currentPassword: formData.currentPassword,
                        newPassword: formData.newPassword
                    })
                }
            );

            let data;
            try {
                data = await response.json();
            } catch {
                data = { message: "Invalid server response" };
            }

            if (response.ok) {
                alerts.success("Success", "Password updated successfully!");
                setFormData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
                setErrors({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: ""
                });
            } else {
                alerts.error("Error", data.message || "Failed to update password");
            }

        } catch (error) {
            alerts.error("Connection Error", "Something went wrong.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="p-5 text-center">Checking security session...</div>;
    }

    const hasEmptyFields =
        !formData.currentPassword ||
        !formData.newPassword ||
        !formData.confirmPassword;

    const hasErrors = Object.values(errors).some(err => err && err.length > 0);

    const isSaveDisabled = isSaving || hasErrors || hasEmptyFields;

    return (
        <div className="change-password">
            <div className="profile-card shadow-sm">

                {/* PROFILE HEADER */}
                <div className="profile-short-info text-center">
                    <div className="profile-image-wrapper mb-3">
                        <Image src="/img/profile-image.jpg" alt="Profile" width={120} height={120} className="profile-image" priority />
                    </div>
                    <h4 className="fw-bold text-uppercase">{user?.U_NAME || "User"}</h4>
                    <p className="text-muted fw-bold small mb-2">
                        CODE: {user?.U_CODE} | {user?.U_NIC}
                    </p>
                    <span className={`badge ${user?.U_ACTIVE ? "badge-success" : "badge-danger"}`}>
                        {user?.U_ACTIVE ? "Active" : "Inactive"}
                    </span>
                </div>

                <div className="security-header text-center mt-4 mb-3">
                    <h4>Security Settings</h4>
                    <p>Update your password to keep your account secure.</p>
                </div>

                <div className="row align-items-start">
                    <div className="col-md-5 text-center mb-3">
                        <Image src="/img/pass-change.png" alt="Security" width={150} height={150} priority style={{ width: '100%', height: 'auto' }} />
                    </div>

                    <div className="col-md-7">
                        <div className="user-details">

                            {[
                                { label: "Current Password", name: "currentPassword", show: showCurrent, toggle: setShowCurrent },
                                { label: "New Password", name: "newPassword", show: showNew, toggle: setShowNew },
                                { label: "Confirm New Password", name: "confirmPassword", show: showConfirm, toggle: setShowConfirm }
                            ].map((field) => (
                                <div className="form-group mb-3" key={field.name}>
                                    <label>{field.label}</label>

                                    <div className="password-input-wrapper">
                                        <input
                                            type={field.show ? "text" : "password"}
                                            name={field.name}
                                            className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                                            value={formData[field.name]}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            placeholder="••••••••"
                                        />

                                        <span
                                            className="eye-icon-btn"
                                            onClick={() => field.toggle(!field.show)}
                                        >
                                            <i className={`bi ${field.show ? "bi-eye-slash" : "bi-eye"}`}></i>
                                        </span>
                                    </div>

                                    {errors[field.name] && (
                                        <div className="invalid-feedback d-block">
                                            {errors[field.name]}
                                        </div>
                                    )}
                                </div>
                            ))}

                        </div>
                    </div>
                </div>

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
                        {isSaving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
}