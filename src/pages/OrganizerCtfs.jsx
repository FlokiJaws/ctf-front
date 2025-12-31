import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldAlert, Trophy, ArrowLeft, MapPin, Eye, Edit2, Trash2, X } from "lucide-react";

const OrganizerCtfs = () => {
    const navigate = useNavigate();
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [userEmail, setUserEmail] = useState("");

    // États pour la modification
    const [editingCtf, setEditingCtf] = useState(null);
    const [editForm, setEditForm] = useState({ titre: "", description: "", lieu: "" });

    // États pour la suppression
    const [deletingCtf, setDeletingCtf] = useState(null);
    const [deleteConfirmName, setDeleteConfirmName] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch (e) {
            console.error("Erreur JWT :", e);
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        // Vérifier que l'utilisateur est un organisateur
        const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
        if (role !== "ORGANISATEUR") {
            navigate("/profile");
            return;
        }

        setUserEmail(decoded.sub);
        const userPseudo = decoded.pseudo;

        console.log("=== DEBUT DEBUG ===");
        console.log("Email organisateur:", decoded.sub);
        console.log("Pseudo organisateur:", userPseudo);

        // Récupérer tous les CTFs (actifs, en attente, inactifs)
        const fetchAllCtfs = async () => {
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

                const allCtfs = [
                    ...(actifs.data || []),
                    ...(enAttente.data || []),
                    ...(inactifs.data || []),
                ];

                console.log("Nombre total de CTFs:", allCtfs.length);

                if (allCtfs.length > 0) {
                    console.log("Premier CTF:", allCtfs[0]);
                    console.log("Structure du premier CTF:");
                    console.log("  - id:", allCtfs[0].id);
                    console.log("  - titre:", allCtfs[0].titre);
                    console.log("  - organisateurPseudo:", allCtfs[0].organisateurPseudo);
                    console.log("  - statut:", allCtfs[0].statut);
                }

                // Filtrer par pseudo
                const myCtfs = allCtfs.filter((ctf) => {
                    const match = ctf.organisateurPseudo === userPseudo;
                    if (match) {
                        console.log("MATCH trouvé:", ctf.titre);
                    }
                    return match;
                });

                console.log("Nombre de CTFs filtrés:", myCtfs.length);
                console.log("=== FIN DEBUG ===");

                setCtfs(myCtfs);
                setLoading(false);
            } catch (err) {
                console.error("Erreur CTFs :", err);
                setError(err.response?.data?.message || "Impossible de charger les CTFs.");
                setLoading(false);
            }
        };

        fetchAllCtfs();
    }, [navigate]);

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
        setEditForm({
            titre: ctf.titre,
            description: ctf.description,
            lieu: ctf.lieu,
        });
    };

    const handleSaveEdit = async () => {
        const token = localStorage.getItem("token");
        try {
            await axios.patch(
                `http://localhost:8080/ctfs/${editingCtf.id}/modify`,
                editForm,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Mettre à jour la liste locale
            setCtfs(ctfs.map(c => c.id === editingCtf.id ? { ...c, ...editForm } : c));
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

            // Retirer de la liste
            setCtfs(ctfs.filter(c => c.id !== deletingCtf.id));
            setDeletingCtf(null);
            setDeleteConfirmName("");
            alert("CTF supprimé avec succès !");
        } catch (err) {
            console.error("Erreur suppression :", err);
            alert(err.response?.data?.message || "Erreur lors de la suppression");
        }
    };

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert size={48} className="text-destructive" />
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate("/")}>
                    Retour
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Trophy className="text-primary h-8 w-8" />
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                            Mes CTFs
                        </h1>
                    </div>
                    <p className="text-muted-foreground text-lg">
                        {ctfs.length} CTF{ctfs.length > 1 ? 's' : ''} créé{ctfs.length > 1 ? 's' : ''}
                    </p>
                </div>

                <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    className="flex items-center space-x-2"
                >
                    <ArrowLeft size={18} />
                    <span>Retour au profil</span>
                </Button>
            </div>

            {/* Liste de CTFs */}
            <div className="space-y-4">
                {ctfs.length > 0 ? (
                    ctfs.map(ctf => (
                        <Card key={ctf.id} className="border-2 border-primary/40 hover:border-primary/70 transition-all duration-300 hover:shadow-lg">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <CardTitle className="text-2xl mb-2">
                                            {ctf.titre}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {ctf.description}
                                        </p>
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
                            </CardContent>

                            <CardFooter className="border-t border-border pt-4 flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => handleEdit(ctf)}
                                    className="flex items-center gap-2"
                                >
                                    <Edit2 size={16} />
                                    Modifier
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => setDeletingCtf(ctf)}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Supprimer
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-lg">
                            Aucun CTF créé pour le moment.
                        </p>
                    </div>
                )}
            </div>

            {/* Popup Modification */}
            {editingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-lg">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Modifier le CTF</CardTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setEditingCtf(null)}
                            >
                                <X size={20} />
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium mb-2 block">Titre</label>
                                <Input
                                    value={editForm.titre}
                                    onChange={(e) => setEditForm({ ...editForm, titre: e.target.value })}
                                    placeholder="Titre du CTF"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Description</label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    placeholder="Description du CTF"
                                    className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background text-foreground resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-2 block">Lieu</label>
                                <Input
                                    value={editForm.lieu}
                                    onChange={(e) => setEditForm({ ...editForm, lieu: e.target.value })}
                                    placeholder="Lieu du CTF"
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingCtf(null)}>
                                Annuler
                            </Button>
                            <Button onClick={handleSaveEdit}>
                                Enregistrer
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {/* Popup Suppression */}
            {deletingCtf && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle className="text-red-600 dark:text-red-400">
                                Confirmer la suppression
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Cette action est irréversible. Pour confirmer, veuillez taper le nom exact du CTF :
                            </p>
                            <p className="font-bold text-center py-2 bg-secondary rounded">
                                {deletingCtf.titre}
                            </p>
                            <Input
                                value={deleteConfirmName}
                                onChange={(e) => setDeleteConfirmName(e.target.value)}
                                placeholder="Tapez le nom du CTF"
                            />
                        </CardContent>
                        <CardFooter className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setDeletingCtf(null);
                                    setDeleteConfirmName("");
                                }}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteConfirmName !== deletingCtf.titre}
                            >
                                Supprimer définitivement
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default OrganizerCtfs;