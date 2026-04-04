'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import "./BorrowedBooks.scss";
import Pagination from "@/components/common/Pagination";
import { capitalizeFirstLetter, getBaseUrl } from "@/lib/client-utility";
import { getCsrfToken } from "@/lib/session-client";
import { alerts } from "@/lib/alerts";
import { FaLock, FaSpinner, FaUserAlt, FaCalendarAlt } from "react-icons/fa";
import { MdOutlineCreditCard } from "react-icons/md";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from "react-icons/fa6";

const safeCap = (str) => str ? capitalizeFirstLetter(str) : "N/A";

const getCoverData = (bookCode) => {
    const coverNum = (Math.abs(parseInt(bookCode)) % 3) + 1;
    return `/img/book-covers/book-cover-${coverNum}.png`;
};

const STATUS_LABELS = {
    "O": { label: "Borrowed",  cls: "status-borrowed"  },
    "R": { label: "Returned",  cls: "status-returned"  },
    "L": { label: "Overdue",   cls: "status-overdue"   },
    "C": { label: "Cancelled", cls: "status-cancelled" },
};

const getStatusInfo = (code) => STATUS_LABELS[code] || { label: code || "—", cls: "status-unknown" };

const RatingStars = ({ rating, count }) => {
    const full  = Math.floor(rating);
    const half  = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return (
        <span className="rating-stars" title={`${rating} / 5 (${count} review${count !== 1 ? "s" : ""})`}>
            {Array(full).fill(null).map((_, i) => <i key={"f" + i}  className="bi bi-star-fill star-filled" />)}
            {half  === 1 && <i className="bi bi-star-half star-filled" />}
            {Array(empty).fill(null).map((_, i) => <i key={"e" + i} className="bi bi-star star-empty" />)}
            {count > 0 && <span className="rating-count ms-1">({count})</span>}
        </span>
    );
};

