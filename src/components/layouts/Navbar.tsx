'use client';

import React, {useState} from "react";
import {capitalizeFirstLetter, FirstNameOnly} from "@/lib/utility";
import SearchBox from "@/components/layouts/SearchBox";
import {useRouter} from "next/navigation";
import {alerts} from "@/lib/alerts";
import {useDataContext} from "@/lib/dataContext";
import Link from "next/link";
import Cart from "@/components/common/Cart";

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

                    <Cart />

                    {/* Notification Dropdown */}
                    <div className="dropdown">
                        <button
                            className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret"
                            style={{width: '35px', height: '35px'}} data-bs-toggle="dropdown" aria-expanded="false">
                            <i className="bi bi-bell text-dark"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 notification-dropdown">
                            <div className="p-3 d-flex justify-content-between align-items-center border-bottom">
                                <h6 className="mb-0 fw-bold">Notification</h6>
                                <button className="btn-close small" style={{fontSize: '10px'}}></button>
                            </div>
                            <div className="notification-list" style={{maxHeight: '300px', minWidth:'300px', overflowY: 'auto'}}>
                                <div className="dropdown-item d-flex align-items-start gap-3 p-3 border-bottom">
                                    <div>
                                        <p className="mb-0 small text-dark text-muted">No new notification</p>
                                    </div>
                                </div>
                                {/*{[1, 2, 3, 4].map((item) => (*/}
                                {/*    <div key={item} className="dropdown-item d-flex align-items-start gap-3 p-3 border-bottom">*/}
                                {/*        <div>*/}
                                {/*            <p className="mb-0 small text-dark">Your membership will expire soon</p>*/}
                                {/*            <small className="text-muted">5 min ago</small>*/}
                                {/*        </div>*/}
                                {/*    </div>*/}
                                {/*))}*/}
                            </div>
                            <div className="p-2 text-center">
                                <a href="#"
                                   className="btn btn-link text-decoration-none text-dark fw-bold w-100 py-2 border rounded"> View
                                    All Notification </a>
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
                            style={{minWidth: "250px", borderRadius: "0px 0px 20px 20px"}}>
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