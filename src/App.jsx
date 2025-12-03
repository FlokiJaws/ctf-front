import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import CtfDetails from './pages/CtfDetail';

function App() {

    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
    };

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);

    return (
        <Router>
            <div className="min-h-screen bg-background font-sans text-foreground antialiased">
                <Navbar theme={theme} toggleTheme={toggleTheme} />
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />

                        <Route path="/ctf/:id" element={<CtfDetails />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}
export default App;