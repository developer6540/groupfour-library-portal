"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaLock, FaArrowLeft, FaEye, FaKey, FaEyeSlash } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import "./ForgotPassword.scss"

export default function ForgotPassword() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="mx-auto">
            {/* Header Section */}
            <div className="text-start mb-4">
                <div className="text-center mb-0">
                    <img
                        src="/img/logo.png"
                        alt="Logo"
                        className="mb-0"
                        style={{ width: "180px" }}
                    />
                </div>

                <hr className="gradient-hr" />

                <h2 className="h4 fw-bold text-secondary mb-2">Forgot Password</h2>
                <p className="text-muted mb-0">
                    Enter your user code to receive the password reset instructions
                </p>
            </div>
            <form className="needs-validation" noValidate>
                {/* Email Address */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label small fw-semibold text-secondary">
                        User Code
                    </label>
                    <div className="position-relative">
                        <MdOutlineEmail
                            className="position-absolute top-50 translate-middle-y text-muted"
                            style={{ left: "1rem", zIndex: 10 }}
                            size={20}
                        />
                        <input
                            type="email"
                            id="email"
                            className="form-control rounded-3 ps-5"
                            placeholder="xxxxxxxx"
                            required
                        />
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    <FaKey size={16} />
                    Reset Password
                </button>
            </form>

            {/* Footer Links */}
            <p className="text-center mt-4 small fw-semibold text-secondary">
                Go to
                <Link href="/sign-in" className="text-purple fw-bold text-decoration-none ms-1">
                    Sign In
                </Link>
            </p>

        </div>
    );
}