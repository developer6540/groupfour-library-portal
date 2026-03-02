'use client';

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {RingLoader} from "react-spinners";

const RootWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const pathname = usePathname();
    console.log("Page Path: ", pathname);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState(pathname);

    useEffect(() => {
        const timeout = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (pathname !== currentPath) {
            setLoading(true);
            const timeout = setTimeout(() => {
                setLoading(false);
                setCurrentPath(pathname);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [pathname, currentPath]);

    return (
        <>
            {loading && (
                <div
                    className="position-fixed top-0 start-0 w-100 vh-100 bg-white d-flex align-items-center justify-content-center"
                    style={{ zIndex: 1500 }}
                >
                    <RingLoader size={100} color="#4f2cab" />
                </div>
            )}
            {children}
        </>
    );
};

export default RootWrapper;
