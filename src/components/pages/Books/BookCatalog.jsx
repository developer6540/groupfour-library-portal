'use client';

import React, { useState, useEffect } from "react";
import "./BookCatalog.scss";
import Pagination from "@/components/common/Pagination";
import { useDataContext } from "@/lib/DataContext";

export default function BookCatalog() {

    const books = [
        {
            id: 1,
            title: "You Don't Know JS",
            author: "Kyle Simpson",
            isbn: "9781491904244",
            category: "Programming",
            description: "A deep dive into JavaScript core mechanisms including scope, closures, and async behavior.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 2,
            title: "JavaScript: The Good Parts",
            author: "Douglas Crockford",
            isbn: "9780596517748",
            category: "Programming",
            description: "Highlights the elegant features of JavaScript and explains how to use the language effectively.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 3,
            title: "Design Patterns",
            author: "Erich Gamma",
            isbn: "9780201633610",
            category: "Programming",
            description: "Classic book describing reusable object-oriented software design patterns.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 4,
            title: "Refactoring",
            author: "Martin Fowler",
            isbn: "9780201485677",
            category: "Programming",
            description: "Improving the design of existing code with practical refactoring techniques.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 5,
            title: "The Clean Coder",
            author: "Robert C. Martin",
            isbn: "9780137081073",
            category: "Programming",
            description: "A code of conduct for professional programmers covering discipline and responsibility.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 6,
            title: "Head First Design Patterns",
            author: "Eric Freeman",
            isbn: "9780596007126",
            category: "Programming",
            description: "An engaging introduction to design patterns using real-world examples.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 7,
            title: "Effective Java",
            author: "Joshua Bloch",
            isbn: "9780134685991",
            category: "Programming",
            description: "Best practices and patterns for writing high-quality Java code.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 8,
            title: "Cracking the Coding Interview",
            author: "Gayle Laakmann McDowell",
            isbn: "9780984782857",
            category: "Computer Science",
            description: "Popular preparation guide for technical interviews with coding questions.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 9,
            title: "Computer Networking: A Top-Down Approach",
            author: "James Kurose",
            isbn: "9780133594140",
            category: "Computer Science",
            description: "Explains networking concepts from application layer to physical layer.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 10,
            title: "Operating System Concepts",
            author: "Abraham Silberschatz",
            isbn: "9781118063330",
            category: "Computer Science",
            description: "Comprehensive guide to operating system structures and concepts.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 11,
            title: "Soft Skills",
            author: "John Sonmez",
            isbn: "9781617292392",
            category: "Career",
            description: "Career development advice for software developers including productivity and personal branding.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 12,
            title: "The Phoenix Project",
            author: "Gene Kim",
            isbn: "9780988262591",
            category: "Business",
            description: "A novel about IT, DevOps, and helping your business win.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 13,
            title: "The Lean Startup",
            author: "Eric Ries",
            isbn: "9780307887894",
            category: "Business",
            description: "Startup methodology focusing on rapid experimentation and validated learning.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 14,
            title: "Start With Why",
            author: "Simon Sinek",
            isbn: "9781591846444",
            category: "Business",
            description: "Explains how great leaders inspire action by focusing on purpose.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 15,
            title: "Think and Grow Rich",
            author: "Napoleon Hill",
            isbn: "9781585424337",
            category: "Self Development",
            description: "Classic motivational book about achieving success and wealth.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 16,
            title: "The 7 Habits of Highly Effective People",
            author: "Stephen Covey",
            isbn: "9780743269513",
            category: "Self Development",
            description: "Personal development framework based on seven powerful habits.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 17,
            title: "Mindset",
            author: "Carol S. Dweck",
            isbn: "9780345472328",
            category: "Self Development",
            description: "Explains fixed vs growth mindset and how mindset affects success.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 18,
            title: "Grit",
            author: "Angela Duckworth",
            isbn: "9781501111105",
            category: "Self Development",
            description: "The power of passion and perseverance in achieving long-term goals.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 19,
            title: "Zero to One",
            author: "Peter Thiel",
            isbn: "9780804139298",
            category: "Business",
            description: "Insights on building innovative startups that create new markets.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 20,
            title: "Deep Work",
            author: "Cal Newport",
            isbn: "9781455586691",
            category: "Self Development",
            description: "Focus on deep, distraction-free work to produce high value results.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 21,
            title: "Digital Minimalism",
            author: "Cal Newport",
            isbn: "9780525536512",
            category: "Self Development",
            description: "Guide to living better with less digital distraction.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 22,
            title: "Artificial Intelligence: A Modern Approach",
            author: "Stuart Russell",
            isbn: "9780134610993",
            category: "Artificial Intelligence",
            description: "Comprehensive textbook covering modern AI concepts.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 23,
            title: "Pattern Recognition and Machine Learning",
            author: "Christopher Bishop",
            isbn: "9780387310732",
            category: "Artificial Intelligence",
            description: "Mathematical approach to machine learning and pattern recognition.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 24,
            title: "Hands-On Machine Learning",
            author: "Aurélien Géron",
            isbn: "9781492032649",
            category: "Artificial Intelligence",
            description: "Practical machine learning with Scikit-Learn, Keras, and TensorFlow.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 25,
            title: "Python Crash Course",
            author: "Eric Matthes",
            isbn: "9781593279288",
            category: "Programming",
            description: "Fast-paced introduction to Python programming.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 26,
            title: "Learning React",
            author: "Alex Banks",
            isbn: "9781492051725",
            category: "Programming",
            description: "Modern guide to building applications using React.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 27,
            title: "Node.js Design Patterns",
            author: "Mario Casciaro",
            isbn: "9781839214110",
            category: "Programming",
            description: "Best practices and patterns for scalable Node.js applications.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 28,
            title: "Laravel Up & Running",
            author: "Matt Stauffer",
            isbn: "9781492041214",
            category: "Programming",
            description: "Comprehensive guide to building modern PHP applications with Laravel.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 29,
            title: "Fullstack Vue",
            author: "Hassan Djirdeh",
            isbn: "9781985083914",
            category: "Programming",
            description: "Guide to building Vue.js applications with modern tooling.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 30,
            title: "The DevOps Handbook",
            author: "Gene Kim",
            isbn: "9781942788003",
            category: "Technology",
            description: "Practices for improving IT performance using DevOps principles.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 31,
            title: "Site Reliability Engineering",
            author: "Betsy Beyer",
            isbn: "9781491929124",
            category: "Technology",
            description: "Google's approach to building reliable and scalable systems.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 32,
            title: "Hooked",
            author: "Nir Eyal",
            isbn: "9781591847786",
            category: "Business",
            description: "How to build habit-forming products.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 33,
            title: "Measure What Matters",
            author: "John Doerr",
            isbn: "9780525536222",
            category: "Business",
            description: "Explains the OKR goal-setting framework used by leading companies.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 34,
            title: "The Psychology of Money",
            author: "Morgan Housel",
            isbn: "9780857197689",
            category: "Finance",
            description: "Timeless lessons on wealth, greed, and happiness.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 35,
            title: "Make Time",
            author: "Jake Knapp",
            isbn: "9780525572428",
            category: "Self Development",
            description: "Practical tips to focus on what matters every day.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 36,
            title: "Rework",
            author: "Jason Fried",
            isbn: "9780307463746",
            category: "Business",
            description: "Fresh perspective on building businesses and startups.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 37,
            title: "Algorithms to Live By",
            author: "Brian Christian",
            isbn: "9781627790369",
            category: "Computer Science",
            description: "Applies computer science algorithms to everyday decision making.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 38,
            title: "The Art of Computer Programming",
            author: "Donald Knuth",
            isbn: "9780201896831",
            category: "Computer Science",
            description: "Legendary multi-volume work on algorithms and programming theory.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 39,
            title: "Structure and Interpretation of Computer Programs",
            author: "Harold Abelson",
            isbn: "9780262510875",
            category: "Computer Science",
            description: "Influential textbook teaching fundamental programming concepts.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 40,
            title: "Code Complete",
            author: "Steve McConnell",
            isbn: "9780735619678",
            category: "Programming",
            description: "Comprehensive guide to software construction best practices.",
            image: "/img/book.jpg",
            available: true
        }
    ];

    const { globalData } = useDataContext();

    const [titleInput, setTitleInput] = useState("");
    const [authorInput, setAuthorInput] = useState("");
    const [isbnInput, setIsbnInput] = useState("");
    const [categoryInput, setCategoryInput] = useState("");

    const [filters, setFilters] = useState({
        title: "",
        author: "",
        isbn: "",
        category: ""
    });

    const [debouncedFilters, setDebouncedFilters] = useState(filters);

    const [currentPage, setCurrentPage] = useState(1);
    const booksPerPage = 12;

    /* Apply global search */
    useEffect(() => {
        if (globalData) {
            setTitleInput(globalData);
            setFilters(prev => ({ ...prev, title: globalData.toLowerCase() }));
        }
    }, [globalData]);

    /* Debounce filter (500ms delay) */
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);

        return () => clearTimeout(handler);
    }, [filters]);

    /* Reset page when filters change */
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedFilters]);

    const clearFilters = () => {
        setTitleInput("");
        setAuthorInput("");
        setIsbnInput("");
        setCategoryInput("");

        setFilters({
            title: "",
            author: "",
            isbn: "",
            category: ""
        });
    };

    const hasFilters =
        titleInput || authorInput || isbnInput || categoryInput;

    const filteredBooks = books.filter((book) => {
        return (
            book.title.toLowerCase().includes(debouncedFilters.title) &&
            book.author.toLowerCase().includes(debouncedFilters.author) &&
            book.isbn.toLowerCase().includes(debouncedFilters.isbn) &&
            (debouncedFilters.category === "" || book.category === debouncedFilters.category)
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
                            onChange={(e) => {
                                const value = e.target.value;
                                setTitleInput(value);
                                setFilters(prev => ({ ...prev, title: value.toLowerCase() }));
                            }}
                        />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label small fw-bold">Author</label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="Author name..."
                            value={authorInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setAuthorInput(value);
                                setFilters(prev => ({ ...prev, author: value.toLowerCase() }));
                            }}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold">ISBN</label>
                        <input
                            type="text"
                            className="form-control custom-input"
                            placeholder="ISBN..."
                            value={isbnInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setIsbnInput(value);
                                setFilters(prev => ({ ...prev, isbn: value.toLowerCase() }));
                            }}
                        />
                    </div>

                    <div className="col-md-2">
                        <label className="form-label small fw-bold">Category</label>
                        <select
                            className="form-select custom-select"
                            value={categoryInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setCategoryInput(value);
                                setFilters(prev => ({ ...prev, category: value }));
                            }}
                        >
                            <option value="">All</option>
                            <option value="Programming">Programming</option>
                            <option value="Computer Science">Computer Science</option>
                            <option value="Business">Business</option>
                        </select>
                    </div>

                    <div className="col-md-2">
                        <button
                            className="btn btn-danger w-100 search-btn"
                            onClick={clearFilters}
                            disabled={!hasFilters}
                        >
                            <i className="bi bi-eraser"></i>&nbsp;Clear All
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

                                    <div
                                        className="book-image-container category-icon-container"
                                        style={{ backgroundImage: `url(${coverImage})` }}
                                    >
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