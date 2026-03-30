'use client';

import React from 'react';
import './ValueBox.scss';

export default function ValueBox({ data }) {

    const formatCurrency = (value) => {
        if (!value) return "Rs. 0.00";
        return new Intl.NumberFormat('en-LK', {
            style: 'currency',
            currency: 'LKR'
        }).format(value);
    };

    console.log(data);

    const stats = [
        {
            title: "Reserved Books",
            value: data?.dashboard_count.TotalReservedBooks ?? "0",
            icon: "bi-bookmark-check",
            color: "#5e72e4",
        },
        {
            title: "Books Read",
            value: data?.dashboard_count.TotalBooksRead ?? "0",
            icon: "bi-journal-check",
            color: "#9a40fb",
        },
        {
            title: "Books Overdue",
            value: data?.dashboard_count.TotalBooksOverdue ?? "0",
            icon: "bi-exclamation-triangle",
            color: "#f5365c",
        },
        {
            title: "Settled Fines",
            value: formatCurrency(data?.dashboard_count.TotalOverdueFines),
            icon: "bi-currency-dollar",
            color: "#2dce89",
        },
        {
            title: "Pending Fines",
            value: formatCurrency(data?.dashboard_count.PendingFines),
            icon: "bi-currency-dollar",
            color: "#f5365c",
        },
    ];

    return (
        <div className="row g-3 mb-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-5">
            {stats.map((item, index) => (
                <div key={index} className="col">
                    <div className="card stat-card border-0 shadow-sm h-100">
                        <div
                            className="card-bg-blob"
                            style={{ backgroundColor: item.color }}
                        ></div>

                        <div className="card-body d-flex justify-content-between align-items-center">

                            <div className="text-content">
                                <p className="stat-title">
                                    {item.title}
                                </p>
                                <h3 className="stat-value text-truncate">
                                    {item.value}
                                </h3>
                            </div>

                            <div
                                className="stat-icon-wrapper"
                                style={{
                                    background: `linear-gradient(135deg, ${item.color}cc, ${item.color})`
                                }}
                            >
                                <i className={`bi ${item.icon}`}></i>
                            </div>

                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}