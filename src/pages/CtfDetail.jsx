import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Eye, Calendar, ShieldAlert } from "lucide-react";

const CtfDetails = () => {
    const navigate = useNavigate();
    const {id} = useParams();

    const [ctf, setctf] = useState(null);
    const [loading, setloading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("token");

        //si token non valide on va sur la page de log
        if (!token) {
            navigate("/login");
            return;
        }

        try{
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch (e){
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        axios.get(`http://127.0.0.1:4010/ctfs/${id}`,{
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(res => {
            setctf(res.data);
            setloading(false);
        })
        .catch(err => {
            console.log(err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else if (err.response && err.response.status === 404) {
                // Fallback si le backend n'envoie pas de JSON valide pour une 404
                setError("CTF introuvable (404).");
            } else {
                // Erreur réseau ou autre (serveur éteint, pas d'internet...)
                setError("Impossible de contacter le serveur.");
            }

            setloading(false);
        });
    }, [id, navigate]);

    if (loading) return <div className="text-center p-20 text-xl">Chargement des données du QG...</div>;

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <ShieldAlert size={48} className="text-destructive" />
            <p className="text-xl font-bold text-destructive">{error}</p>
            <Button variant="outline" onClick={() => navigate('/')}>Retour à la liste</Button>
        </div>
    );

    return (
        <div className="container mx-auto py-10 px-4">
            {/* Carte principale de détail */}
            <Card className="max-w-4xl mx-auto border-border bg-card shadow-2xl">
                <CardHeader className="border-b border-border pb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            {/* Titre (specs: ctf_info.titre) */}
                            <CardTitle className="text-4xl font-extrabold text-primary mb-2">
                                {ctf.titre}
                            </CardTitle>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Status: Actif
                            </span>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded-xl">
                            <span className="block text-2xl font-bold">{ctf.nb_vues}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Vues</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-8">
                    {/* Description (specs: ctf_info.description) */}
                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-semibold mb-2">Briefing de mission</h3>
                        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {ctf.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                            <MapPin className="text-blue-500 h-6 w-6" />
                            <div>
                                <p className="text-sm text-muted-foreground">Lieu / Plateforme</p>
                                {/* Lieu (specs: ctf_info.lieu) */}
                                <p className="font-medium">{ctf.lieu}</p>
                            </div>
                        </div>

                        {/* Placeholder pour une date si tu en ajoutes une plus tard dans le YAML */}
                        <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                            <Calendar className="text-orange-500 h-6 w-6" />
                            <div>
                                <p className="text-sm text-muted-foreground">Date</p>
                                <p className="font-medium">À déterminer</p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-end gap-4 border-t border-border pt-6">
                    <Button variant="ghost" onClick={() => navigate('/')}>
                        Annuler
                    </Button>
                    <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Rejoindre le CTF
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default CtfDetails;