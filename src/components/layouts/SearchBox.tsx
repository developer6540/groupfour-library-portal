'use client';

import React, { useEffect, useState } from "react";
import {deleteCookie, getCookie, setCookie} from "@/lib/client-utility";

interface SearchBoxProps {
    placeholder?: string;
    onSearch?: (value: string) => void;
}

const SearchBox: React.FC<SearchBoxProps> = ({
                                                 placeholder = "Enter book name to quick search...",
                                                 onSearch
                                             }) => {

    const [searchTerm, setSearchTerm] = useState("");
    const [showHistory, setShowHistory] = useState(false);
    const [history, setHistory] = useState<string[]>([]);

    /* ---------------- Load Cookie ---------------- */

    useEffect(() => {
        const stored = getCookie("search-history");
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
        setCookie("search-history", JSON.stringify(newHistory), 7);
    };

    const handleSearch = (value: string) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return;

        // Update history: remove duplicates and add to front
        const updatedHistory = [
            trimmedValue,
            ...history.filter(item => item !== trimmedValue)
        ].slice(0, 10);

        setHistory(updatedHistory);
        setCookie("search-history", JSON.stringify(updatedHistory), 7);
        setShowHistory(false);
        setSearchTerm(trimmedValue); // Sync the input field

        if (onSearch) {
            onSearch(trimmedValue);
        }
    };

    const filteredHistory = history.filter(item =>
        item.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const clearHistory = () => {
        deleteCookie("search-history");
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