import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import CtfCard from "@/components/CtfCard.jsx";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

const STORAGE_KEY = "joinedCtfs";

function getJoinedIds() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
        return [];
    }
}

const Profile = () => {
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

        // Vérif JWT (même style que ton code)
        try {
            const decoded = jwtDecode(token);
            const now = Date.now() / 1000;
            if (decoded.exp && decoded.exp < now) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        const joinedIds = getJoinedIds().map(String);

        // On récupère la liste (comme Home.jsx) puis on filtre
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
                setError(err.response?.data?.message || "Impossible de charger le profil.");
                setLoading(false);
            });
    }, [navigate]);

    if (loading) return <div className="text-center p-10">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert size={48} className="text-destructive" />
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate("/")}>Retour</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <Card className="border-border bg-card shadow-xl">
                <CardHeader>
                    <CardTitle className="text-2xl">Mon profil</CardTitle>
                    <p className="text-muted-foreground">CTF rejoints</p>
                </CardHeader>

                <CardContent>
                    {ctfs.length === 0 ? (
                        <div className="text-muted-foreground">
                            Aucun CTF rejoint pour le moment.
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
        </div>
    );
};

export default Profile;
