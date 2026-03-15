'use client';

import React, { useState } from "react";
import { capitalizeFirstLetter, FirstNameOnly, getBaseUrl } from "@/lib/client-utility";
import SearchBox from "@/components/layouts/SearchBox";
import { useRouter } from "next/navigation";
import { alerts } from "@/lib/alerts";
import { useDataContext } from "@/lib/dataContext";
import Link from "next/link";
import Cart from "@/components/common/Cart";
import Notification from "@/components/common/Notification";
import {getCsrfToken} from "@/lib/session-client";

interface User {
    U_CODE: any;
    U_NAME: string;
    U_EMAIL: string;
}

interface NavbarProps {
    onToggle: () => void;
    user: User;
}

const Navbar: React.FC<NavbarProps> = ({ onToggle, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const { setGlobalData } = useDataContext();
    const router = useRouter();

    const handleToggle = () => {
        setIsOpen(prev => !prev);
        onToggle();
    };

    const handleLogout = async () => {

        alerts.confirm(
            "Logout Confirmation",
            "Are you sure you want to sign out?",
            async () => {
                try {
                    const res = await fetch(`${getBaseUrl()}/api/v1/auth/logout`, {
                        method: "POST",
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': getCsrfToken() || '',
                        }
                    });

                    if (res.ok) {
                        alerts.success("Goodbye!", "You have been logged out.", 3000);
                        setTimeout(() => { window.location.href = '/sign-in'; }, 2000);
                    }
                } catch (error) {
                    alerts.error("Logout Error", "Something went wrong.");
                }
            }
        );

    }

    return (
        <nav className="navbar navbar-expand navbar-light px-4 py-3">
            {/* Hamburger */}
            <button type="button" className="btn btn-link link-dark p-0 me-auto" onClick={handleToggle}>
                <i className={`bi ${isOpen ? "bi-text-indent-left" : "bi-text-indent-right"} fs-2`} style={{ color: "rgba(104,104,104,0.81)" }}></i>
            </button>

            {/* 🔍 Search Component */}
            <div className="ms-3 flex-grow-1 d-none d-md-flex justify-content-start me-4">
                <SearchBox onSearch={(value) => {
                    setGlobalData(value);
                    router.push("/books");
                }} />
            </div>

            {/* Right Side */}
            <div className="d-flex align-items-center gap-3">

                {/* Cart Dropdown */}
                <Cart />

                {/* Notification Dropdown */}
                <Notification />

                {/* User Dropdown */}
                <div className="dropdown">
                    <a className="nav-link p-0 d-flex align-items-center gap-2 dropdown-toggle hide-caret" href="#" role="button" data-bs-toggle="dropdown">
                        <img src="/img/profile-image.jpg" alt="User" className="rounded-circle border" width={33} height={33} />
                        <div className="d-none d-md-block text-dark">
                            <span className="fw-semibold small text-capitalize">
                                {user?.U_NAME ? FirstNameOnly(user.U_NAME) : "User"}
                            </span>
                            <i className="bi bi-chevron-down ms-1 small"></i>
                        </div>
                    </a>

                    <ul className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 user-profile-dropdown" style={{ minWidth: "250px", borderRadius: "0px 0px 20px 20px" }}>
                        <li className="p-3 py-3 border-bottom">
                            <h6 className="mb-0 fw-bold text-dark text-wrap">
                                {user?.U_NAME ? capitalizeFirstLetter(user.U_NAME) : "Guest"}
                            </h6>
                            <span style={{ fontSize: "14px", color: "#888787" }} className="mt-2 d-block">
                                Code: {user?.U_CODE || "N/A"}
                            </span>
                        </li>
                        <li className="p-2">
                            <Link className="dropdown-item d-flex align-items-center gap-3 py-2 px-2" href="/profile/account-details">
                                <i className="bi bi-person"></i> My Profile
                            </Link>
                        </li>
                        <li className="p-2" style={{ background: "#fafafa", borderRadius: "0px 0px 20px 20px" }}>
                            <a className="dropdown-item logout d-flex align-items-center gap-3 py-2 px-2 text-danger" href="#" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right"></i> Sign out
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;