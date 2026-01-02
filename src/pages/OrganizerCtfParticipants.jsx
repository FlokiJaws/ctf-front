import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Search } from "lucide-react";

const OrganizerCtfParticipants = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ctf, setCtf] = useState(null);
    const [participations, setParticipations] = useState([]);
    const [filteredParticipations, setFilteredParticipations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
            if (role !== 'ORGANISATEUR') {
                navigate('/profile');
                return;
            }
        } catch (e) {
            console.error('Erreur JWT:', e);
            navigate('/login');
            return;
        }

        fetchData();
    }, [id, navigate]);

    useEffect(() => {
        applyFilters();
    }, [participations, searchTerm, filterStatus]);

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        setLoading(true);

        try {
            // Récupérer les infos du CTF
            const ctfResponse = await axios.get(`http://localhost:8080/ctfs/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCtf(ctfResponse.data);

            // Récupérer les participations
            const participationsResponse = await axios.get(
                `http://localhost:8080/ctfs/${id}/participations?filter=ALL`,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const allParticipations = participationsResponse.data || [];

            // Garder uniquement la participation la plus récente par participant
            const participantsMap = new Map();
            allParticipations.forEach(p => {
                const key = p.participantEmail || p.participantPseudo;
                const existing = participantsMap.get(key);

                // Si pas de participation existante OU si celle-ci est plus récente
                if (!existing || new Date(p.joinedAt) > new Date(existing.joinedAt)) {
                    participantsMap.set(key, p);
                }
            });

            // Convertir la Map en tableau
            const uniqueParticipations = Array.from(participantsMap.values());
            setParticipations(uniqueParticipations);
        } catch (err) {
            console.error('Erreur:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...participations];

        // Filtre par statut
        if (filterStatus === 'ACTIVE') {
            // Actif = pas quitté ET pas complété
            filtered = filtered.filter(p => p.leftAt === null && p.completedAt === null);
        } else if (filterStatus === 'LEFT') {
            // Quitté = a une date de départ
            filtered = filtered.filter(p => p.leftAt !== null);
        } else if (filterStatus === 'COMPLETED') {
            // Complété = a une date de complétion
            filtered = filtered.filter(p => p.completedAt !== null);
        }

        // Filtre par recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.participantPseudo?.toLowerCase().includes(search) ||
                p.participantEmail?.toLowerCase().includes(search)
            );
        }

        setFilteredParticipations(filtered);
    };

    const getStats = () => {
        // Actif = ni quitté ni complété
        const actifs = participations.filter(p => p.leftAt === null && p.completedAt === null).length;

        // Quitté = a une date de départ
        const quittes = participations.filter(p => p.leftAt !== null).length;

        // Complété = a une date de complétion
        const completes = participations.filter(p => p.completedAt !== null).length;

        return { actifs, quittes, completes, total: participations.length };
    };

    const getStatusBadge = (participation) => {
        if (participation.completedAt !== null) {
            return (
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-500/20 text-green-600 dark:text-green-400">
                    <CheckCircle size={14} />
                    Complété
                </span>
            );
        }
        if (participation.leftAt !== null) {
            return (
                <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                    <XCircle size={14} />
                    Quitté
                </span>
            );
        }
        return (
            <span className="flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <Clock size={14} />
                Actif
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="text-center p-10 text-lg">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate('/organizer-ctfs')}>Retour</Button>
            </div>
        );
    }

    const stats = getStats();

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/organizer-ctfs')}
                        className="mb-2"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Retour à mes CTFs
                    </Button>
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Users className="text-primary" />
                        Participants
                    </h1>
                    {ctf && (
                        <p className="text-muted-foreground">
                            CTF : {ctf.titre}
                        </p>
                    )}
                </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-border">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-primary">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.actifs}</p>
                            <p className="text-sm text-muted-foreground">Actifs</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completes}</p>
                            <p className="text-sm text-muted-foreground">Complétés</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.quittes}</p>
                            <p className="text-sm text-muted-foreground">Quittés</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtres */}
            <div className="flex gap-4 flex-wrap items-center justify-between">
                <div className="flex gap-4 flex-wrap items-center">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Rechercher un participant..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 max-w-xs"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant={filterStatus === 'ALL' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('ALL')}
                            size="sm"
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filterStatus === 'ACTIVE' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('ACTIVE')}
                            size="sm"
                            className={filterStatus === 'ACTIVE' ? '' : 'border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/20'}
                        >
                            Actifs
                        </Button>
                        <Button
                            variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('COMPLETED')}
                            size="sm"
                            className={filterStatus === 'COMPLETED' ? '' : 'border-green-300 text-green-600 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/20'}
                        >
                            Complétés
                        </Button>
                        <Button
                            variant={filterStatus === 'LEFT' ? 'default' : 'outline'}
                            onClick={() => setFilterStatus('LEFT')}
                            size="sm"
                            className={filterStatus === 'LEFT' ? '' : 'border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20'}
                        >
                            Quittés
                        </Button>
                    </div>
                </div>
            </div>

            {/* Liste des participants */}
            <Card className="border-border">
                <CardHeader>
                    <CardTitle>
                        {filteredParticipations.length} participant{filteredParticipations.length > 1 ? 's' : ''}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredParticipations.length > 0 ? (
                        <div className="space-y-3">
                            {filteredParticipations.map((participation, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex-1">
                                        <p className="font-semibold">
                                            {participation.participantPseudo || 'Inconnu'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {participation.participantEmail || '-'}
                                        </p>
                                    </div>

                                    <div className="text-right space-y-1 mr-4">
                                        <p className="text-sm text-muted-foreground">
                                            Inscrit le {formatDate(participation.joinedAt)}
                                        </p>
                                        {participation.leftAt && (
                                            <p className="text-sm text-muted-foreground">
                                                Quitté le {formatDate(participation.leftAt)}
                                            </p>
                                        )}
                                        {participation.completedAt && (
                                            <p className="text-sm text-muted-foreground">
                                                Complété le {formatDate(participation.completedAt)}
                                            </p>
                                        )}
                                    </div>

                                    {getStatusBadge(participation)}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Users size={48} className="mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Aucun participant trouvé</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrganizerCtfParticipants;