import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/animations.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        try {
            const res = await axios.post("http://localhost:5000/api/auth/login", { email, password });
            
            if (res.data.token) {
                localStorage.setItem("token", res.data.token);
                navigate("/tax-calculator");
            } else {
                setError("Login Failed. Please Try Again.");
            }
        } catch (error) {
            setError("Invalid Email Or Password. Please Try Again.");
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
                    Welcome Back
                </h2>
                <p style={{
                    color: "#6b7280",
                    marginBottom: "2rem",
                    animation: "slideInFromRight 0.5s ease-out",
                    lineHeight: "1.5"
                }}>
                    Sign In To Continue Your Tax Calculation Journey
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
                
                <form onSubmit={handleLogin}>
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
                            placeholder="Enter Your Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
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
                                "Sign In To TaxEase"
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
                    New To TaxEase?{" "}
                    <Link to="/register" style={{ 
                        color: "#0072ff",
                        textDecoration: "none",
                        fontWeight: "500",
                        transition: "color 0.2s ease"
                    }}>
                        Create Your Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
