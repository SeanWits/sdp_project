import "./Header.css";

function Header() {
    return (
        <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
            />

            <header id="Header">
                <section id="logo_on_header" onClick={() => navigate("/")}>
                    <img
                        id="logo"
                        src={require("../assets/logo outline transparent.png")}
                        alt="Campus Bites Logo"
                    />
                    <p id="logo_label">Campus Bites</p>
                </section>
                <section id="icons_on_header">
                    <span
                        className="material-symbols-outlined"
                        onClick={() => navigate("/Orders")}
                    >
                        receipt
                    </span>
                    <span
                        className="material-symbols-outlined"
                        onClick={() => navigate("/")}
                    >
                        shopping_basket
                    </span>
                </section>
            </header>
        </>
    );
}

export default Header;
