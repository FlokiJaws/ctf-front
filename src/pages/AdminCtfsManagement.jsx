import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Eye, Edit2, Trash2, CheckCircle, X, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 10;

const AdminCtfsManagement = () => {
    const navigate = useNavigate();
    const [allCtfs, setAllCtfs] = useState([]);
    const [filteredCtfs, setFilteredCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatut, setFilterStatut] = useState("ALL");

    // États pour la modification
    const [editingCtf, setEditingCtf] = useState(null);
    const [editForm, setEditForm] = useState({ titre: "", description: "", lieu: "" });

    // États pour la suppression
    const [deletingCtf, setDeletingCtf] = useState(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");

    // États pour la validation
    const [validatingCtf, setValidatingCtf] = useState(null);

    useEffect(() => {
        fetchAllCtfs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [allCtfs, searchTerm, filterStatut]);

    const fetchAllCtfs = async () => {
        const token = localStorage.getItem("token");
        try {
            const [actifs, enAttente, inactifs] = await Promise.all([
                axios.get("http://localhost:8080/ctfs/list/actif", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:8080/ctfs/list/en_attente", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get("http://localhost:8080/ctfs/list/inactif", {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            const all = [
                ...(actifs.data || []),
                ...(enAttente.data || []),
                ...(inactifs.data || []),
            ];

            setAllCtfs(all);
            setLoading(false);
        } catch (err) {
            console.error("Erreur CTFs :", err);
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...allCtfs];

        // Filtre par statut
        if (filterStatut !== "ALL") {
            filtered = filtered.filter(ctf => ctf.statut === filterStatut);
        }

        // Filtre par recherche
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(ctf =>
                ctf.titre.toLowerCase().includes(search) ||
                ctf.description.toLowerCase().includes(search) ||
                ctf.lieu.toLowerCase().includes(search)
            );
        }

        setFilteredCtfs(filtered);
        setCurrentPage(1);
    };

    const getStatutBadge = (statut) => {
        switch (statut) {
            case "ACTIF":
                return <span className="text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full">Actif</span>;
            case "EN_ATTENTE":
                return <span className="text-xs font-medium bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 px-2.5 py-0.5 rounded-full">En attente</span>;
            case "INACTIF":
                return <span className="text-xs font-medium bg-red-500/20 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded-full">Inactif</span>;
            default:
                return null;
        }
    };

    const handleEdit = (ctf) => {
        setEditingCtf(ctf);
        setEditForm({ titre: ctf.titre, description: ctf.description, lieu: ctf.lieu });
    };

    const handleSaveEdit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.patch(
                `http://localhost:8080/ctfs/${editingCtf.id}/modify`,
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Rafraîchir la liste
            fetchAllCtfs();
            setEditingCtf(null);
            alert("CTF modifié avec succès !");
        } catch (err) {
            console.error("Erreur modification :", err);
            alert(err.response?.data?.message || "Erreur lors de la modification");
        }
    };

    const handleDelete = async () => {
        if (deleteConfirmName !== deletingCtf.titre) {
            alert("Le nom du CTF ne correspond pas !");
            return;
        }

        const token = localStorage.getItem("token");
        try {
            await axios.patch(
                `http://localhost:8080/ctfs/${deletingCtf.id}/disable`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchAllCtfs();
            setDeletingCtf(null);
            setDeleteConfirmName("");
            alert("CTF supprimé avec succès !");
        } catch (err) {
            console.error("Erreur suppression :", err);
            alert(err.response?.data?.message || "Erreur lors de la suppression");
        }
    };

    const handleValidate = async (approve) => {
        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `http://localhost:8080/ctfs/${validatingCtf.id}/validation`,
                { isValid: approve },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            fetchAllCtfs();
            setValidatingCtf(null);
            alert(approve ? "CTF validé avec succès !" : "CTF refusé");
        } catch (err) {
            console.error("Erreur validation :", err);
            alert(err.response?.data?.message || "Erreur lors de la validation");
        }
    };

    const totalPages = Math.ceil(filteredCtfs.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCtfs = filteredCtfs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

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
            {/* Header et filtres */}
            <div className="space-y-4">
                <h1 className="text-3xl font-bold">Gestion des CTFs</h1>
                <p className="text-muted-foreground">{filteredCtfs.length} CTF{filteredCtfs.length > 1 ? 's' : ''}</p>

                <div className="flex gap-4 flex-wrap">
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-xs"
                    />

                    <select
                        value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                        className="px-3 py-2 rounded-md border border-input bg-background text-foreground"
                    >
                        <option value="ALL">Tous les statuts</option>
                        <option value="ACTIF">Actif</option>
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="INACTIF">Inactif</option>
                    </select>
                </div>
            </div>

            {/* Liste des CTFs */}
            <div className="space-y-4">
                {paginatedCtfs.length > 0 ? (
                    paginatedCtfs.map(ctf => (
                        <Card key={ctf.id} className="border-2 border-primary/40">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl mb-2">{ctf.titre}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{ctf.description}</p>
                                    </div>
                                    {getStatutBadge(ctf.statut)}
                                </div>
                            </CardHeader>

                            <CardContent className="flex justify-between items-center">
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} />
                                        <span>{ctf.lieu}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye size={16} />
                                        <span>{ctf.nbVues} vues</span>
                                    </div>
                                </div>
                                {ctf.organisateurPseudo && (
                                    <p className="text-xs text-muted-foreground">
                                        Par <span className="font-semibold">{ctf.organisateurPseudo}</span>
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter className="border-t pt-4 flex justify-end gap-2">
                                {ctf.statut === "EN_ATTENTE" && (
                                    <Button
                                        variant="default"
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => setValidatingCtf(ctf)}
                                    >
                                        <CheckCircle size={16} className="mr-2" />
                                        Valider
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => handleEdit(ctf)}>
                                    <Edit2 size={16} className="mr-2" />
                                    Modifier
                                </Button>
                                <Button variant="destructive" onClick={() => setDeletingCtf(ctf)}>
                                    <Trash2 size={16} className="mr-2" />
                                    Supprimer
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        Aucun CTF trouvé
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

            {/* Popup Modification */}
            {editingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Modifier le CTF</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setEditingCtf(null)}>
                                <X size={20} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Titre</label>
                                <Input
                                    value={editForm.titre}
                                    onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Lieu</label>
                                <Input
                                    value={editForm.lieu}
                                    onChange={(e) => setEditForm({ ...editForm, lieu: e.target.value })}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingCtf(null)}>Annuler</Button>
                            <Button onClick={handleSaveEdit}>Enregistrer</Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Popup Suppression */}
            {deletingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600">Confirmer la suppression</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Pour confirmer, tapez le nom du CTF :
                            </p>
                            <p className="font-bold text-center py-2 bg-secondary rounded">{deletingCtf.titre}</p>
                            <Input
                                value={deleteConfirmName}
                                onChange={(e) => setDeleteConfirmName(e.target.value)}
                                placeholder="Nom du CTF"
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => { setDeletingCtf(null); setDeleteConfirmName(""); }}>
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteConfirmName !== deletingCtf.titre}
                            >
                                Supprimer
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Popup Validation */}
            {validatingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Valider le CTF</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm mb-4">
                                <span className="font-bold">{validatingCtf.titre}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Voulez-vous approuver ou refuser ce CTF ?
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setValidatingCtf(null)}>Annuler</Button>
                            <Button variant="destructive" onClick={() => handleValidate(false)}>Refuser</Button>
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleValidate(true)}>
                                Approuver
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default AdminCtfsManagement;