'use client';

import React, { useState } from "react";
import "./BookCatalog.scss";

export default function BookCatalog({ books = [] }) {
    // Input states (what the user is currently typing)
    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    // Applied filter states (what is actually filtering the list)
    const [filters, setFilters] = useState({
        title: "",
        author: "",
        isbn: "",
        category: ""
    });

    // Triggered by the Search Button
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

    const renderStars = (rating = 4) => {
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < rating ? 'filled' : ''}`}>★</span>
        ));
    };

    return (
        <div className="book-catalog container py-4">
            {/* MULTIPLE SEARCH TEXTBOXES */}
            <div className="search-panel p-4 mb-3  bg-white">
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
                        <button
                            className="btn btn-primary w-100 search-btn"
                            onClick={handleSearch}
                        >
                            Search Book
                        </button>
                    </div>
                </div>
            </div>

            {/* BOOK GRID */}
            <div className="row g-4">
                {filteredBooks.map((book) => (
                    <div key={book.id} className="col-lg-3 col-md-4 col-sm-6">
                        <div className="book-card">
                            <div className="book-image-container">
                                <img
                                    src={book.image || "/img/book-placeholder.png"}
                                    alt={book.title}
                                    className="book-image"
                                />
                                <div className="book-overlay">
                                    <button className="action-btn cart-btn"><i className="bi bi-cart-fill"></i></button>
                                    <button className="action-btn view-btn"><i className="bi bi-eye-fill"></i></button>
                                </div>
                            </div>

                            <div className="book-info text-center">
                                <h5 className="book-title">{book.title}</h5>
                                <p className="book-author">by {book.author}</p>

                                <div className="book-isbn">
                                    <small className="isbn-label">ISBN</small>
                                    <small className="isbn-number">{book.isbn}</small>
                                </div>

                                <div className="book-isbn">
                                    <small className="isbn-number">({book.category})</small>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}