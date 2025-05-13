import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Home.css";
import "../styles/typography.css";

const Home = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Check authentication status
        const token = localStorage.getItem("token");
        setIsAuthenticated(!!token);
    }, []);

    return (
        <div className="home-container">
            <header className="hero">
                <div className="greeting-section">
                    <h1 className="heading-1">
                        Welcome To TaxEase
                    </h1>
                    <p className="subtitle">
                        Simplify Your Tax Calculations With Our Smart Calculator
                    </p>
                </div>

                <div className="tax-highlights">
                    <div className="highlight-item">
                        <span className="highlight-label">Tax Year</span>
                        <span className="highlight-value">2025</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-label">Last Updated</span>
                        <span className="highlight-value">April 2025</span>
                    </div>
                    <div className="highlight-item">
                        <span className="highlight-label">Response Time</span>
                        <span className="highlight-value">Instant</span>
                    </div>
                </div>

                <div className="intro-section">
                    <h2 className="heading-2">Your Tax Calculation Partner</h2>
                    <p className="intro-text">
                        Experience Hassle-Free Tax Estimation With Our Intuitive Calculator.<br></br>
                        Quick, Reliable, and Designed With You In Mind.
                    </p>
                    <div className="calculator-preview">
                        <div className="preview-item">
                            <span className="preview-label">Basic Income Tax</span>
                            <span className="preview-icon">📊</span>
                        </div>
                        <div className="preview-item">
                            <span className="preview-label">Tax Estimate</span>
                            <span className="preview-icon">💰</span>
                        </div>
                        <div className="preview-item">
                            <span className="preview-label">Easy to Use</span>
                            <span className="preview-icon">✓</span>
                        </div>
                    </div>
                </div>

                <div className="features">
                    <div className="feature-item">
                        <span role="img" aria-label="calculator" className="feature-icon">🧮</span>
                        <h3 className="heading-3">Basic Calculation</h3>
                        <p className="body-text">Simple and Straight Forward Income Tax Estimation</p>
                    </div>
                    <div className="feature-item">
                        <span role="img" aria-label="easy" className="feature-icon">👌</span>
                        <h3 className="heading-3">User Friendly</h3>
                        <p className="body-text">Easy To Understand Interface For Quick Tax Calculations</p>
                    </div>
                    <div className="feature-item">
                        <span role="img" aria-label="instant" className="feature-icon">⚡</span>
                        <h3 className="heading-3">Instant Results</h3>
                        <p className="body-text">Get Your Estimated Tax Calculation Immediately</p>
                    </div>
                </div>

                <div className="tax-categories">
                    <h2 className="heading-2">What You Can Calculate</h2>
                    <div className="category-grid">
                        <div className="category-item">
                            <h4>Basic Income Tax</h4>
                            <ul>
                                <li>Annual Income Input</li>
                                <li>Basic Tax Estimation</li>
                                <li>Simple Breakdown</li>
                            </ul>
                        </div>
                        <div className="category-item">
                            <h4>Calculator Features</h4>
                            <ul>
                                <li>Easy Input Form</li>
                                <li>Instant Calculation</li>
                                <li>Basic Tax Brackets</li>
                            </ul>
                        </div>
                        <div className="category-item">
                            <h4>Results Overview</h4>
                            <ul>
                                <li>Total Tax Estimate</li>
                                <li>Basic Breakdown</li>
                                <li>Simple Summary</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="cta-section">
                    <h2 className="heading-2">Start Your Tax Calculation</h2>
                    <p className="body-text">
                        Get Accurate Tax Estimates And Maximize Your Deductions With Our Tax Calculator
                    </p>
                    <div className="cta-buttons">
                        {isAuthenticated ? (
                            <button 
                                onClick={() => navigate("/tax-calculator")}
                                className="animated-button primary"
                            >
                                Go To Calculator
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={() => navigate("/login")}
                                    className="animated-button primary"
                                >
                                    Log In
                                </button>
                                <button 
                                    onClick={() => navigate("/register")}
                                    className="animated-button secondary"
                                >
                                    Create Free Account
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <footer className="home-footer">
                    <div className="footer-content">
                        <p className="small-text">
                            © All Rights Reserved.
                        </p>
                        <p className="credit-text">
                            Made With <span role="img" aria-label="love">❤️ </span> By 
                            <span className="developer-name">Vivek Singh</span>
                        </p>
                    </div>
                </footer>
            </header>
        </div>
    );
};

export default Home;
