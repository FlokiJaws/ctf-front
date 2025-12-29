import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowLeft, Edit2, Ban } from "lucide-react";

const AdminUsers = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingEmail, setEditingEmail] = useState(null);
    const [selectedRole, setSelectedRole] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        let decoded;
        try {
            decoded = jwtDecode(token);
            if (!decoded.groups?.includes("ADMINISTRATEUR")) {
                navigate("/profile");
                return;
            }
        } catch (e) {
            navigate("/login");
            return;
        }

        // Récupérer tous les utilisateurs
        axios
            .get("http://localhost:8080/admin/users", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                setUsers(res.data || []);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erreur récupération utilisateurs :", err);
                setError(err.response?.data?.message || "Impossible de charger les utilisateurs.");
                setLoading(false);
            });
    }, [navigate]);

    const handleChangeRole = async (email, newRole) => {
        const token = localStorage.getItem("token");
        try {
            await axios.put(
                `http://localhost:8080/admin/users/${email}/role`,
                { role: newRole },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.map(u => u.email === email ? { ...u, role: newRole } : u));
            setEditingEmail(null);
            alert("Rôle modifié avec succès !");
        } catch (err) {
            console.error("Erreur modification rôle :", err);
            alert("Erreur lors de la modification du rôle");
        }
    };

    const handleBanUser = async (email) => {
        const reason = prompt("Raison du bannissement :");
        if (!reason) return;

        const token = localStorage.getItem("token");
        try {
            await axios.post(
                `http://localhost:8080/admin/ban/${email}`,
                { reason },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(users.filter(u => u.email !== email));
            alert("Utilisateur banni avec succès !");
        } catch (err) {
            console.error("Erreur bannissement :", err);
            alert("Erreur lors du bannissement de l'utilisateur");
        }
    };

    if (loading) return <div className="text-center p-10 text-lg">Chargement...</div>;

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <ShieldAlert size={48} className="text-destructive" />
                <p className="text-xl font-bold text-destructive">{error}</p>
                <Button variant="outline" onClick={() => navigate("/profile")}>Retour</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => navigate("/profile")}
                    className="flex items-center gap-2"
                >
                    <ArrowLeft size={18} />
                    Retour
                </Button>
                <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
            </div>

            {/* Tableau utilisateurs */}
            <Card className="border-border bg-card shadow-lg">
                <CardHeader>
                    <CardTitle>Utilisateurs ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {users.length === 0 ? (
                        <p className="text-muted-foreground">Aucun utilisateur trouvé.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-semibold">Email</th>
                                    <th className="text-left py-3 px-4 font-semibold">Pseudo</th>
                                    <th className="text-left py-3 px-4 font-semibold">Rôle</th>
                                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {users.map((user) => (
                                    <tr key={user.email} className="border-b border-border hover:bg-secondary/20">
                                        <td className="py-3 px-4">{user.email}</td>
                                        <td className="py-3 px-4">{user.pseudo}</td>
                                        <td className="py-3 px-4">
                                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                                                    {user.role}
                                                </span>
                                        </td>
                                        <td className="py-3 px-4 space-x-2">
                                            {editingEmail === user.email ? (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={selectedRole}
                                                        onChange={(e) => setSelectedRole(e.target.value)}
                                                        className="px-2 py-1 rounded border border-input bg-background text-foreground text-sm"
                                                    >
                                                        <option value="">Sélectionner</option>
                                                        <option value="PARTICIPANT">PARTICIPANT</option>
                                                        <option value="ORGANISATEUR">ORGANISATEUR</option>
                                                        <option value="ADMINISTRATEUR">ADMINISTRATEUR</option>
                                                    </select>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleChangeRole(user.email, selectedRole)}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        OK
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => setEditingEmail(null)}
                                                    >
                                                        Annuler
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setEditingEmail(user.email);
                                                            setSelectedRole(user.role);
                                                        }}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Edit2 size={14} />
                                                        Rôle
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleBanUser(user.email)}
                                                        className="flex items-center gap-1"
                                                    >
                                                        <Ban size={14} />
                                                        Bannir
                                                    </Button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminUsers;