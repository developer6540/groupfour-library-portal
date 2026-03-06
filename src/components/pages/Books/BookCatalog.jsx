'use client';

import React, { useState, useEffect } from "react";
import "./BookCatalog.scss";
import Pagination from "@/components/common/Pagination";

export default function BookCatalog({ books }) {
    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 6;

    const [filters, setFilters] = useState({
        title: "",
        author: "",
        isbn: "",
        category: ""
    });

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

    const indexOfLastBook = currentPage * booksPerPage;
    const indexOfFirstBook = indexOfLastBook - booksPerPage;
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    const totalPages = 60; //Math.ceil(filteredBooks.length / booksPerPage);

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
                                {/* ISBN BADGE - TOP RIGHT */}
                                <div className="book-isbn">
                                    ISBN: {book.isbn}
                                </div>

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
                                    <span className="badge-category">{book.category}</span>
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
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

        </div>
    );
}