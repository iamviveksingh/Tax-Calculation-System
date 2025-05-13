import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
    const location = useLocation();
    const isHomePage = location.pathname === "/"; // Check if we are on the Home page

    return (
        <nav>
            <ul>
                {!isHomePage && ( // Hide Register/Login on Home page
                    <>
                        <li><Link to="/register">Register</Link></li>
                        <li><Link to="/login">Login</Link></li>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
