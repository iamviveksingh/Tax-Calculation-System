import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/animations.css";

function TaxCalculator() {
    // eslint-disable-next-line no-unused-vars
    const [income, setIncome] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [otherIncome, setOtherIncome] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [deduction, setDeduction] = useState(75000);
    // eslint-disable-next-line no-unused-vars
    const [employmentType, setEmploymentType] = useState("salaried");
    // eslint-disable-next-line no-unused-vars
    const [tax, setTax] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [breakdown, setBreakdown] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [isCalculating, setIsCalculating] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [showSuccess, setShowSuccess] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    // eslint-disable-next-line no-unused-vars
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        profileImage: null
    });

    const navigate = useNavigate();

    // Update current date and time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    navigate("/login");
                    return;
                }

                const response = await fetch("http://localhost:5000/api/user/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserInfo({
                        name: data.name || "User",
                        email: data.email || "",
                        profileImage: data.profileImage || null
                    });
                }
            } catch (error) {
                console.error("Error fetching user info:", error);
            }
        };

        fetchUserInfo();
    }, [navigate]);

    const handleEmploymentChange = (e) => {
        setEmploymentType(e.target.value);
        setDeduction(e.target.value === "salaried" ? 75000 : 0);
    };

    const handleInputChange = (setter) => (e) => {
        const value = e.target.value;
        setter(value ? Number(value) : "");
    };

    const calculateTax = async () => {
        setIsCalculating(true);
        setShowSuccess(false);
        
        try {
            if (!income && !otherIncome) {
                alert("Please enter at least one income value");
                return;
            }

            const token = localStorage.getItem("token");
            if (!token) {
                alert("User not authenticated. Please log in.");
                navigate("/login");
                return;
            }

            const response = await fetch("http://localhost:5000/api/tax/calculate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    salary: income || 0,
                    otherIncome: otherIncome || 0,
                    employmentType: employmentType
                }),
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || data.details || "Failed to calculate tax");
            }

            if (data && data.breakdown) {
                const { breakdown } = data;
                let taxBreakdown = "";
                
                taxBreakdown += `New Tax Regime 2025\n`;
                taxBreakdown += `Employment Type: ${breakdown.employmentType === 'salaried' ? 'Salaried' : 'Self-Employed'}\n`;
                taxBreakdown += `Total Income: ₹${breakdown.totalIncome.toLocaleString('en-IN')}\n`;
                
                if (breakdown.employmentType === 'salaried') {
                    taxBreakdown += `Standard Deduction: ₹${breakdown.standardDeduction.toLocaleString('en-IN')}\n`;
                    taxBreakdown += `Taxable Income (after standard deduction): ₹${breakdown.taxableIncome.toLocaleString('en-IN')}\n`;
                } else {
                    taxBreakdown += `No standard deduction applicable for self-employed individuals.\n`;
                    taxBreakdown += `Taxable Income: ₹${breakdown.taxableIncome.toLocaleString('en-IN')}\n`;
                }

                taxBreakdown += `\nTax Calculation Breakdown:\n`;
                
                // Add slab-wise breakdown
                breakdown.slabs.forEach(slab => {
                    if (slab.amount > 0) {
                        taxBreakdown += `${slab.range}: ${slab.rate} = ₹${slab.amount.toLocaleString('en-IN')}\n`;
                    } else {
                        taxBreakdown += `${slab.range}: ${slab.rate}\n`;
                    }
                });

                taxBreakdown += `\nTotal Tax Payable: ₹${data.tax.toLocaleString('en-IN')}`;

                setTax(data.tax);
                setBreakdown(taxBreakdown);
                setShowSuccess(true);
            } else {
                throw new Error("Invalid response format from server");
            }
        } catch (error) {
            console.error("Error calculating tax:", error);
            alert(error.message || "An error occurred. Please try again.");
        } finally {
            setIsCalculating(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    return (
        <div className="page-container" style={{ 
            background: "linear-gradient(145deg, #f6f9fc 0%, #ffffff 100%)",
            minHeight: "100vh",
            padding: "0 0 2rem 0"
        }}>
            <nav className="navigation" style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1.25rem 2.5rem",
                background: "rgba(255, 255, 255, 0.95)",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                backdropFilter: "blur(8px)",
                position: "sticky",
                top: 0,
                zIndex: 100,
                marginBottom: "2.5rem"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span role="img" aria-label="calculator" style={{ fontSize: "1.75rem" }}>🧮</span>
                    <h1 style={{
                        fontSize: "1.75rem",
                        fontWeight: "700",
                        background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        margin: 0
                    }}>
                        TaxEase
                    </h1>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div style={{ position: "relative" }}>
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            style={{
                                background: "transparent",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.75rem",
                                cursor: "pointer",
                                padding: "0.5rem",
                                borderRadius: "8px",
                                transition: "all 0.2s ease"
                            }}
                            onMouseEnter={(e) => e.target.style.background = "rgba(0, 114, 255, 0.1)"}
                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                            <div style={{
                                width: "40px",
                                height: "40px",
                                borderRadius: "50%",
                                background: userInfo.profileImage ? `url(${userInfo.profileImage})` : "linear-gradient(120deg, #00c6ff, #0072ff)",
                                backgroundSize: "cover",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "white",
                                fontSize: "1.25rem",
                                fontWeight: "500"
                            }}>
                                {!userInfo.profileImage && "👤"}
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <p style={{ margin: 0, color: "#1f2937", fontWeight: "500" }}>{userInfo.name}</p>
                                <p style={{ margin: 0, fontSize: "0.75rem", color: "#6b7280" }}>{userInfo.email}</p>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div style={{
                                position: "absolute",
                                top: "100%",
                                right: 0,
                                marginTop: "0.5rem",
                                background: "white",
                                borderRadius: "12px",
                                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                                width: "250px",
                                padding: "1rem",
                                animation: "slideUpFade 0.2s ease-out"
                            }}>
                                <div style={{ padding: "0.75rem", borderBottom: "1px solid #e5e7eb" }}>
                                    <p style={{ margin: 0, fontSize: "0.875rem", color: "#6b7280" }}>Date & Time</p>
                                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#1f2937" }}>
                                        {currentDateTime.toLocaleString('en-IN', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                                <div style={{ padding: "0.5rem" }}>
                                    <button
                                        onClick={() => navigate("/profile")}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "none",
                                            borderRadius: "8px",
                                            background: "transparent",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s ease",
                                            color: "#1f2937"
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                                    >
                                        <span role="img" aria-label="profile">👤</span>
                                        View Profile
                                    </button>
                                    <button
                                        onClick={handleLogout}
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.5rem",
                                            width: "100%",
                                            padding: "0.75rem",
                                            border: "none",
                                            borderRadius: "8px",
                                            background: "transparent",
                                            cursor: "pointer",
                                            transition: "background-color 0.2s ease",
                                            color: "#ef4444"
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = "#f3f4f6"}
                                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                                    >
                                        <span role="img" aria-label="logout">👋</span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="card-container interactive-card" style={{
                maxWidth: "800px",
                margin: "0 auto",
                padding: "2rem",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)"
            }}>
                <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                    <h2 style={{ 
                        fontSize: "2.25rem",
                        color: "#1f2937",
                        marginBottom: "1rem",
                        animation: "slideInFromLeft 0.5s ease-out",
                        fontWeight: "700"
                    }}>
                        Tax Calculator
                    </h2>
                    <p style={{
                        color: "#6b7280",
                        marginBottom: "0",
                        animation: "slideInFromRight 0.5s ease-out",
                        lineHeight: "1.6",
                        fontSize: "1.125rem",
                        maxWidth: "600px",
                        margin: "0 auto"
                    }}>
                        Get An Instant Estimate Of Your Tax Liability Under The New Tax Regime
                    </p>
                </div>

                <div className="form-section" style={{
                    background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
                    padding: "2rem",
                    borderRadius: "12px",
                    marginBottom: "2rem",
                    border: "1px solid #e2e8f0"
                }}>
                    <h3 style={{
                        fontSize: "1.5rem",
                        color: "#1f2937",
                        marginBottom: "1.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                    }}>
                        <span role="img" aria-label="income">💼</span>
                        Income Details
                    </h3>

                    <div className="form-element" style={{ marginBottom: "1.25rem" }}>
                        <label htmlFor="employment" style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Employment Type
                        </label>
                        <select 
                            id="employment" 
                            value={employmentType} 
                            onChange={handleEmploymentChange}
                            className="animated-input"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: "white"
                            }}
                        >
                            <option value="salaried">Salaried</option>
                            <option value="self-employed">Self-Employed</option>
                        </select>
                    </div>
                    
                    <div className="form-element" style={{ marginBottom: "1.25rem" }}>
                        <label htmlFor="income" style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Annual Income (₹)
                        </label>
                        <input
                            type="number"
                            id="income"
                            placeholder="Enter Your Annual Income"
                            value={income}
                            onChange={handleInputChange(setIncome)}
                            className="animated-input"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0"
                            }}
                        />
                    </div>

                    <div className="form-element">
                        <label htmlFor="otherIncome" style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Other Income (₹)
                        </label>
                        <input
                            type="number"
                            id="otherIncome"
                            placeholder="Enter Additional Income (If Any)"
                            value={otherIncome}
                            onChange={handleInputChange(setOtherIncome)}
                            className="animated-input"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0"
                            }}
                        />
                    </div>
                </div>

                <div className="form-section" style={{
                    background: "linear-gradient(to right, #f8fafc, #f1f5f9)",
                    padding: "2rem",
                    borderRadius: "12px",
                    marginBottom: "2rem",
                    border: "1px solid #e2e8f0"
                }}>
                    <h3 style={{
                        fontSize: "1.5rem",
                        color: "#1f2937",
                        marginBottom: "1.75rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                    }}>
                        <span role="img" aria-label="deductions">💸</span>
                        Standard Deduction
                    </h3>

                    <div className="form-element">
                        <label style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            color: "#4b5563",
                            fontSize: "0.875rem"
                        }}>
                            Under The New Tax Regime For 2025, A Fixed Deduction Of ₹75,000 Is Available Only For Salaried Employees. 
                            No Other Deductions Or Exemptions (Like HRA Or NPS) Are Applicable.
                        </label>
                        <input
                            type="number"
                            value={deduction} 
                            readOnly 
                            className="animated-input"
                            style={{
                                width: "100%",
                                padding: "0.75rem",
                                borderRadius: "8px",
                                border: "1px solid #e2e8f0",
                                background: "#f1f5f9"
                            }}
                        />
                    </div>
                </div>

                <div className="form-element" style={{ marginTop: "2rem" }}>
                    <button 
                        onClick={calculateTax} 
                        className="animated-button primary"
                        style={{ 
                            width: "100%",
                            background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                            border: "none",
                            padding: "1rem",
                            borderRadius: "8px",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "1rem",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem"
                        }}
                        disabled={isCalculating}
                    >
                        {isCalculating ? (
                            <div className="loading-spinner"></div>
                        ) : (
                            <>
                                <span role="img" aria-label="calculate">🧮</span>
                                Calculate Tax
                            </>
                        )}
                    </button>
                </div>

                {showSuccess && (
                    <div style={{
                        padding: "1rem",
                        backgroundColor: "#DCFCE7",
                        borderRadius: "8px",
                        color: "#16A34A",
                        marginTop: "1rem",
                        animation: "slideUpFade 0.5s ease-out",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem"
                    }}>
                        <span role="img" aria-label="success">✅</span>
                        Calculation Saved Successfully!
                    </div>
                )}

                {tax !== null && (
                    <div className="result-container" style={{
                        animation: "slideUpFade 0.5s ease-out",
                        marginTop: "2.5rem",
                        background: "white",
                        padding: "2rem",
                        borderRadius: "16px",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05), 0 10px 15px rgba(0, 0, 0, 0.1)"
                    }}>
                        <div style={{
                            textAlign: "center",
                            marginBottom: "2rem"
                        }}>
                            <span role="img" aria-label="result" style={{ fontSize: "2.5rem" }}>📊</span>
                            <h3 style={{
                                fontSize: "1.75rem",
                                color: "#1f2937",
                                marginTop: "1rem",
                                marginBottom: "0.5rem"
                            }}>
                                Your Tax Summary
                            </h3>
                            <p style={{
                                color: "#6b7280",
                                fontSize: "1rem",
                                margin: 0
                            }}>
                                Based On The Information You Provided
                            </p>
                        </div>
                        
                        <div style={{
                            background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                            padding: "2rem",
                            borderRadius: "12px",
                            marginBottom: "2rem",
                            color: "white",
                            textAlign: "center"
                        }}>
                            <p style={{
                                fontSize: "1rem",
                                opacity: 0.9,
                                marginBottom: "0.75rem",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em"
                            }}>
                                Total Tax Payable
                            </p>
                            <h4 style={{
                                fontSize: "3rem",
                                margin: 0,
                                fontWeight: "700"
                            }}>
                                ₹{tax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                            </h4>
                        </div>

                        <div style={{ 
                            background: "#f8fafc",
                            padding: "1rem",
                            borderRadius: "8px",
                            fontSize: "0.875rem",
                            lineHeight: "1.5",
                            color: "#4b5563"
                        }}>
                            <h4 style={{
                                color: "#1f2937",
                                marginBottom: "0.75rem",
                                fontSize: "1rem"
                            }}>
                                Detailed Breakdown
                            </h4>
                            <pre style={{
                                whiteSpace: "pre-wrap",
                                fontFamily: "inherit",
                                margin: 0
                            }}>
                                {breakdown}
                            </pre>
                        </div>
                    </div>
                )}

                <section className="faq-section" style={{
                    maxWidth: "800px",
                    margin: "2rem auto",
                    padding: "2rem",
                    background: "white",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}>
                    <h2 style={{ color: "#1f2937", marginBottom: "1.5rem" }}>Frequently Asked Questions</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
                        <div className="faq-item" style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                            <h3 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>What Is The New Tax Regime?</h3>
                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>The New Tax Regime Offers Lower Tax Rates With Fewer Deductions. It's Optional And Taxpayers Can Choose Between The Old And New Regime Each Year.</p>
                        </div>
                        <div className="faq-item" style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                            <h3 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>What Are The Tax Slabs?</h3>
                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Tax Slabs For FY 2025-26: 0% Up To ₹4L, 5% From ₹4L-8L, 10% From ₹8L-12L, 15% From ₹12L-16L, 20% From ₹16L-20L, 25% From ₹20L-24L, And 30% Above ₹24L.</p>
                        </div>
                        <div className="faq-item" style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                            <h3 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>What Is Marginal Relief For Self-Employed?</h3>
                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Marginal Relief Is A Special Tax Benefit For Self-Employed Individuals Earning Between ₹12L And ₹12.75L. Instead Of Paying Tax On The Entire Income, They Only Pay Tax On The Amount Exceeding ₹12L. For Example, If Income Is ₹12.3L, Tax Will Be Only ₹30,000 (Excess Over ₹12L).</p>
                        </div>
                        <div className="faq-item" style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                            <h3 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>Who Gets Standard Deduction?</h3>
                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Salaried Employees Get A Standard Deduction Of ₹75,000. This Deduction Is Not Available For Self-Employed Individuals.</p>
                        </div>
                        <div className="faq-item" style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                            <h3 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>What Is The Rebate Limit?</h3>
                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>Individuals With Total Income Up To ₹12L (After Standard Deduction For Salaried) Are Eligible For A Full Tax Rebate, Meaning They Don't Have To Pay Any Tax.</p>
                        </div>
                        <div className="faq-item" style={{ padding: "1rem", background: "#f9fafb", borderRadius: "8px" }}>
                            <h3 style={{ color: "#1f2937", marginBottom: "0.5rem" }}>How Is Tax Calculated For Self-Employed?</h3>
                            <p style={{ color: "#4b5563", fontSize: "0.875rem" }}>For Self-Employed: No Tax Up To ₹12L, Marginal Relief Between ₹12L-12.75L (Tax Only On Excess Over ₹12L), And Regular Slab Rates Above ₹12.75L. For Example, Income Of ₹12.3L Will Have Tax Of ₹30,000.</p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default TaxCalculator;
