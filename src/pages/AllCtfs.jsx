// src/pages/AllCtfs.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const AllCtfs = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get('http://localhost:8080/ctfs/list/actif', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setCtfs(res.data || []))
            .catch(err => {
                console.error("Erreur", err);
                setCtfs([]);
            })
            .finally(() => setLoading(false));
    }, [filter, token, navigate]);

    if (loading) {
        return <div className="text-center p-10 text-lg">Chargement des CTFs...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    Tous les CTFs
                </h1>
                <p className="text-muted-foreground text-lg">
                    {ctfs.length} compétition{ctfs.length > 1 ? 's' : ''} disponible{ctfs.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Grille de CTFs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ctfs.length > 0 ? (
                    ctfs.map(ctf => (
                        <Card key={ctf.id} className="border-2 border-primary/40 hover:border-primary/70 transition-all duration-300 hover:shadow-lg flex flex-col">
                            <CardHeader>
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <CardTitle className="text-xl line-clamp-2">
                                            {ctf.titre}
                                        </CardTitle>
                                    </div>
                                    <span className="text-xs font-medium bg-primary/20 text-primary px-2.5 py-0.5 rounded-full flex-shrink-0">
                                        Ouvert
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-4">
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {ctf.description}
                                </p>

                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <MapPin size={16} className="flex-shrink-0" />
                                        <span>{ctf.lieu}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Eye size={16} className="flex-shrink-0" />
                                        <span>{ctf.nbVues} vues</span>
                                    </div>
                                </div>

                                {ctf.organisateur && (
                                    <div className="pt-2 border-t border-border">
                                        <p className="text-xs text-muted-foreground">
                                            Organisé par <span className="font-semibold text-foreground">{ctf.organisateur}</span>
                                        </p>
                                    </div>
                                )}
                            </CardContent>

                            <CardFooter className="border-t border-border pt-4">
                                <Button
                                    className="w-full bg-primary hover:bg-primary/90"
                                    onClick={() => navigate(`/ctf/${ctf.id}`)}
                                >
                                    Voir les détails
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-12">
                        <p className="text-lg text-muted-foreground">
                            Aucun CTF disponible pour le moment
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AllCtfs;