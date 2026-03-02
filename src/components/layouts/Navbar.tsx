'use client';

import React, { useState } from "react";
import { FirstNameOnly } from "@/lib/helper";

interface User {
    U_NAME: string;
    U_EMAIL: string;
}

interface NavbarProps {
    onToggle: () => void;
    dataArr: {
        user: User;
    };
}

const Navbar: React.FC<NavbarProps> = ({ onToggle, dataArr }) => {
    // Local state to control icon change
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(prev => !prev); // toggle the icon state
        onToggle(); // call parent toggle
    };

    return (
        <nav className="navbar navbar-expand navbar-light px-4 py-3">
            {/* Hamburger Button */}
            <button
                type="button"
                className="btn btn-link link-dark p-0 me-auto"
                onClick={handleToggle}
            >
                <i className={`bi ${isOpen ? "bi-text-indent-left fs-2" : "bi-text-indent-right fs-2"} `} style={{color:"rgba(104,104,104,0.81)"}}></i>
            </button>

            {/* Search Box */}
            <div className="ms-3 flex-grow-1 d-none d-md-flex justify-content-start me-4">
                <div className="input-group" style={{ maxWidth: '400px' }}>
                    <input
                        type="text"
                        className="form-control btn-outline-light bg-light border-end-0 rounded-start-pill py-2"
                        placeholder="Enter book name to quick search..."
                        aria-label="Search"
                    />
                    <span className="input-group-text bg-light border-start-0 rounded-end-pill pe-3">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                </div>
            </div>

            {/* Right-side items */}
            <div className="d-flex align-items-center gap-3">
                {/* Theme Toggle Button */}
                <button
                    className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: '35px', height: '35px' }}
                >
                    <i className="bi bi-cart text-dark fs-5"></i>
                </button>

                {/* Notification Dropdown */}
                <div className="dropdown">
                    <button
                        className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret"
                        style={{ width: '35px', height: '35px' }}
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <i className="bi bi-bell text-dark fs-5"></i>
                    </button>
                    <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 notification-dropdown">
                        <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
                            <h6 className="mb-0 fw-bold">Notification</h6>
                            <button className="btn-close small" style={{ fontSize: '10px' }}></button>
                        </div>
                        <div className="notification-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {[1, 2, 3, 4].map((item) => (
                                <a key={item} href="#" className="dropdown-item d-flex align-items-start gap-3 p-3 border-bottom">
                                    <div>
                                        <p className="mb-0 small text-dark">
                                            <span className="fw-bold">Terry Franci</span> requests permission to change <span className="fw-bold">Project - Nganter App</span>
                                        </p>
                                        <small className="text-muted">Project • 5 min ago</small>
                                    </div>
                                </a>
                            ))}
                        </div>
                        <div className="p-2 text-center">
                            <a href="#" className="btn btn-link text-decoration-none text-dark fw-bold w-100 py-2 border rounded">
                                View All Notification
                            </a>
                        </div>
                    </div>
                </div>

                {/* User Dropdown */}
                <div className="dropdown">
                    <a
                        className="prfl nav-link p-0 d-flex align-items-center gap-2 dropdown-toggle hide-caret"
                        href="#"
                        role="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jonh"
                            alt="User"
                            className="rounded-circle border"
                            width={35}
                            height={35}
                        />
                        <div className="d-none d-md-block text-dark">
                            <span className="p-name fw-semibold small text-uppercase">{FirstNameOnly(dataArr.user?.U_NAME)}</span>
                            <i className="bi bi-chevron-down ms-1 small"></i>
                        </div>
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-3 mt-3 user-profile-dropdown">
                        <li className="p-0 border-bottom mb-2">
                            <p className="mb-0 fw-bold small text-dark text-capitalize">{dataArr.user?.U_NAME.toLowerCase()}</p>
                            <p className="text-muted small">{dataArr.user?.U_EMAIL.toLowerCase()}</p>
                        </li>
                        <li>
                            <a className="dropdown-item d-flex align-items-center gap-3 py-1 px-2" href="#">
                                <i className="bi small bi-person fs-5"></i> Edit profile
                            </a>
                        </li>
                        <li>
                            <a className="dropdown-item d-flex align-items-center gap-3 py-1 px-2" href="#">
                                <i className="bi small bi-gear fs-5"></i> Account settings
                            </a>
                        </li>
                        <li><hr className="dropdown-divider mx-n2" /></li>
                        <li>
                            <a className="dropdown-item d-flex align-items-center gap-3 py-1 px-2 text-dark" href="#">
                                <i className="bi small bi-box-arrow-right fs-5"></i> Sign out
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;