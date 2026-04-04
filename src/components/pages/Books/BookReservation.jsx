'use client';

import React, {useState, useEffect, useCallback} from "react";
import "./BookReservation.scss";
import {getCsrfToken, getSessionClient, setSessionClient} from "@/lib/session-client";
import {capitalizeFirstLetter, getBaseUrl} from "@/lib/client-utility";
import {useDataContext} from "@/lib/dataContext";
import Link from "next/link";
import {alerts} from "@/lib/alerts";
import {getUserInfo} from "@/lib/server-utility";
import {useRouter} from "next/navigation";
import {FaSpinner} from "react-icons/fa";

export default function BookReservation() {

    const router = useRouter();

    const {getGlobalDataCart, setGlobalDataCart} = useDataContext();
    const [isHydrated, setIsHydrated] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Use the global context as the single source of truth
    const cartItems = Array.isArray(getGlobalDataCart) ? getGlobalDataCart : [];

    // 1. LOAD: Fetch from Session on Mount
    const loadCart = useCallback(async () => {
        try {
            const saved = getSessionClient("cart-items");
            if (saved) {
                const parsed = typeof saved === "string" ? JSON.parse(saved) : saved;
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const formatted = parsed.map(book => ({
                        ...book,
                        BR_QTY: book.BR_QTY ?? 1,
                        BR_HOLD_DAYS: book.BR_HOLD_DAYS ?? 1,
                        BR_REMARK: book.BR_REMARK ?? ""
                    }));
                    setGlobalDataCart(formatted);
                }
            }
        } catch (error) {
            console.error("Failed to load cart:", error);
        } finally {
            setIsHydrated(true);
        }
    }, [setGlobalDataCart]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    // 2. SAVE: Sync Context to Session whenever cartItems change
    useEffect(() => {
        if (!isHydrated) return;
        setSessionClient("cart-items", JSON.stringify(cartItems));
    }, [cartItems, isHydrated]);

    const removeReservation = (code) => {
        alerts.confirm(
            "Remove Item",
            "Are you sure you want to remove?",
            async () => {
                setGlobalDataCart(prev => (prev || []).filter(book => book.B_CODE !== code));
            }
        )
    };

    const updateField = (code, field, delta) => {
        setGlobalDataCart(prev =>
            (prev || []).map(book =>
                book.B_CODE === code
                    ? {
                        ...book,
                        [field]: Math.min(
                            Math.max(
                                field === "BR_QTY"
                                    ? (book.BR_QTY ?? 1) + delta
                                    : (book.BR_HOLD_DAYS ?? 1) + delta,
                                1
                            ),
                            field === "BR_QTY" ? 4 : 3
                        )
                    }
                    : book
            )
        );
    };

    const handleRemarkChange = (code, value) => {
        setGlobalDataCart(prev =>
            (prev || []).map(book =>
                book.B_CODE === code ? {...book, BR_REMARK: value} : book
            )
        );
    };

    const confirmReservation = async () => {

        if (!cartItems.length) return;

        alerts.confirm(
            "Receive Books",
            "Are you sure you want to make reservation?",
            async () => {

                setIsSubmitting(true);

                try {
                    const user = await getUserInfo();
                    const userData = typeof user === "string" ? JSON.parse(user) : user;

                   // Check reservation eligibility
                    const eligibilityRes = await fetch(`${getBaseUrl()}/api/v1/user/${userData.U_CODE}/reservation/eligibility`, {
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": getCsrfToken() || '',
                        }
                    });

                    const eligibility = await eligibilityRes.json();

                    if (!eligibilityRes.ok || !eligibility.data.isEligible) {
                        alerts.error(eligibility.data?.message || "You are not eligible to reserve books.");
                        setIsSubmitting(false);
                        return;
                    }

                    // Payload
                    const payload = cartItems.map((book, index) => ({
                        BR_USERCODE: userData?.U_CODE,
                        BR_BOOKCODE: book.B_CODE,
                        BR_QTY: 1,
                        BR_HOLD_DAYS: 3,
                        BR_REMARK: book.BR_REMARK,
                        BR_BORROW_LINENO: index + 1
                    }));

                    const response = await fetch(`${getBaseUrl()}/api/v1/user/reserve-booksyy`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "X-CSRF-Token": getCsrfToken() || '',
                        },
                        body: JSON.stringify(payload),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        alerts.success("Reservation submitted successfully!");
                        setGlobalDataCart([]);
                        setSessionClient("cart-items", JSON.stringify([]));
                        setIsSubmitting(false);
                        router.push('/books/reserve/complete');
                    } else {
                        alerts.error(result.message || "Failed to submit reservation.");
                        setIsSubmitting(false);
                    }

                } catch (error) {
                    console.error("Reservation failed:", error);
                    alerts.error("A network error occurred.");
                    setIsSubmitting(false);
                }
            }
        );
    };

    const confirmClearAll = async () => {

        alerts.confirm(
            "Clear Cart",
            "Are you sure you want to clear all your selected books?",
            async () => {
                setGlobalDataCart([])
            }
        );
    };

    if (!isHydrated) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-purple"></div>
                <p className="mt-2 text-muted">Synchronizing your cart...</p>
            </div>
        );
    }

    return (
        <div className="book-reservation-card container">
            <div className="reservation-header d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-dark">
                    <i className="bi bi-journal-bookmark-fill me-2 text-purple-soft"></i>
                    Selected Books ({cartItems.length})
                </h5>
                {cartItems.length > 0 && (
                    <button
                        type="button"
                        className="btn btn-danger btn-sm text-white text-decoration-none"
                        onClick={confirmClearAll}
                    >
                        <i className="bi bi-trash3"></i> &nbsp; Clear All
                    </button>
                )}
            </div>

            {cartItems.length === 0 ? (
                <div className="empty-reservation text-center py-5">
                    <div className="icon-wrapper mb-3">
                        <i className="bi bi-cart-x text-muted" style={{fontSize: '3rem'}}></i>
                    </div>
                    <h5 className="text-dark">Your queue is empty</h5>
                    <p className="text-muted mb-4">You haven't selected any books for reservation yet.</p>
                    <Link className="btn btn-purple" href="/books">Back to Book List</Link>
                </div>
            ) : (
                <>
                    <div className="table-responsive">
                        <table className="table reservation-table">
                            <thead>
                            <tr>
                                <th>Book Information</th>
                                <th>Author</th>
                                <th>ISBN</th>
                                <th>Category</th>
                                <th className="text-end">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {cartItems.map(book => (
                                <React.Fragment key={book.B_CODE}>
                                    <tr className="main-row">
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="book-icon-sm me-3"><i className="bi bi-book"></i></div>
                                                <div>
                                                    <div
                                                        className="fw-bold text-dark mb-0">{book.B_TITLE}</div>
                                                    <span className="text-muted small-code">Code: {book.B_CODE}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-secondary">{capitalizeFirstLetter(book.B_AUTHOR || "Unknown")}</td>
                                        <td className="text-secondary font-monospace small">{book.B_ISBN}</td>
                                        <td><span className="badge-category">{book.B_CATEGORY}</span></td>
                                        <td className="text-end">
                                            <button type="button" className="btn btn-action-delete"
                                                    onClick={() => removeReservation(book.B_CODE)}>
                                                <i className="bi bi-trash3"></i>
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="reservation-form-row">
                                        <td colSpan="5">
                                            <div className="row mt-1 g-3">
                                                {/*<div className="col-lg-2 col-md-3">*/}
                                                {/*    <label className="form-label-custom">Quantity</label>*/}
                                                {/*    <div className="input-group input-group-sm custom-stepper">*/}
                                                {/*        <button type="button" className="btn" onClick={() => updateField(book.B_CODE, "BR_QTY", -1)}>-</button>*/}
                                                {/*        <input type="text" className="form-control text-center" value={book.BR_QTY} readOnly />*/}
                                                {/*        <button type="button" className="btn" onClick={() => updateField(book.B_CODE, "BR_QTY", 1)}>+</button>*/}
                                                {/*    </div>*/}
                                                {/*</div>*/}
                                                {/*<div className="col-lg-2 col-md-3">*/}
                                                {/*    <label className="form-label-custom">Hold Duration (Days)</label>*/}
                                                {/*    <div className="input-group input-group-sm custom-stepper">*/}
                                                {/*        <button type="button" className="btn" onClick={() => updateField(book.B_CODE, "BR_HOLD_DAYS", -1)}>-</button>*/}
                                                {/*        <input type="text" className="form-control text-center" value={book.BR_HOLD_DAYS} readOnly />*/}
                                                {/*        <button type="button" className="btn" onClick={() => updateField(book.B_CODE, "BR_HOLD_DAYS", 1)}>+</button>*/}
                                                {/*    </div>*/}
                                                {/*</div>*/}
                                                <div className="col-lg-12 col-md-6">
                                                    <label className="form-label-custom">Special Remarks</label>
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm remark-input"
                                                        placeholder="Add any specific instructions here..."
                                                        value={book.BR_REMARK || ""}
                                                        onChange={(e) => handleRemarkChange(book.B_CODE, e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="reservation-footer d-flex justify-content-between align-items-center mt-4">
                        <p className="small fw-bold text-muted mb-0">Total books: <strong>{cartItems.length}</strong></p>
                        <button type="button" disabled={isSubmitting} className="btn btn-purple" onClick={confirmReservation}>
                            {isSubmitting ? (
                                <>
                                    <FaSpinner className="animate-spin" /> &nbsp;
                                    Confirm Reservation
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-book"></i> &nbsp; Confirm Reservation
                                </>
                            )}

                        </button>
                    </div>
                </>
            )}
        </div>
    );
}