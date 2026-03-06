'use client';

import React, { useState, useEffect } from "react";
import "./BookCatalog.scss";

export default function BookCatalog({ books}) {
    // Search Inputs
    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 6; // Set how many books you want per page

    const [filters, setFilters] = useState({
        title: "",
        author: "",
        isbn: "",
        category: ""
    });

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const handleSearch = () => {
        setFilters({
            title: titleInput.toLowerCase(),
            author: authorInput.toLowerCase(),
            isbn: isbnInput.toLowerCase(),
            category: categoryInput
        });
    };

    const filteredBooks = books.filter((book) => {
        return (
            book.title.toLowerCase().includes(filters.title) &&
            book.author.toLowerCase().includes(filters.author) &&
            book.isbn.toLowerCase().includes(filters.isbn) &&
            (filters.category === "" || book.category === filters.category)
        );
    });

    // Logic for Pagination
    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="book-catalog container py-4">
            {/* SEARCH PANEL */}
            <div className="search-panel p-4 mb-5 bg-white">
                <div className="row g-3 align-items-end">
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">Title</label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="Book title..."
                            value={titleInput}
                            onChange={(e) => setTitleInput(e.target.value)}
                        />
                    </div>
                    <div className="col-md-3">
                        <label className="form-label small fw-bold">Author</label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="Author name..."
                            value={authorInput}
                            onChange={(e) => setAuthorInput(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">ISBN</label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="ISBN..."
                            value={isbnInput}
                            onChange={(e) => setIsbnInput(e.target.value)}
                        />
                    </div>
                    <div className="col-md-2">
                        <label className="form-label small fw-bold">Category</label>
                        <select
                            className="form-select custom-select"
                            value={categoryInput}
                            onChange={(e) => setCategoryInput(e.target.value)}
                        >
                            <option value="">All</option>
                            <option value="Programming">Programming</option>
                            <option value="Science">Science</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>
                    <div className="col-md-2">
                        <button className="btn btn-purple w-100 search-btn" onClick={handleSearch}>
                            Search Book
                        </button>
                    </div>
                </div>
            </div>

            {/* BOOK GRID */}
            <div className="row g-4">
                {currentBooks.length > 0 ? (
                    currentBooks.map((book) => (
                        <div key={book.id} className="col-lg-4 col-md-6">
                            <div className="book-card">
                                <div className="book-overlay">
                                    <button className="action-btn cart-btn">
                                        <i className="bi bi-cart-fill"></i>
                                    </button>
                                    <button className="action-btn view-btn">
                                        <i className="bi bi-eye-fill"></i>
                                    </button>
                                </div>

                                <div className="book-image-container">
                                    <img
                                        src={book.image || "/img/book-placeholder.png"}
                                        alt={book.title}
                                        className="book-image"
                                    />
                                </div>

                                <div className="book-info">
                                    <h5 className="book-title">{book.title}</h5>
                                    <p className="book-author">{book.author}</p>
                                    <div className="book-isbn">ISBN: {book.isbn}</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted">No books found.</p>
                    </div>
                )}
            </div>

            {/* PAGINATION UI */}
            {totalPages > 1 && (
                <nav className="pagination-container mt-5">
                    <ul className="pagination justify-content-center">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage - 1)}>
                                <i className="bi bi-chevron-left"></i>
                            </button>
                        </li>

                        {[...Array(totalPages)].map((_, index) => (
                            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                <button className="page-link" onClick={() => paginate(index + 1)}>
                                    {index + 1}
                                </button>
                            </li>
                        ))}

                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => paginate(currentPage + 1)}>
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
}