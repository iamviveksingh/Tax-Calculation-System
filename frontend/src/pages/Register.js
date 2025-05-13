import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../styles/animations.css";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post("http://localhost:5000/api/auth/register", { name, email, password });
            setSuccess(true);
            setError("");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setSuccess(false);
            setError(err.response?.data?.error || "Registration Failed. Try Again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="card-container">
                <div className="logo-section" style={{
                    textAlign: "center",
                    marginBottom: "2rem",
                    animation: "fadeIn 0.5s ease-out"
                }}>
                    <h1 style={{
                        fontSize: "2.5rem",
                        color: "#1a365d",
                        marginBottom: "0.5rem",
                        background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                    }}>
                        TaxEase
                    </h1>
                </div>

                <h2 style={{ 
                    fontSize: "1.75rem", 
                    color: "#1f2937",
                    marginBottom: "1rem",
                    animation: "slideInFromLeft 0.5s ease-out"
                }}>
                    Join TaxEase Today
                </h2>
                <p style={{
                    color: "#6b7280",
                    marginBottom: "2rem",
                    animation: "slideInFromRight 0.5s ease-out",
                    lineHeight: "1.5"
                }}>
                    Create Your Account And Start Managing Your Tax Calculations With Ease
                </p>

                {error && (
                    <div style={{
                        padding: "1rem",
                        backgroundColor: "#FEE2E2",
                        borderRadius: "8px",
                        color: "#DC2626",
                        marginBottom: "1rem",
                        animation: "fadeIn 0.3s ease-out",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <span role="img" aria-label="error">⚠️</span>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{
                        padding: "1rem",
                        backgroundColor: "#DCFCE7",
                        borderRadius: "8px",
                        color: "#16A34A",
                        marginBottom: "1rem",
                        animation: "fadeIn 0.3s ease-out",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <span role="img" aria-label="success">✅</span>
                        Welcome To TaxEase! Redirecting You To Login...
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="form-element" style={{ marginBottom: "1.25rem" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Full Name
                        </label>
                        <input
                            className="animated-input"
                            type="text"
                            placeholder="Enter Your Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-element" style={{ marginBottom: "1.25rem" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Email Address
                        </label>
                        <input
                            className="animated-input"
                            type="email"
                            placeholder="Enter Your Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-element" style={{ marginBottom: "1.5rem" }}>
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Password
                        </label>
                        <input
                            className="animated-input"
                            type="password"
                            placeholder="Create A Strong Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <p style={{
                            fontSize: "0.75rem",
                            color: "#6b7280",
                            marginTop: "0.5rem"
                        }}>
                            Must Be At Least 8 Characters Long
                        </p>
                    </div>
                    <div className="form-element" style={{ marginTop: "2rem" }}>
                        <button 
                            type="submit" 
                            className="animated-button primary"
                            style={{ 
                                width: "100%",
                                background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                                border: "none",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                color: "white",
                                fontWeight: "500",
                                fontSize: "1rem",
                                cursor: "pointer",
                                transition: "transform 0.2s ease"
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="loading-spinner" style={{ margin: "0 auto" }}></div>
                            ) : (
                                "Create Your Account"
                            )}
                        </button>
                    </div>
                </form>

                <p style={{ 
                    marginTop: "2rem",
                    textAlign: "center",
                    color: "#4b5563",
                    animation: "fadeIn 0.5s ease-out 0.5s backwards"
                }}>
                    Already Have An Account?{" "}
                    <Link to="/login" style={{ 
                        color: "#0072ff",
                        textDecoration: "none",
                        fontWeight: "500",
                        transition: "color 0.2s ease"
                    }}>
                        Sign In To TaxEase
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
