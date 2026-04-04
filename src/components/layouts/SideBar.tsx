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
    { title: "Dashboard", icon: "bi-grid-3x3-gap-fill", path: "/" },
    {
        title: "Profile", icon: "bi-person", key: "profile", children: [
            { title: "View Account", path: "/profile/account-details" },
            { title: "Edit Account", path: "/profile/change-account-details" },
            { title: "Edit Password", path: "/profile/change-password" },
        ]
    },
    {
        title: "Book Catalog", icon: "bi-book", key: "book-catalog", children: [
            { title: "Books List", path: "/books" },
            { title: "Reserve Books", path: "/books/reserve" },
            { title: "Borrowed Books", path: "/books/borrowed" },
            { title: "Returned Books", path: "/books/return" }
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
    const [openMenus, setOpenMenus] = useState<string[]>([]);

    const toggleMenu = (menuKey: string) => {
        setOpenMenus(prev =>
            prev.includes(menuKey)
                ? prev.filter(key => key !== menuKey)
                : [...prev, menuKey]
        );
    };

    const handleClick = () => {
        if (isMobile) closeMobileSidebar();
    };

    useEffect(() => {
        const parentMenu = menuItems.find(item =>
            item.children?.some(child => pathname.startsWith(child.path))
        );
        if (parentMenu?.key && !openMenus.includes(parentMenu.key)) {
            setOpenMenus([...openMenus, parentMenu.key]);
        }
    }, [pathname]);

    return (
        <nav className={`sidebar 
      ${isCollapsed && !isMobile ? 'collapsed' : ''} 
      ${isMobile && mobileSidebar ? 'mobile-show' : ''}`}>

            {/* Logo */}
            <div className="sidebar-header d-flex align-items-center justify-content-center px-3">
                <img src="/img/logo.png" width={170} alt="Library" />
            </div>

            {/* Navigation */}
            <div className="sidebar-content">
                <ul className="nav flex-column mb-4 pt-3">
                    {menuItems.map((menu, index) => {
                        if (!menu.children) {
                            return (
                                <li key={index} className="nav-item">
                                    <Link href={menu.path} onClick={handleClick} className={`nav-link ${pathname === menu.path ? "active" : ""}`}>
                                        <i className={`bi ${menu.icon} me-3`}></i>
                                        {!isCollapsed && <span>{menu.title}</span>}
                                    </Link>
                                </li>
                            );
                        }

                        const isOpen = openMenus.includes(menu.key!);
                        return (
                            <li key={index} className="nav-item">
                                <div className={`nav-link d-flex align-items-center cursor-pointer ${isOpen ? "active" : ""}`} onClick={() => toggleMenu(menu.key!)}>
                                    <i className={`bi ${menu.icon} me-3`}></i>
                                    {!isCollapsed && <span>{menu.title}</span>}
                                    {!isCollapsed && <i className="bi bi-chevron-down ms-auto small" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />}
                                </div>
                                <ul className={`nav-submenu ${isOpen ? "submenu-open" : ""}`}>
                                    {menu.children.map((sub, i) => (
                                        <li key={i}>
                                            <Link href={sub.path} onClick={handleClick} className={`nav-link-sub ${pathname === sub.path ? "active" : ""}`}>
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