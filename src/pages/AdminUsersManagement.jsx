import React, { useEffect, useState } from "react";
import axios from "axios";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, ChevronLeft, ChevronRight, User, Mail, Shield } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const AdminUsersManagement = () => {
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState("ALL"); // Nouveau filtre de rôle

    // États pour le bannissement
    const [banningUser, setBanningUser] = useState(null);
    const [banReason, setBanReason] = useState("");

    useEffect(() => {
        fetchAllUsers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allUsers, searchTerm, filterRole]);

    const fetchAllUsers = async () => {
        const token = localStorage.getItem("token");
        try {
            const response = await axios.get("http://localhost:8080/users/getall/admin", {
                headers: { Authorization: `Bearer ${token}` },
            });

            setAllUsers(response.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Erreur users :", err);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allUsers];

        // Filtre par statut banni
        if (filterRole === "BANNED") {
            // Afficher uniquement les bannis
            filtered = filtered.filter(user => user.banned === true);
        } else {
            // Exclure les bannis de la liste normale
            filtered = filtered.filter(user => user.banned !== true);

            // Filtre par rôle
            if (filterRole !== "ALL") {
                filtered = filtered.filter(user => user.role === filterRole);
            }
        }

        // Filtre par recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(user =>
                user.pseudo.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                user.role.toLowerCase().includes(search)
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleBan = async () => {
        if (!banReason.trim()) {
            alert("Veuillez saisir une raison pour le bannissement");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.post(
                "http://localhost:8080/users/ban",
                {
                    userEmail: banningUser.email,
                    banReason: banReason
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Retirer l'utilisateur de la liste
            setAllUsers(allUsers.filter(u => u.email !== banningUser.email));
            setBanningUser(null);
            setBanReason("");
            alert("Utilisateur banni avec succès !");
        } catch (err) {
            console.error("Erreur bannissement :", err);
            alert(err.response?.data?.message || "Erreur lors du bannissement");
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case "ADMINISTRATEUR":
                return <span className="text-xs font-medium bg-purple-500/20 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full">Admin</span>;
            case "ORGANISATEUR":
                return <span className="text-xs font-medium bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2.5 py-0.5 rounded-full">Organisateur</span>;
            case "PARTICIPANT":
                return <span className="text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full">Participant</span>;
            default:
                return null;
        }
    };

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedUsers = filteredUsers.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Calculer les numéros de pages à afficher
    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible + 2) {
            // Afficher toutes les pages si peu de pages
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Logique pour afficher 5 pages + ... + dernière
            if (currentPage <= 3) {
                // Début : 1 2 3 4 5 ... dernière
                for (let i = 1; i <= maxVisible; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                // Fin : 1 ... avant-dernière-4 avant-dernière-3 avant-dernière-2 avant-dernière-1 dernière
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Milieu : 1 ... currentPage-2 currentPage-1 currentPage currentPage+1 currentPage+2 ... dernière
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header et recherche */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                <p className="text-muted-foreground">{filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}</p>

                <div className="flex gap-3 flex-wrap items-center">
                    <Input
                        placeholder="Rechercher par pseudo, email ou rôle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-md"
                    />

                    {/* Boutons de filtre par rôle */}
                    <div className="flex gap-2">
                        <Button
                            variant={filterRole === "ALL" ? "default" : "outline"}
                            onClick={() => setFilterRole("ALL")}
                            size="sm"
                        >
                            Tous
                        </Button>
                        <Button
                            variant={filterRole === "ADMINISTRATEUR" ? "default" : "outline"}
                            onClick={() => setFilterRole("ADMINISTRATEUR")}
                            size="sm"
                        >
                            Admin
                        </Button>
                        <Button
                            variant={filterRole === "ORGANISATEUR" ? "default" : "outline"}
                            onClick={() => setFilterRole("ORGANISATEUR")}
                            size="sm"
                        >
                            Organisateur
                        </Button>
                        <Button
                            variant={filterRole === "PARTICIPANT" ? "default" : "outline"}
                            onClick={() => setFilterRole("PARTICIPANT")}
                            size="sm"
                        >
                            Participant
                        </Button>
                        <Button
                            variant={filterRole === "BANNED" ? "destructive" : "outline"}
                            onClick={() => setFilterRole("BANNED")}
                            size="sm"
                            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            Bannis
                        </Button>
                    </div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="space-y-3">
                {paginatedUsers.length > 0 ? (
                    paginatedUsers.map(user => (
                        <Card key={user.email} className="border-2 border-border hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Infos utilisateur */}
                                    <div className="flex items-center gap-6 flex-1">
                                        <div className="flex items-center gap-3 min-w-[200px]">
                                            <User size={20} className="text-primary" />
                                            <div>
                                                <p className="font-semibold">{user.pseudo}</p>
                                                <p className="text-xs text-muted-foreground">Pseudo</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 min-w-[250px]">
                                            <Mail size={20} className="text-primary" />
                                            <div>
                                                <p className="font-medium text-sm">{user.email}</p>
                                                <p className="text-xs text-muted-foreground">Email</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Shield size={20} className="text-primary" />
                                            <div>
                                                <div className="flex gap-2 items-center">
                                                    {getRoleBadge(user.role)}
                                                    {user.banned && (
                                                        <span className="text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full">
                                                            BANNI
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">Rôle</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton bannir */}
                                    {!user.banned ? (
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => setBanningUser(user)}
                                            className="flex items-center gap-2"
                                        >
                                            <Ban size={16} />
                                            Bannir
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            className="flex items-center gap-2 opacity-50"
                                        >
                                            <Ban size={16} />
                                            Déjà banni
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucun utilisateur trouvé
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        size="sm"
                    >
                        <ChevronLeft size={16} />
                    </Button>

                    {getPageNumbers().map((pageNum, idx) => (
                        pageNum === '...' ? (
                            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                ...
                            </span>
                        ) : (
                            <Button
                                key={pageNum}
                                variant={currentPage === pageNum ? "default" : "outline"}
                                onClick={() => handlePageChange(pageNum)}
                                size="sm"
                                className="min-w-[40px]"
                            >
                                {pageNum}
                            </Button>
                        )
                    ))}

                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        size="sm"
                    >
                        <ChevronRight size={16} />
                    </Button>
                </div>
            )}

            {/* Popup Bannissement */}
            {banningUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardContent className="pt-6 space-y-4">
                            <h3 className="text-lg font-bold text-red-600">Bannir l'utilisateur</h3>

                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">Utilisateur :</p>
                                <div className="p-3 bg-secondary rounded">
                                    <p className="font-semibold">{banningUser.pseudo}</p>
                                    <p className="text-sm text-muted-foreground">{banningUser.email}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Raison du bannissement *</label>
                                <textarea
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Saisissez la raison..."
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setBanningUser(null);
                                        setBanReason("");
                                    }}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleBan}
                                    disabled={!banReason.trim()}
                                >
                                    Bannir définitivement
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminUsersManagement;