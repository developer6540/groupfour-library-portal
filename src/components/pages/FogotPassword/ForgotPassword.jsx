"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaKey, FaSpinner } from "react-icons/fa";
import { MdNumbers } from "react-icons/md";
import { alerts } from "@/lib/alerts";
import { getBaseUrl } from "@/lib/client-utility";
import { getCsrfToken } from "@/lib/session-client";
import "./ForgotPassword.scss";

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        usercode: ""
    });

    const [errors, setErrors] = useState({
        usercode: ""
    });

    const validate = (name, value) => {
        let error = "";

        if (name === "usercode") {
            if (!value.trim()) error = "User code is required";
            else if (value.trim().length < 3)
                error = "User code must be at least 3 characters";
        }

        return error;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;

        setFormData(prev => ({ ...prev, [id]: value }));
        setErrors(prev => ({ ...prev, [id]: validate(id, value) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const usercodeError = validate("usercode", formData.usercode);

        if (usercodeError) {
            setErrors({ usercode: usercodeError });
            alerts.error("Validation Error", "Please fix the errors.");
            return;
        }

        setLoading(true);
        const loadingToastId = alerts.loading("Processing request...");

        try {
            const res = await fetch(`${getBaseUrl()}/api/v1/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || '',
                },
                body: JSON.stringify({
                    U_CODE: formData.usercode
                }),
            });

            const result = await res.json();

            import("sonner").then(({ toast }) => toast.dismiss(loadingToastId));

            if (!res.ok) {
                alerts.error("Request Failed", result.message || "Something went wrong");
                return;
            }

            alerts.success(
                "Success",
                "Temporary password has been sent to your email."
            );

            setFormData({ usercode: "" });

        } catch (err) {
            import("sonner").then(({ toast }) => toast.dismiss(loadingToastId));
            alerts.error("Connection Error", "Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    const isFormInvalid =
        Object.values(errors).some(err => err !== "") ||
        !formData.usercode;

    return (
        <div className="mx-auto">
            {/* Header */}
            <div className="text-start mb-4">
                <div className="text-center mb-0">
                    <img src="/img/logo.png" alt="Logo" style={{ width: "180px" }} />
                </div>

                <hr className="gradient-hr" />

                <h2 className="h4 fw-bold text-secondary mb-2">
                    Forgot Password
                </h2>
                <p className="text-muted mb-0">
                    Enter your user code to receive reset instructions
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                {/* User Code */}
                <div className="mb-3">
                    <label
                        htmlFor="usercode"
                        className="form-label small fw-semibold text-secondary"
                    >
                        User Code *
                    </label>

                    <div className="position-relative">
                        <MdNumbers
                            className={`position-absolute top-50 translate-middle-y ${
                                errors.usercode ? "text-danger" : "text-muted"
                            }`}
                            style={{ left: "1rem", zIndex: 10 }}
                            size={20}
                        />

                        <input
                            type="text"
                            id="usercode"
                            value={formData.usercode}
                            onChange={handleChange}
                            className={`form-control rounded-3 ps-5 ${
                                errors.usercode ? "is-invalid" : ""
                            }`}
                            placeholder="Enter your user code"
                        />
                    </div>

                    {errors.usercode && (
                        <div className="error-text">{errors.usercode}</div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || isFormInvalid}
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    {loading ? (
                        <FaSpinner className="animate-spin" />
                    ) : (
                        <FaKey size={16} />
                    )}
                    {loading ? "Please wait..." : "Reset Password"}
                </button>
            </form>

            {/* Footer */}
            <p className="text-center mt-4 small fw-semibold text-secondary">
                Go to
                <Link
                    href="/sign-in"
                    className="text-purple fw-bold text-decoration-none ms-1"
                >
                    Sign In
                </Link>
            </p>
        </div>
    );
}