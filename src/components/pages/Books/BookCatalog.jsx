'use client';

import React, { useState, useEffect, useCallback } from "react";
import "./BookCatalog.scss";
import Pagination from "@/components/common/Pagination";
import { useDataContext } from "@/lib/dataContext";
import { capitalizeFirstLetter, getBaseUrl } from "@/lib/client-utility";
import { alerts } from "@/lib/alerts";
import {getUserCode, getUserInfo} from "@/lib/server-utility";
import {getCsrfToken} from "@/lib/session-client";

const loadBootstrap = async () => {
    if (typeof window !== "undefined" && !window.bootstrap) {
        const bootstrap = await import("bootstrap/dist/js/bootstrap.bundle.min.js");
        window.bootstrap = bootstrap;
    }
    return window.bootstrap;
};

export default function BookCatalog() {
    const [books, setBooks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [totalBooks, setTotalBooks] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedBook, setSelectedBook] = useState(null);

    const { getGlobalData, getGlobalDataCart, setGlobalDataCart } = useDataContext();

    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    const [filters, setFilters] = useState({ title: "", author: "", isbn: "", category: "" });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    const [userResEligibility, setUserResEligibility] = useState(null);

    const safeCap = (str) => str ? capitalizeFirstLetter(str) : "N/A";

    const getCoverData = (bookCode) => {
        const numericId = parseInt(bookCode?.replace(/\D/g, '')) || 0;
        const coverNum = (numericId % 10) + 1;
        return `/img/book-covers/book-cover-${coverNum}.png`;
    };

    const renderStars = (rating = 0) => (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
                <i key={star} className={`bi ${star <= rating ? 'bi-star-fill' : 'bi-star'}`}></i>
            ))}
            <span className="rating-text">({rating})</span>
        </div>
    );

    // --- NEW: PAGE CHANGE HANDLER ---
    const handlePageChange = (page) => {
        setCurrentPage(page);
        // Smoothly scroll to the top of the catalog when page changes
        const catalogTop = document.querySelector(".book-catalog");
        if (catalogTop) {
            catalogTop.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    useEffect(() => {
        if (getGlobalData) {
            setTitleInput(getGlobalData);
            setFilters(prev => ({ ...prev, title: getGlobalData }));
        }
    }, [getGlobalData]);


    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch(`${getBaseUrl()}/api/v1/category/list`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || '',
                },
            });
            const result = await response.json();

            if (response.ok && result.data) {
                setCategories(result.data || []);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

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
            const response = await fetch(`${getBaseUrl()}/api/v1/books/list?${queryParams.toString()}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || '',
                },
            });
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

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedFilters(filters), 500);
        return () => clearTimeout(handler);
    }, [filters]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilters]);

    useEffect(() => {
        const fetchUserEligibility = async () => {
            const userCode = await getUserCode();
            if (!userCode) return;

            try {
                const response = await fetch(`${getBaseUrl()}/api/v1/user/${userCode}/reservation/eligibility`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-Token": getCsrfToken() || '',
                    },
                });
                const result = await response.json();
                if (response.ok) {
                    setUserResEligibility(result.data);
                }
            } catch (error) {
                console.error("Error pre-fetching eligibility:", error);
            }
        };

        fetchUserEligibility();
    }, [currentPage]);

    const clearFilters = () => {
        setTitleInput(""); setAuthorInput(""); setIsbnInput(""); setCategoryInput("");
        setFilters({ title: "", author: "", isbn: "", category: "" });
    };

    const handleViewBook = async (book) => {
        setSelectedBook(book);
        const modalEl = document.getElementById("bookDetailModal");
        if (!modalEl) return;
        const bootstrap = await loadBootstrap();
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    };

    const handleAddToCart = async (book, e) => {
        const user = await getUserInfo();
        //const userData = typeof user === "string" ? JSON.parse(user) : user;
        //const maxBorrow = userData?.U_MAXBORROW || 2;
        const maxReservation = 2;
        const currentCart = Array.isArray(getGlobalDataCart) ? getGlobalDataCart : [];
        if (currentCart.some(item => item.B_CODE === book.B_CODE)) {
            alerts.warning("Already in your cart.");
            return;
        }
        if (currentCart.length >= maxReservation) {
            alerts.error(`Limit reached!`, `You may only reserve up to ${maxReservation} books per reservation.`);
            return;
        }

        animateToCart(e);
        setGlobalDataCart([...currentCart, book]);
    };

    const animateToCart = (event) => {

        const cart = document.getElementById("cart-icon");
        if (!cart) return;

        const sourceEl = event?.currentTarget || event?.target;
        if (!sourceEl) return;

        const card = sourceEl.closest?.(".book-card");
        if (!card) return;

        const img = card.querySelector(".book-image");
        if (!img) return;

        const imgRect = img.getBoundingClientRect();
        const cartRect = cart.getBoundingClientRect();

        const clone = img.cloneNode(true);

        clone.style.position = "fixed";
        clone.style.top = `${imgRect.top}px`;
        clone.style.left = `${imgRect.left}px`;
        clone.style.width = `${imgRect.width}px`;
        clone.style.height = `${imgRect.height}px`;
        clone.style.zIndex = "20000";
        clone.style.pointerEvents = "none";
        clone.style.transition = "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)";
        clone.style.transform = "scale(1)";
        clone.style.opacity = "1";

        document.body.appendChild(clone);

        requestAnimationFrame(() => {
            clone.style.top = `${cartRect.top}px`;
            clone.style.left = `${cartRect.left}px`;
            clone.style.width = "40px";
            clone.style.height = "40px";
            clone.style.opacity = "0";
            clone.style.transform = "scale(0.3)";
        });

        setTimeout(() => {
            clone.remove();
            cart.classList.add("cart-bounce");
            setTimeout(() => cart.classList.remove("cart-bounce"), 300);
        }, 700);
    };

    const totalPages = Math.ceil(totalBooks / booksPerPage) || 1;

    return (
        <div className="book-catalog container py-4" style={{ scrollMarginTop: '20px' }}>
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
                    books.map((book, index) => (
                        <div key={index} className="col-lg-4 col-md-6">
                            <div className="book-card">
                                <div className="book-isbn">ISBN: {book.B_ISBN}</div>
                                <div className="book-overlay">
                                    <button className="action-btn cart-btn"
                                            onClick={(e) => {
                                                handleAddToCart(book, e);
                                            }}>
                                        <i className="bi bi-cart-fill"></i></button>
                                    <button className="action-btn view-btn" onClick={() => handleViewBook(book)}><i className="bi bi-eye-fill"></i></button>
                                </div>
                                <div className="book-image-container category-icon-container bk-rotate book-image" style={{ backgroundImage: `url(${getCoverData(book.B_CODE)})` }}>
                                    <div className="inner-cover-content">
                                        <div className="top-title-container"><div className="top-title">{book.B_TITLE}</div></div>
                                        <div className="mid-icon"><i className="bi bi-book"></i></div>
                                        <div className="bottom-label">{safeCap(book.B_AUTHOR)}</div>
                                    </div>
                                    <p className="book-stock">{book.BI_QTY}</p>
                                </div>
                                <div className="book-info">
                                    <p className="book-title mt-2">{book.B_TITLE}</p>
                                    <p className="book-author">{safeCap(book.B_AUTHOR)}</p>
                                    {renderStars(book.STAR_RATE || 0)}
                                    <div className="mt-2"><span className="badge-category">{safeCap(book.B_CATEGORY)}</span></div>
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
            <div className="modal fade" id="bookDetailModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                        <div className="modal-body p-0">
                            {selectedBook && (
                                <div className="row g-0">
                                    <div className="col-md-5 d-none d-md-flex align-items-center justify-content-center p-5 bg-light-purple">
                                        <div className="book-image-container category-icon-container bk-rotate book-image" style={{ width:'100%', height:'100%', backgroundImage: `url(${getCoverData(selectedBook.B_CODE)})` }}>
                                            <div className="inner-cover-content">
                                                <div className="top-title-container"><div className="top-title">{selectedBook.B_TITLE}</div></div>
                                                <div className="mid-icon"><i className="bi bi-book"></i></div>
                                                <div className="bottom-label">{safeCap(selectedBook.B_AUTHOR)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-7 p-4 p-lg-5">
                                        <div className="d-flex flex-column h-100">
                                            <div className="mb-4">
                                                <span className="badge-minimal mb-2">{safeCap(selectedBook.B_CATEGORY)}</span>
                                                <h3 className="fw-bold text-dark mb-1 lh-sm">{selectedBook.B_TITLE}</h3>
                                                <p className="text-muted mb-3">by <span className="text-dark fw-medium">{safeCap(selectedBook.B_AUTHOR)}</span></p>
                                                <div className="detail-rating-wrap">{renderStars(selectedBook.STAR_RATE || 0)}</div>
                                            </div>

                                            <div className="specs-grid mb-auto">
                                                <div className="spec-row">
                                                    <span className="label">ISBN-13</span>
                                                    <span className="value">{selectedBook.B_ISBN}</span>
                                                </div>
                                                <div className="spec-row">
                                                    <span className="label">Publisher</span>
                                                    <span className="value text-truncate ms-2">{safeCap(selectedBook.B_PUBLISHER) || "N/A"}</span>
                                                </div>
                                                <div className="spec-row">
                                                    <span className="label">Available Stock</span>
                                                    <span className="value fw-semibold">{selectedBook.BI_QTY}</span>
                                                </div>
                                            </div>

                                            <div className="modal-action-row d-flex gap-2 mt-4">
                                                <button
                                                    onClick={(e) => {
                                                        handleAddToCart(selectedBook, e);
                                                    }} className="btn btn-dark-minimal flex-grow-1 py-2">
                                                    Add to Cart
                                                </button>
                                                <button className="btn btn-outline-dark px-4 py-2" data-bs-dismiss="modal">
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