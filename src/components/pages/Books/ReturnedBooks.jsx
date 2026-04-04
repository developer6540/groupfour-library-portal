'use client';

import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ReturnedBooks.scss";
import Pagination from "@/components/common/Pagination";
import { capitalizeFirstLetter } from "@/lib/client-utility";

const safeCap = (str) => str ? capitalizeFirstLetter(str) : "N/A";

const getCoverData = (bookCode) => {
    const coverNum = (Math.abs(parseInt(bookCode)) % 3) + 1;
    return `/img/book-covers/book-cover-${coverNum}.png`;
};

const CONDITION_LABELS = {
    "O": { label: "Good",    cls: "cond-good"    },
    "N": { label: "New",     cls: "cond-new"     },
    "D": { label: "Damaged", cls: "cond-damaged" },
    "L": { label: "Lost",    cls: "cond-lost"    },
};
const getConditionInfo = (code) =>
    CONDITION_LABELS[code] || { label: code || "—", cls: "cond-unknown" };

export default function ReturnedBooks() {
    const memberCodeRef  = useRef("");
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

    /* ── Debounce search ── */
    useEffect(() => {
        const h = setTimeout(() => {
            setDebouncedSearch(searchInput);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(h);
    }, [searchInput]);

    /* ── Fetch ── */
    const fetchBooks = useCallback(async () => {
        if (!userReady) return;
        // Do not fetch without a resolved member code — would expose all users' data
        if (!memberCodeRef.current) {
            setBooks([]);
            setTotal(0);
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                t:        debouncedSearch,
                member:   memberCodeRef.current,
                page:     currentPage.toString(),
                pageSize: pageSize.toString(),
            });
            const res    = await fetch(`/api/v1/book/returned?${params}`);
            const result = await res.json();
            if (res.ok && result.data) {
                setBooks(result.data.data || []);
                setTotal(result.data.total  || 0);
            } else {
                setBooks([]);
                setTotal(0);
            }
        } catch (err) {
            console.error("Error fetching returned books:", err);
            setBooks([]);
            setTotal(0);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearch, currentPage, userReady]);

    useEffect(() => { fetchBooks(); }, [fetchBooks]);

    const clearFilters = () => setSearchInput("");
    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const openDetail  = (book) => { setSelectedBook(book); setShowModal(true); };
    const closeModal  = () => setShowModal(false);

    const formatDate = (val) => {
        if (!val) return "—";
        const d = new Date(val);
        return isNaN(d) ? String(val) : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    };

    return (
        <div className="returned-books-section container-fluid px-0">

            {/* ── Section Header ── */}
            <div className="returned-section-header mb-4">
                <div className="d-flex align-items-center gap-3">
                    <div className="section-icon">
                        <i className="bi bi-arrow-return-left"></i>
                    </div>
                    <div>
                        <h4 className="section-title mb-0">Return Books</h4>
                        <p className="section-subtitle mb-0">Your personal book return history</p>
                    </div>
                    {total > 0 && (
                        <span className="ms-auto records-badge">{total} record{total !== 1 ? "s" : ""}</span>
                    )}
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="returned-filter-panel p-4 mb-4 bg-white shadow-sm rounded">
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
                                onChange={(e) => setSearchInput(e.target.value)}
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
                                Showing return history for: <strong>{loggedUser.U_NAME || loggedUser.U_CODE}</strong>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Table ── */}
            <div className="returned-table-wrapper bg-white shadow-sm rounded p-0 mb-3">
                {isLoading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-purple" role="status"></div>
                        <p className="text-muted mt-3 small">Loading return history…</p>
                    </div>
                ) : books.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table returned-table mb-0">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Cover</th>
                                    <th>ISBN</th>
                                    <th>Title</th>
                                    <th>Author</th>
                                    <th>Category</th>
                                    <th>Publisher</th>
                                    <th>Return Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {books.map((book, idx) => {

                                    return (
                                        <tr key={`${book.RH_DOCNO}-${book.RD_LINENO}`}>
                                            <td className="row-num">{(currentPage - 1) * pageSize + idx + 1}</td>
                                            <td>
                                                <div
                                                    className="book-thumb category-icon-container"
                                                    style={{ backgroundImage: `url(${getCoverData(book.RD_BOOKCODE)})` }}
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
                                            <td className="date-cell">{formatDate(book.RH_RETURNDATE)}</td>
                                            <td>
                                                <button
                                                    type="button"
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
                        <i className="bi bi-arrow-return-left text-muted mb-3" style={{ fontSize: "36px", display: "block" }}></i>
                        <h5 className="fw-bold text-muted">No return records found</h5>
                        {hasFilters && (
                            <button type="button" className="btn btn-outline-dark btn-sm mt-2" onClick={clearFilters}>
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
                                <i className="bi bi-arrow-return-left me-2"></i>Return Record
                            </h5>
                            <button type="button" className="modal-close-btn" onClick={closeModal} title="Close">
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>
                        <div className="modal-box-body">
                            <div className="row align-items-start">
                                <div className="col-md-3 text-center mb-4 mb-md-0">
                                    <div
                                        className="book-image-container-modal category-icon-container"
                                        style={{ backgroundImage: `url(${getCoverData(selectedBook.RD_BOOKCODE)})` }}
                                    >
                                        <div className="inner-cover-content">
                                            <div className="top-title-container">
                                                <div className="top-title">{safeCap(selectedBook.B_TITLE)}</div>
                                            </div>
                                            <div className="mid-icon"><i className="bi bi-book"></i></div>
                                            <div className="bottom-label">{safeCap(selectedBook.B_AUTHOR)}</div>
                                        </div>
                                    </div>
                                </div>
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
                                                <span className="detail-value font-monospace">{selectedBook.RH_DOCNO}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="my-3" />
                                    <h6 className="fw-bold text-purple mb-3">Return Information</h6>
                                    <div className="row g-3">
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Return Date</span>
                                                <span className="detail-value">{formatDate(selectedBook.RH_RETURNDATE)}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Borrow Ref</span>
                                                <span className="detail-value font-monospace">{selectedBook.RH_BORROW_DOCNO}</span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6">
                                            <div className="detail-item">
                                                <span className="detail-label">Qty Returned</span>
                                                <span className="detail-value">{selectedBook.RD_RETURN_QTY}</span>
                                            </div>
                                        </div>
                                        {selectedBook.RD_REMARK && (
                                            <div className="col-12">
                                                <div className="detail-item">
                                                    <span className="detail-label">Remark</span>
                                                    <span className="detail-value">{selectedBook.RD_REMARK}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-box-footer">
                            <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
