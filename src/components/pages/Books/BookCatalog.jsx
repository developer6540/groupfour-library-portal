'use client';

import React, { useState, useEffect, useCallback } from "react";
import "./BookCatalog.scss";
import Pagination from "@/components/common/Pagination";
import { useDataContext } from "@/lib/dataContext";
import { capitalizeFirstLetter } from "@/lib/utility";

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

    const { globalData } = useDataContext();

    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    const [filters, setFilters] = useState({ title: "", author: "", isbn: "", category: "" });
    const [debouncedFilters, setDebouncedFilters] = useState(filters);
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    const safeCap = (str) => str ? capitalizeFirstLetter(str) : "N/A";

    // Helper to get dynamic cover image logic in one place
    const getCoverData = (bookCode) => {
        const coverNum = (Math.abs(parseInt(bookCode)) % 3) + 1;
        return `/img/book-covers/book-cover-${coverNum}.png`;
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/v1/category/list");
                const result = await response.json();
                if (response.ok && result.data) setCategories(result.data || []);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    const fetchBooks = useCallback(async () => {
        setIsLoading(true);
        try {
            const queryParams = new URLSearchParams({
                title: debouncedFilters.title,
                author: debouncedFilters.author,
                isbn: debouncedFilters.isbn,
                category: debouncedFilters.category,
                page: currentPage.toString(),
                pageSize: booksPerPage.toString(),
            });
            const response = await fetch(`/api/v1/book/list?${queryParams.toString()}`);
            const result = await response.json();
            if (response.ok && result.data) {
                setBooks(result.data.data || []);
                setTotalBooks(result.data.total || 0);
            } else {
                setBooks([]);
                setTotalBooks(0);
            }
        } catch (error) {
            console.error("Error fetching books:", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedFilters, currentPage]);

    useEffect(() => {
        fetchBooks();
    }, [fetchBooks]);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedFilters(filters), 500);
        return () => clearTimeout(handler);
    }, [filters]);

    useEffect(() => setCurrentPage(1), [debouncedFilters]);

    const clearFilters = () => {
        setTitleInput("");
        setAuthorInput("");
        setIsbnInput("");
        setCategoryInput("");
        setFilters({ title: "", author: "", isbn: "", category: "" });
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleViewBook = async (book) => {
        setSelectedBook(book);
        const modalEl = document.getElementById("bookDetailModal");
        if (!modalEl) return;

        try {
            const bootstrap = await loadBootstrap();
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.show();
        } catch (err) {
            console.error("Error showing Bootstrap modal", err);
        }
    };

    const hasFilters = titleInput || authorInput || isbnInput || categoryInput;
    const totalPages = Math.ceil(totalBooks / booksPerPage) || 1;

    return (
        <div className="book-catalog container py-4">
            {/* SEARCH PANEL */}
            <div className="search-panel p-4 mb-5 bg-white shadow-sm rounded">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">Title</label>
                        <input type="text" className="form-control custom-input" placeholder="Book title..."
                               value={titleInput} onChange={(e) => {
                            setTitleInput(e.target.value);
                            setFilters(prev => ({ ...prev, title: e.target.value }));
                        }} />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">Author</label>
                        <input type="text" className="form-control custom-input" placeholder="Author name..."
                               value={authorInput} onChange={(e) => {
                            setAuthorInput(e.target.value);
                            setFilters(prev => ({ ...prev, author: e.target.value }));
                        }} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">ISBN</label>
                        <input type="text" className="form-control custom-input" placeholder="ISBN..." value={isbnInput}
                               onChange={(e) => {
                                   setIsbnInput(e.target.value);
                                   setFilters(prev => ({ ...prev, isbn: e.target.value }));
                               }} />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">Category</label>
                        <select className="form-select custom-select" value={categoryInput} onChange={(e) => {
                            setCategoryInput(e.target.value);
                            setFilters(prev => ({ ...prev, category: e.target.value }));
                        }}>
                            <option value="">All</option>
                            {categories.map(cat => <option key={cat.BC_CODE} value={cat.BC_CODE}>{cat.BC_NAME}</option>)}
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-danger w-100 search-btn" onClick={clearFilters} disabled={!hasFilters}>
                            <i className="bi bi-eraser"></i>&nbsp;Clear
                        </button>
                    </div>
                </div>
            </div>

            {/* BOOK GRID */}
            <div className="row g-4">
                {isLoading ? (
                    <div className="col-12 text-center py-5">
                        <div className="spinner-border text-purple" role="status"></div>
                    </div>
                ) : books.length > 0 ? (
                    books.map(book => (
                        <div key={book.B_CODE} className="col-lg-4 col-md-6">
                            <div className="book-card">
                                <div className="book-isbn">ISBN: {book.B_ISBN}</div>
                                <div className="book-overlay">
                                    <button className="action-btn cart-btn"><i className="bi bi-cart-fill"></i></button>
                                    <button className="action-btn view-btn" onClick={() => handleViewBook(book)}>
                                        <i className="bi bi-eye-fill"></i>
                                    </button>
                                </div>
                                <div className="book-image-container category-icon-container"
                                     style={{ backgroundImage: `url(${getCoverData(book.B_CODE)})` }}>
                                    <div className="inner-cover-content">
                                        <div className="top-title-container">
                                            <div className="top-title">{safeCap(book.B_TITLE)}</div>
                                        </div>
                                        <div className="mid-icon"><i className="bi bi-book"></i></div>
                                        <div className="bottom-label">{safeCap(book.B_AUTHOR)}</div>
                                    </div>
                                </div>
                                <div className="book-info">
                                    <p className="book-title">{safeCap(book.B_TITLE)}</p>
                                    <p className="book-author">{safeCap(book.B_AUTHOR)}</p>
                                    <span className="badge-category">{safeCap(book.B_CATEGORY)}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <i className="bi bi-search text-muted mb-3" style={{ fontSize: "30px", display: "block" }}></i>
                        <h4 className="fw-bold m-3 text-muted">No books found</h4>
                        <button className="btn btn-outline-dark btn-sm" onClick={clearFilters}>Clear filters</button>
                    </div>
                )}
            </div>

            {books.length > 0 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />}

            {/* MODAL */}
            <div className="modal fade" id="bookDetailModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 shadow">
                        <div className="modal-header bg-purple">
                            <h5 className="modal-title text-white fw-bold">Book Details</h5>
                        </div>
                        <div className="modal-body p-4">
                            {selectedBook && (
                                <div className="row align-items-center">
                                    <div className="col-md-4 text-center mb-3 mb-md-0">
                                        <div className="book-image-container category-icon-container"
                                             style={{ backgroundImage: `url(${getCoverData(selectedBook.B_CODE)})` }}>
                                            <div className="inner-cover-content">
                                                <div className="top-title-container">
                                                    <div className="top-title">{safeCap(selectedBook.B_TITLE)}</div>
                                                </div>
                                                <div className="mid-icon"><i className="bi bi-book"></i></div>
                                                <div className="bottom-label">{safeCap(selectedBook.B_AUTHOR)}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-8">
                                        <h3 className="fw-bold text-purple">{safeCap(selectedBook.B_TITLE)}</h3>
                                        <p className="text-muted mb-4">By {safeCap(selectedBook.B_AUTHOR)}</p>
                                        <table className="table table-sm table-borderless">
                                            <tbody>
                                            <tr>
                                                <td className="fw-bold" style={{ width: "100px" }}>ISBN:</td>
                                                <td>{selectedBook.B_ISBN}</td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Category:</td>
                                                <td><span className="badge bg-info text-dark">{safeCap(selectedBook.B_CATEGORY)}</span></td>
                                            </tr>
                                            <tr>
                                                <td className="fw-bold">Publisher:</td>
                                                <td>{safeCap(selectedBook.B_PUBLISHER) || "N/A"}</td>
                                            </tr>
                                            </tbody>
                                        </table>
                                        <div className="row g-2 mt-4">
                                            <div className="col-6">
                                                <button
                                                    className="btn btn-purple text-white shadow-sm py-2 w-100"
                                                    style={{ backgroundColor: '#6f42c1', fontWeight: '600' }}
                                                >
                                                    <i className="bi bi-cart-plus-fill me-2"></i> Add to Cart
                                                </button>
                                            </div>
                                            <div className="col-6">
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary py-2 w-100"
                                                    data-bs-dismiss="modal"
                                                    style={{ fontWeight: '500' }}
                                                >
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