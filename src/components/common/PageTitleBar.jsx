'use client';

import React, { useEffect, useState } from 'react';
import './PageTitleBar.scss';
import {getCurrentTime} from "@/lib/utility";

export default function PageTitleBar({ title }) {

    const [currentTime, setCurrentTime] = useState("");

    useEffect(() => {

        const updateClock = () => {
        const time = getCurrentTime()
            setCurrentTime(time);
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