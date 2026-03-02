// MainLayoutContent.jsx
'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SideBar from "./SideBar";

export default function MainLayoutContent({ children, dataArr }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 992);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (isMobile) {
            setMobileSidebar(!mobileSidebar);
        } else {
            setIsCollapsed(!isCollapsed);
        }
    };

    const closeMobileSidebar = () => {
        if (isMobile) setMobileSidebar(false);
    };

    return (
        <div className={`layout-wrapper ${mobileSidebar ? 'mobile-show' : ''}`}>
            {/* Sidebar is now a top-level child for full height */}
            <SideBar
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                mobileSidebar={mobileSidebar}
                closeMobileSidebar={closeMobileSidebar}
            />

            <div className={`wrapper ${isCollapsed && !isMobile ? 'full-width' : ''}`}>
                {/* Navbar sits inside the content wrapper */}
                <Navbar dataArr={dataArr} onToggle={toggleSidebar} />
                <div id="content" className="main-content" onClick={closeMobileSidebar}>
                    {children}
                </div>
            </div>

            {isMobile && mobileSidebar && (
                <div className="sidebar-overlay" onClick={closeMobileSidebar}></div>
            )}
        </div>
    );
}