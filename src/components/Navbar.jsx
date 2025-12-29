import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, User, Sun, Moon } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Navbar = ({theme, toggleTheme}) => {
    const navigate = useNavigate();
    useLocation();

    const [userEmail, setUserEmail] = useState(null);
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserEmail(null);
        navigate('/login');
    };

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserEmail(decoded.sub);

                const currentTime = Date.now() / 1000;
                if (decoded.exp && decoded.exp < currentTime) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (error) {
                console.error('Erreur JWT:', error);
                localStorage.removeItem('token');
                navigate('/login');
            }
        } else {
            setUserEmail(null);
        }
        // TODO : enlevé le com
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    return (
        <nav className="bg-white dark:bg-gray-800 shadow-md">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-blue-600 dark:text-blue-400">
                    <ShieldCheck size={28} />
                    <span>RootYou</span>
                </Link>

                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </Button>

                    {token && userEmail ? (
                        <>
                            <div className="flex items-center space-x-2 text-sm">
                                <User size={18} />
                                <span>{userEmail}</span>
                            </div>
                            <Button variant="outline" onClick={handleLogout}>
                                <LogOut size={18} className="mr-2" />
                                Déconnexion
                            </Button>
                            <Link to="/profile">
                                <Button variant="outline">Profil</Button>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="outline">Connexion</Button>
                            </Link>
                            <Link to="/register">
                                <Button>Inscription</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
