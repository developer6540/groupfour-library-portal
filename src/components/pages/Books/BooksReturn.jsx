'use client';

import React, { useState, useEffect, useCallback } from "react";
import "./BooksReturn.scss";
import Pagination from "@/components/common/Pagination";
import { capitalizeFirstLetter, getBaseUrl } from "@/lib/client-utility";
import { alerts } from "@/lib/alerts";
import {getUserCode} from "@/lib/server-utility";
import {getCsrfToken} from "@/lib/session-client";

const loadBootstrap = async () => {
    if (typeof window !== "undefined" && !window.bootstrap) {
        const bootstrap = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
        window.bootstrap = bootstrap;
    }
    return window.bootstrap;
};

export default function BooksReturn() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);

    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    const [filters, setFilters] = useState({ title: "", author: "", isbn: "", category: "" });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [feedbackType, setFeedbackType] = useState("General");

    const [errors, setErrors] = useState({
        rating: "",
        subject: "",
        message: ""
    });

    const safeCap = (str) => str ? capitalizeFirstLetter(str) : "N/A";

    const getCoverData = (bookCode) => {
        const numericId = parseInt(bookCode?.replace(/\D/g, '')) || 0;
        const coverNum = (numericId % 10) + 1;
        return `/img/book-covers/book-cover-${coverNum}.png`;
    };

    // --- NEW: PAGE CHANGE HANDLER ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Smoothly scroll to the top of the catalog when page changes
        const catalogTop = document.querySelector(".book-catalog");
        if (catalogTop) {
            catalogTop.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${getBaseUrl()}/api/v1/category/list`);
            const result = await response.json();

            if (response.ok && result.data) {
                setCategories(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    },[fetchCategories]);

    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                title: debouncedFilters.title,
                author: debouncedFilters.author,
                isbn: debouncedFilters.isbn,
                category: debouncedFilters.category,
                userCode: await getUserCode(),
                page: currentPage.toString(),
                pageSize: booksPerPage.toString(),
            });

            const response = await fetch(`${getBaseUrl()}/api/v1/books/return?${queryParams.toString()}`);
            const result = await response.json();
            if (response.ok && result.data) {
                setBooks(result.data.data || []);
                setTotalBooks(result.data.total || 0);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedFilters, currentPage]);

    useEffect(() => {
        fetchBooks();
    },[fetchBooks]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedFilters(filters), 500);
        return () => clearTimeout(handler);
    }, [filters]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilters]);

    const clearFilters = () => {
        setTitleInput(""); setAuthorInput(""); setIsbnInput(""); setCategoryInput("");
        setFilters({ title: "", author: "", isbn: "", category: "" });
    };

    const handleFeedbackView = async (book) => {
        setSelectedBook(book);
        const modalEl = document.getElementById("bookReturnModal");
        if (!modalEl) return;
        const bootstrap = await loadBootstrap();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    };

    // Validaiton
    const validateFeedback = (name, value) => {
        let error = "";

        if (name === "rating") {
            if (!value || value < 1) error = "Rating is required";
        }

        if (name === "subject") {
            if (!value.trim()) error = "Subject is required";
            else if (value.trim().length < 3) error = "Minimum 3 characters required";
            else if (value.length > 100) error = "Maximum 100 characters allowed";
        }

        if (name === "message") {
            if (!value.trim()) error = "Message is required";
            else if (value.trim().length < 10) error = "Minimum 10 characters required";
            else if (value.length > 500) error = "Maximum 500 characters allowed";
        }

        return error;
    };

    const handleRating = (value) => {
        setRating(value);
        setErrors(prev => ({
            ...prev,
            rating: validateFeedback("rating", value)
        }));
    };

    const handleSubjectChange = (e) => {
        const value = e.target.value;
        setSubject(value);
        setErrors(prev => ({
            ...prev,
            subject: validateFeedback("subject", value)
        }));
    };

    const handleMessageChange = (e) => {
        const value = e.target.value;
        setMessage(value);
        setErrors(prev => ({
            ...prev,
            message: validateFeedback("message", value)
        }));
    };

    const handleFeedback = async (selectedBook) => {

        const ratingError = validateFeedback("rating", rating);
        const subjectError = validateFeedback("subject", subject);
        const messageError = validateFeedback("message", message);

        if (ratingError || subjectError || messageError) {
            setErrors({
                rating: ratingError,
                subject: subjectError,
                message: messageError
            });

            alerts.error("Validation Error", "Please fix the errors before submitting.");
            return;
        }

        try {
            const payload = {
                FB_USER_ID: await getUserCode(),
                FB_BOOK_ID: selectedBook.B_CODE,
                FB_TYPE: feedbackType,
                FB_RATING: rating,
                FB_SUBJECT: subject,
                FB_MESSAGE: message
            };

            const res = await fetch(`${getBaseUrl()}/api/v1/feedback/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || '',
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {

                alerts.success(data.message || "Feedback submitted successfully 111!");

                resetFeedbackForm();

                const modalEl = document.getElementById("bookReturnModal");
                if (modalEl && window.bootstrap) {
                    const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                    modalInstance?.hide();
                }

            } else {
                alerts.error("Failed to submit feedback");
            }

        } catch (err) {
            console.error(err);
            alerts.error("Something went wrong");
        }
    };

    const resetFeedbackForm = () => {
        setRating(0);
        setHoverRating(0); // if you implement hover
        setSubject("");
        setMessage("");
        setFeedbackType("General");
        setErrors({ rating: "", subject: "", message: "" });
    };

    const isFeedbackInvalid =
        errors.rating || errors.subject || errors.message ||
        !rating || !subject || !message;

    const totalPages = Math.ceil(totalBooks / booksPerPage) || 1;

    return (
        <div className="book-return container py-4" style={{ scrollMarginTop: '20px' }}>
            {/* SEARCH PANEL */}
            <div className="search-panel p-4 mb-5 bg-white shadow-sm rounded">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-uppercase">Title</label>
                        <input type="text" className="form-control custom-input" placeholder="Search title..." value={titleInput} onChange={(e) => { setTitleInput(e.target.value); setFilters(prev => ({ ...prev, title: e.target.value })); }} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold text-uppercase">Author</label>
                        <input type="text" className="form-control custom-input" placeholder="Search author..." value={authorInput} onChange={(e) => { setAuthorInput(e.target.value); setFilters(prev => ({ ...prev, author: e.target.value })); }} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-uppercase">ISBN</label>
                        <input type="text" className="form-control custom-input" placeholder="ISBN..." value={isbnInput} onChange={(e) => { setIsbnInput(e.target.value); setFilters(prev => ({ ...prev, isbn: e.target.value })); }} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold text-uppercase">Category</label>
                        <select className="form-select custom-select" value={categoryInput} onChange={(e) => { setCategoryInput(e.target.value); setFilters(prev => ({ ...prev, category: e.target.value })); }}>
                            <option value="">All</option>
                            {categories.map(cat => <option key={cat.BC_CODE} value={cat.BC_CODE}>{cat.BC_NAME}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-danger w-100 search-btn" onClick={clearFilters} disabled={!titleInput && !authorInput && !isbnInput && !categoryInput}>
                            <i className="bi bi-eraser"></i> Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* BOOK GRID */}
            <div className="row g-4 position-relative">
                {isLoading && (
                    <div className="col-12 text-center py-5"><div className="spinner-border text-purple"></div></div>
                )}
                {!isLoading && books.length > 0 ? (
                    books.map(book => (
                        <div key={book.B_CODE} className="col-lg-4 col-md-6">
                            <div className="book-card">
                                <div className="book-isbn">ISBN: {book.B_ISBN}</div>
                                <div className="book-image-container category-icon-container bk-rotate book-image" style={{ backgroundImage: `url(${getCoverData(book.B_CODE)})` }}>
                                    <div className="inner-cover-content">
                                        <div className="top-title-container"><div className="top-title">{safeCap(book.B_TITLE)}</div></div>
                                        <div className="mid-icon"><i className="bi bi-book"></i></div>
                                        <div className="bottom-label">{safeCap(book.B_AUTHOR)}</div>
                                    </div>
                                </div>
                                <div className="book-info">
                                    <p className="book-title mt-3">{safeCap(book.B_TITLE)}</p>
                                    <p className="book-author">{safeCap(book.B_AUTHOR)}</p>
                                    <div className="mt-2"><span className="badge-category">{safeCap(book.B_CATEGORY)}</span></div>
                                    <button  className="btn btn-sm shadow-sm fw-bold btn-feedback mt-3" onClick={() => handleFeedbackView(book)}><i className="bi bi-star"></i> Add Feedback</button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : !isLoading && (
                    <div className="col-12 text-center py-5">
                        <div className="fw-bold" style={{fontSize:"50px", marginBottom:"-10px", color:"#b3b3b3"}}><i className="bi bi-book"></i></div>
                        <div className="fw-bold" style={{fontSize:"20px", color:"#b3b3b3"}}>Books Not Found</div>
                    </div>
                )}
            </div>

            {books.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}

            {/* CLEAN & MINIMALIST DETAIL MODAL */}
            <div className="modal fade" id="bookReturnModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-body p-0">
                            {selectedBook && (
                                <div className="row g-0">
                                    <div className="col-md-5 d-none d-md-flex align-items-center justify-content-center p-5 bg-light-purple">
                                        <div className="book-image-container category-icon-container bk-rotate book-image" style={{ width:'100%', height:'100%', backgroundImage: `url(${getCoverData(selectedBook.B_CODE)})` }}>
                                            <div className="inner-cover-content">
                                                <div className="top-title-container"><div className="top-title">{safeCap(selectedBook.B_TITLE)}</div></div>
                                                <div className="mid-icon"><i className="bi bi-book"></i></div>
                                                <div className="bottom-label">{safeCap(selectedBook.B_AUTHOR)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-7 p-4 p-lg-5">
                                        <div className="d-flex flex-column h-100">
                                            <div className="mb-4">
                                                <h5 className="fw-bold text-dark mb-1 lh-sm">Add Your Feedback</h5>
                                            </div>

                                            <div className="feedback-form" style={{height:"250px", overflowY:"scroll", paddingRight:"20px"}}>

                                                {/* RATING */}
                                                <div className="mb-3">
                                                    <div className={`star-rating ${errors.rating ? 'is-invalid' : ''} text-center`}>
                                                        {[1,2,3,4,5].map(num => (
                                                            <i
                                                                key={num}
                                                                className={`bi ${num <= (hoverRating || rating) ? "bi-star-fill" : "bi-star"}`}
                                                                onClick={() => handleRating(num)}
                                                                onMouseEnter={() => setHoverRating(num)}
                                                                onMouseLeave={() => setHoverRating(0)}
                                                                style={{ cursor: "pointer" }}
                                                            />
                                                        ))}
                                                    </div>
                                                    {errors.rating && <div className="error-text">{errors.rating}</div>}
                                                </div>

                                                {/* TYPE */}
                                                <div className="mb-3">
                                                    <label className="form-label">Feedback Type</label>
                                                    <select
                                                        className="form-select"
                                                        value={feedbackType}
                                                        onChange={(e) => setFeedbackType(e.target.value)}
                                                    >
                                                        <option value="General">General</option>
                                                        <option value="Complaint">Complaint</option>
                                                        <option value="Issue">Issue</option>
                                                        <option value="Suggestion">Suggestion</option>
                                                    </select>
                                                </div>

                                                {/* SUBJECT */}
                                                <div className="mb-3">
                                                    <label className="form-label">Subject *</label>
                                                    <input
                                                        type="text"
                                                        className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                        value={subject}
                                                        onChange={handleSubjectChange}
                                                        placeholder="Enter subject"
                                                    />
                                                    {errors.subject && <div className="error-text">{errors.subject}</div>}
                                                </div>

                                                {/* MESSAGE */}
                                                <div className="mb-3">
                                                    <label className="form-label">Message *</label>
                                                    <textarea
                                                        className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                        rows={3}
                                                        value={message}
                                                        onChange={handleMessageChange}
                                                        placeholder="Write your feedback..."
                                                    />
                                                    {errors.message && <div className="error-text">{errors.message}</div>}
                                                </div>

                                            </div>

                                            <div className="modal-action-row d-flex gap-2 mt-4">
                                                <button
                                                    disabled={isFeedbackInvalid}
                                                    onClick={() => handleFeedback(selectedBook)}
                                                    className="btn btn-purple flex-grow-1 py-2"
                                                >
                                                    Submit Feedback
                                                </button>
                                                <button className="btn btn-outline-dark px-4 py-2" onClick={resetFeedbackForm} data-bs-dismiss="modal">
                                                    Close
                                                </button>
                                            </div>

                                            </div>

                                        </div>
                                    </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}