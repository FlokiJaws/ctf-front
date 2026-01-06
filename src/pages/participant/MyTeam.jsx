import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Input } from "@/components/ui/input.jsx";
import { Users, Plus, ArrowLeft, Crown, Mail, LogOut, UserX, UserCog, AlertCircle, Bell } from "lucide-react";
import ConfirmDialog from "@/components/common/ConfirmDialog.jsx";

const MyTeam = () => {
    const navigate = useNavigate();
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [isChef, setIsChef] = useState(false);

    // États pour les dialogs
    const [showLeaveDialog, setShowLeaveDialog] = useState(false);
    const [showKickDialog, setShowKickDialog] = useState(false);
    const [showTransferDialog, setShowTransferDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [newChefEmail, setNewChefEmail] = useState('');

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

            // Chercher l'équipe de l'utilisateur
            let foundTeam = null;
            let foundIsChef = false;

            // Méthode 1 : Vérifier si l'utilisateur est chef
            const teamAsChef = allEquipes.find(equipe => equipe.chefEquipeEmail === email);

            if (teamAsChef) {
                foundTeam = teamAsChef;
                foundIsChef = true;
            } else {
                // Méthode 2 : Vérifier les détails de chaque équipe pour voir si l'utilisateur est membre
                for (const equipe of allEquipes) {
                    // Utiliser equipeId au lieu de id
                    const teamId = equipe.equipeId || equipe.id;

                    if (!teamId) {
                        console.warn('Équipe sans ID trouvée:', equipe);
                        continue;
                    }

                    try {
                        const detailsResponse = await axios.get(`http://localhost:8080/equipes/${teamId}`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });

                        const participants = detailsResponse.data.participants || [];
                        const isMember = participants.some(p => p.email === email);

                        if (isMember) {
                            foundTeam = detailsResponse.data;
                            foundIsChef = detailsResponse.data.chefEquipeEmail === email;
                            break;
                        }
                    } catch (detailErr) {
                        console.warn(`Erreur pour l'équipe ${teamId}:`, detailErr);
                    }
                }
            }

            if (foundTeam) {
                // TOUJOURS récupérer les détails complets pour avoir les participants
                const teamId = foundTeam.equipeId || foundTeam.id;

                if (!teamId) {
                    console.error('Équipe trouvée mais sans ID:', foundTeam);
                    setMyTeam(null);
                    setIsChef(false);
                    setError('Équipe invalide (pas d\'ID)');
                    return;
                }

                try {
                    const detailsResponse = await axios.get(`http://localhost:8080/equipes/${teamId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    console.log('Détails complets équipe:', detailsResponse.data); // DEBUG

                    // Normaliser les données pour avoir toujours les mêmes noms de champs
                    const teamData = {
                        ...detailsResponse.data,
                        id: detailsResponse.data.id || teamId,
                        nom: detailsResponse.data.nom || foundTeam.nomEquipe
                    };

                    setMyTeam(teamData);
                    setIsChef(foundIsChef);
                } catch (detailErr) {
                    console.error('Erreur récupération détails:', detailErr);
                    setError('Impossible de récupérer les détails de l\'équipe');
                    setMyTeam(null);
                    setIsChef(false);
                }
            } else {
                setMyTeam(null);
                setIsChef(false);
            }
        } catch (err) {
            console.error('Erreur récupération équipe:', err);
            setError(err.response?.data?.message || 'Erreur lors de la récupération de votre équipe');
            setMyTeam(null);
            setIsChef(false);
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveTeam = async () => {
        const token = localStorage.getItem('token');

        try {
            await axios.post(`http://localhost:8080/equipes/leave?equipeId=${myTeam.id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowLeaveDialog(false);
            navigate('/my-team');
            window.location.reload();
        } catch (err) {
            console.error('Erreur quitter équipe:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'abandon de l\'équipe');
            setShowLeaveDialog(false);
        }
    };

    const handleKickMember = async () => {
        const token = localStorage.getItem('token');

        try {
            await axios.post('http://localhost:8080/equipes/kick', {
                equipeId: myTeam.id,
                membreEmail: selectedMember.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowKickDialog(false);
            setSelectedMember(null);
            fetchMyTeam(token, userEmail);
        } catch (err) {
            console.error('Erreur expulsion membre:', err);
            setError(err.response?.data?.message || 'Erreur lors de l\'expulsion du membre');
            setShowKickDialog(false);
        }
    };

    const handleDesignateNewChef = async () => {
        const token = localStorage.getItem('token');

        if (!newChefEmail || !newChefEmail.trim()) {
            setError('Veuillez sélectionner un nouveau chef');
            return;
        }

        try {
            await axios.post('http://localhost:8080/equipes/designate_new_chef', {
                equipeId: myTeam.id,
                newChefEmail: newChefEmail
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setShowTransferDialog(false);
            setNewChefEmail('');
            fetchMyTeam(token, userEmail);
        } catch (err) {
            console.error('Erreur transfert chef:', err);
            setError(err.response?.data?.message || 'Erreur lors du transfert du rôle de chef');
            setShowTransferDialog(false);
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
                                ? 'Gérez votre équipe pour les compétitions CTF'
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
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start gap-3">
                        <AlertCircle className="flex-shrink-0 mt-0.5" size={20} />
                        <p>{error}</p>
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
                    // Affichage de l'équipe
                    <>
                        <Card className="border-2 border-primary/40 shadow-lg">
                            <CardHeader className="border-b border-border">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        {/* Logo de l'équipe */}
                                        <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                            {generateDefaultLogo(myTeam.nom)}
                                        </div>

                                        <div>
                                            <CardTitle className="text-3xl mb-2">{myTeam.nom}</CardTitle>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Crown className="w-4 h-4 text-yellow-500" />
                                                <span className="text-muted-foreground">
                                                    {isChef ? 'Vous êtes le chef d\'équipe' : 'Membre de l\'équipe'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {isChef && (
                                        <Button
                                            variant="outline"
                                            onClick={() => navigate('/team/requests')}
                                            className="flex items-center gap-2"
                                        >
                                            <Bell size={18} />
                                            Demandes
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="pt-6">
                                {/* Informations de l'équipe */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold mb-4">Informations</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                <p className="font-semibold text-lg">{myTeam.participants?.length || 1}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(myTeam.participants?.length || 1) === 1 ? 'Membre' : 'Membres'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Liste des membres */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-4">Membres de l'équipe</h3>
                                    <div className="space-y-3">
                                        {myTeam.participants && myTeam.participants.length > 0 ? (
                                            myTeam.participants.map((participant, index) => {
                                                const isTeamChef = participant.email === myTeam.chefEquipeEmail;
                                                const isCurrentUser = participant.email === userEmail;

                                                return (
                                                    <div
                                                        key={participant.email || index}
                                                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            {/* Avatar */}
                                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                                                                isTeamChef
                                                                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                                                                    : 'bg-gradient-to-br from-primary to-blue-500'
                                                            }`}>
                                                                {participant.pseudo?.charAt(0).toUpperCase() || 'U'}
                                                            </div>

                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold">{participant.pseudo || 'Utilisateur'}</p>
                                                                    {isTeamChef && (
                                                                        <Crown className="w-4 h-4 text-yellow-500" />
                                                                    )}
                                                                    {isCurrentUser && (
                                                                        <span className="text-xs text-primary">(Vous)</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Mail className="w-3 h-3" />
                                                                    <span>{participant.email}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Actions du chef */}
                                                        {isChef && !isCurrentUser && !isTeamChef && (
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setNewChefEmail(participant.email);
                                                                        setShowTransferDialog(true);
                                                                    }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <UserCog size={14} />
                                                                    Promouvoir
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        setSelectedMember(participant);
                                                                        setShowKickDialog(true);
                                                                    }}
                                                                    className="flex items-center gap-2"
                                                                >
                                                                    <UserX size={14} />
                                                                    Expulser
                                                                </Button>
                                                            </div>
                                                        )}

                                                        {isTeamChef && (
                                                            <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                                                Chef
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-muted-foreground">
                                                Aucun membre pour le moment
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="border-t border-border pt-6 flex justify-between">
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/all-teams')}
                                    className="flex items-center gap-2"
                                >
                                    <Users size={16} />
                                    Toutes les équipes
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={() => setShowLeaveDialog(true)}
                                    className="flex items-center gap-2"
                                >
                                    <LogOut size={16} />
                                    {isChef ? 'Quitter (et transférer)' : 'Quitter l\'équipe'}
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Info pour le chef */}
                        {isChef && (
                            <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
                                <CardContent className="pt-6">
                                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                                        <Crown className="w-5 h-5" />
                                        Vos privilèges de chef d'équipe
                                    </h3>
                                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                                        <li>Gérer les demandes d'adhésion à votre équipe</li>
                                        <li>Expulser des membres de l'équipe</li>
                                        <li>Promouvoir un membre au rang de chef</li>
                                        <li>Inscrire l'équipe à des CTFs</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}
            </div>

            {/* Dialog: Quitter l'équipe */}
            <ConfirmDialog
                show={showLeaveDialog}
                title="Quitter l'équipe"
                message={
                    isChef
                        ? "En tant que chef, vous devez d'abord désigner un nouveau chef avant de quitter l'équipe. Voulez-vous vraiment quitter ?"
                        : `Êtes-vous sûr de vouloir quitter l'équipe "${myTeam?.nom}" ?`
                }
                onConfirm={handleLeaveTeam}
                onCancel={() => setShowLeaveDialog(false)}
                confirmLabel="Quitter"
                confirmVariant="destructive"
            />

            {/* Dialog: Expulser un membre */}
            <ConfirmDialog
                show={showKickDialog}
                title="Expulser un membre"
                message={`Êtes-vous sûr de vouloir expulser ${selectedMember?.pseudo} de l'équipe ?`}
                onConfirm={handleKickMember}
                onCancel={() => {
                    setShowKickDialog(false);
                    setSelectedMember(null);
                }}
                confirmLabel="Expulser"
                confirmVariant="destructive"
            />

            {/* Dialog: Transférer le rôle de chef */}
            {showTransferDialog && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-full max-w-md mx-4">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserCog className="text-primary" />
                                Promouvoir au rang de chef
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-muted-foreground">
                                Vous allez transférer le rôle de chef d'équipe. Vous deviendrez un membre normal de l'équipe.
                            </p>
                            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                    <strong>Attention :</strong> Cette action est irréversible. Seul le nouveau chef pourra vous redonner ce rôle.
                                </p>
                            </div>
                            {newChefEmail && (
                                <div className="p-3 bg-secondary rounded-lg">
                                    <p className="text-sm">
                                        <span className="text-muted-foreground">Nouveau chef :</span>
                                        <br />
                                        <strong>{newChefEmail}</strong>
                                    </p>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowTransferDialog(false);
                                    setNewChefEmail('');
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                onClick={handleDesignateNewChef}
                                className="bg-primary"
                            >
                                Confirmer le transfert
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default MyTeam;