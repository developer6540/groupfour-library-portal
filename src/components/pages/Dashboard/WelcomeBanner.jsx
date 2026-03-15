"use client";
import "./WelcomeBanner.scss"
import {FirstNameOnly} from "@/lib/client-utility";
import {alerts} from "@/lib/alerts";
import {useEffect, useRef, useState} from "react";;
import {getUserInfo} from "@/lib/server-utility";

export default function WelcomeBanner() {

    const [user, setUser] = useState(null);
    const alertShown = useRef(false);

    useEffect(() => {
        const fetchUser = async () => {
            const data = await getUserInfo();
            if (data) {
                const parsedUser = typeof data === 'string' ? JSON.parse(data) : data;
                setUser(parsedUser);
                if (!alertShown.current) {
                    const firstName = parsedUser.U_NAME?.split(' ')[0] || 'User';
                    alerts.info(`Hello ${firstName}! 👋`, 'Welcome back to your dashboard.', 3000);
                    alertShown.current = true;
                }
            }
        };
        fetchUser();
    }, []);

    return (
        <div className="card welcome-banner text-white border-0">
            <div className="card-body d-flex align-items-center">
                <div className="px-4 py-4">
                    <h4 className="bnr-wlcm mb-3 d-flex align-items-center">
                        <span className="text-capitalize">Welcome Back, {FirstNameOnly(user?.U_NAME)}</span>
                        <img
                            className="bnr-img ms-2"
                            src="/img/hand.gif"
                            alt="hand-gif"
                        />
                    </h4>

                    <p className="bnr-wlcm-nt mb-0">
                        Let's continue your learning journey. Stay updated with new arrivals,
                        manage your borrowed books, and explore the latest resources available
                        in your library today.
                    </p>
                </div>

                <img
                    src="/img/members.png"
                    alt="Student"
                    className="welcome-right-img"
                />
            </div>
        </div>
    );
}