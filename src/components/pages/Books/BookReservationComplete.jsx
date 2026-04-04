'use client';

import "./BookReservationComplete.scss";
import Link from "next/link";
import React from "react";

export default function BookReservationComplete() {
    return (
        <div className="book-reservation-complete-card container">
            <div className="reservation-header d-flex justify-content-between align-items-center">
                <h5 className="fw-bold m-0 text-dark">
                    <i className="bi bi-journal-bookmark-fill me-2 text-purple-soft"></i>
                    Reservation Status
                </h5>
            </div>

            <div className="reservation-body text-center">
                <div className="success-animation">
                    <div className="check-icon">
                        <span className="icon-line line-tip"></span>
                        <span className="icon-line line-long"></span>
                        <div className="icon-circle"></div>
                        <div className="icon-fix"></div>
                    </div>
                </div>

                <h3 className="fw-bold text-dark mb-2">Reservation Completed!</h3>
                <p className="text-muted mb-4 px-4">
                    Your books have been successfully reserved. <br />
                    You will receive an email notification with the pickup details shortly.
                </p>

                <div className="action-area d-flex gap-3 justify-content-center">
                    <Link className="btn btn-purple px-4" href="/books">
                        Continue Browsing
                    </Link>
                </div>
            </div>
        </div>
    );
}