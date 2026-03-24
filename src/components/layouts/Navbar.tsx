'use client';

import React, {useState, useEffect} from "react";
import {capitalizeFirstLetter, FirstNameOnly} from "@/lib/utility";
import SearchBox from "@/components/layouts/SearchBox";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {alerts} from "@/lib/alerts";
import {useDataContext} from "@/lib/dataContext";

interface User {
    U_CODE: any;
    U_NAME: string;
    U_EMAIL: string;
}

interface NavbarProps {
    onToggle: () => void;
    user: User;
}

const Navbar: React.FC<NavbarProps> = ({onToggle, user}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    // Fetch due-date notifications for the logged-in user
    useEffect(() => {
        try {
            const stored = localStorage.getItem("user");
            const u = stored ? JSON.parse(stored) : null;
            if (!u?.U_CODE) return;
            fetch(`/api/v1/book/due-notifications?member=${encodeURIComponent(u.U_CODE)}`)
                .then(r => r.json())
                .then(res => { if (res?.data) setNotifications(res.data); })
                .catch(() => {});
        } catch {}
    }, []);

    const getDueLabel = (daysLeft: number) => {
        if (daysLeft < 0)  return { text: `Overdue by ${Math.abs(daysLeft)} day${Math.abs(daysLeft) !== 1 ? 's' : ''}`, color: '#dc2626', icon: 'bi-exclamation-circle-fill' };
        if (daysLeft === 0) return { text: 'Due today!',             color: '#ea580c', icon: 'bi-clock-fill' };
        if (daysLeft === 1) return { text: 'Due tomorrow',           color: '#d97706', icon: 'bi-clock-history' };
        return {                      text: `Due in ${daysLeft} days`, color: '#ca8a04', icon: 'bi-calendar-event' };
    };

    const handleToggle = () => {
        setIsOpen(prev => !prev);
        onToggle();
    };

    const {setGlobalData} = useDataContext();
    const router = useRouter();

    const handleLogout = (e: any) => {
        e.preventDefault();
        localStorage.clear();
        router.push("/sign-in");
        alerts.success("Logged out successfull", "You have been logged out.", 3000);
    };

    return (
        <>
            <nav className="navbar navbar-expand navbar-light px-4 py-3">

                {/* Hamburger */}
                <button
                    type="button"
                    className="btn btn-link link-dark p-0 me-auto"
                    onClick={handleToggle}
                >
                    <i
                        className={`bi ${isOpen ? "bi-text-indent-left" : "bi-text-indent-right"} fs-2`}
                        style={{color: "rgba(104,104,104,0.81)"}}
                    ></i>
                </button>

                {/* 🔍 Search Component */}
                <div className="ms-3 flex-grow-1 d-none d-md-flex justify-content-start me-4">
                    <SearchBox onSearch={(value) => {
                        setGlobalData(value);
                        router.push("/books");
                    }}
                    />
                </div>

                {/* Right Side */}
                <div className="d-flex align-items-center gap-3">

                    <button
                        className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
                        style={{width: "35px", height: "35px"}}
                    >
                        <i className="bi bi-cart text-dark"></i>
                    </button>

                    {/* Notification Dropdown */}
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret position-relative"
                            style={{width: '35px', height: '35px'}} data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-bell text-dark"></i>
                            {notifications.length > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill"
                                    style={{background:'#dc2626', fontSize:'0.6rem', minWidth:'16px', padding:'2px 5px'}}
                                >
                                    {notifications.length > 9 ? '9+' : notifications.length}
                                </span>
                            )}
                        </button>
                        <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 notification-dropdown" style={{minWidth:'320px'}}>
                            <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
                                <h6 className="mb-0 fw-bold">Return Reminders</h6>
                                {notifications.length > 0 && (
                                    <span className="badge rounded-pill" style={{background:'#dc2626'}}>{notifications.length}</span>
                                )}
                            </div>
                            <div className="notification-list" style={{maxHeight: '320px', overflowY: 'auto'}}>
                                {notifications.length === 0 ? (
                                    <div className="p-4 text-center text-muted">
                                        <i className="bi bi-check-circle-fill text-success mb-2" style={{fontSize:'1.5rem',display:'block'}}></i>
                                        <small>No books due soon</small>
                                    </div>
                                ) : (
                                    notifications.map((n, i) => {
                                        const due = getDueLabel(n.DAYS_LEFT);
                                        return (
                                            <Link key={i} href="/books/borrowed"
                                               className="dropdown-item d-flex align-items-start gap-3 p-3 border-bottom text-decoration-none">
                                                <div className="flex-shrink-0 mt-1">
                                                    <i className={`bi ${due.icon}`} style={{color: due.color, fontSize:'1.1rem'}}></i>
                                                </div>
                                                <div className="flex-grow-1 overflow-hidden">
                                                    <p className="mb-0 small fw-semibold text-dark text-truncate">{n.B_TITLE}</p>
                                                    <p className="mb-0" style={{fontSize:'0.72rem', color: due.color, fontWeight:600}}>{due.text}</p>
                                                    <small className="text-muted" style={{fontSize:'0.68rem'}}>{n.B_AUTHOR}</small>
                                                </div>
                                            </Link>
                                        );
                                    })
                                )}
                            </div>
                            <div className="p-2 text-center">
                                <Link href="/books/borrowed"
                                   className="btn btn-link text-decoration-none text-dark fw-bold w-100 py-2 border rounded">
                                    View All Borrowed Books
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* User Dropdown */}
                    <div className="dropdown">
                        <a
                            className="nav-link p-0 d-flex align-items-center gap-2 dropdown-toggle hide-caret"
                            href="#"
                            role="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            <img
                                src="/img/profile-image.jpg"
                                alt="User"
                                className="rounded-circle border"
                                width={33}
                                height={33}
                            />
                            <div className="d-none d-md-block text-dark">
                                <span className="fw-semibold small text-capitalize">{FirstNameOnly(user?.U_NAME)}</span>
                                <i className="bi bi-chevron-down ms-1 small"></i>
                            </div>
                        </a>

                        <ul className="dropdown-menu dropdown-menu-end shadow border-1 p-0 mt-3 user-profile-dropdown"
                            style={{minWidth: "250px"}}>
                            <li className="p-3 py-3 border-bottom ">
                                <h6 className="mb-0 fw-bold text-dark text-wrap">{capitalizeFirstLetter(user?.U_NAME)}</h6>
                                <span style={{fontSize: "14px", color: "#888787"}}
                                      className="mt-3 small">Code: {user?.U_CODE}</span>
                            </li>
                            <li className="p-2">
                                <Link className="dropdown-item d-flex align-items-center gap-3 py-2 px-2"
                                      href="/profile/change-account-details">
                                    <i className="bi bi-person"></i> Edit profile
                                </Link>
                            </li>
                            <li className="p-2" style={{background: "#fafafa", borderRadius: "0px 0px 20px 20px"}}>
                                <a
                                    className="dropdown-item logout d-flex align-items-center gap-3 py-2 px-2 text-dark"
                                    href="#"
                                    onClick={handleLogout}
                                >
                                    <i className="bi bi-box-arrow-right"></i> Sign out
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

            </nav>

        </>


    );
};

export default Navbar;