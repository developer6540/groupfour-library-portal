import React from "react";
import "./page.scss"
import Register from "@/components/pages/Register/Register";

export default function RegisterPage() {

    return (
        <>
            <div className="container-fluid min-vh-100">
                <div className="row min-vh-100">

                    {/* LEFT SIDE */}
                    <div className="col-lg-6 d-none d-lg-flex position-relative overflow-hidden p-5">
                        {/* Background image */}
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{
                                background: 'url("/img/lbr2.jpg") no-repeat bottom right #3c3c3c',
                                backgroundSize: "cover",
                                zIndex: 0,
                            }}
                        />

                        {/* Overlay */}
                        <div
                            className="position-absolute top-0 start-0 w-100 h-100"
                            style={{background: "rgba(0,0,0,0.55)"}}
                        />

                        {/* Content */}
                        <div
                            className="position-relative text-center text-lg-start h-100 d-flex flex-column justify-content-center z-index-2">
                            <img
                                src="/img/logo-white.png"
                                width={200}
                                className="mb-3"
                                alt="Library"
                            />

                            <h1 className="text-white fw-bold mb-3">
                                Welcome Back to Your
                                <span className="d-block" style={{color: "#a59cfa"}}>
                                   Literary Haven
                                </span>
                            </h1>

                            <p className="text-white fs-5 mb-4" style={{opacity: "0.80"}}>
                                Create your account today to discover amazing books, connect with like-minded readers,
                                and start building your own personalized library.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="col-12 col-lg-6 d-flex flex-column vh-100 bg-rgt-container p-4 p-md-5" style={{ position: 'relative' }}>
                        <div className="w-100 pe-sm-4 d-flex justify-content-center overflow-y-auto overflow-x-hidden flex-grow-1">
                            <div className="w-100" style={{ maxWidth: "520px" }}>
                                <Register />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}