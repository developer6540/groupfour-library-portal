'use client';

import React from 'react';
// Import Swiper React components
{  }
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import './BookBorrowedList.scss';

export default function BookBorrowedList() {

    const bookBorrowed = [
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
                                <SwiperSlide key={book.id}>
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