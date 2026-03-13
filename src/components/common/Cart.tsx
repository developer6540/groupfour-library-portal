'use client';

import React, { useEffect } from "react";
import "./Cart.scss";
import { useDataContext } from "@/lib/dataContext";
import Link from "next/link";
import { getSession, setSession } from "@/lib/session-client";

const Cart = () => {

    const { getGlobalDataCart, setGlobalDataCart } = useDataContext();

    // Pull from Session on Mount
    useEffect(() => {
        const ctDta = getSession("cart-items");
        if (ctDta) {
            try {
                const parsed = typeof ctDta === 'string' ? JSON.parse(ctDta) : ctDta;
                // Only update if state is currently empty to avoid overwriting newer changes
                if (parsed && Array.isArray(parsed)) {
                    setGlobalDataCart(parsed);
                }
            } catch (error) {
                console.error("Cart parsing error:", error);
            }
        }
    }, []); // Empty dependency array = runs only ONCE when page loads

    // Push to Session whenever state changes
    useEffect(() => {
        // We only save if the cart actually exists (even if empty array)
        if (getGlobalDataCart !== undefined) {
            setSession("cart-items", JSON.stringify(getGlobalDataCart));
        }
    }, [getGlobalDataCart]); // Runs whenever getGlobalDataCart is updated

    const items = Array.isArray(getGlobalDataCart) ? getGlobalDataCart : [];

    const handleRemove = (B_CODE: string) => {
        setGlobalDataCart(items.filter(item => item.B_CODE !== B_CODE));
    };

    const handleClearAll = () => {
        if (confirm("Clear all items from cart?")) {
            setGlobalDataCart([]);
        }
    };

    return (
        <div className="cart-card dropdown">
            <button
                className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret position-relative"
                style={{ width: '40px', height: '40px' }}
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="bi bi-cart3 text-dark fs-5"></i>
                {items.length > 0 && (
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                          style={{ fontSize: '10px' }}>
                        {items.length}
                    </span>
                )}
            </button>

            <div className="dropdown-menu dropdown-menu-end shadow border-0 p-0 mt-3 notification-dropdown">
                <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                    <h6 className="mb-0 fw-bold">My Book Cart ({items.length})</h6>
                    {items.length > 0 && (
                        <button onClick={handleClearAll} className="btn btn-sm text-danger small p-0" style={{ fontSize: '11px' }}>
                            Clear All
                        </button>
                    )}
                </div>

                <div className="notification-list" style={{ maxHeight: "350px", minWidth: "320px", overflowY: "auto" }}>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.B_CODE} className="dropdown-item d-flex align-items-center gap-3 p-3 border-bottom">
                                <div className="flex-grow-1">
                                    <p className="mb-0 fw-bold text-dark" style={{ fontSize: '14px' }}>{item.B_TITLE}</p>
                                    <p className="mb-0 text-muted" style={{ fontSize: '12px' }}>{item.B_AUTHOR}</p>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleRemove(item.B_CODE); }}
                                    className="btn-action-delete btn btn-sm "
                                >
                                    <i className="bi bi-trash3"></i>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-5 text-center">
                            <i className="bi bi-cart-x text-muted opacity-50" style={{ fontSize: '2rem' }}></i>
                            <p className="mt-2 text-muted small">Your cart is empty</p>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-3">
                        <Link href="/books/reserve" className="btn btn-link w-100 text-decoration-none py-2 fw-bold" style={{ borderRadius: '8px' }}>
                            Go to Reserve Books
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;