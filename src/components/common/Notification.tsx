'use client';

import React, {useCallback, useEffect, useState} from "react";
import "./Notification.scss";
import Link from "next/link";
import {getUserInfo} from "@/lib/server-utility";
import {getCsrfToken} from "@/lib/session-client";
import {formatTimeAgo} from "@/lib/client-utility";

const Notification = () => {

        const [notifications, setNotifications] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        const fetchNotifications = useCallback(async () => {
            try {
                const user = await getUserInfo();
                const userData = typeof user === "string" ? JSON.parse(user) : user;

                const response = await fetch(`/api/v1/notification`, {
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': getCsrfToken() || '',
                        }
                });

                const res = await response.json();
                const filtered = res.data?.filter(
                    (n: any) => n.user_code === user?.U_CODE
                );
                setNotifications(filtered || []);
            } catch (error) {
                console.error("Polling error:", error);
            } finally {
                setLoading(false);
            }
        }, []);

        useEffect(() => {
            // Initial fetch
            fetchNotifications();

            // Polling every 30s
            const intervalId = setInterval(() => {
                fetchNotifications();
            }, 30000);

            return () => clearInterval(intervalId);
        }, [fetchNotifications]);

    const markAllAsRead = async () => {
        try {

            const updated = notifications.map(n => ({
                ...n,
                status: false
            }));

            setNotifications(updated);

            const response = await fetch("/api/v1/notification/read", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-Token": getCsrfToken() || "",
                },
            });
            const res = await response.json();
            if (res.success && res.data) setNotifications(res.data);
        } catch (error) {
            console.error("Failed to mark notifications as read", error);
        }
    };

    // Badge shows only unread
    const unreadCount = notifications.filter(n => n.status).length;

    return (
        <div className="notification-card dropdown">
            <button
                onClick={markAllAsRead}
                className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret position-relative"
                style={{ width: '40px', height: '40px' }}
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="bi bi-bell text-dark fs-5"></i>

                {unreadCount > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {unreadCount}
                    </span>
                )}
            </button>

            <div
                className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 notification-dropdown"
                style={{ minWidth: "320px" }}
            >
                <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                    <h6 className="mb-0 fw-bold">
                        Notifications ({notifications.length})
                    </h6>
                </div>

                <div
                    className="notification-list"
                    style={{ maxHeight: "350px", overflowY: "auto" }}
                >
                    {loading ? (
                        <div className="p-3 text-center small">Loading...</div>
                    ) : notifications.length > 0 ? (
                        notifications.map((notif, index) => (
                            <div
                                key={notif.id || `${notif.title}-${notif.time}-${index}`}
                                className="dropdown-item d-flex align-items-start gap-3 p-3 border-bottom"
                            >
                                <div
                                    className="rounded-circle bg-info bg-opacity-10 text-info p-2 d-flex align-items-center justify-content-center"
                                    style={{ width: '35px', height: '35px' }}
                                >
                                    <i className="bi bi-info-circle"></i>
                                </div>

                                <div className="flex-grow-1">
                                    <p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>
                                        {notif.title}
                                    </p>
                                    <p className="mb-1 text-muted" style={{ fontSize: '12px' }}>
                                        {notif.message}
                                    </p>
                                    <small className="text-muted" style={{ fontSize: '10px' }}>
                                        {formatTimeAgo(notif.time)}
                                    </small>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-5 text-center">
                            <p className="mt-2 text-muted small">No new notifications</p>
                        </div>
                    )}
                </div>

                {/* Optional View All */}
                {/*
                <div className="p-3">
                    <Link href="/notifications" className="btn btn-link w-100 text-decoration-none py-2 fw-bold">
                        View All
                    </Link>
                </div>
                */}
            </div>
        </div>
    );
};

export default Notification;