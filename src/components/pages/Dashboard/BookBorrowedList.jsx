'use client';

import React from 'react';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import './BookBorrowedList.scss';

export default function BookBorrowedList() {

    const bookBorrowed = [
        {
            id: 1,
            title: "Eloquent JavaScript",
            author: "Marijn Haverbeke",
            isbn: "9781593279509",
            category: "Programming",
            description: "Modern introduction to JavaScript covering language fundamentals and advanced topics.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 2,
            title: "The Mythical Man-Month",
            author: "Frederick P. Brooks Jr.",
            isbn: "9780201835953",
            category: "Software Engineering",
            description: "Classic essays on software project management and development challenges.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 3,
            title: "Don't Make Me Think",
            author: "Steve Krug",
            isbn: "9780321965516",
            category: "UX Design",
            description: "Practical guide to web usability and intuitive user interface design.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 4,
            title: "Hooked on UX",
            author: "David Travis",
            isbn: "9780993336334",
            category: "UX Design",
            description: "Explains the importance of user experience in building engaging products.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 5,
            title: "The Intelligent Investor",
            author: "Benjamin Graham",
            isbn: "9780060555665",
            category: "Finance",
            description: "Classic investment guide focusing on long-term value investing strategies.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 6,
            title: "Sapiens",
            author: "Yuval Noah Harari",
            isbn: "9780062316097",
            category: "History",
            description: "Explores the history of humankind from the Stone Age to the modern era.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 7,
            title: "Homo Deus",
            author: "Yuval Noah Harari",
            isbn: "9780062464316",
            category: "History",
            description: "Discusses the future of humanity in the age of artificial intelligence and biotechnology.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 8,
            title: "The Alchemist",
            author: "Paulo Coelho",
            isbn: "9780061122415",
            category: "Fiction",
            description: "A philosophical novel about following dreams and listening to one's heart.",
            image: "/img/book.jpg",
            available: true
        },
        {
            id: 9,
            title: "To Kill a Mockingbird",
            author: "Harper Lee",
            isbn: "9780060935467",
            category: "Fiction",
            description: "A timeless novel addressing racial injustice and moral growth.",
            image: "/img/book.jpg",
            available: false
        },
        {
            id: 10,
            title: "1984",
            author: "George Orwell",
            isbn: "9780451524935",
            category: "Fiction",
            description: "Dystopian novel depicting a totalitarian society under constant surveillance.",
            image: "/img/book.jpg",
            available: true
        }
    ];


    return (
        <div className="borrowed-card book-borrowed-catalog">
            <div className="card-header">
                <h5>Borrowed Books</h5>
            </div>
            <div className="card-body">
                {bookBorrowed.length > 0 ? (
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            // Responsive breakpoints
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1200: { slidesPerView: 3 }
                        }}
                        className="book-swiper"
                    >
                        {bookBorrowed.map((book) => {
                            const iconClass = "bi bi-book";
                            const coverNum = (Number(book.id) % 3) + 1;
                            const coverImage = `/img/book-covers/book-cover-${coverNum}.png`;

                            return (
                                <SwiperSlide
                                    speed={1000}
                                    key={book.id}>
                                    <div className="book-card">
                                        <div className="book-isbn">ISBN: {book.isbn}</div>

                                        <div className="book-image-container category-icon-container" style={{ backgroundImage: `url(${coverImage})` }}>
                                            <div className="inner-cover-content">
                                                <div className="top-title-container">
                                                    <div className="top-title">{book.title}</div>
                                                </div>
                                                <div className="mid-icon">
                                                    <i className={iconClass}></i>
                                                </div>
                                                <div className="bottom-label">{book.author}</div>
                                            </div>
                                        </div>

                                        <div className="book-info">
                                            <p className="book-title">{book.title}</p>
                                            <p className="book-author">{book.author}</p>
                                            <span className="badge-category">{book.category}</span>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                ) : (
                    <div className="text-center py-4">
                        <p className="text-muted">No borrowed books found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}