'use client';

import React, { useState } from "react";
import { FaBookOpenReader } from "react-icons/fa6";

interface SideBarProps {
    isCollapsed: boolean;
    isMobile: boolean;
    mobileSidebar: boolean;
    closeMobileSidebar: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
                                             isCollapsed,
                                             isMobile,
                                             mobileSidebar,
                                             closeMobileSidebar,
                                         }) => {

    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const toggleMenu = (menuName: string) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);
    };

    return (
        <nav className={`sidebar 
            ${isCollapsed && !isMobile ? 'collapsed' : ''} 
            ${isMobile && mobileSidebar ? 'mobile-show' : ''}`}>

            {/* BRAND LOGO */}
            <div className="sidebar-header d-flex align-items-center justify-content-center px-3">
                <img src="/img/logo.png" width={170} alt="Library" />
            </div>

            {/* NAVIGATION */}
            <div className="sidebar-content">
                <ul className="nav flex-column mb-4 pt-3">

                    {/* DASHBOARD */}
                    <li className="nav-item">
                        <a href="#" className="nav-link active">
                            <i className="bi bi-grid-3x3-gap-fill me-3"></i>
                            {!isCollapsed && <span>Dashboard</span>}
                        </a>
                    </li>

                    {/* SAMPLE PAGE 1 */}
                    <li className="nav-item">
                        <div
                            className="nav-link d-flex align-items-center cursor-pointer"
                            onClick={() => toggleMenu('sample1')}
                        >
                            <i className="bi bi-grid-3x3-gap-fill me-3"></i>
                            {!isCollapsed && <span>Sample Page 1</span>}
                            <i
                                className="bi bi-chevron-down ms-auto small"
                                style={{
                                    transition: "transform 0.3s ease",
                                    transform: activeMenu === 'sample1' ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                            ></i>
                        </div>
                        <ul className={`nav-submenu ${activeMenu === 'sample1' ? 'submenu-open' : ''}`}>
                            <li>
                                <a href="#" className="nav-link-sub">
                                    <i className="bi bi-caret-right-fill me-1"></i> Sub Page 1
                                </a>
                            </li>
                        </ul>
                    </li>

                    {/* SAMPLE PAGE 2 */}
                    <li className="nav-item">
                        <div
                            className="nav-link d-flex align-items-center cursor-pointer"
                            onClick={() => toggleMenu('sample2')}
                        >
                            <i className="bi bi-grid-3x3-gap-fill me-3"></i>
                            {!isCollapsed && <span>Sample Page 2</span>}
                            <i
                                className="bi bi-chevron-down ms-auto small"
                                style={{
                                    transition: "transform 0.3s ease",
                                    transform: activeMenu === 'sample2' ? 'rotate(180deg)' : 'rotate(0deg)'
                                }}
                            ></i>
                        </div>
                        <ul className={`nav-submenu ${activeMenu === 'sample2' ? 'submenu-open' : ''}`}>
                            <li>
                                <a href="#" className="nav-link-sub">
                                    <i className="bi bi-caret-right-fill me-1"></i> Sub Page 1
                                </a>
                            </li>
                        </ul>
                    </li>

                </ul>
            </div>
        </nav>
    );
};

export default SideBar;