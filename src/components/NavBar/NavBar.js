import {Link} from "react-router-dom";
import React from "react";
import './NavBar.css';

export function NavBar({Heading, displayBackButton, displayIcon, openModal, returnTo}) {
    return (
        <>
            <header className="menuHeader grid">
                {displayBackButton && (
                    <Link to={returnTo} className="back-arrow">
                                <span className="material-symbols-outlined icon filled">
                                    arrow_back_ios_new
                                </span>
                    </Link>
                )}
                <h2 className={"nav-heading"}>
                    {Heading}
                </h2>
                {displayIcon && (
                    <span id={"dietary-filter"} className="material-symbols-outlined icon filled" onClick={openModal}>
                        filter_alt
                    </span>
                )}
            </header>
        </>
    );
}