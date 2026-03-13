'use client';

import React, { useEffect, useState } from 'react';
import './ValueBox.scss';

// Helper to get base URL (ensure this matches your environment setup)
const getBaseUrl = () => window.location.origin;

export default function ValueBox({ data }) {

    const stats = [
        {
            title: "Reserved Books",
            value: data?.TotalReservedBooks ?? "0",
            icon: "bi-bookmark-check",
            color: "#5e72e4",
        },
        {
            title: "Total Books Read",
            value: data?.TotalBooksRead ?? "0",
            icon: "bi-journal-check",
            color: "#fb6340",
        },
        {
            title: "Books Overdue",
            value: data?.TotalBooksOverdue ?? "0",
            icon: "bi-exclamation-triangle",
            color: "#f5365c",
        },
        {
            title: "Total Fines",
            // Mapping to the SQL alias 'TotalOverdueFines'
            value: data?.TotalOverdueFines ? `Rs. ${Number(data.TotalOverdueFines).toLocaleString()}` : "Rs. 0.00",
            icon: "bi-currency-dollar",
            color: "#2dce89",
        },
    ];

    return (
        <div className="row g-4 mb-4">
            {stats.map((item, index) => (
                <div key={index} className="col-xl-3 col-md-6">
                    <div className="card stat-card border-0 shadow-sm h-100 overflow-hidden">
                        <div className="card-bg-blob" style={{ backgroundColor: item.color }}></div>
                        <div className="card-body z-1 pt-4 pb-2 px-4">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                    <p className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
                                        {item.title}
                                    </p>
                                    <h3 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.6rem' }}>
                                        {item.value}
                                    </h3>
                                </div>
                                <div
                                    className="stat-icon-wrapper rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                                    style={{
                                        background: `linear-gradient(135deg, ${item.color}dd, ${item.color})`,
                                        width: '50px',
                                        height: '50px'
                                    }}
                                >
                                    <i className={`bi ${item.icon} text-white fs-4`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}