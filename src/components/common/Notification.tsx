'use client';

import React, {useState} from "react";
import "./Notification.scss";
import Link from "next/link";

const Notification = () => {

    const [notifications] = useState([
        { id: 1, title: "Book Overdue", msg: "Return 'Clean Code' by tomorrow.", time: "2h ago", type: "danger" },
        { id: 2, title: "Reservation Ready", msg: "Your reserved book is available.", time: "5h ago", type: "success" },
        { id: 3, title: "Membership Info", msg: "Expiry in 10 days.", time: "1d ago", type: "warning" },
    ]);

    return (
        <>
            <div className="notification-card dropdown">
                <button
                    className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret position-relative"
                    style={{ width: '40px', height: '40px' }}
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                >
                    <i className="bi bi-bell text-dark fs-5"></i>
                    {notifications.length > 0 && (
                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                              style={{ fontSize: '10px' }}>
                {notifications.length}
            </span>
                    )}
                </button>

                <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 notification-dropdown" style={{ minWidth: "320px" }}>
                    {/* Header - Matches Cart Style */}
                    <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                        <h6 className="mb-0 fw-bold">Notifications ({notifications.length})</h6>
                        {notifications.length > 0 && (
                            <button className="btn btn-sm text-purple small p-0" style={{ fontSize: '11px' }}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notification List */}
                    <div className="notification-list" style={{ maxHeight: "350px", overflowY: "auto" }}>
                        {notifications.length > 0 ? (
                            notifications.map((notif) => (
                                <div key={notif.id} className="dropdown-item d-flex align-items-start gap-3 p-3 border-bottom whitespace-normal">
                                    <div className={`rounded-circle bg-info bg-opacity-10 text-info p-2 d-flex align-items-center justify-content-center`}
                                         style={{ width: '35px', height: '35px', minWidth: '35px' }}>
                                        <i className={`bi bi-info-circle`}></i>
                                    </div>
                                    <div className="flex-grow-1" style={{ whiteSpace: 'normal' }}>
                                        <p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>{notif.title}</p>
                                        <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>{notif.msg}</p>
                                        <small className="text-lowercase text-muted fw-bolder" style={{ fontSize: '10px' }}>{notif.time}</small>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center">
                                <i className="bi bi-bell-slash text-muted opacity-50" style={{ fontSize: '2rem' }}></i>
                                <p className="mt-2 text-muted small">No new notifications</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Link */}
                    <div className="p-3">
                        <Link href="/notifications" className="btn btn-link w-100 text-decoration-none py-2 fw-bold" style={{ borderRadius: '8px' }}>
                            View All Notifications
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Notification;