'use client';

import React, { useEffect, useState } from "react";

interface SearchBoxProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
}

const COOKIE_NAME = "SearchHistory";

const SearchBox: React.FC<SearchBoxProps> = ({
                                                 placeholder = "Enter book name to quick search...",
                                                 onSearch
                                             }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    /* ---------------- Cookie Helpers ---------------- */

    const setCookie = (name: string, value: string, days: number) => {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
    };

    const getCookie = (name: string) => {
        const cookies = document.cookie.split("; ");
        for (let cookie of cookies) {
            const [key, value] = cookie.split("=");
            if (key === name) {
                return decodeURIComponent(value);
            }
        }
        return null;
    };

    const deleteCookie = (name: string) => {
        document.cookie = `${name}=; Max-Age=0; path=/`;
    };

    /* ---------------- Load Cookie ---------------- */

    useEffect(() => {
        const stored = getCookie(COOKIE_NAME);
        if (stored) {
            try {
                setHistory(JSON.parse(stored));
            } catch {
                setHistory([]);
            }
        }
    }, []);

    /* ---------------- Save Cookie ---------------- */

    const saveHistory = (newHistory: string[]) => {
        setHistory(newHistory);
        setCookie(COOKIE_NAME, JSON.stringify(newHistory), 7);
    };

    const handleSearch = (value: string) => {
        if (!value.trim()) {
            alert("Please enter a search term.");
            return;
        }

        let updatedHistory = history.filter(item => item !== value);
        updatedHistory.unshift(value);

        if (updatedHistory.length > 10) {
            updatedHistory = updatedHistory.slice(0, 10);
        }

        saveHistory(updatedHistory);
        setShowHistory(false);

        if (onSearch) {
            onSearch(value);
        } else {
            alert("Searching for: " + value);
        }
    };

    const filteredHistory = history.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearHistory = () => {
        deleteCookie(COOKIE_NAME);
        setHistory([]);
    };

    return (
        <div className="position-relative" style={{ maxWidth: "400px", width: "100%" }}>
            <div className="input-group">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            handleSearch(searchTerm);
                        }
                    }}
                    className="form-control bg-light border-end-0 rounded-start-pill py-2"
                    placeholder={placeholder}
                />
                <span
                    className="input-group-text bg-light border-start-0 rounded-end-pill pe-3"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleSearch(searchTerm)}
                >
                    <i className="bi bi-search"></i>
                </span>
            </div>

            {showHistory && filteredHistory.length > 0 && (
                <div className="search-history-dropdown shadow-sm">
                    <div className="history-header">
                        <span className="fw-bold">Recent Searches</span>
                        <button className="fw-bold" onMouseDown={clearHistory}>
                            Clear
                        </button>
                    </div>

                    {filteredHistory.map((item, index) => (
                        <div
                            key={index}
                            className="history-item"
                            onMouseDown={() => {
                                setSearchTerm(item);
                                handleSearch(item);
                            }}
                        >
                            <i className="bi bi-clock-history me-2 text-muted"></i>
                            {item}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBox;