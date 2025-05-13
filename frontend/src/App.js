import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import TaxCalculator from "./pages/TaxCalculator";
import PrivateRoute from "./components/PrivateRoute";
import PageTransition from "./components/PageTransition";
import Profile from "./pages/Profile";

function AnimatedRoutes() {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                    <PageTransition>
                        <Home />
                    </PageTransition>
                } />
                <Route path="/login" element={
                    <PageTransition>
                        <Login />
                    </PageTransition>
                } />
                <Route path="/register" element={
                    <PageTransition>
                        <Register />
                    </PageTransition>
                } />
                <Route path="/tax-calculator" element={
                    <PageTransition>
                        <PrivateRoute>
                            <TaxCalculator />
                        </PrivateRoute>
                    </PageTransition>
                } />
                <Route path="/profile" element={
                    <PageTransition>
                        <PrivateRoute>
                            <Profile />
                        </PrivateRoute>
                    </PageTransition>
                } />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <Router>
            <AnimatedRoutes />
        </Router>
    );
}

export default App;
