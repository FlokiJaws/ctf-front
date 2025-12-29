import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { MapPin, Eye, Calendar, ShieldAlert, Send, MessageSquare, ArrowLeft, Check } from "lucide-react";

const STORAGE_KEY = "joinedCtfs";

const CtfDetails = () => {
    const navigate = useNavigate();
    const {id} = useParams();

    const [ctf, setctf] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setloading] = useState(true);
    const [error, setError] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem("token");
                navigate("/login");
                return;
            }
        } catch (e) {
            localStorage.removeItem("token");
            navigate("/login");
            return;
        }

        // Récupérer les détails du CTF
        axios.get(`http://localhost:8080/ctfs/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setctf(res.data);
                setloading(false);
            })
            .catch(err => {
                console.log(err);
                if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else if (err.response?.status === 404) {
                    setError("CTF introuvable (404).");
                } else {
                    setError("Impossible de contacter le serveur.");
                }
                setloading(false);
            });

        // Récupérer les commentaires du CTF
        axios.get(`http://localhost:8080/comments/ctf/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                setComments(res.data || []);
            })
            .catch(err => {
                console.log("Erreur lors du chargement des commentaires", err);
            });

        // Vérifier si déjà rejoint
        const joinedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        setIsJoined(joinedIds.includes(parseInt(id)));
    }, [id, navigate, token]);

    const handleJoinCtf = () => {
        const joinedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

        if (!joinedIds.includes(parseInt(id))) {
            joinedIds.push(parseInt(id));
            localStorage.setItem(STORAGE_KEY, JSON.stringify(joinedIds));
            setIsJoined(true);
        }
    };

    const handleLeaveCtf = () => {
        let joinedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        joinedIds = joinedIds.filter(ctfId => ctfId !== parseInt(id));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(joinedIds));
        setIsJoined(false);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();

        if (!commentText.trim()) return;

        setSubmitting(true);
        try {
            await axios.post(
                `http://localhost:8080/comments/new/${id}`,
                { contenu: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Ajouter le nouveau commentaire à la liste
            const decoded = jwtDecode(token);
            const newComment = {
                id: Date.now(),
                contenu: commentText,
                userPseudo: decoded.sub,
                date: new Date().toISOString()
            };

            setComments([newComment, ...comments]);
            setCommentText('');
        } catch (err) {
            console.error("Erreur lors de l'ajout du commentaire", err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-center p-20 text-xl">Chargement des données du QG...</div>;

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
            <ShieldAlert size={48} className="text-destructive" />
            <p className="text-xl font-bold text-destructive">{error}</p>
            <Button variant="outline" onClick={() => navigate(-1)}>Retour</Button>
        </div>
    );

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Carte principale de détail */}
            <Card className="max-w-4xl mx-auto border-border bg-card shadow-2xl">
                <CardHeader className="border-b border-border pb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-4xl font-extrabold text-primary mb-2">
                                {ctf.titre}
                            </CardTitle>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Status: Actif
                            </span>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded-xl">
                            <span className="block text-2xl font-bold">{ctf.nbVues}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Vues</span>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-8">
                    <div className="prose dark:prose-invert max-w-none">
                        <h3 className="text-xl font-semibold mb-2">Briefing de mission</h3>
                        <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                            {ctf.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols gap-6">
                        <div className="flex items-center space-x-3 p-4 bg-secondary/50 rounded-lg">
                            <MapPin className="text-blue-500 h-6 w-6" />
                            <div>
                                <p className="text-sm text-muted-foreground">Lieu / Plateforme</p>
                                <p className="font-medium">{ctf.lieu}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="flex justify-between gap-4 border-t border-border pt-6">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
                        <ArrowLeft size={18} />
                        Retour
                    </Button>
                    <Button
                        size="lg"
                        onClick={isJoined ? handleLeaveCtf : handleJoinCtf}
                        className={`flex items-center gap-2 ${
                            isJoined
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-primary hover:bg-primary/90'
                        }`}
                    >
                        {isJoined ? (
                            <>
                                <Check size={20} />
                                Quitter
                            </>
                        ) : (
                            'Rejoindre le CTF'
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {/* Section Commentaires */}
            <Card className="max-w-4xl mx-auto border-border bg-card">
                <CardHeader className="border-b border-border pb-4">
                    <div className="flex items-center space-x-2">
                        <MessageSquare className="text-primary h-5 w-5" />
                        <CardTitle className="text-2xl">Commentaires ({comments.length})</CardTitle>
                    </div>
                </CardHeader>

                <CardContent className="pt-6 space-y-6">
                    {/* Formulaire d'ajout de commentaire */}
                    <div className="space-y-3">
                        <div className="flex items-end gap-3">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Partage ton avis ou pose une question..."
                                className="flex-1 px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                                rows="3"
                                disabled={submitting}
                            />
                            <Button
                                onClick={handleAddComment}
                                size="icon"
                                disabled={submitting || !commentText.trim()}
                                className="flex-shrink-0 h-12 w-12"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Liste des commentaires */}
                    <div className="space-y-4">
                        {comments.length > 0 ? (
                            comments.map((comment) => (
                                <div key={comment.id} className="p-4 bg-secondary/30 rounded-lg border border-border/50 hover:border-border transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold text-sm text-primary">
                                            {comment.userPseudo}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {comment.date ? new Date(comment.date).toLocaleString('fr-FR') : 'À l\'instant'}
                                        </span>
                                    </div>
                                    <p className="text-muted-foreground whitespace-pre-wrap break-words">
                                        {comment.contenu}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p>Aucun commentaire pour le moment. Sois le premier à commenter !</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CtfDetails;