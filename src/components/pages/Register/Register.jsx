"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    FaArrowLeft,
    FaEye,
    FaEyeSlash,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaVenusMars, FaLock,
} from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import "./Register.scss"

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <div className="container-fluid p-0">
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

                <h2 className="h4 fw-bold text-secondary mb-2">Create Account</h2>
                <p className="text-muted mb-0">
                    Join the world's largest online book community
                </p>
            </div>

            <form>
                {/* First & Last Name */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            First Name
                        </label>
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control pe-5"
                                id="firstName"
                                placeholder="Nimal"
                            />
                            <FaUser className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Last Name
                        </label>
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control pe-5"
                                id="lastName"
                                placeholder="Fernando"
                            />
                            <FaUser className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Email & Phone */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Email Address
                        </label>
                        <div className="position-relative">
                            <input
                                type="email"
                                className="form-control pe-5"
                                id="email"
                                placeholder="john@example.com"
                            />
                            <MdOutlineEmail className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Contact Number
                        </label>
                        <div className="position-relative">
                            <input
                                type="tel"
                                className="form-control pe-5"
                                id="phone"
                                placeholder="0771234567"
                            />
                            <FaPhone className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                    </div>
                </div>

                {/* Address & Gender */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Permanent Address
                        </label>
                        <div className="position-relative">
                            <input
                                type="text"
                                className="form-control pe-5"
                                id="address"
                                placeholder="123 Main Street, Colombo 4"
                            />
                            <FaMapMarkerAlt className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Gender
                        </label>
                        <div className="position-relative">
                            <select className="form-select pe-5" id="gender">
                                <option value="">Select Gender</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                            <FaVenusMars className="position-absolute end-0 top-50 translate-middle-y me-5 text-secondary opacity-50 pe-none" />
                        </div>
                    </div>
                </div>

                {/* Password Fields */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Password
                        </label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control pe-5"
                                id="password"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">
                            Confirm Password
                        </label>
                        <div className="position-relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control pe-5"
                                id="confirmPassword"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    <FaUser size={16} />
                    Create Account
                </button>
            </form>

            <p className="text-center mt-4 small fw-semibold text-secondary">
                Already have an account?
                <Link href="/sign-in" className="text-purple fw-bold text-decoration-none ms-1">
                    Sign In
                </Link>
            </p>

        </div>
    );
}