export default function BorrowedBooks() {
    const memberCodeRef  = useRef("");          // holds U_CODE without state timing issues
    const [books,        setBooks]        = useState([]);
    const [total,        setTotal]        = useState(0);
    const [isLoading,    setIsLoading]    = useState(true);
    const [loggedUser,   setLoggedUser]   = useState(null);
    const [userReady,    setUserReady]    = useState(false);
    const [searchInput,  setSearchInput]  = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [currentPage,  setCurrentPage]  = useState(1);
    const [selectedBook, setSelectedBook] = useState(null);
    const [showModal,    setShowModal]    = useState(false);

    // Fine summary
    const [fineSummary,  setFineSummary]  = useState({ totalFine: 0, totalPaid: 0, totalBalance: 0 });
    const [showPayModal, setShowPayModal] = useState(false);
    const [payLoading,   setPayLoading]   = useState(false);
    const [payForm,      setPayForm]      = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
    const [payErrors,    setPayErrors]    = useState({ cardName: "", cardNumber: "", expiry: "", cvv: "" });

    const pageSize   = 12;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const hasFilters = searchInput;

    /* ── Read logged-in user once on mount ── */
    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            const user   = stored ? JSON.parse(stored) : null;
            memberCodeRef.current = user?.U_CODE || "";
            setLoggedUser(user);
        } catch {}
        setUserReady(true);
    }, []);

    /* ── Debounce search only ── */
    useEffect(() => {
        const h = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(h);
    }, [searchInput]);

    /* ── Fetch fine summary ── */
    const fetchFineSummary = useCallback(async () => {
        if (!userReady || !memberCodeRef.current) return;
        try {
            const params = new URLSearchParams({ member: memberCodeRef.current });
            const res = await fetch(`/api/v1/book/fine-summary?${params}`);
            const result = await res.json();
            if (res.ok && result.data) setFineSummary(result.data);
        } catch (err) {
            console.error("Error fetching fine summary:", err);
        }
    }, [userReady]);

    useEffect(() => { fetchFineSummary(); }, [fetchFineSummary]);

    /* ── Fetch — uses ref so member is always correct ── */
    const fetchBooks = useCallback(async () => {
        if (!userReady) return;
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                t:        debouncedSearch,
                member:   memberCodeRef.current,
                page:     currentPage.toString(),
                pageSize: pageSize.toString(),
            });
            const res    = await fetch(`/api/v1/book/borrowed?${params}`);
            const result = await res.json();
            if (res.ok && result.data) {
                setBooks(result.data.data || []);
                setTotal(result.data.total  || 0);
            } else {
                setBooks([]);
                setTotal(0);
            }
        } catch (err) {
            console.error("Error fetching borrowed books:", err);
            setBooks([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage, userReady]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    /* ── Helpers ── */
    const clearFilters = () => {
        setSearchInput("");
    };

    const handleSearch = (val) => {
        setSearchInput(val);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openDetail = (book) => {
        setSelectedBook(book);
        setShowModal(true);
    };

    const closeModal = () => setShowModal(false);

    const resetPayForm = () => {
        setPayForm({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
        setPayErrors({ cardName: "", cardNumber: "", expiry: "", cvv: "" });
    };

    const closePayModal = () => {
        setShowPayModal(false);
        resetPayForm();
    };

    const formatCardNumber = (val) =>
        val.replace(/\D/g, "").substring(0, 16).replace(/(.{4})/g, "$1 ").trim();

    const formatExpiry = (val) => {
        const digits = val.replace(/\D/g, "").substring(0, 4);
        return digits.length >= 3 ? digits.substring(0, 2) + "/" + digits.substring(2) : digits;
    };

    const handlePayFieldChange = (e) => {
        const { id, value } = e.target;
        let v = value;
        if (id === "pCardNumber") v = formatCardNumber(value);
        if (id === "pExpiry")     v = formatExpiry(value);
        if (id === "pCvv")        v = value.replace(/\D/g, "").substring(0, 3);
        setPayForm(prev => ({ ...prev, [id.replace("p", "").charAt(0).toLowerCase() + id.replace("p", "").slice(1)]: v }));
        setPayErrors(prev => ({ ...prev, [id.replace("p", "").charAt(0).toLowerCase() + id.replace("p", "").slice(1)]: "" }));
    };

    const validatePayForm = () => {
        const e = { cardName: "", cardNumber: "", expiry: "", cvv: "" };
        if (!payForm.cardName.trim())                                e.cardName   = "Cardholder name is required";
        if (payForm.cardNumber.replace(/\s/g, "").length !== 16)    e.cardNumber = "Enter a valid 16-digit card number";
        const [mm, yy] = (payForm.expiry || "").split("/");
        if (!mm || !yy || parseInt(mm) < 1 || parseInt(mm) > 12 || yy.length !== 2)
                                                                     e.expiry     = "Enter valid expiry MM/YY";
        if (payForm.cvv.length !== 3)                                e.cvv        = "Enter a valid 3-digit CVV";
        setPayErrors(e);
        return !Object.values(e).some(Boolean);
    };

    const handlePaySubmit = async (ev) => {
        ev.preventDefault();
        if (!validatePayForm()) return;
        if (fineSummary.totalBalance <= 0) {
            alerts.info("No Outstanding Fine", "You have no balance to pay.");
            return;
        }
        setPayLoading(true);
        const toastId = alerts.loading("Processing payment...");
        try {
            const refNo = "REF-" + Date.now();
            const res = await fetch(`${getBaseUrl()}/api/v1/book/fine-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || "",
                },
                body: JSON.stringify({
                    memberCode: memberCodeRef.current,
                    amount:     fineSummary.totalBalance,
                    payMode:    "CARD",
                    refNo,
                }),
            });
            const result = await res.json();
            import("sonner").then(({ toast }) => toast.dismiss(toastId));
            if (!res.ok) {
                alerts.error("Payment Failed", result.message || "Something went wrong.");
                return;
            }
            alerts.success("Payment Successful! 🎉", result.message || "Your fine has been cleared.", 4000);
            closePayModal();
            fetchFineSummary();
            fetchBooks();
        } catch {
            alerts.error("Connection Error", "Could not process payment. Please try again.");
        } finally {
            setPayLoading(false);
        }
    };

    const formatDate = (val) => {
        if (!val) return "—";
        const d = new Date(val);
        return isNaN(d) ? val : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="borrowed-books-section container-fluid px-0">

            {/* ── Section Header ── */}
            <div className="borrowed-section-header mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="section-icon">
                        <i className="bi bi-journal-bookmark-fill"></i>
                    </div>
                    <div>
                        <h4 className="section-title mb-0">Borrow Books</h4>
                        <p className="section-subtitle mb-0">Your personal book borrowing history</p>
                    </div>
                    {total > 0 && (
                        <span className="ms-auto records-badge">{total} record{total !== 1 ? "s" : ""}</span>
                    )}
                </div>
            </div>

            {/* ── Pay Button ── */}
            <div className="pay-fine-bar mb-4">
                <p className="pay-fine-total">Total Fine Amount</p>
                <p className="pay-fine-amount">LKR {fineSummary.totalFine.toLocaleString('en-LK', { minimumFractionDigits: 2 })}</p>
                <button
                    type="button"
                    className="btn-pay-standalone"
                    onClick={() => { resetPayForm(); setShowPayModal(true); }}
                >
                    <i className="bi bi-credit-card-fill me-2"></i>Pay Fine
                </button>
            </div>

            {/* ── Filter Bar ── */}
            <div className="borrowed-filter-panel p-4 mb-4 bg-white shadow-sm rounded">
                <div className="row g-3 align-items-end">
                    <div className="col-md-8">
                        <label className="form-label small fw-bold">Search</label>
                        <div className="input-group">
                            <span className="input-group-text search-icon-addon">
                                <i className="bi bi-search"></i>
                            </span>
                            <input
                                type="text"
                                className="form-control custom-input"
                                placeholder="Title, author or ISBN…"
                                value={searchInput}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-2">
                        <button
                            className="btn btn-outline-secondary w-100 clear-btn"
                            onClick={clearFilters}
                            disabled={!hasFilters}
                        >
                            <i className="bi bi-eraser me-1"></i>Clear
                        </button>
                    </div>
                    {loggedUser && (
                        <div className="col-12">
                            <span className="small text-muted">
                                <i className="bi bi-person-fill me-1 text-purple"></i>
                                Showing borrowed books for: <strong>{loggedUser.U_NAME || loggedUser.U_CODE}</strong>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="borrowed-table-wrapper bg-white shadow-sm rounded p-0 mb-3">
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-purple" role="status"></div>
                        <p className="text-muted mt-3 small">Loading borrowed books…</p>
                    </div>
                ) : books.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table borrowed-table mb-0">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cover</th>
                                    <th>ISBN</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Publisher</th>
                                    <th>Borrow Date</th>
                                    <th>Due Date</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book, idx) => {
                                    return (
                                        <tr key={`${book.BH_DOCNO}-${book.BD_LINENO}`} onClick={() => openDetail(book)} style={{ cursor: 'pointer' }}>
                                            <td className="row-num">{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td>
                                                <div
                                                    className="book-thumb category-icon-container"
                                                    style={{ backgroundImage: `url(${getCoverData(book.BD_BOOKCODE)})` }}
                                                >
                                                    <div className="inner-cover-content">
                                                        <div className="top-title-container">
                                                            <div className="top-title">{safeCap(book.B_TITLE)}</div>
                                                        </div>
                                                        <div className="mid-icon"><i className="bi bi-book"></i></div>
                                                        <div className="bottom-label">{safeCap(book.B_AUTHOR)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="isbn-cell">{book.B_ISBN || "—"}</td>
                                            <td className="title-cell">{safeCap(book.B_TITLE)}</td>
                                            <td>{safeCap(book.B_AUTHOR)}</td>
                                            <td>
                                                <span className="badge-category">{safeCap(book.B_CATEGORY)}</span>
                                            </td>
                                            <td>{safeCap(book.B_PUBLISHER)}</td>
                                            <td className="date-cell">{formatDate(book.BH_BORROWDATE)}</td>
                                            <td className="date-cell">{formatDate(book.BD_DUEDATE)}</td>
                                            <td>
                                                <RatingStars rating={book.AVG_RATING || 0} count={book.RATING_COUNT || 0} />
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-icon-action"
                                                    title="View Details"
                                                    onClick={() => openDetail(book)}
                                                >
                                                    <i className="bi bi-eye-fill"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-journal-x text-muted mb-3" style={{ fontSize: "36px", display: "block" }}></i>
                        <h5 className="fw-bold text-muted">No borrowed books found</h5>
                        {hasFilters && (
                            <button className="btn btn-outline-dark btn-sm mt-2" onClick={clearFilters}>
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {books.length > 0 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
            )}

            {/* ── Detail Modal ── */}
            {showModal && selectedBook && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-box-header">
                            <h5 className="mb-0 fw-bold">
                                <i className="bi bi-journal-bookmark-fill me-2"></i>Borrow Record
                            </h5>
                            <button className="modal-close-btn" onClick={closeModal} title="Close">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-box-body">
                            <div className="row align-items-start">
                                {/* Cover */}
                                <div className="col-md-3 text-center mb-4 mb-md-0">
                                    <div
                                        className="book-image-container-modal category-icon-container"
                                        style={{ backgroundImage: `url(${getCoverData(selectedBook.BD_BOOKCODE)})` }}
                                    >
                                        <div className="inner-cover-content">
                                            <div className="top-title-container">
                                                <div className="top-title">{safeCap(selectedBook.B_TITLE)}</div>
                                            </div>
                                            <div className="mid-icon"><i className="bi bi-book"></i></div>
                                            <div className="bottom-label">{safeCap(selectedBook.B_AUTHOR)}</div>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <RatingStars rating={selectedBook.AVG_RATING || 0} count={selectedBook.RATING_COUNT || 0} />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="col-md-9">
                                    <h4 className="fw-bold text-purple mb-1">{safeCap(selectedBook.B_TITLE)}</h4>
                                    <p className="text-muted mb-3">By {safeCap(selectedBook.B_AUTHOR)}</p>

                                    <div className="row g-3 mb-3">
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">ISBN</span>
                                                <span className="detail-value font-monospace">{selectedBook.B_ISBN || "—"}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Category</span>
                                                <span className="badge-category">{safeCap(selectedBook.B_CATEGORY)}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Publisher</span>
                                                <span className="detail-value">{safeCap(selectedBook.B_PUBLISHER)}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Document No.</span>
                                                <span className="detail-value font-monospace">{selectedBook.BH_DOCNO}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="my-3" />
                                    <h6 className="fw-bold text-purple mb-3">Borrow Information</h6>
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Member</span>
                                                <span className="detail-value">
                                                    <span className="member-badge">{selectedBook.BH_MEMBERCODE}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Borrow Date</span>
                                                <span className="detail-value">{formatDate(selectedBook.BH_BORROWDATE)}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Due Date</span>
                                                <span className="detail-value">{formatDate(selectedBook.BD_DUEDATE)}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Qty / Returned</span>
                                                <span className="detail-value">
                                                    {selectedBook.BD_QTY} / {selectedBook.BD_RETURNED_QTY}
                                                </span>
                                            </div>
                                        </div>
                                        {selectedBook.BD_REMARK && (
                                            <div className="col-12">
                                                <div className="detail-item">
                                                    <span className="detail-label">Remark</span>
                                                    <span className="detail-value">{selectedBook.BD_REMARK}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-box-footer">
                            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── Pay Modal ── */}
            {showPayModal && (
                <div className="modal-overlay" onClick={closePayModal}>
                    <div className="modal-box pay-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-box-header">
                            <h5 className="mb-0 fw-bold">
                                <i className="bi bi-credit-card-fill me-2"></i>Outstanding Fine Payment
                            </h5>
                            <button type="button" className="modal-close-btn" onClick={closePayModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-box-body">
                            {/* Summary row */}
                            <div className="pay-modal-summary mb-4">
                                <div className="row g-3">
                                    <div className="col-sm-4">
                                        <div className="detail-item">
                                            <span className="detail-label">Member</span>
                                            <span className="detail-value fw-bold">{loggedUser?.U_CODE || "—"}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-4">
                                        <div className="detail-item">
                                            <span className="detail-label">Total Fine</span>
                                            <span className="detail-value">LKR {fineSummary.totalFine.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                    <div className="col-sm-4">
                                        <div className="detail-item balance-box">
                                            <span className="detail-label">Amount Due</span>
                                            <span className="detail-value fine-amount fw-bold fs-5">LKR {fineSummary.totalBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Card payment form */}
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <span className="small fw-semibold text-secondary">
                                    <i className="bi bi-credit-card me-2"></i>Card Details
                                </span>
                                <div className="d-flex align-items-center gap-1">
                                    <FaCcVisa       size={30} style={{ color: "#1a1f71" }} title="Visa" />
                                    <FaCcMastercard size={30} style={{ color: "#eb001b" }} title="Mastercard" />
                                    <FaCcAmex       size={30} style={{ color: "#007bc1" }} title="American Express" />
                                </div>
                            </div>
                            <form onSubmit={handlePaySubmit} noValidate>
                                {/* Cardholder Name */}
                                <div className="mb-3">
                                    <label htmlFor="pCardName" className="form-label small fw-semibold text-secondary">Cardholder Name *</label>
                                    <div className="position-relative">
                                        <FaUserAlt className="form-icon text-muted" style={{ position:"absolute", top:"50%", left:"14px", transform:"translateY(-50%)", pointerEvents:"none" }} />
                                        <input
                                            id="pCardName"
                                            type="text"
                                            value={payForm.cardName}
                                            onChange={handlePayFieldChange}
                                            placeholder="Name on card"
                                            className={`form-control rounded-3 ps-5 ${payErrors.cardName ? "is-invalid" : ""}`}
                                        />
                                    </div>
                                    {payErrors.cardName && <div className="text-danger small mt-1">{payErrors.cardName}</div>}
                                </div>

                                {/* Card Number */}
                                <div className="mb-3">
                                    <label htmlFor="pCardNumber" className="form-label small fw-semibold text-secondary">Card Number *</label>
                                    <div className="position-relative">
                                        <MdOutlineCreditCard size={20} className="text-muted" style={{ position:"absolute", top:"50%", left:"14px", transform:"translateY(-50%)", pointerEvents:"none" }} />
                                        <input
                                            id="pCardNumber"
                                            type="text"
                                            value={payForm.cardNumber}
                                            onChange={handlePayFieldChange}
                                            placeholder="1234 5678 9012 3456"
                                            className={`form-control rounded-3 ps-5 ${payErrors.cardNumber ? "is-invalid" : ""}`}
                                        />
                                    </div>
                                    {payErrors.cardNumber && <div className="text-danger small mt-1">{payErrors.cardNumber}</div>}
                                </div>

                                {/* Expiry + CVV */}
                                <div className="row g-3 mb-4">
                                    <div className="col-7">
                                        <label htmlFor="pExpiry" className="form-label small fw-semibold text-secondary">Expiry Date *</label>
                                        <div className="position-relative">
                                            <FaCalendarAlt className="text-muted" style={{ position:"absolute", top:"50%", left:"14px", transform:"translateY(-50%)", pointerEvents:"none" }} />
                                            <input
                                                id="pExpiry"
                                                type="text"
                                                value={payForm.expiry}
                                                onChange={handlePayFieldChange}
                                                placeholder="MM/YY"
                                                className={`form-control rounded-3 ps-5 ${payErrors.expiry ? "is-invalid" : ""}`}
                                            />
                                        </div>
                                        {payErrors.expiry && <div className="text-danger small mt-1">{payErrors.expiry}</div>}
                                    </div>
                                    <div className="col-5">
                                        <label htmlFor="pCvv" className="form-label small fw-semibold text-secondary">CVV *</label>
                                        <div className="position-relative">
                                            <FaLock className="text-muted" style={{ position:"absolute", top:"50%", left:"14px", transform:"translateY(-50%)", pointerEvents:"none" }} />
                                            <input
                                                id="pCvv"
                                                type="password"
                                                value={payForm.cvv}
                                                onChange={handlePayFieldChange}
                                                placeholder="•••"
                                                className={`form-control rounded-3 ps-5 ${payErrors.cvv ? "is-invalid" : ""}`}
                                            />
                                        </div>
                                        {payErrors.cvv && <div className="text-danger small mt-1">{payErrors.cvv}</div>}
                                    </div>
                                </div>

                                {/* Order summary */}
                                <div className="order-summary mb-4 p-3 rounded-3 bg-light border">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted small">Payment Type</span>
                                        <span className="fw-semibold small">Library Fine</span>
                                    </div>
                                    <div className="d-flex justify-content-between mt-1">
                                        <span className="text-muted small">Total</span>
                                        <span className="fw-bold text-danger">LKR {fineSummary.totalBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={payLoading || fineSummary.totalBalance <= 0}
                                    className="btn btn-purple w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
                                >
                                    {payLoading
                                        ? <><FaSpinner className="spin" /> Processing...</>
                                        : <><FaLock size={14} /> Pay LKR {fineSummary.totalBalance.toLocaleString("en-LK", { minimumFractionDigits: 2 })}</>
                                    }
                                </button>
                                <p className="text-center mt-3 small text-muted">🔒 Payments are secured and encrypted</p>
                            </form>
                        </div>
                        <div className="modal-box-footer">
                            <button type="button" className="btn btn-secondary" onClick={closePayModal} disabled={payLoading}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
