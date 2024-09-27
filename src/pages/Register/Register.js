import React, {useState} from "react";
import {registerUser} from "../../utils/authFunctions";
import {Link, useNavigate} from "react-router-dom";
import UserStatus from "../../utils/userStatus";
import "./Register.css"

const Register = () => {
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [personNum, setPersonNum] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(String(email).toLowerCase());
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!validateEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        try {
            await registerUser(name, surname, email, personNum, password);
            navigate("/"); // Redirect to home page after successful registration
        } catch (error) {
            console.error("Registration error:", error);
            if (error.code === "auth/invalid-email") {
                setError(
                    "The email address is badly formatted. Please enter a valid email."
                );
            } else if (error.code === "auth/email-already-in-use") {
                setError(
                    "This email is already registered. Please use a different email or try logging in."
                );
            } else {
                setError(
                    error.message ||
                    "An error occurred during registration. Please try again."
                );
            }
        }
    };

    return (
        <div id="signup">
            <section id="signup_logo">
                <img
                    id="logo_login_img"
                    src={require("../../assets/logo outline transparent.png")}
                />
            </section>
            <section id="signup_article_section">
                <article id="signup_article">
                    <section id="signup_heading_section">
                        <h2>Register</h2>
                    </section>
                    {error && <p style={{color: "red"}}>{error}</p>}
                    <form id="form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name"
                            required
                        />
                        <input
                            type="text"
                            value={surname}
                            onChange={(e) => setSurname(e.target.value)}
                            placeholder="Surname"
                            required
                        />
                        <input
                            type="text"
                            value={personNum}
                            onChange={(e) => setPersonNum(e.target.value)}
                            placeholder="Person Number"
                            required
                        />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            required
                        />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                        />
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm Password"
                            required
                        />
                        <button className="button" type="submit">
                            Register
                        </button>
                        <Link to={"/login"} id="account_anchor">
                            Have an account? Login
                        </Link>
                    </form>
                </article>
            </section>
        </div>
    );
};

export default Register;
