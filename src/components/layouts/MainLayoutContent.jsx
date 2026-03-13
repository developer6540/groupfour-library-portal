'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import { getSession, setSession } from "@/lib/session-client";
import { alerts } from "@/lib/alerts";

export default function MainLayoutContent({ children, user = null }) {

    const [currentUser, setCurrentUser] = useState(user);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    useEffect(() => {

        const loadUser = async () => {
            try {
                if (!user) {
                    const sessionData = getSession("user-info");
                    if (!sessionData) {
                        alerts.error("Unauthorized Access", "User session expired, Please log in again", 401);
                        setTimeout(() => { window.location.href = '/sign-in'; }, 2000);
                    } else {
                        const parsedUser = typeof sessionData === 'string' ? JSON.parse(sessionData) : sessionData;
                        setCurrentUser(parsedUser);
                    }
                } else {
                    setSession("user-info", JSON.stringify(user));
                    setCurrentUser(user);
                }
            } catch (error) {
                console.error("Error loading user:", error);
            }
        };
        loadUser();
    }, [user]);

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