import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CtfCard from '@/components/CtfCard.jsx';

const Home = () => {
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:4010/ctfs/list/valide')
            .then(res => {
                setCtfs(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Erreur de chargement", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center p-10">Chargement des compétitions...</div>;
    }

    return (
        <div className="h-[calc(100vh-64px)] flex flex-col bg-gradient-to-b from-background to-secondary/20 overflow-hidden">
            {/* Header Section */}
            <div className="py-8 text-center space-y-3 px-4 flex-shrink-0">
                <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent leading-tight px-2">
                    Challenges & Compétitions
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
                    Prouvez votre valeur dans les plus grands défis de cybersécurité
                </p>
            </div>

            {/* CTF Cards Section - Full Height */}
            <div className="flex-1 flex items-center justify-center px-4 overflow-hidden">
                {ctfs.length > 0 ? (
                    <div className="w-full max-w-7xl">
                        {ctfs.length === 1 ? (
                            // Si une seule carte
                            <div className="flex justify-center">
                                <div className="w-full md:w-96">
                                    <CtfCard ctf={ctfs[0]} featured={true} />
                                </div>
                            </div>
                        ) : ctfs.length === 2 ? (
                            // Si deux cartes
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <CtfCard ctf={ctfs[0]} />
                                </div>
                                <div className="md:scale-110 md:origin-center">
                                    <CtfCard ctf={ctfs[1]} featured={true} />
                                </div>
                            </div>
                        ) : (
                            // Si 3 ou plus - layout optimal
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center auto-rows-max">
                                {/* Carte gauche */}
                                <div className="md:col-span-1">
                                    <CtfCard ctf={ctfs[0]} />
                                </div>

                                {/* Carte centrale - Featured */}
                                <div className="md:col-span-1 md:scale-110 md:origin-center">
                                    <CtfCard ctf={ctfs[1]} featured={true} />
                                </div>

                                {/* Carte droite */}
                                <div className="md:col-span-1">
                                    <CtfCard ctf={ctfs[2]} />
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground text-lg">
                        Aucun CTF disponible pour le moment
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;