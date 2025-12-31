// src/pages/AllCtfs.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { MapPin, Eye, ChevronLeft, ChevronRight, SortAsc, SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

const AllCtfs = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [allCtfs, setAllCtfs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('none');
    const [selectedCity, setSelectedCity] = useState('');

    const ITEMS_PER_PAGE = 12;

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        axios.get('http://localhost:8080/ctfs/list/actif', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => setAllCtfs(res.data || []))
            .catch(err => {
                console.error("Erreur", err);
                setAllCtfs([]);
            })
            .finally(() => setLoading(false));
    }, [token, navigate]);

    // Récupérer les villes uniques et triées
    const cities = [...new Set(allCtfs.map(ctf => ctf.lieu))].sort();

    // Filtrer et trier les CTFs
    const filteredCtfs = allCtfs
        .filter(ctf => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = (
                ctf.titre.toLowerCase().includes(searchLower) ||
                ctf.description.toLowerCase().includes(searchLower) ||
                ctf.lieu.toLowerCase().includes(searchLower)
            );
            const matchesCity = !selectedCity || ctf.lieu === selectedCity;
            return matchesSearch && matchesCity;
        })
        .sort((a, b) => {
            if (sortBy === 'vues') return b.nbVues - a.nbVues;
            if (sortBy === 'lieu') return a.lieu.localeCompare(b.lieu);
            return 0;
        });

    const totalPages = Math.ceil(filteredCtfs.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedCtfs = filteredCtfs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
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
        return <div className="text-center p-10 text-lg">Chargement des CTFs...</div>;
    }

    return (
        <div className="container mx-auto py-10 px-4 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                    Tous les CTFs
                </h1>
                <p className="text-muted-foreground text-lg">
                    {filteredCtfs.length} compétition{filteredCtfs.length > 1 ? 's' : ''} trouvée{filteredCtfs.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Recherche et Filtres */}
            <div className="flex gap-5 flex-wrap items-end">
                <div className="w-80">
                    <Input
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <select
                    value={selectedCity}
                    onChange={(e) => {
                        setSelectedCity(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                >
                    <option value="">Toutes les villes</option>
                    {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>

                <Button
                    variant={sortBy === 'vues' ? 'default' : 'outline'}
                    onClick={() => setSortBy(sortBy === 'vues' ? 'none' : 'vues')}
                    className="flex items-center gap-2"
                    size="sm"
                >
                    {sortBy === 'vues' ? <SortDesc size={14} /> : <SortAsc size={14} />}
                    Vues
                </Button>
            </div>

            {/* Liste de CTFs */}
            <div className="space-y-4">
                {paginatedCtfs.length > 0 ? (
                    paginatedCtfs.map(ctf => (
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
                                    <span className="text-xs font-medium bg-primary/20 text-primary px-2.5 py-0.5 rounded-full flex-shrink-0">
                                        Ouvert
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

                                {ctf.organisateurPseudo && (
                                    <p className="text-xs text-muted-foreground">
                                        Organisé par <span className="font-semibold text-foreground">{ctf.organisateurPseudo}</span>
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
                    <div className="text-center py-12">
                        <p className="text-lg text-muted-foreground">
                            Aucun CTF correspondant à ta recherche
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination améliorée */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-8">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
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
        </div>
    );
};

export default AllCtfs;