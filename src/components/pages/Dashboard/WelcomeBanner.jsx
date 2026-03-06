"use client";
import "./WelcomeBanner.scss"
import {FirstNameOnly} from "@/lib/utility";
import {alerts} from "@/lib/alerts";
import {useEffect} from "react";

export default function WelcomeBanner({ user }) {

    useEffect(() => {
        alerts.info(`Hello ${user?.U_NAME}! 👋`, "Welcome back to the library.", 5000);
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