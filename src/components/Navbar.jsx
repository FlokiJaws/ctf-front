import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShieldCheck, LogOut, User } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        navigate('/login');
    };

    return (
        <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link to="/" className="flex items-center space-x-2 font-bold text-xl text-slate-900">
                    <ShieldCheck className="h-7 w-7 text-indigo-600" />
                    <span>RootYou</span>
                </Link>
                <div className="flex items-center space-x-4">
                    {token ? (
                        <div className="flex items-center gap-4">
               <span className="text-sm text-slate-500 hidden md:inline-flex items-center">
                 <User className="w-4 h-4 mr-1" /> {userEmail}
               </span>
                            <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50">
                                <LogOut className="w-4 h-4 mr-2" /> Déconnexion
                            </Button>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <Link to="/login"><Button variant="ghost" size="sm">Connexion</Button></Link>
                            <Link to="/register"><Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Inscription</Button></Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};
export default Navbar;