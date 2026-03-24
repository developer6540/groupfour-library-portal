'use client';

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SideBarProps {
    isCollapsed: boolean;
    isMobile: boolean;
    mobileSidebar: boolean;
    closeMobileSidebar: () => void;
}

const menuItems = [
    {
        title: "Dashboard",
        icon: "bi-grid-3x3-gap-fill",
        path: "/"
    },
    {
        title: "Profile",
        icon: "bi bi-person",
        key: "profile",
        children: [
            { title: "View Account", path: "/profile/account-details" },
            { title: "Edit Account", path: "/profile/change-account-details" },
            { title: "Edit Passeord", path: "/profile/change-password" },
        ]
    },
    {
        title: "Book Catalog",
        icon: "bi-book",
        key: "book-catalog",
        children: [
            { title: "Book List", path: "/books" },
            { title: "Reserve Book", path: "/books/reserve" }
        ]
    },
    {
        title: "Borrow History",
        icon: "bi-journal-bookmark-fill",
        key: "borrowed-books",
        children: [
            { title: "Borrow Books", path: "/books/borrowed" },
            { title: "Return Books", path: "/books/returned"  }
        ]
    }
];

const SideBar: React.FC<SideBarProps> = ({ isCollapsed, isMobile, mobileSidebar, closeMobileSidebar }) => {
    const pathname = usePathname();

    // Use an array to track multiple open menu keys simultaneously
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    // Add to array if not present, remove if it is
    const toggleMenu = (menuKey: string) => {
        setOpenMenus(prev =>
            prev.includes(menuKey)
                ? prev.filter(key => key !== menuKey)
                : [...prev, menuKey]
        );
    };

    // Close sidebar on mobile after clicking a link
    const handleClick = () => {
        if (isMobile) closeMobileSidebar();
    };

    // Ensure the parent menu is open if a child route is active
    useEffect(() => {
        const parentMenu = menuItems.find(item =>
            item.children?.some(child => pathname.startsWith(child.path))
        );

        if (parentMenu?.key) {
            setOpenMenus(prev =>
                prev.includes(parentMenu!.key!) ? prev : [...prev, parentMenu!.key!]
            );
        }
    }, [pathname]);

    return (
        <nav className={`sidebar 
            ${isCollapsed && !isMobile ? 'collapsed' : ''} 
            ${isMobile && mobileSidebar ? 'mobile-show' : ''}`}>

            {/* LOGO */}
            <div className="sidebar-header d-flex align-items-center justify-content-center px-3">
                <img src="/img/logo.png" width={170} alt="Library" />
            </div>

            {/* NAVIGATION */}
            <div className="sidebar-content">
                <ul className="nav flex-column mb-4 pt-3">
                    {menuItems.map((menu, index) => {

                        // Simple menu without children
                        if (!menu.children) {
                            return (
                                <li key={index} className="nav-item">
                                    <Link
                                        href={menu.path}
                                        onClick={handleClick}
                                        className={`nav-link ${pathname === menu.path ? "active" : ""}`}
                                    >
                                        <i className={`bi ${menu.icon} me-3`}></i>
                                        {!isCollapsed && <span>{menu.title}</span>}
                                    </Link>
                                </li>
                            );
                        }

                        // Determine if this specific submenu should be visible
                        const isOpen = openMenus.includes(menu.key!);

                        return (
                            <li key={index} className="nav-item">
                                <div
                                    className={`nav-link d-flex align-items-center cursor-pointer ${isOpen ? "active" : ""}`}
                                    onClick={() => toggleMenu(menu.key!)}
                                >
                                    <i className={`bi ${menu.icon} me-3`}></i>
                                    {!isCollapsed && <span>{menu.title}</span>}

                                    {!isCollapsed && (
                                        <i
                                            className="bi bi-chevron-down ms-auto small"
                                            style={{
                                                transition: "transform 0.3s",
                                                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)"
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Submenu - Visibility controlled by isOpen boolean */}
                                <ul className={`nav-submenu ${isOpen ? "submenu-open" : ""}`}>
                                    {menu.children.map((sub, i) => (
                                        <li key={i}>
                                            <Link
                                                href={sub.path}
                                                onClick={handleClick}
                                                className={`nav-link-sub ${pathname === sub.path ? "active" : ""}`}
                                            >
                                                <i className="bi bi-caret-right-fill me-1"></i>
                                                {sub.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </nav>
    );
};

export default SideBar;