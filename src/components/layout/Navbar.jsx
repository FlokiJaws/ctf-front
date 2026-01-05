import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button.jsx";
import { ShieldCheck, LogOut, User, ChevronDown, Sun, Moon, Trophy, Flag } from "lucide-react";
import { jwtDecode } from "jwt-decode";

const Navbar = ({theme, toggleTheme}) => {
    const navigate = useNavigate();
    useLocation();

    const [userPseudo, setUserPseudo] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showLogoutPopup, setShowLogoutPopup] = useState(false);
    const dropdownRef = useRef(null);
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUserPseudo(null);
        setShowLogoutPopup(false);
        setShowDropdown(false);
        navigate('/login');
    };

    useEffect(() => {
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserPseudo(decoded.pseudo);
                const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
                setUserRole(role);

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
            setUserPseudo(null);
            setUserRole(null);
        }
    }, [token, navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    return (
        <>
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

                        {token && userPseudo ? (
                            <div className="relative" ref={dropdownRef}>
                                <div
                                    className="flex items-center space-x-2 px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <User size={18} />
                                    <span className="text-sm font-medium">{userPseudo}</span>
                                    <ChevronDown size={16} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </div>

                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                                        <div className="py-1">
                                            {/* Profil - pour tous les utilisateurs */}
                                            <Link to="/profile" onClick={() => setShowDropdown(false)}>
                                                <div className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2">
                                                    <User size={16} />
                                                    <span>Profil</span>
                                                </div>
                                            </Link>

                                            {/* CTFs - pour tous les utilisateurs */}
                                            <Link to="/all-ctfs" onClick={() => setShowDropdown(false)}>
                                                <div className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2">
                                                    <Flag size={16} />
                                                    <span>CTFs</span>
                                                </div>
                                            </Link>

                                            {/* Leaderboard - pour tous les utilisateurs */}
                                            <Link to="/leaderboard" onClick={() => setShowDropdown(false)}>
                                                <div className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2">
                                                    <Trophy size={16} />
                                                    <span>Classement</span>
                                                </div>
                                            </Link>

                                            {/* Dashboard Admin */}
                                            {userRole === 'ADMINISTRATEUR' && (
                                                <Link to="/admin/dashboard" onClick={() => setShowDropdown(false)}>
                                                    <div className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2">
                                                        <ShieldCheck size={16} />
                                                        <span>Dashboard</span>
                                                    </div>
                                                </Link>
                                            )}

                                            {/* Mes CTFs - Participant */}
                                            {userRole === 'PARTICIPANT' && (
                                                <Link to="/my-ctfs" onClick={() => setShowDropdown(false)}>
                                                    <div className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2">
                                                        <ShieldCheck size={16} />
                                                        <span>Mes CTFs</span>
                                                    </div>
                                                </Link>
                                            )}

                                            {/* Mes CTFs - Organisateur */}
                                            {userRole === 'ORGANISATEUR' && (
                                                <Link to="/organizer-ctfs" onClick={() => setShowDropdown(false)}>
                                                    <div className="px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-2">
                                                        <ShieldCheck size={16} />
                                                        <span>Mes CTFs</span>
                                                    </div>
                                                </Link>
                                            )}

                                            {/* Déconnexion */}
                                            <div
                                                className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer flex items-center space-x-2"
                                                onClick={() => {
                                                    setShowDropdown(false);
                                                    setShowLogoutPopup(true);
                                                }}
                                            >
                                                <LogOut size={16} />
                                                <span>Déconnexion</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
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

            {showLogoutPopup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Confirmation de déconnexion</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">
                            Êtes-vous sûr de vouloir vous déconnecter ?
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowLogoutPopup(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={handleLogout}
                            >
                                Déconnexion
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;