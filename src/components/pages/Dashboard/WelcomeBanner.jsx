"use client";

import "./WelcomeBanner.scss";
import { FirstNameOnly } from "@/lib/client-utility";
import { alerts } from "@/lib/alerts";
import { useEffect, useRef, useState } from "react";
import { getUserInfo } from "@/lib/server-utility";

export default function WelcomeBanner() {
    const [user, setUser] = useState(null);
    const [currentImage, setCurrentImage] = useState("/img/welcome-banner/members-1.png");
    const alertShown = useRef(false);

    const images = [
        "/img/welcome-banner/members-1.png",
        "/img/welcome-banner/members-2.png",
        "/img/welcome-banner/members-3.png",
        "/img/welcome-banner/members-4.png",
    ];

    // Fetch user info and show welcome alert once
    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUserInfo();
            if (data) {
                const parsedUser = typeof data === "string" ? JSON.parse(data) : data;
                setUser(parsedUser);

                if (!alertShown.current) {
                    const firstName = parsedUser.U_NAME?.split(" ")[0] || "User";
                    alerts.info(`Hello ${firstName}! 👋`, "Welcome back to your dashboard.", 3000);
                    alertShown.current = true;
                }
            }
        };
        fetchUser();
    }, []);

    // Random image rotation with fade effect
    useEffect(() => {
        let index = 0; // start at first image
        setCurrentImage(images[index]);

        const interval = setInterval(() => {
            index = (index + 1) % images.length; // next image in order
            setCurrentImage(images[index]);
        }, 6000); // change every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card welcome-banner text-white border-0">
            <div className="card-body d-flex align-items-center">
                <div className="px-4 py-4">
                    <h4 className="bnr-wlcm mb-3 d-flex align-items-center">
                        <span className="text-capitalize">
                            Welcome Back, {FirstNameOnly(user?.U_NAME)}
                        </span>
                        <img className="bnr-img ms-2" src="/img/hand.gif" alt="hand-gif" />
                    </h4>

                    <p className="bnr-wlcm-nt mb-0">
                        Let's continue your learning journey. Stay updated with new arrivals,
                        manage your borrowed books, and explore the latest resources available
                        in your library today.
                    </p>
                </div>

                {/* Rotating right-side image */}
                <img
                    key={currentImage}
                    src={currentImage}
                    alt="Student"
                    className="welcome-right-img fade-img"
                />
            </div>
        </div>
    );
}