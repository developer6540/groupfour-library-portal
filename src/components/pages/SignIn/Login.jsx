"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaLock, FaEye, FaKey, FaEyeSlash, FaSpinner, FaInfoCircle } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { alerts } from "@/lib/alerts";
import { getBaseUrl } from "@/lib/client-utility";
import { getCsrfToken } from "@/lib/session-client";
import "./Login.scss";

export default function Login() {
    const router = useRouter();

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordInfo, setShowPasswordInfo] = useState(false);

    const [formData, setFormData] = useState({
        usercode: "",
        password: ""
    });

    const [errors, setErrors] = useState({
        usercode: "",
        password: ""
    });

    const validate = (name, value) => {
        let error = "";
        if (name === "usercode") {
            if (!value.trim()) error = "User code is required";
            else if (value.trim().length < 3) error = "User code must be at least 3 characters";
        }

        if (name === "password") {
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;
            if (!value) error = "Password is required";
            else if (value.length < 8) error = "Minimum 8 characters required";
            else if (value.length > 20) error = "Maximum 20 characters allowed";
            else if (!passwordRegex.test(value)) {
                error = "Password complexity requirements not met";
            }
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
        const passwordError = validate("password", formData.password);

        if (usercodeError || passwordError) {
            setErrors({ usercode: usercodeError, password: passwordError });
            alerts.error("Validation Error", "Please fix the errors before signing in.");
            return;
        }

        setLoading(true);
        const loadingToastId = alerts.loading("Verifying credentials...");

        try {
            const res = await fetch(`${getBaseUrl()}/api/v1/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || '',
                },
                body: JSON.stringify({
                    usercode: formData.usercode,
                    password: formData.password
                }),
            });

            const result = await res.json();
            import("sonner").then(({ toast }) => toast.dismiss(loadingToastId));

            if (!res.ok) {
                alerts.error("Login Failed", result.message || "Invalid credentials");
                return;
            }

            alerts.success("Login Success", `Hi! ${result.data.U_NAME}, welcome back.`);
            router.push("/");
            router.refresh();
        } catch (err) {
            alerts.error("Connection Error", "Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    const isFormInvalid = Object.values(errors).some(err => err !== "") || !formData.usercode || !formData.password;

    return (
        <div className="mx-auto login-container">
            <div className="text-start mb-4">
                <div className="text-center mb-0">
                    <img src="/img/logo.png" alt="Logo" style={{ width: "180px" }} />
                </div>
                <hr className="gradient-hr" />
                <h2 className="h4 fw-bold text-secondary mb-2">Sign In</h2>
                <p className="text-muted mb-0">Enter your credentials to access your account</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                {/* User Code */}
                <div className="mb-3">
                    <label htmlFor="usercode" className="form-label small fw-semibold text-secondary">
                        User Code
                    </label>
                    <div className="position-relative">
                        <MdOutlineEmail
                            className={`position-absolute top-50 translate-middle-y ${errors.usercode ? 'text-danger' : 'text-muted'}`}
                            style={{ left: "1rem", zIndex: 10 }}
                            size={20}
                        />
                        <input
                            type="text"
                            id="usercode"
                            value={formData.usercode}
                            onChange={handleChange}
                            className={`form-control rounded-3 ps-5 ${errors.usercode ? 'is-invalid' : ''}`}
                            placeholder="Enter your user code"
                        />
                    </div>
                    {errors.usercode && <div className="error-text">{errors.usercode}</div>}
                </div>

                {/* Password Section */}
                <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                            <label htmlFor="password" className="form-label small fw-semibold text-secondary mb-0">
                                Password
                            </label>

                            {/* Info Icon next to Label */}
                            <div className="position-relative d-flex align-items-center">
                                <FaInfoCircle
                                    className="text-info cursor-pointer"
                                    size={14}
                                    onMouseEnter={() => setShowPasswordInfo(true)}
                                    onMouseLeave={() => setShowPasswordInfo(false)}
                                    onClick={() => setShowPasswordInfo(!showPasswordInfo)}
                                />

                                {/* Password Requirements Popup */}
                                {showPasswordInfo && (
                                    <div className="password-requirements-popup">
                                        <h6 className="fw-bold mb-2 small">Password Requirements:</h6>
                                        <ul className="list-unstyled mb-0 extra-small">
                                            <li>• 8 - 20 Characters</li>
                                            <li>• At least 1 Uppercase Letter</li>
                                            <li>• At least 1 Number</li>
                                            <li>• At least 1 Special Character (@$!%*?&)</li>
                                        </ul>
                                        <div className="popup-arrow"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <Link href="/forgot-password" className="small fw-semibold text-purple text-decoration-none">
                            Forgot Password?
                        </Link>
                    </div>

                    <div className="position-relative">
                        <FaKey
                            className={`position-absolute top-50 translate-middle-y ${errors.password ? 'text-danger' : 'text-muted'}`}
                            style={{ left: "1rem", zIndex: 10 }}
                            size={20}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn border-0 position-absolute top-50 translate-middle-y p-0"
                            style={{ right: "1rem", zIndex: 10, lineHeight: 1 }}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>

                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-control rounded-3 ps-5 pe-5 ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="••••••••••••"
                        />
                    </div>
                    {errors.password && <div className="error-text">{errors.password}</div>}
                </div>

                <button
                    type="submit"
                    disabled={loading || isFormInvalid}
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    {loading ? <FaSpinner className="animate-spin" /> : <FaLock size={16} />}
                    {loading ? "Please wait..." : "Sign In"}
                </button>
            </form>

            <p className="text-center mt-4 small fw-semibold text-secondary">
                Don't have an account?
                <Link href="/register" className="text-purple fw-semibold ms-1 text-decoration-none">
                    Create an account
                </Link>
            </p>
        </div>
    );
}