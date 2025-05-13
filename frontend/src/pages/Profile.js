import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/animations.css";

function Profile() {
    const [userProfile, setUserProfile] = useState({
        name: "",
        email: "",
        createdAt: "",
        totalTaxPaid: 0,
        totalCalculations: 0,
        accountType: ""
    });
    const [previousCalculations, setPreviousCalculations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    console.log("No token found, redirecting to login");
                    navigate("/login");
                    return;
                }

                console.log("Token found:", token.substring(0, 20) + "...");

                // First verify the token
                const verifyResponse = await fetch("http://localhost:5000/api/auth/verify", {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!verifyResponse.ok) {
                    const errorText = await verifyResponse.text();
                    console.error("Token verification failed:", errorText);
                    throw new Error('Session expired. Please login again.');
                }

                const { userId } = await verifyResponse.json();
                console.log("User ID from verification:", userId);

                // Fetch user profile using verified userId
                const profileResponse = await fetch(`http://localhost:5000/api/auth/user/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!profileResponse.ok) {
                    const errorText = await profileResponse.text();
                    console.error("Profile Response:", errorText);
                    throw new Error('Failed to fetch profile data');
                }

                const profileData = await profileResponse.json();

                // Fetch tax calculations
                const calculationsResponse = await fetch(`http://localhost:5000/api/incomes/${userId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!calculationsResponse.ok) {
                    const errorText = await calculationsResponse.text();
                    console.error("Calculations Response:", errorText);
                    throw new Error('Failed to fetch tax calculations');
                }

                const calculationsData = await calculationsResponse.json();

                // Format dates and numbers for display
                const formattedCalculations = calculationsData.map(calc => ({
                    _id: calc._id,
                    date: new Date(calc.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    taxAmount: parseFloat(calc.taxCalculated || 0),
                    salary: parseFloat(calc.salary || 0),
                    otherIncome: parseFloat(calc.otherIncome || 0),
                    totalIncome: (parseFloat(calc.salary || 0) + parseFloat(calc.otherIncome || 0))
                }));

                const totalTaxPaid = calculationsData.reduce((sum, calc) => 
                    sum + parseFloat(calc.taxCalculated || 0), 0);

                setUserProfile({
                    name: profileData.name || "User",
                    email: profileData.email || "",
                    createdAt: new Date(profileData.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    totalTaxPaid: totalTaxPaid,
                    totalCalculations: calculationsData.length,
                    accountType: profileData.accountType || "Standard User"
                });

                setPreviousCalculations(formattedCalculations);
            } catch (err) {
                console.error("Error fetching data:", err);
                if (err.message === 'Session expired. Please login again.') {
                    localStorage.removeItem("token");
                    navigate("/login");
                } else {
                    setError(err.message || "Failed to load profile. Please try again.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [navigate]);

    const handleBack = () => {
        navigate("/tax-calculator");
    };

    const handleDownloadPDF = async (calculationId) => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:5000/api/tax/report/${calculationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to download PDF');
            }

            // Create blob from response
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            
            // Create temporary link and trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = `tax-report-${calculationId}.pdf`;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            alert(error.message);
        }
    };

    if (error) {
        return (
            <div className="page-container" style={{ 
                background: "linear-gradient(145deg, #f6f9fc 0%, #ffffff 100%)",
                minHeight: "100vh",
                padding: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                <div style={{
                    background: "white",
                    padding: "2rem",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    textAlign: "center",
                    maxWidth: "400px",
                    width: "100%"
                }}>
                    <span role="img" aria-label="error" style={{ fontSize: "3rem", marginBottom: "1rem", display: "block" }}>⚠️</span>
                    <h2 style={{ color: "#ef4444", marginBottom: "1rem" }}>Error Loading Profile</h2>
                    <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                            border: "none",
                            padding: "0.75rem 1.5rem",
                            borderRadius: "8px",
                            color: "white",
                            fontWeight: "500",
                            cursor: "pointer"
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ 
            background: "linear-gradient(145deg, #f6f9fc 0%, #ffffff 100%)",
            minHeight: "100vh",
            padding: "2rem"
        }}>
            <div style={{
                maxWidth: "1000px",
                margin: "0 auto",
                display: "grid",
                gridTemplateColumns: "300px 1fr",
                gap: "2rem"
            }}>
                {/* Profile Sidebar */}
                <div style={{
                    background: "white",
                    padding: "2rem",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
                    height: "fit-content"
                }}>
                    <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                        <div style={{
                            width: "120px",
                            height: "120px",
                            borderRadius: "50%",
                            background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1rem",
                            color: "white",
                            fontSize: "3rem",
                            fontWeight: "500"
                        }}>
                            {userProfile.name.charAt(0)}
                        </div>
                        <h2 style={{ 
                            fontSize: "1.5rem", 
                            color: "#1f2937",
                            margin: "0 0 0.5rem 0"
                        }}>{userProfile.name}</h2>
                        <p style={{ 
                            color: "#6b7280",
                            margin: 0
                        }}>{userProfile.email}</p>
                    </div>

                    <div style={{ borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
                        <div style={{ marginBottom: "1rem" }}>
                            <p style={{ 
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                margin: "0 0 0.25rem 0"
                            }}>Member Since</p>
                            <p style={{ 
                                color: "#1f2937",
                                margin: 0,
                                fontWeight: "500"
                            }}>{userProfile.createdAt}</p>
                        </div>
                        
                        <div style={{ marginBottom: "1rem" }}>
                            <p style={{ 
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                margin: "0 0 0.25rem 0"
                            }}>Total Tax Paid</p>
                            <p style={{ 
                                color: "#1f2937",
                                margin: 0,
                                fontWeight: "500"
                            }}>₹{userProfile.totalTaxPaid.toLocaleString('en-IN')}</p>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <p style={{ 
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                margin: "0 0 0.25rem 0"
                            }}>Account Type</p>
                            <p style={{ 
                                color: "#1f2937",
                                margin: 0,
                                fontWeight: "500"
                            }}>{userProfile.accountType}</p>
                        </div>

                        <div style={{ marginBottom: "1rem" }}>
                            <p style={{ 
                                color: "#6b7280",
                                fontSize: "0.875rem",
                                margin: "0 0 0.25rem 0"
                            }}>Total Calculations</p>
                            <p style={{ 
                                color: "#1f2937",
                                margin: 0,
                                fontWeight: "500"
                            }}>{userProfile.totalCalculations}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleBack}
                        style={{
                            width: "100%",
                            padding: "0.75rem",
                            marginTop: "1.5rem",
                            background: "transparent",
                            border: "2px solid #0072ff",
                            borderRadius: "8px",
                            color: "#0072ff",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.5rem"
                        }}
                        onMouseEnter={(e) => e.target.style.background = "rgba(0, 114, 255, 0.1)"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                        <span role="img" aria-label="back">⬅️</span>
                        Back to Calculator
                    </button>
                </div>

                {/* Previous Calculations */}
                <div style={{
                    background: "white",
                    padding: "2rem",
                    borderRadius: "16px",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)"
                }}>
                    <h2 style={{ 
                        fontSize: "1.5rem",
                        color: "#1f2937",
                        marginBottom: "2rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem"
                    }}>
                        <span role="img" aria-label="history">📊</span>
                        Tax Calculation History
                    </h2>

                    {isLoading ? (
                        <div style={{ textAlign: "center", padding: "2rem" }}>
                            <div className="loading-spinner"></div>
                        </div>
                    ) : previousCalculations.length === 0 ? (
                        <div style={{
                            textAlign: "center",
                            padding: "2rem",
                            color: "#6b7280"
                        }}>
                            <p>No Tax Calculations Yet</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gap: "1rem" }}>
                            {previousCalculations.map((calc) => (
                                <div
                                    key={calc._id}
                                    style={{
                                        padding: "1.5rem",
                                        borderRadius: "12px",
                                        background: "#f8fafc",
                                        border: "1px solid #e2e8f0"
                                    }}
                                >
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr auto auto",
                                        gap: "1rem",
                                        marginBottom: "1rem",
                                        alignItems: "center"
                                    }}>
                                        <div>
                                            <p style={{
                                                color: "#1f2937",
                                                fontWeight: "500",
                                                margin: "0 0 0.25rem 0"
                                            }}>
                                                Calculation On {calc.date}
                                            </p>
                                            <p style={{
                                                color: "#6b7280",
                                                fontSize: "0.875rem",
                                                margin: 0
                                            }}>
                                                Total Income: ₹{calc.totalIncome.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div style={{
                                            background: "linear-gradient(120deg, #00c6ff, #0072ff)",
                                            padding: "0.75rem 1rem",
                                            borderRadius: "8px",
                                            color: "white",
                                            fontWeight: "500"
                                        }}>
                                            Tax Amount: ₹{calc.taxAmount.toLocaleString('en-IN')}
                                        </div>
                                        <button
                                            onClick={() => handleDownloadPDF(calc._id)}
                                            style={{
                                                background: "transparent",
                                                border: "2px solid #0072ff",
                                                padding: "0.75rem",
                                                borderRadius: "8px",
                                                color: "#0072ff",
                                                fontWeight: "500",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "0.5rem",
                                                transition: "all 0.2s ease"
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = "rgba(0, 114, 255, 0.1)"}
                                            onMouseLeave={(e) => e.target.style.background = "transparent"}
                                        >
                                            <span role="img" aria-label="download">📄</span>
                                            Download PDF
                                        </button>
                                    </div>
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "1fr 1fr",
                                        gap: "1rem",
                                        fontSize: "0.875rem",
                                        color: "#6b7280"
                                    }}>
                                        <div>
                                            <p style={{ margin: "0 0 0.25rem 0" }}>Salary Income:</p>
                                            <p style={{ margin: 0, color: "#1f2937", fontWeight: "500" }}>
                                                ₹{calc.salary.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ margin: "0 0 0.25rem 0" }}>Other Income:</p>
                                            <p style={{ margin: 0, color: "#1f2937", fontWeight: "500" }}>
                                                ₹{calc.otherIncome.toLocaleString('en-IN')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile; 