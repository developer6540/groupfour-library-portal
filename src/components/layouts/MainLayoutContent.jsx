'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import {alerts} from "@/lib/alerts";
import {getUserInfo} from "@/lib/server-utility";

export default function MainLayoutContent({ children }) {

    const [currentUser, setCurrentUser] = useState(null);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const data = await getUserInfo();
                if (!data) {
                    alerts.error("Unauthorized", "Session expired. Redirecting...", 3000);
                    setTimeout(() => { window.location.href = '/sign-in'; }, 3000);
                } else {
                    setCurrentUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user:", error);
            }
        };
        loadUser();
    }, []);

    // Handle window resize
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
            <SideBar
                isCollapsed={isCollapsed}
                isMobile={isMobile}
                mobileSidebar={mobileSidebar}
                closeMobileSidebar={closeMobileSidebar}
            />

            <div className={`wrapper ${isCollapsed && !isMobile ? 'full-width' : ''}`}>
                <Navbar user={currentUser} onToggle={toggleSidebar} />

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