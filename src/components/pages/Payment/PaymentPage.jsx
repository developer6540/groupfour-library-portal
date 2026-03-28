"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FaLock, FaSpinner, FaCalendarAlt, FaUserAlt } from "react-icons/fa";
import { MdOutlineCreditCard } from "react-icons/md";
import "./PaymentPage.scss";

export default function PaymentPage() {

    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [paid, setPaid] = useState(false);
    const [form, setForm] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
    const [errors, setErrors] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });

    const formatCardNumber = (val) =>
        val.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, "").substring(0, 4);
        return digits.length >= 3 ? digits.substring(0, 2) + "/" + digits.substring(2) : digits;
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        let v = value;
        if (id === "cardNumber") v = formatCardNumber(value);
        if (id === "expiry")     v = formatExpiry(value);
        if (id === "cvv")        v = value.replace(/\D/g, "").substring(0, 3);
        setForm(prev => ({ ...prev, [id]: v }));
        setErrors(prev => ({ ...prev, [id]: "" }));
    };

    const validate = () => {
        const e = { cardName: "", cardNumber: "", expiry: "", cvv: "" };
        if (!form.cardName.trim())                               e.cardName   = "Cardholder name is required";
        if (form.cardNumber.replace(/\s/g, "").length !== 16)   e.cardNumber = "Enter a valid 16-digit card number";
        const [mm, yy] = (form.expiry || "").split("/");
        if (!mm || !yy || parseInt(mm) < 1 || parseInt(mm) > 12 || yy.length !== 2)
                                                                 e.expiry     = "Enter a valid expiry MM/YY";
        if (form.cvv.length !== 3)                               e.cvv        = "Enter a valid 3-digit CVV";
        setErrors(e);
        return !Object.values(e).some(Boolean);
    };

    const handleSubmit = (ev) => {
        ev.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setPaid(true);
        }, 1800);
    };

    if (paid) {
        return (
            <div className="payment-card mx-auto text-center">
                <div className="success-icon-wrapper">
                    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="success-checkmark">
                        <circle cx="32" cy="32" r="30" fill="#e9f9f0" stroke="#28a745" strokeWidth="2"/>
                        <polyline points="18,34 28,44 47,22" fill="none" stroke="#28a745" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h4 className="fw-bold mt-3 mb-1" style={{ color: "#1a1a2e" }}>Payment Successful!</h4>
                <p className="text-muted mb-4">Your membership has been activated.</p>
                <button
                    className="btn btn-purple w-100 py-2 fw-bold"
                    onClick={() => router.push("/")}
                >
                    <i className="bi bi-house me-2"></i>Go to Dashboard
                </button>
                <p className="text-center mt-3 small text-muted">🔒 Payments are secured and encrypted</p>
            </div>
        );
    }

    return (
        <div className="payment-card mx-auto">

            {/* Header */}
            <div className="text-center mb-3">
                <img src="/img/logo.png" alt="Library" style={{ width: "160px" }} />
                <hr className="gradient-hr" />
            </div>

            {/* Payment Form */}
            <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold text-secondary mb-0">
                    <i className="bi bi-credit-card me-2"></i>Card Details
                </h6>
                <div className="card-logos">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 471" className="card-logo-svg">
                        <rect width="750" height="471" rx="40" fill="#1A1F71"/>
                        <text x="375" y="310" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="200" fill="#FFFFFF" letterSpacing="-8">VISA</text>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 471" className="card-logo-svg">
                        <rect width="750" height="471" rx="40" fill="#252525"/>
                        <circle cx="280" cy="235" r="145" fill="#EB001B"/>
                        <circle cx="470" cy="235" r="145" fill="#F79E1B"/>
                        <path d="M375 122 a145 145 0 0 1 0 226 a145 145 0 0 1 0-226z" fill="#FF5F00"/>
                    </svg>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 471" className="card-logo-svg">
                        <rect width="750" height="471" rx="40" fill="#2E77BC"/>
                        <text x="375" y="295" textAnchor="middle" fontFamily="Arial,sans-serif" fontWeight="bold" fontSize="120" fill="#FFFFFF" letterSpacing="2">AMEX</text>
                        <text x="375" y="380" textAnchor="middle" fontFamily="Arial,sans-serif" fontSize="55" fill="#FFFFFF" letterSpacing="1">AMERICAN EXPRESS</text>
                    </svg>
                </div>
            </div>

            <form onSubmit={handleSubmit} noValidate>

                {/* Cardholder Name */}
                <div className="mb-3">
                    <label htmlFor="cardName" className="form-label small fw-semibold text-secondary">
                        Cardholder Name *
                    </label>
                    <div className="position-relative">
                        <FaUserAlt className="form-icon text-muted" />
                        <input
                            id="cardName"
                            type="text"
                            value={form.cardName}
                            onChange={handleChange}
                            placeholder="Name on card"
                            className={`form-control rounded-3 ps-5 ${errors.cardName ? "is-invalid" : ""}`}
                        />
                    </div>
                    {errors.cardName && <div className="error-text">{errors.cardName}</div>}
                </div>

                {/* Card Number */}
                <div className="mb-3">
                    <label htmlFor="cardNumber" className="form-label small fw-semibold text-secondary">
                        Card Number *
                    </label>
                    <div className="position-relative">
                        <MdOutlineCreditCard className="form-icon text-muted" size={20} />
                        <input
                            id="cardNumber"
                            type="text"
                            value={form.cardNumber}
                            onChange={handleChange}
                            placeholder="1234 5678 9012 3456"
                            className={`form-control rounded-3 ps-5 ${errors.cardNumber ? "is-invalid" : ""}`}
                        />
                    </div>
                    {errors.cardNumber && <div className="error-text">{errors.cardNumber}</div>}
                </div>

                {/* Expiry + CVV */}
                <div className="row g-3 mb-4">
                    <div className="col-7">
                        <label htmlFor="expiry" className="form-label small fw-semibold text-secondary">
                            Expiry Date *
                        </label>
                        <div className="position-relative">
                            <FaCalendarAlt className="form-icon text-muted" />
                            <input
                                id="expiry"
                                type="text"
                                value={form.expiry}
                                onChange={handleChange}
                                placeholder="MM/YY"
                                className={`form-control rounded-3 ps-5 ${errors.expiry ? "is-invalid" : ""}`}
                            />
                        </div>
                        {errors.expiry && <div className="error-text">{errors.expiry}</div>}
                    </div>
                    <div className="col-5">
                        <label htmlFor="cvv" className="form-label small fw-semibold text-secondary">
                            CVV *
                        </label>
                        <div className="position-relative">
                            <FaLock className="form-icon text-muted" />
                            <input
                                id="cvv"
                                type="password"
                                value={form.cvv}
                                onChange={handleChange}
                                placeholder="•••"
                                className={`form-control rounded-3 ps-5 ${errors.cvv ? "is-invalid" : ""}`}
                            />
                        </div>
                        {errors.cvv && <div className="error-text">{errors.cvv}</div>}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    {loading
                        ? <><FaSpinner className="spin" /> Processing...</>
                        : <><FaLock size={14} /> Pay</>
                    }
                </button>
            </form>

            <p className="text-center mt-4 small text-muted">
                🔒 Payments are secured and encrypted
            </p>
        </div>
    );
}

