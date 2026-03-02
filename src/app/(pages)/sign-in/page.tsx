import React from "react";
import "./page.scss"
import Login from "@/components/pages/SignIn/Login";

export default function SignInPage() {

    return (
        <>
            <div className="container-fluid vh-100 d-flex flex-column flex-lg-row p-0">

                {/* LEFT SIDE */}
                <div className="col-lg-6 d-none d-lg-flex  bg-lft-container position-relative overflow-hidden p-5">

                    {/* Background Video */}
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="position-absolute top-0 start-0 w-100 h-100 object-fit-cover"
                        style={{ zIndex: 0 }}
                    >
                        <source src="/vdo/libruary.mp4" type="video/mp4" />
                    </video>

                    {/* Dark Overlay */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{background: "rgb(0 0 0 / 60%)"}}
                    />

                    {/* Content */}
                    <div className="position-relative text-center text-lg-start h-100 d-flex flex-column justify-content-center"
                         style={{ zIndex: 2 }}>

                        <img
                            src="/img/logo-white.png"
                            width={200}
                            className="mb-3"
                            alt="Library"
                        />

                        <h1 className="text-white fw-bold mb-3">
                            Welcome Back to Your
                            <span className="d-block" style={{ color: "#a59cfa" }}>
                                Literary Haven
                            </span>
                        </h1>

                        <p className="text-white fs-5 mb-4" style={{ opacity: "0.85" }}>
                            Sign in to continue exploring new books, connecting with fellow readers, and managing your personal library effortlessly.
                        </p>

                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="container d-flex align-items-center bg-rgt-container justify-content-center min-vh-100">
                    <div className="w-100" style={{ maxWidth: "400px" }}>
                        <Login />
                    </div>
                </div>

            </div>
        </>
    );
}