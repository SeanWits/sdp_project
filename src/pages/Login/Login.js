import React, {useState} from "react";
import {loginUser} from "../../utils/authFunctions";
import {useNavigate, Link} from "react-router-dom";
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await loginUser(email, password);
            navigate("/"); // Redirect to home page after successful login
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div id="login">
            <section id="login_logo">
                <img
                    id="logo_login_img"
                    src={require("../../assets/logo outline transparent.png")}
                    alt="Logo"
                />
            </section>
            <section id="login_article_section">
                <article id="login_article">
                    <section id="login_heading_section">
                        <h2 className="centre_no_margin">Login</h2>
                    </section>
                    {error && <p style={{color: "red"}}>Incorrect credentials. Please try again.</p>}
                    <form id="form" onSubmit={handleSubmit}>
                        <input
                            className="form_input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            className="form_input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <button className="button" type="submit">
                            Login
                        </button>
                        <Link to="/register" id="account_anchor">
                            Don't have an account? Register
                        </Link>
                    </form>
                </article>
            </section>
        </div>
    );
};

export default Login;