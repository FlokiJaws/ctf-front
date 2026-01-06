import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Card, CardContent } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Users, Plus, ArrowLeft, Crown, Mail } from "lucide-react";

const MyTeam = () => {
    const navigate = useNavigate();
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (role !== 'PARTICIPANT') {
                navigate('/profile');
                return;
            }

            setUserEmail(decoded.sub);
            fetchMyTeam(token, decoded.sub);
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
        }
    }, [navigate]);

    const fetchMyTeam = async (token, email) => {
        setLoading(true);
        setError('');

        try {
            const response = await axios.get('http://localhost:8080/equipes/all', {
                headers: { Authorization: `Bearer ${token}` }
            });

            const allEquipes = response.data || [];

            // Trouver l'équipe où l'utilisateur est le chef
            const userTeam = allEquipes.find(equipe =>
                equipe.chefEquipeEmail === email
            );

            setMyTeam(userTeam || null);
        } catch (err) {
            console.error('Erreur récupération équipes:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération de votre équipe');
        } finally {
            setLoading(false);
        }
    };

    const generateDefaultLogo = (name) => {
        if (!name) return 'EQ';
        const initials = name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);

        return initials || 'EQ';
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Users className="text-primary" />
                            Mon Équipe
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {myTeam
                                ? 'Votre équipe pour les compétitions CTF'
                                : 'Créez votre équipe pour participer aux CTFs en groupe'
                            }
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => navigate('/profile')} className="flex items-center space-x-2">
                        <ArrowLeft size={18} />
                        <span>Retour</span>
                    </Button>
                </div>

                {/* Message d'erreur */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Contenu */}
                {!myTeam ? (
                    // Pas d'équipe
                    <Card className="border-border shadow-lg">
                        <CardContent className="pt-12 pb-12 text-center space-y-6">
                            <div className="flex justify-center">
                                <div className="p-6 bg-secondary rounded-full">
                                    <Users size={64} className="text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold">Vous n'avez pas encore d'équipe</h2>
                                <p className="text-muted-foreground max-w-md mx-auto">
                                    Créez votre équipe pour participer aux CTFs en groupe et grimper dans le classement ensemble !
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={() => navigate('/team/create')}
                                    className="flex items-center gap-2"
                                    size="lg"
                                >
                                    <Plus size={20} />
                                    Créer une équipe
                                </Button>

                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate('/all-teams')}
                                >
                                    <Users size={20} className="mr-2" />
                                    Voir toutes les équipes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    // Affichage simple de l'équipe
                    <Card className="border-2 border-primary/40 shadow-lg">
                        <CardContent className="pt-8">
                            <div className="flex items-center gap-6 mb-6">
                                {/* Logo de l'équipe */}
                                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                    {generateDefaultLogo(myTeam.nom)}
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-3xl font-bold mb-2">{myTeam.nom}</h2>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Crown className="w-4 h-4 text-yellow-500" />
                                        <span className="text-muted-foreground">Vous êtes le chef d'équipe</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Chef d'équipe</p>
                                        <p className="font-semibold">{myTeam.chefEquipePseudo || 'N/A'}</p>
                                        <p className="text-sm text-muted-foreground">{myTeam.chefEquipeEmail}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-secondary/30 rounded-lg">
                                    <Users className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Membres</p>
                                        <p className="font-semibold text-lg">1</p>
                                        <p className="text-xs text-muted-foreground">Vous seul pour l'instant</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => navigate('/all-teams')}
                                >
                                    <Users size={16} className="mr-2" />
                                    Voir toutes les équipes
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info */}
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                    <CardContent className="pt-6">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                            Fonctionnalités à venir
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                            <li>Inviter d'autres participants</li>
                            <li>Gérer les membres</li>
                            <li>Participer aux CTFs en équipe</li>
                            <li>Upload de logo personnalisé</li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default MyTeam;