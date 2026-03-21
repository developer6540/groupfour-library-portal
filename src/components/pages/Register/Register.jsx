"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FaEye,
    FaEyeSlash,
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaVenusMars,
    FaIdCard,
    FaSpinner, FaInfoCircle,
} from "react-icons/fa";
import { MdOutlineEmail, MdNumbers, MdLocationOn } from "react-icons/md";
import { alerts } from "@/lib/alerts";
import { getBaseUrl } from "@/lib/client-utility";
import { getCsrfToken } from "@/lib/session-client";
import "./Register.scss";
import DatePickerInput from "@/components/common/DatePicker";
import moment from "moment/moment";

export default function Register() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showNicPopup, setShowNicPopup] = useState(false);
    const [showPasswordInfo, setShowPasswordInfo] = useState(false);

    const [formData, setFormData] = useState({
        userCode: "",
        fullName: "",
        phone: "",
        nic: "",
        email: "",
        address: "",
        location: "",
        dob: "",
        gender: "male",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState({});

    // -------------------------
    // Validation function
    // -------------------------
    const validate = (name, value) => {
        let error = "";

        switch (name) {
            case "userCode":
                if (!value.trim()) error = "User code is required";
                else if (/\s/.test(value)) error = "No spaces allowed";
                else if (value.length < 3) error = "Minimum 3 characters required";
                break;

            case "fullName":
                if (!value.trim()) error = "Full name is required";
                break;

            case "phone":
                if (!value.trim()) error = "Mobile number is required";
                else if (!/^\d{10}$/.test(value)) error = "Enter a valid 10-digit number";
                break;

            case "nic":
                if (value.trim()) {
                    const oldNic = /^\d{9}[vVxX]$/;
                    const newNic = /^\d{12}$/;
                    if (!oldNic.test(value) && !newNic.test(value))
                        error = "Enter valid NIC Number (Old or New)";
                }
                break;

            case "email":
                if (value.trim()) {
                    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
                        error = "Invalid email address";
                }
                break;

            case "address":
                // optional, no validation
                break;

            // case "location":
            //     if (!value.trim()) error = "Location is required";
            //     break;

            case "dob":
                if (!value) error = "Date of Birth is required";
                break;

            case "gender":
                if (!value) error = "Gender is required";
                break;

            case "password":
                const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
                if (!value) error = "Password is required";
                else if (value.length < 8) error = "Minimum 8 characters required";
                else if (value.length > 20) error = "Maximum 20 characters allowed";
                else if (!passwordRegex.test(value))
                    error =
                        "Password must include 1 uppercase letter, 1 number & 1 special character";
                break;

            case "confirmPassword":
                if (!value) error = "Confirm password is required";
                else if (value !== formData.password) error = "Passwords do not match";
                break;

            default:
                break;
        }

        return error;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
        setErrors((prev) => ({ ...prev, [id]: validate(id, value) }));
    };

    const handleDateChange = (date) => {
        const isoDate = date ? moment(date).toISOString() : "";
        setFormData(prev => ({ ...prev, dob: isoDate }));
        setErrors(prev => ({ ...prev, dob: validate("dob", isoDate) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            newErrors[key] = validate(key, formData[key]);
        });
        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err !== "")) {
            alerts.error("Validation Error", "Please fix all errors before submitting.");
            return;
        }

        setLoading(true);
        const loadingToastId = alerts.loading("Creating account...");

        try {
            const csrfToken = await getCsrfToken();
            const res = await fetch(`${getBaseUrl()}/api/v1/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": csrfToken || "",
                },
                body: JSON.stringify({
                    U_CODE: formData.userCode,
                    U_NAME: formData.fullName,
                    U_MOBILE: formData.phone,
                    U_DOB: formData.dob,
                    U_ADDRESS: formData.address,
                    U_PASSWORD: formData.password,
                    U_NIC: formData.nic,
                    U_GENDER: formData.gender,
                    U_EMAIL: formData.email,
                    //U_LOCATION: formData.location,
                }),
            });

            const result = await res.json();
            import("sonner").then(({ toast }) => toast.dismiss(loadingToastId));

            if (!res.ok) {
                alerts.error("Registration Failed", result.message || "Could not create account.");
                return;
            }

            alerts.success("Registration Success", `Hi ${formData.fullName}, your account is created.`);
            router.push("/sign-in");
        } catch (err) {
            alerts.error("Connection Error", "Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    const isFormInvalid =
        Object.values(errors).some((err) => err !== "") ||
        !formData.userCode ||
        !formData.fullName ||
        !formData.phone ||
        //!formData.location ||
        !formData.dob ||
        !formData.gender ||
        !formData.password ||
        !formData.confirmPassword;

    return (
        <div className="container-fluid p-0">
            {/* Header */}
            <div className="text-start mb-4">
                <div className="text-center mb-0">
                    <img src="/img/logo.png" alt="Logo" style={{ width: "180px" }} />
                </div>
                <hr className="gradient-hr" />
                <h2 className="h4 fw-bold text-secondary mb-2">Create Account</h2>
                <p className="text-muted mb-0">
                    Join the world's largest online book community
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                {/* User Code */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">User Code *</label>
                    <div className="position-relative">
                        <input
                            type="text"
                            id="userCode"
                            className={`form-control pe-5 ${errors.userCode ? "is-invalid" : ""}`}
                            placeholder="Any Code"
                            value={formData.userCode}
                            onChange={handleChange}
                        />
                        <MdNumbers className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                    </div>
                    {errors.userCode && <div className="error-text">{errors.userCode}</div>}
                </div>

                {/* Full Name */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Full Name *</label>
                    <div className="position-relative">
                        <input
                            type="text"
                            id="fullName"
                            className={`form-control pe-5 ${errors.fullName ? "is-invalid" : ""}`}
                            placeholder="Nimal Fernando"
                            value={formData.fullName}
                            onChange={handleChange}
                        />
                        <FaUser className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                    </div>
                    {errors.fullName && <div className="error-text">{errors.fullName}</div>}
                </div>

                {/* Mobile */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Mobile *</label>
                        <div className="position-relative">
                            <input
                                type="tel"
                                id="phone"
                                className={`form-control pe-5 ${errors.phone ? "is-invalid" : ""}`}
                                placeholder="0771234567"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                            <FaPhone className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                        {errors.phone && <div className="error-text">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6 position-relative">
                        <label className="form-label small fw-semibold text-secondary d-flex align-items-center">
                            NIC
                            <FaInfoCircle
                                className="ms-2 text-info cursor-pointer"
                                onMouseEnter={() => setShowNicPopup(true)}
                                onMouseLeave={() => setShowNicPopup(false)}
                            />
                        </label>
                        <div className="position-relative">
                            <input
                                type="text"
                                id="nic"
                                className={`form-control pe-5 ${errors.nic ? "is-invalid" : ""}`}
                                placeholder="901234567V"
                                value={formData.nic}
                                onChange={handleChange}
                            />
                            <FaIdCard className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                        </div>
                        {errors.nic && <div className="error-text">{errors.nic}</div>}

                        {showNicPopup && (
                            <div className="nic-popup">
                                <h6 className="fw-bold mb-2 small">NIC format:</h6>
                                <ul className="list-unstyled mb-0 extra-small">
                                    <li> Old: 9 digits + V/X (e.g., 901234567V)</li>
                                    <li> New: 12 digits (e.g., 199012345678)</li>
                                </ul>
                                <div className="popup-arrow"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Email Address</label>
                    <div className="position-relative">
                        <input
                            type="email"
                            id="email"
                            className={`form-control pe-5 ${errors.email ? "is-invalid" : ""}`}
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <MdOutlineEmail className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                    </div>
                    {errors.email && <div className="error-text">{errors.email}</div>}
                </div>

                {/* Address */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Permanent Address</label>
                    <div className="position-relative">
                        <input
                            type="text"
                            id="address"
                            className={`form-control pe-5 ${errors.address ? "is-invalid" : ""}`}
                            placeholder="123 Main Street, Colombo 4"
                            value={formData.address}
                            onChange={handleChange}
                        />
                        <FaMapMarkerAlt className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />
                    </div>
                    {errors.address && <div className="error-text">{errors.address}</div>}
                </div>

                {/* Location */}
                {/*<div className="mb-3">*/}
                {/*    <label className="form-label small fw-semibold text-secondary">Location *</label>*/}
                {/*    <div className="position-relative">*/}
                {/*        <input*/}
                {/*            type="text"*/}
                {/*            id="location"*/}
                {/*            className={`form-control pe-5 ${errors.location ? "is-invalid" : ""}`}*/}
                {/*            placeholder="Enter Location"*/}
                {/*            value={formData.location}*/}
                {/*            onChange={handleChange}*/}
                {/*        />*/}
                {/*        <MdLocationOn className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary opacity-50" />*/}
                {/*    </div>*/}
                {/*    {errors.location && <div className="error-text">{errors.location}</div>}*/}
                {/*</div>*/}

                {/* DOB & Gender */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Date of Birth *</label>
                        <DatePickerInput
                            value={formData.dob}
                            maxDate={new Date()}
                            onChange={handleDateChange}
                        />
                        {errors.dob && <div className="error-text">{errors.dob}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Gender *</label>
                        <div className="position-relative">
                            <select
                                id="gender"
                                className={`form-select pe-5 ${errors.gender ? "is-invalid" : ""}`}
                                value={formData.gender}
                                onChange={handleChange}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                            <FaVenusMars className="position-absolute end-0 top-50 translate-middle-y me-5 text-secondary opacity-50 pe-none" />
                        </div>
                        {errors.gender && <div className="error-text">{errors.gender}</div>}
                    </div>
                </div>

                {/* Password */}
                <div className="row g-3 mb-4">
                    <div className="col-md-6 position-relative">
                        <label className="form-label small fw-semibold text-secondary">Password *
                            <FaInfoCircle
                                className="ms-2 text-info cursor-pointer"
                                size={14}
                                onMouseEnter={() => setShowPasswordInfo(true)}
                                onMouseLeave={() => setShowPasswordInfo(false)}
                                onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                            />

                            {/* Password Requirements Popup */}
                            {showPasswordInfo && (
                                <div className="password-popup">
                                    <h6 className="fw-bold mb-2 small">Password Requirements:</h6>
                                    <ul className="list-unstyled mb-0 extra-small">
                                        <li> 8 - 20 Characters</li>
                                        <li> At least 1 Uppercase Letter</li>
                                        <li> At least 1 Number</li>
                                        <li> At least 1 Special Character (@$!%*?&)</li>
                                    </ul>
                                    <div className="popup-arrow"></div>
                                </div>
                            )}
                        </label>
                        <div className="position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                className={`form-control pe-5 ${errors.password ? "is-invalid" : ""}`}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.password && <div className="error-text">{errors.password}</div>}
                    </div>

                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Confirm Password *</label>
                        <div className="position-relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id="confirmPassword"
                                className={`form-control pe-5 ${errors.confirmPassword ? "is-invalid" : ""}`}
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="btn position-absolute end-0 top-50 translate-middle-y border-0 text-secondary"
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                        {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading || isFormInvalid}
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaUser size={16} />}
                    {loading ? "Please wait..." : "Create Account"}
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