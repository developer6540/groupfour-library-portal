'use client';

import React, { useEffect, useState } from 'react';
import './PageTitleBar.scss';

export default function PageTitleBar({ title }) {

    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            const formatted = now.toLocaleString("en-GB", {
                day: "2-digit",
                month: "short",  // e.g., Mar
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false
            });
            setCurrentTime(formatted);
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pg-title-bar d-flex align-items-center justify-content-between mb-4">
            <div className="pg-title">{title}</div>
            <div className="pg-time">{currentTime}</div>
        </div>
    );
}