"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { FaLock, FaSpinner, FaCreditCard, FaCalendarAlt, FaUserAlt } from "react-icons/fa";
import { MdOutlineCreditCard } from "react-icons/md";
import { alerts } from "@/lib/alerts";
import { getBaseUrl } from "@/lib/client-utility";
import { getCsrfToken } from "@/lib/session-client";
import "./PaymentPage.scss";

const PLANS = [
    {
        id: "MONTHLY",
        label: "Monthly",
        duration: "1 Month Access",
        price: "LKR 500",
        priceNum: 500,
        icon: "bi-calendar-month",
        description: "Flexible, cancel anytime",
        popular: false,
    },
    {
        id: "ANNUAL",
        label: "Annual",
        duration: "12 Months Access",
        price: "LKR 5,000",
        priceNum: 5000,
        icon: "bi-calendar-check",
        description: "Best value — save 17%",
        popular: true,
    },
];

export default function PaymentPage() {

    const searchParams = useSearchParams();
    const router = useRouter();

    const usercode  = searchParams.get("u") ? decodeURIComponent(searchParams.get("u")) : "";
    const userName  = searchParams.get("n") ? decodeURIComponent(searchParams.get("n")) : "";

    const [selectedPlan, setSelectedPlan] = useState("ANNUAL");
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
    const [errors, setErrors] = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });

    useEffect(() => {
        //if (!usercode) router.replace("/sign-in");
    }, [usercode, router]);

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

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;

        setLoading(true);
        const toastId = alerts.loading("Processing payment...");

        try {
            const res = await fetch(`${getBaseUrl()}/api/v1/payment/subscribe`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || "",
                },
                body: JSON.stringify({ usercode, plan: selectedPlan }),
            });

            const result = await res.json();
            import("sonner").then(({ toast }) => toast.dismiss(toastId));

            if (!res.ok) {
                alerts.error("Payment Failed", result.message || "Something went wrong. Please try again.");
                return;
            }

            alerts.success(
                "Payment Successful! 🎉",
                `Your subscription has been renewed. Please sign in to continue.`,
                4000
            );
            //setTimeout(() => router.push("/sign-in"), 3000);
        } catch {
            alerts.error("Connection Error", "Could not process payment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const selectedPlanData = PLANS.find(p => p.id === selectedPlan);

    return (
        <div className="payment-card mx-auto">

            {/* Header */}
            <div className="text-center mb-3">
                <img src="/img/logo.png" alt="Library" style={{ width: "160px" }} />
                <hr className="gradient-hr" />
            </div>

            {/* Expiry Banner */}
            <div className="alert alert-warning d-flex align-items-center gap-2 py-2 mb-4" role="alert">
                <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                <div>
                    <strong>Subscription Required</strong>
                    <div className="small">Your subscription is inactive or has expired. Renew below to regain access.</div>
                </div>
            </div>

            {/* User Info */}
            {userName && (
                <div className="user-info-bar mb-4">
                    <i className="bi bi-person-circle fs-4 text-purple"></i>
                    <div>
                        <p className="mb-0 fw-semibold text-dark">{userName}</p>
                        <p className="mb-0 small text-muted">Member Code: <span className="fw-bold">{usercode}</span></p>
                    </div>
                </div>
            )}

            {/* Plan Selection */}
            <h6 className="fw-bold text-secondary mb-3">
                <i className="bi bi-grid me-2"></i>Choose a Plan
            </h6>
            <div className="row g-3 mb-4">
                {PLANS.map(plan => (
                    <div className="col-6" key={plan.id}>
                        <div
                            className={`plan-card ${selectedPlan === plan.id ? "plan-selected" : ""}`}
                            onClick={() => setSelectedPlan(plan.id)}
                            role="button"
                        >
                            {plan.popular && (
                                <span className="plan-badge">Best Value</span>
                            )}
                            <i className={`bi ${plan.icon} plan-icon`}></i>
                            <p className="fw-bold mb-0 mt-1">{plan.label}</p>
                            <p className="plan-duration">{plan.duration}</p>
                            <p className="plan-price">{plan.price}</p>
                            <p className="plan-desc">{plan.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Payment Form */}
            <h6 className="fw-bold text-secondary mb-3">
                <i className="bi bi-credit-card me-2"></i>Card Details
            </h6>
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

                {/* Order Summary */}
                <div className="order-summary mb-4">
                    <div className="d-flex justify-content-between">
                        <span className="text-muted small">Plan</span>
                        <span className="fw-semibold small">{selectedPlanData?.label} ({selectedPlanData?.duration})</span>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                        <span className="text-muted small">Total</span>
                        <span className="fw-bold text-purple">{selectedPlanData?.price}</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                >
                    {loading
                        ? <><FaSpinner className="spin" /> Processing...</>
                        : <><FaLock size={14} /> Pay {selectedPlanData?.price}</>
                    }
                </button>
            </form>

            <p className="text-center mt-4 small text-muted">
                🔒 Payments are secured and encrypted
            </p>
            <p className="text-center small fw-semibold text-secondary">
                <Link href="/sign-in" className="text-purple text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i>Back to Sign In
                </Link>
            </p>
        </div>
    );
}
