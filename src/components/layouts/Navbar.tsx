'use client';

import React, { useState } from "react";
import { FirstNameOnly } from "@/lib/helper";
import SearchBox from "@/components/layouts/SearchBox";

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

    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(prev => !prev);
        onToggle();
    };

    return (
        <nav className="navbar navbar-expand navbar-light px-4 py-3">

            {/* Hamburger */}
            <button
                type="button"
                className="btn btn-link link-dark p-0 me-auto"
                onClick={handleToggle}
            >
                <i
                    className={`bi ${isOpen ? "bi-text-indent-left" : "bi-text-indent-right"} fs-2`}
                    style={{ color: "rgba(104,104,104,0.81)" }}
                ></i>
            </button>

            {/* 🔍 Search Component */}
            <div className="ms-3 flex-grow-1 d-none d-md-flex justify-content-start me-4">
                <SearchBox
                    onSearch={(value) => {
                        console.log("Search from Navbar:", value);
                        // You can connect Laravel API here
                    }}
                />
            </div>

            {/* Right Side */}
            <div className="d-flex align-items-center gap-3">
                <button
                    className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center"
                    style={{ width: "35px", height: "35px" }}
                >
                    <i className="bi bi-cart text-dark fs-5"></i>
                </button>

                <div className="dropdown">
                    <a
                        className="prfl nav-link p-0 d-flex align-items-center gap-2 dropdown-toggle hide-caret"
                        href="#"
                        data-bs-toggle="dropdown"
                    >
                        <img
                            src="/img/profile-image.jpg"
                            alt="User"
                            className="rounded-circle border"
                            width={35}
                            height={35}
                        />
                        <div className="d-none d-md-block text-dark">
                            <span className="p-name fw-semibold small text-uppercase">
                                {FirstNameOnly(dataArr.user?.U_NAME)}
                            </span>
                            <i className="bi bi-chevron-down ms-1 small"></i>
                        </div>
                    </a>
                </div>
            </div>

        </nav>
    );
};

export default Navbar;