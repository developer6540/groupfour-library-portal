'use client';

import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import SideBar from "./SideBar";
import {getSession, setSession} from "@/lib/session";

export default function MainLayoutContent({ children, user = "" }) {

    const [currentUser, setCurrentUser] = useState(user);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSidebar, setMobileSidebar] = useState(false);

    useEffect(() => {
        if (!currentUser) {
            getSession("user-info").then(res => {
               setCurrentUser(JSON.parse(res));
            });
        }else{
            setSession("user-info", JSON.stringify(currentUser));
        }
        const handleResize = () => setIsMobile(window.innerWidth <= 992);
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [currentUser]);

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