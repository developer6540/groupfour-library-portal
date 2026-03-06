import React from "react";
import "./page.scss"
import MainLayoutContent from "@/components/layouts/MainLayoutContent";
import PageTitleBar from "@/components/common/PageTitleBar";
import BookCatalog from "@/components/pages/Books/BookCatalog";

export default async function BooksPage() {

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

    return <>
        <MainLayoutContent>
            <div className="container-fluid p-4">

                <PageTitleBar title="Our Books Store" />

                <div className="row mb-4">
                    <div className="col-12">
                        <BookCatalog books={books} />
                    </div>
                </div>

            </div>
        </MainLayoutContent>
    </>
}