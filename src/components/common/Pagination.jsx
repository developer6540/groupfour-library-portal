'use client';

import React from 'react';
import "./Pagination.scss"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
    if (totalPages <= 1) return null;

    const getPaginationRange = () => {
        const delta = 2; // Pages to show around current
        const range = [];

        for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (currentPage - delta > 2) range.unshift("...");
        range.unshift(1);
        if (currentPage + delta < totalPages - 1) range.push("...");
        if (totalPages > 1) range.push(totalPages);

        return range;
    };

    return (
        <nav className="pagination-container mt-5">
            <ul className="pagination justify-content-center">
                {/* Previous */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                </li>

                {/* Numbered Pages */}
                {getPaginationRange().map((page, index) => (
                    <li
                        key={index}
                        className={`page-item ${currentPage === page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}
                    >
                        <button
                            className="page-link"
                            onClick={() => typeof page === 'number' && onPageChange(page)}
                        >
                            {page}
                        </button>
                    </li>
                ))}

                {/* Next */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button
                        className="page-link"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <i className="bi bi-chevron-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
}