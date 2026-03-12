"use client";
import React, { useState } from "react";
import { useDataContext } from "@/lib/dataContext";
import "./Cart.scss";

const Cart = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { getGlobalData, setGlobalData } = useDataContext();

    const toggleDropdown = () => setIsOpen(!isOpen);

    // Ensure cartItems is always an array
    const cartItems = Array.isArray(getGlobalData) ? getGlobalData : [];

    const handleRemove = (B_CODE) => {
        setGlobalData(cartItems.filter(item => item.B_CODE !== B_CODE));
    };

    return (
        <div className="dropdown">
            {/* Cart Button with Badge */}
            <button
                onClick={toggleDropdown}
                className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center position-relative"
                style={{ width: "40px", height: "40px" }}
            >
                <i className="bi bi-cart text-dark"></i>
                {cartItems.length > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '10px' }}
                    >
                        {cartItems.length}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <div className={`dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 ${isOpen ? "show" : ""}`}>
                <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold">Your Cart ({cartItems.length})</h6>
                    <button onClick={() => setIsOpen(false)} className="btn-close small" style={{ fontSize: "10px" }}></button>
                </div>

                <div className="notification-list" style={{ maxHeight: "350px", minWidth: "320px", overflowY: "auto" }}>
                    {cartItems.length > 0 ? (
                        cartItems.map((item) => (
                            <div key={item.B_CODE} className="dropdown-item d-flex align-items-center gap-3 p-2 border-bottom">
                                {/* Book Cover */}
                                <div
                                    className="cart-book-cover"
                                    style={{
                                        width: "50px",
                                        height: "70px",
                                        backgroundImage: `url(/img/book-covers/book-cover-${(Math.abs(parseInt(item.B_CODE)) % 3) + 1}.png)`,
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        borderRadius: "4px"
                                    }}
                                ></div>

                                {/* Book Info */}
                                <div className="flex-grow-1">
                                    <p className="mb-1 fw-bold small">{item.B_TITLE}</p>
                                    <p className="mb-0 text-muted small">by {item.B_AUTHOR}</p>
                                </div>

                                {/* Remove Button */}
                                <button
                                    onClick={() => handleRemove(item.B_CODE)}
                                    className="btn btn-sm btn-outline-danger"
                                    style={{ fontSize: "10px", padding: "2px 6px" }}
                                >
                                    Remove
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="dropdown-item p-3 text-center text-muted">
                            Your cart is empty
                        </div>
                    )}
                </div>

                {/* View All / Checkout Button */}
                {cartItems.length > 0 && (
                    <div className="p-2 border-top text-center">
                        <a href="/books/reserve" className="btn btn-sm btn-primary w-100">
                            View All / Checkout
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;