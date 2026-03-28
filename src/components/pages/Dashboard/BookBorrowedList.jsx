'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { getBaseUrl } from '@/lib/client-utility';
import { getCsrfToken } from '@/lib/session-client';
import { getUserInfo } from '@/lib/server-utility';

import 'swiper/css';
import 'swiper/css/pagination';
import './BookBorrowedList.scss';

export default function BookBorrowedList() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBorrowedBooks = useCallback(async () => {
        setLoading(true);
        try {
            const user = await getUserInfo();
            if (!user?.U_CODE) return;

            const res = await fetch(
                `${getBaseUrl()}/api/v1/books/borrowed?member=${encodeURIComponent(user.U_CODE)}&pageSize=20`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': getCsrfToken() || '',
                    },
                }
            );
            const result = await res.json();
            if (res.ok && Array.isArray(result?.data?.data)) {
                setBooks(result.data.data);
            }
        } catch (err) {
            console.error('Error fetching borrowed books:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBorrowedBooks();
    }, [fetchBorrowedBooks]);

    return (
        <div className="borrowed-card book-borrowed-catalog">
            <div className="card-header">
                <h5>Borrowed Books</h5>
            </div>
            <div className="card-body">
                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-purple" role="status" />
                    </div>
                ) : books.length > 0 ? (
                    <Swiper
                        modules={[Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000, disableOnInteraction: false }}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1200: { slidesPerView: 3 }
                        }}
                        className="book-swiper"
                    >
                        {books.map((book, index) => {
                            const coverNum = (index % 10) + 1;
                            const coverImage = `/img/book-covers/book-cover-${coverNum}.png`;
                            const isOverdue = book.BD_DUEDATE && new Date(book.BD_DUEDATE) < new Date();

                            return (
                                <SwiperSlide speed={1000} key={`${book.BH_DOCNO}-${book.BD_LINENO}`}>
                                    <div className="book-card">
                                        <div className="book-isbn">ISBN: {book.B_ISBN || 'N/A'}</div>

                                        <div
                                            className="book-image-container category-icon-container"
                                            style={{ backgroundImage: `url(${coverImage})` }}
                                        >
                                            <div className="inner-cover-content">
                                                <div className="top-title-container">
                                                    <div className="top-title">{book.B_TITLE}</div>
                                                </div>
                                                <div className="mid-icon">
                                                    <i className="bi bi-book"></i>
                                                </div>
                                                <div className="bottom-label">{book.B_AUTHOR}</div>
                                            </div>
                                        </div>

                                        <div className="book-info">
                                            <p className="book-title">{book.B_TITLE}</p>
                                            <p className="book-author">{book.B_AUTHOR}</p>
                                            <span className="badge-category">{book.B_CATEGORY || 'General'}</span>
                                            {book.BD_DUEDATE && (
                                                <p className={`due-date mt-1 mb-0 small ${isOverdue ? 'text-danger fw-semibold' : 'text-muted'}`}>
                                                    {isOverdue ? '⚠ Overdue · ' : 'Due: '}
                                                    {new Date(book.BD_DUEDATE).toLocaleDateString('en-LK')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                ) : (
                    <div className="text-center py-3">
                        <i className="bi fw-bold bi-book" style={{fontSize:"80px", marginBottom:"-10px", color:"#ccc"}}></i>
                        <p className="fw-bold" style={{fontSize:"20px", marginTop:"-20px", color:"#ccc"}}>No borrowed books found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
