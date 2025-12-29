import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import CtfCard from "@/components/CtfCard.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, User, Mail, Shield, Trophy, Zap, Users, CheckCircle, Trash2, Edit2 } from "lucide-react";

const STORAGE_KEY = "joinedCtfs";

const Profile = () => {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        setUserInfo(decoded);

        // Si NON ADMINISTRATEUR ni ORGANISATEUR : récupérer les CTFs inscrits
        if (!decoded.groups?.includes("ADMINISTRATEUR") && !decoded.groups?.includes("ORGANISATEUR")) {
            const joinedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]").map(String);

            axios
                .get("http://localhost:8080/ctfs/list/actif", {
                    headers: { Authorization: `Bearer ${token}` },
                })
                .then((res) => {
                    const all = res.data || [];
                    const filtered = all.filter((c) => joinedIds.includes(String(c.id)));
                    setCtfs(filtered);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Erreur CTFs :", err);
                    setError(err.response?.data?.message || "Impossible de charger les CTFs.");
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [navigate]);

    if (loading) return <div className="text-center p-10 text-lg">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert size={48} className="text-destructive" />
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate("/")}>Retour</Button>
            </div>
        );
    }

    const isAdmin = userInfo?.groups?.includes("ADMINISTRATEUR");
    const isOrganisateur = userInfo?.groups?.includes("ORGANISATEUR");

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Infos Utilisateur - Tous les rôles */}
            {userInfo && (
                <Card className="border-border bg-gradient-to-r from-card to-primary/5 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-3xl">Mon Profil</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Pseudo */}
                            <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg border border-border">
                                <User className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Pseudo</p>
                                    <p className="text-lg font-semibold break-words">
                                        {userInfo.pseudo || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Email */}
                            <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg border border-border">
                                <Mail className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Email</p>
                                    <p className="text-lg font-semibold break-words">
                                        {userInfo.sub || "N/A"}
                                    </p>
                                </div>
                            </div>

                            {/* Rôle */}
                            <div className="flex items-center space-x-4 p-4 bg-secondary/30 rounded-lg border border-border">
                                <Shield className="text-primary w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Rôle</p>
                                    <p className="text-lg font-semibold break-words">
                                        {userInfo.groups?.join(", ") || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            onClick={() => navigate("/")}
                            className="w-full md:w-auto"
                        >
                            Retour à l'accueil
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* SECTION ADMINISTRATEUR - Liens vers pages admin */}
            {isAdmin && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Gestion Admin</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Gestion des Utilisateurs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/users")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Users className="w-12 h-12 text-primary" />
                                    <div>
                                        <h3 className="text-lg font-bold">Utilisateurs</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Gérer les rôles et bannir
                                        </p>
                                    </div>
                                    <Button className="w-full bg-primary hover:bg-primary/90 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Validation des CTFs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/ctf-validation")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                    <div>
                                        <h3 className="text-lg font-bold">Validation</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Valider les CTFs
                                        </p>
                                    </div>
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modification des CTFs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/ctf-edit")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Edit2 className="w-12 h-12 text-blue-500" />
                                    <div>
                                        <h3 className="text-lg font-bold">Modifier</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Éditer les CTFs
                                        </p>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Suppression des CTFs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/ctf-delete")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Trash2 className="w-12 h-12 text-red-500" />
                                    <div>
                                        <h3 className="text-lg font-bold">Supprimer</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Supprimer les CTFs
                                        </p>
                                    </div>
                                    <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* SECTION ORGANISATEUR - Liens vers pages organisateur */}
            {isOrganisateur && !isAdmin && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Gestion Organisateur</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Validation des CTFs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/ctf-validation")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <CheckCircle className="w-12 h-12 text-green-500" />
                                    <div>
                                        <h3 className="text-lg font-bold">Validation</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Valider les CTFs
                                        </p>
                                    </div>
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Modification des CTFs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/ctf-edit")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Edit2 className="w-12 h-12 text-blue-500" />
                                    <div>
                                        <h3 className="text-lg font-bold">Modifier</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Éditer les CTFs
                                        </p>
                                    </div>
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Suppression des CTFs */}
                        <Card className="border-border bg-card shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                              onClick={() => navigate("/admin/ctf-delete")}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4 text-center">
                                    <Trash2 className="w-12 h-12 text-red-500" />
                                    <div>
                                        <h3 className="text-lg font-bold">Supprimer</h3>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Supprimer les CTFs
                                        </p>
                                    </div>
                                    <Button className="w-full bg-red-600 hover:bg-red-700 text-sm">
                                        Accéder
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* SECTION PARTICIPANT - CTFs inscrits */}
            {!isAdmin && !isOrganisateur && (
                <Card className="border-border bg-card shadow-lg">
                    <CardHeader>
                        <div className="flex items-center space-x-2">
                            <Trophy className="text-primary h-5 w-5" />
                            <CardTitle className="text-2xl">
                                Mes CTFs ({ctfs.length})
                            </CardTitle>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {ctfs.length === 0 ? (
                            <div className="text-center py-12 space-y-4">
                                <Zap className="w-12 h-12 mx-auto opacity-50 text-muted-foreground" />
                                <p className="text-muted-foreground text-lg">
                                    Aucun CTF rejoint pour le moment.
                                </p>
                                <Button
                                    onClick={() => navigate("/all-ctfs")}
                                    className="bg-primary hover:bg-primary/90"
                                >
                                    Découvrir les CTFs
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {ctfs.map((ctf) => (
                                    <CtfCard key={ctf.id} ctf={ctf} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default Profile;