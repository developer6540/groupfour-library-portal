'use client';

import React, {useEffect} from "react";
import "./Cart.scss";
import {useDataContext} from "@/lib/dataContext";
import Link from "next/link";
import {getSessionClient, setSessionClient} from "@/lib/session-client";
import {alerts} from "@/lib/alerts";

const Cart = () => {

    const {getGlobalDataCart, setGlobalDataCart} = useDataContext();

    // Pull from Session on Mount
    useEffect(() => {
        const ctDta = getSessionClient("cart-items");
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
        if (getGlobalDataCart !== undefined) {
            setSessionClient("cart-items", JSON.stringify(getGlobalDataCart));
        }
    }, [getGlobalDataCart]); // Runs whenever getGlobalDataCart is updated

    const items = Array.isArray(getGlobalDataCart) ? getGlobalDataCart : [];

    const handleRemove = (B_CODE: string) => {
        setGlobalDataCart(items.filter(item => item.B_CODE !== B_CODE));
    };

    const handleClearAll = () => {
        alerts.confirm(
            "Clear all items from cart",
            "Are you sure you want to clear?",
            async () => {
                setGlobalDataCart([]);
            }
        );
    };

    return (
        <div className="cart-card dropdown">
            <button
                className="btn btn-outline-light border rounded-circle p-2 d-flex align-items-center justify-content-center hide-caret position-relative"
                style={{width: '40px', height: '40px'}}
                data-bs-toggle="dropdown"
                aria-expanded="false"
            >
                <i className="bi bi-cart3 text-dark fs-5"></i>
                {items.length > 0 && (
                    <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white"
                        style={{fontSize: '10px'}}>
                        {items.length}
                    </span>
                )}
            </button>

            <div className="dropdown-menu dropdown-menu-end shadow cart-dropdown border-0 p-0 mt-3 ">
                <div className="p-3 d-flex justify-content-between align-items-center border-bottom bg-light">
                    <h6 className="mb-0 fw-bold">My Book Cart ({items.length})</h6>
                    {items.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleClearAll();
                            }}
                            className="btn btn-sm btn-outline-danger text-danger text-decoration-none fw-semibold p-1"
                            style={{fontSize: '12px'}}
                        >
                            Clear All
                        </button>
                    )}
                </div>

                <div className="cart-list" style={{maxHeight: "350px", minWidth: "320px", overflowY: "auto"}}>
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div key={item.B_CODE}
                                 className="dropdown-item d-flex align-items-center gap-3 p-3 border-bottom">
                                <div className="flex-grow-1">
                                    <p className="mb-0 fw-bold text-dark" style={{fontSize: '14px'}}>{item.B_TITLE}</p>
                                    <p className="mb-0 text-muted" style={{fontSize: '12px'}}>{item.B_AUTHOR}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove(item.B_CODE);
                                    }}
                                    className="btn-action-delete btn btn-sm "
                                >
                                    <i className="bi bi-trash3"></i>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-5 text-center">
                            <i className="bi bi-cart-x text-muted opacity-50" style={{fontSize: '2rem'}}></i>
                            <p className="mt-2 text-muted small">Your cart is empty</p>
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-3">
                        <Link href="/books/reserve" className="btn btn-link w-100 text-decoration-none py-2 fw-bold"
                              style={{borderRadius: '8px'}}>
                            Go to Reserve Books
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;