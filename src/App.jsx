import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import AllCtfs from './pages/AllCtfs';
import Navbar from './components/Navbar';
import CtfDetails from './pages/CtfDetail';
import Profile from './pages/Profile';
import MyCtfs from './pages/MyCtfs';
import OrganizerCtfs from './pages/OrganizerCtfs';
import OrganizerCtfParticipants from './pages/OrganizerCtfParticipants';
import CreateCtf from './pages/CreateCtf';
import AdminDashboard from './pages/AdminDashboard';
import AdminCtfValidation from "@/pages/AdminCtfValidation.jsx";
import AdminCtfDelete from "@/pages/AdminCtfDelete.jsx";
import AdminCtfEdit from "@/pages/AdminCtfEdit.jsx";
import Leaderboard from './pages/Leaderboard';

function App() {
    const [theme, setTheme] = useState('dark');
    const toggleTheme = () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));

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
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/my-ctfs" element={<MyCtfs />} />
                        <Route path="/organizer-ctfs" element={<OrganizerCtfs />} />
                        <Route path="/organizer-ctfs/create" element={<CreateCtf />} />
                        <Route path="/organizer-ctfs/:id/participants" element={<OrganizerCtfParticipants />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/ctf/:id" element={<CtfDetails />} />
                        <Route path="/all-ctfs" element={<AllCtfs />} />
                        <Route path="/leaderboard" element={<Leaderboard />} />
                        <Route path="/admin/ctf-validation" element={<AdminCtfValidation />} />
                        <Route path="/admin/ctf-delete" element={<AdminCtfDelete />} />
                        <Route path="/admin/ctf-edit" element={<AdminCtfEdit />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;