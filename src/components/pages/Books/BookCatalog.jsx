'use client';

import React, { useState, useEffect } from "react";
import "./BookCatalog.scss";
import Pagination from "@/components/common/Pagination";
import { useDataContext } from "@/lib/DataContext";

export default function BookCatalog() {

    const books = [
        {
            id: 1,
            title: "Clean Code",
            author: "Robert C. Martin",
            isbn: "9780132",
            category: "Programming",
            description: "A handbook of agile software craftsmanship teaching principles of writing clean and maintainable code.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 2,
            title: "The Pragmatic Programmer",
            author: "Andrew Hunt",
            isbn: "9780201",
            category: "Programming",
            description: "A classic book for software developers covering practical techniques and best practices.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 3,
            title: "Introduction to Algorithms",
            author: "Thomas H. Cormen",
            isbn: "978026",
            category: "Computer Science",
            description: "Widely used textbook covering algorithms, data structures, and computational complexity.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 4,
            title: "Atomic Habits",
            author: "James Clear",
            isbn: "978073",
            category: "Self Development",
            description: "A guide on how small habits can lead to remarkable personal and professional results.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 5,
            title: "Rich Dad Poor Dad",
            author: "Robert Kiyosaki",
            isbn: "978169",
            category: "Business",
            description: "A personal finance classic explaining financial education and wealth building.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 6,
            title: "Deep Learning",
            author: "Ian Goodfellow",
            isbn: "978026",
            category: "Artificial Intelligence",
            description: "Comprehensive introduction to deep learning concepts, neural networks, and machine learning.",
            image: "/img/book.jpg",
            available: false
        }
    ];


    const { globalData } = useDataContext();

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
        if (globalData) {
            setTitleInput(globalData);
            setFilters(prev => ({ ...prev, title: globalData.toLowerCase() }));
        }
    }, [globalData]);

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
    const totalPages = Math.ceil(filteredBooks.length / booksPerPage) || 1;

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
                    currentBooks.map((book) => {
                        const iconClass = "bi bi-book";

                        const coverNum = (Number(book.id) % 3) + 1;
                        const coverImage = `/img/book-covers/book-cover-${coverNum}.png`;

                        return (
                            <div key={book.id} className="col-lg-4 col-md-6">
                                <div className="book-card">
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

                                    <div className="book-image-container category-icon-container" style={{ backgroundImage: `url(${coverImage})` }}>
                                        <div className="inner-cover-content">
                                            <div className="top-title-container">
                                                <div className="top-title">{book.title}</div>
                                            </div>

                                            <div className="mid-icon">
                                                <i className={iconClass}></i>
                                            </div>

                                            <div className="bottom-label">
                                                {book.author}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="book-info">
                                        <p className="book-title">{book.title}</p>
                                        <p className="book-author">{book.author}</p>
                                        <span className="badge-category">{book.category}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12 text-center py-5">
                        <p className="text-muted">No books found.</p>
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}