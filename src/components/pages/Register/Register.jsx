"use client";

import React, { useEffect, useState } from "react";
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
    FaSpinner,
    FaInfoCircle, FaCalendar,
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

    const [locations, setLocations] = useState([]);
    const [loadingLocations, setLoadingLocations] = useState(true);

    const [userCodeStatus, setUserCodeStatus] = useState("idle");
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: "", color: "" });
    const [confirmPasswordStrength, setConfirmPasswordStrength] = useState({ score: 0, label: "", color: "", matches: false });

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

    const csrfToken = getCsrfToken();

    const [errors, setErrors] = useState({});

    // Load locations
    useEffect(() => {
        const loadLocations = async () => {
            try {
                const res = await fetch(`${getBaseUrl()}/api/v1/locations`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": csrfToken || "",
                    },
                });

                const data = await res.json();
                setLocations(Array.isArray(data) ? data : data.data || []);
            } catch {
                setLocations([]);
            } finally {
                setLoadingLocations(false);
            }
        };
        void loadLocations();
    }, [csrfToken]);

    // User code availability check
    useEffect(() => {
        if (!formData.userCode || errors.userCode) {
            setUserCodeStatus("idle");
            return;
        }

        const timeout = setTimeout(async () => {
            try {
                setUserCodeStatus("checking");

                const res = await fetch(
                    `${getBaseUrl()}/api/v1/user/${formData.userCode}/exist`,
                    {
                        method: "GET",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": csrfToken || "",
                        },
                    }
                );
                const data = await res.json();
                if (res.ok) {
                    setUserCodeStatus(data.data.exists ? "taken" : "available");
                } else {
                    setUserCodeStatus("idle");
                }
            } catch {
                setUserCodeStatus("idle");
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [formData.userCode, errors.userCode]);

    // Password strength calculation
    const getPasswordStrength = (password) => {
        let score = 0;
        if (!password) return { score, label: "", color: "" };

        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[@$!%*?&]/.test(password)) score += 1;
        if (password.length >= 12) score += 1;

        let label = "";
        let color = "";

        if (score <= 2) { label = "Weak"; color = "bg-danger"; }
        else if (score <= 4) { label = "Medium"; color = "bg-warning"; }
        else { label = "Strong"; color = "bg-success"; }

        return { score, label, color };
    };

    // Validation function
    const validate = (name, value, formData) => {
        let error = "";
        switch (name) {
            case "userCode":
                if (!value.trim()) error = "User code is required";
                else if (/\s/.test(value)) error = "No spaces allowed";
                else if (value.length < 3) error = "Minimum 3 characters required";
                break;
            case "fullName":
                if (!value.trim()) error = "Full name is required";
                else if (!/^[A-Za-z\s]+$/.test(value))
                    error = "Numbers and special characters not allowed";
                else if (value.length > 20)
                    error = "Maximum 20 characters allowed";
                break;
            case "phone":
                if (!value.trim()) error = "Contact number is required";
                else if (!/^\d+$/.test(value))
                    error = "Only numbers allowed (no spaces or dashes)";
                else if (value.length < 8 || value.length > 10)
                    error = "Must be between 8 and 10 digits";
                break;
            case "nic":
                if (!value.trim()) error = "NIC is required";
                else {
                    const oldNic = /^\d{9}[vVxX]$/;
                    const newNic = /^\d{12}$/;
                    if (!oldNic.test(value) && !newNic.test(value))
                        error = "Enter valid NIC Number (Old or New)";
                }
                break;
            case "email":
                if (!value.trim()) error = "Email is required";
                else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value))
                    error = "Invalid email address";
                break;
            case "address":
                if (value.length > 60) error = "Maximum 60 characters allowed";
                break;
            case "location":
                if (!value.trim()) error = "Location is required";
                break;
            case "dob":
                if (!value) error = "Date of Birth is required";
                break;
            case "gender":
                if (!value)
                    error = "Gender is required";
                else if (!["male", "female", "other"].includes(value.toLowerCase()))
                    error = "Select Male, Female or Other";
                break;
            case "password":
                if (!value) error = "Password is required";
                else if (value.length < 8) error = "Minimum 8 characters required";
                else if (value.length > 20) error = "Maximum 20 characters allowed";
                else if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value))
                    error = "Must include 1 uppercase, 1 number & 1 special character";
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

        setFormData((prev) => {
            const newFormData = { ...prev, [id]: value };
            setErrors((prevErrors) => ({
                ...prevErrors,
                [id]: validate(id, value, newFormData)
            }));

            if (id === "password") {
                setPasswordStrength(getPasswordStrength(value));
                setConfirmPasswordStrength((prev) => ({
                    ...prev,
                    matches: newFormData.confirmPassword === value
                }));
            }

            if (id === "confirmPassword") {
                setConfirmPasswordStrength((prev) => ({
                    ...prev,
                    matches: value === newFormData.password,
                    score: getPasswordStrength(value).score,
                    color: getPasswordStrength(value).color
                }));
            }

            return newFormData;
        });

        if (id === "userCode") setUserCodeStatus("idle");
    };

    const handleDateChange = (date) => {
        const isoDate = date ? moment(date).toISOString() : "";
        setFormData((prev) => ({ ...prev, dob: isoDate }));
        setErrors((prev) => ({ ...prev, dob: validate("dob", isoDate, formData) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Pass full formData to validation
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            newErrors[key] = validate(key, formData[key], formData);
        });
        setErrors(newErrors);

        if (Object.values(newErrors).some((err) => err !== "")) {
            alerts.error("Validation Error", "Please fix all errors before submitting.");
            return;
        }

        setLoading(true);
        const loadingToastId = alerts.loading("Creating account...");

        try {
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
                    U_LOCATION: formData.location,
                }),
            });

            const result = await res.json();
            import("sonner").then(({ toast }) => toast.dismiss(loadingToastId));

            if (!res.ok) {
                alerts.error("Registration Failed", result.message || "Could not create account.");
                return;
            }

            alerts.success("Registration Success", `Hi ${formData.fullName}, your account is created.`);
            router.push("/membership-payment");
        } catch {
            alerts.error("Connection Error", "Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    const isFormInvalid =
        Object.values(errors).some((err) => err !== "") ||
        userCodeStatus === "taken" ||
        !formData.userCode ||
        !formData.fullName ||
        !formData.phone ||
        !formData.location ||
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
                <p className="text-muted mb-0">Join the world's largest online book community</p>
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
                            onChange={(e) => {
                                handleChange(e);
                                setUserCodeStatus("idle"); // reset status when typing
                            }}
                        />
                        <MdNumbers className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary " />
                    </div>

                        {userCodeStatus === "checking" && (
                            <div className="mt-2 d-flex align-items-center gap-2">
                                <FaSpinner style={{fontSize:"small"}} className="text-secondary animate-spin" />
                                <span style={{fontSize:"small"}} className="text-muted">Checking...</span>
                            </div>
                        )}

                        {userCodeStatus === "available" && (
                            <div className="mt-2 d-flex align-items-center gap-2">
                            <span style={{fontSize:"small"}} className="text-success fw-bold">✔ Great! You can use this User Code.</span>
                            </div>
                        )}

                        {userCodeStatus === "taken" && (
                            <div className="mt-2 d-flex align-items-center gap-2">
                            <span style={{fontSize:"small"}} className="text-danger fw-bold"> ✖ Sorry, this User Code is already in use. Please choose another.</span>
                            </div>
                        )}
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
                        <FaUser className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary " />
                    </div>
                    {errors.fullName && <div className="error-text">{errors.fullName}</div>}
                </div>

                {/* Mobile & NIC */}
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
                            <FaPhone className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary " />
                        </div>
                        {errors.phone && <div className="error-text">{errors.phone}</div>}
                    </div>

                    <div className="col-md-6 position-relative">
                        <label className="form-label small fw-semibold text-secondary d-flex align-items-center">
                            NIC *
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
                            <FaIdCard className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary " />
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
                    <label className="form-label small fw-semibold text-secondary">Email Address *</label>
                    <div className="position-relative">
                        <input
                            type="email"
                            id="email"
                            className={`form-control pe-5 ${errors.email ? "is-invalid" : ""}`}
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <MdOutlineEmail className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary " />
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
                        <FaMapMarkerAlt className="position-absolute end-0 top-50 translate-middle-y me-3 text-secondary " />
                    </div>
                    {errors.address && <div className="error-text">{errors.address}</div>}
                </div>

                {/* Location */}
                <div className="mb-3">
                    <label className="form-label small fw-semibold text-secondary">Location *</label>
                    <div className="position-relative">
                        <select
                            id="location"
                            className={`form-select pe-5 ${errors.location ? "is-invalid" : ""}`}
                            value={formData.location}
                            onChange={handleChange}
                            disabled={loadingLocations}
                        >
                            <option value="">{loadingLocations ? "Loading..." : "Select Location"}</option>
                            {Array.isArray(locations) &&
                                locations.map((loc) => (
                                    <option key={loc.L_CODE} value={loc.L_CODE}>
                                        {loc.L_DESC}
                                    </option>
                                ))}
                        </select>
                        <MdLocationOn className="position-absolute end-0 top-50 translate-middle-y me-5 text-secondary  pe-none" />
                    </div>
                    {errors.location && <div className="error-text">{errors.location}</div>}
                </div>

                {/* DOB & Gender */}
                <div className="row g-3 mb-3">
                    <div className="col-md-6">
                        <label className="form-label small fw-semibold text-secondary">Date of Birth *</label>
                        <div className="position-relative">
                            <DatePickerInput
                                value={formData.dob}
                                maxDate={new Date()}
                                onChange={handleDateChange}
                                placeholder={"YYYY-MM-DD"}
                                style={{width:'100%'}}
                            />
                            <FaCalendar className="position-absolute end-0 top-50 translate-middle-y me-2 text-secondary  pe-none" />
                        </div>
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
                            <FaVenusMars className="position-absolute end-0 top-50 translate-middle-y me-5 text-secondary  pe-none" />
                        </div>
                        {errors.gender && <div className="error-text">{errors.gender}</div>}
                    </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="row g-3 mb-4">
                    {/* Password */}
                    <div className="col-md-6 position-relative">
                        <label className="form-label small fw-semibold text-secondary">
                            Password *
                            <FaInfoCircle
                                className="ms-2 text-info cursor-pointer"
                                size={14}
                                onMouseEnter={() => setShowPasswordInfo(true)}
                                onMouseLeave={() => setShowPasswordInfo(false)}
                                onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                            />
                        </label>

                        {showPasswordInfo && (
                            <div className="password-popup">
                                <h6 className="fw-bold mb-2 small">Password Requirements:</h6>
                                <ul className="list-unstyled mb-0 extra-small">
                                    <li>8 - 20 Characters</li>
                                    <li>At least 1 Uppercase Letter</li>
                                    <li>At least 1 Number</li>
                                    <li>At least 1 Special Character (@$!%*?&)</li>
                                </ul>
                                <div className="popup-arrow"></div>
                            </div>
                        )}

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
                        {formData.password && (
                            <div className="mt-2">
                                <div className="progress" style={{ height: "6px" }}>
                                    <div
                                        className={`progress-bar ${passwordStrength.color}`}
                                        role="progressbar"
                                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {errors.password && <div className="error-text">{errors.password}</div>}
                    </div>

                    {/* Confirm Password */}
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
                        {formData.confirmPassword && (
                            <div className="mt-2">
                                <div className="progress" style={{ height: "6px" }}>
                                    <div
                                        className={`progress-bar ${confirmPasswordStrength.color}`}
                                        role="progressbar"
                                        style={{ width: `${(confirmPasswordStrength.score / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
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