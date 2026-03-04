'use client';

import React from 'react';
import Image from 'next/image';
import './BookBorrowedList.scss';

const books = [
    {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        dueDate: "10-03-2026",
        image: "/img/book.jpg"
    },
    {
        title: "1984",
        author: "George Orwell",
        dueDate: "12-03-2026",
        image: "/img/book.jpg"
    },
    {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        dueDate: "15-03-2026",
        image: "/img/book.jpg"
    },
    {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        dueDate: "18-03-2026",
        image: "/img/book.jpg"
    },
];

export default function BookBorrowedList() {

    return (
        <div className="borrowed-card">
            <div className="card-header">
                <h5>Borrowed Books</h5>
            </div>
            <div className="card-body">
                <div className="book-grid">
                    {books.map((book, index) => (
                        <div key={index} className="book-item">
                            <div className="book-img">
                                <Image
                                    src={book.image || "/img/book-placeholder.png"} // dummy image
                                    alt={book.title}
                                    width={80}
                                    height={100}
                                    className="img-cover"
                                />
                            </div>
                            <div className="book-details">
                                <h6 className="book-title">{book.title}</h6>
                                <p className="book-author">{book.author}</p>
                                <p className="book-due">
                                    Due: <span>{book.dueDate}</span>
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}