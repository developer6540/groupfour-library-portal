import React from "react";
import "./page.scss"
import ForgotPassword from "@/components/pages/FogotPassword/ForgotPassword";

export default function SignInPage() {

    return (
        <>
            <div className="container-fluid vh-100 d-flex flex-column flex-lg-row p-0">

                {/* LEFT SIDE */}
                <div className="col-lg-6 d-none d-lg-flex position-relative overflow-hidden p-5">
                    {/* Background image */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{
                            background: 'url("/img/lbr1.jpg") no-repeat bottom right #3c3c3c',
                            backgroundSize: "cover",
                            zIndex: 0,
                        }}
                    />

                    {/* Overlay */}
                    <div
                        className="position-absolute top-0 start-0 w-100 h-100"
                        style={{background: "rgb(0 0 0 / 50%)"}}
                    />

                    {/* Content */}
                    <div className="position-relative text-center text-lg-start h-100 d-flex flex-column justify-content-center z-index-2">
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
                            Reset your password to continue discovering books, managing your library, and staying connected with the reading community.
                        </p>
                    </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="container d-flex align-items-center bg-rgt-container justify-content-center min-vh-100">
                    <div className="w-100" style={{ maxWidth: "400px" }}>
                        <ForgotPassword />
                    </div>
                </div>

            </div>
        </>
    );
}