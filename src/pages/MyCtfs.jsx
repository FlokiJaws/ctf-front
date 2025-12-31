import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, Trophy, Zap, ArrowLeft, MapPin, Eye } from "lucide-react";

const STORAGE_KEY = "joinedCtfs";

const MyCtfs = () => {
    const navigate = useNavigate();
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

        // Vérifier que l'utilisateur est un participant
        const role = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
        if (role !== "PARTICIPANT") {
            navigate("/profile");
            return;
        }

        // Récupérer les CTFs rejoints
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
    }, [navigate]);

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
                        {ctfs.length} compétition{ctfs.length > 1 ? 's' : ''} rejoint{ctfs.length > 1 ? 'es' : 'e'}
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
                                    <span className="text-xs font-medium bg-green-500/20 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full flex-shrink-0">
                                        Inscrit
                                    </span>
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

                                {ctf.organisateur && (
                                    <p className="text-xs text-muted-foreground">
                                        Organisé par <span className="font-semibold text-foreground">{ctf.organisateur}</span>
                                    </p>
                                )}
                            </CardContent>

                            <CardFooter className="border-t border-border pt-4">
                                <Button
                                    className="ml-auto bg-primary hover:bg-primary/90"
                                    onClick={() => navigate(`/ctf/${ctf.id}`)}
                                >
                                    Voir les détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default MyCtfs;