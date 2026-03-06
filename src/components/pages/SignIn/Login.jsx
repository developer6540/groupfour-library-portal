"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaLock, FaArrowLeft, FaEye, FaKey, FaEyeSlash } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import "./Login.scss"

export default function Login() {
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

                <h2 className="h4 fw-bold text-secondary mb-2">Sign In</h2>
                <p className="text-muted mb-0">
                    Enter your credentials to access your account
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

                {/* Password */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <label htmlFor="password" className="form-label small fw-semibold text-secondary mb-0">
                            Password
                        </label>
                        <Link href="/forgot-password" className="small fw-semibold text-purple text-decoration-none">
                            Forgot Password?
                        </Link>
                    </div>
                    <div className="position-relative">
                        <FaKey
                            className="position-absolute top-50 translate-middle-y text-muted"
                            style={{ left: "1rem", zIndex: 10 }}
                            size={20}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn border-0 position-absolute top-50 translate-middle-y p-0"
                            style={{ right: "1rem", zIndex: 10, lineHeight: 1 }}
                        >
                            {showPassword ? <FaEyeSlash className="text-muted" size={18} /> : <FaEye className="text-muted" size={18} />}
                        </button>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            className="form-control rounded-3 ps-5"
                            placeholder="••••••••••••"
                            required
                        />
                    </div>
                </div>

                {/* Remember me */}
                <div className="form-check mb-4">
                    <input type="checkbox" className="form-check-input" id="remember" />
                    <label htmlFor="remember" className="form-check-label fw-semibold small text-secondary">
                        Remember me
                    </label>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    <FaLock size={16} />
                    Sign In
                </button>
            </form>

            {/* Footer Links */}
            <p className="text-center mt-4 small fw-semibold text-secondary">
                Don't have an account?
                <Link href="/register" className="text-purple fw-semibold ms-1 text-decoration-none">
                    Create an account
                </Link>
            </p>

        </div>
    );
}