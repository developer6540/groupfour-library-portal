'use client';

import React from 'react';
import  './ValueBox.scss'

export default function ValueBox() {
    const stats = [
        {
            title: "Total Books Read",
            value: "12",
            trend: "+12%",
            trendLabel: "from last month",
            trendUp: true,
            icon: "bi-book",
            color: "#5e72e4",
        },
        {
            title: "Currently Borrowed",
            value: "03",
            trend: "01",
            trendLabel: "due this week",
            trendUp: false,
            icon: "bi-journal-bookmark",
            color: "#fb6340",
        },
        {
            title: "Books Overdue",
            value: "01",
            trend: "Critical",
            trendLabel: "action needed",
            trendUp: false,
            icon: "bi-exclamation-triangle",
            color: "#f5365c",
        },
        {
            title: "Total Fines",
            value: "2,000.00",
            trend: "-10%",
            trendLabel: "from last month",
            trendUp: true, // "Up" here indicates a positive trend (reduction in fines)
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