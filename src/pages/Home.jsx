import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import des composants shadcn-ui
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Trophy, Flag } from "lucide-react";

//composant parent
const Home = () => {
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:4010/ctfs')
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
        <div className="container mx-auto py-10 px-4">
            <div className="mb-10 text-center space-y-4">
                <h1 className="text-4xl font-extrabold text-slate-900">Challenges & Compétitions</h1>
                <p className="text-xl text-slate-600">Prouvez votre valeur.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ctfs.map((ctf) => (
                    <Card key={ctf.id} className="hover:shadow-xl transition-all duration-300">
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div className="p-2 bg-slate-100 rounded-lg">
                                    <Flag className="w-5 h-5 text-slate-700" />
                                </div>
                                <span className="text-xs font-medium bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                                    Ouvert
                                </span>
                            </div>
                            <CardTitle className="mt-4">{ctf.titre}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-600 text-sm mb-4">{ctf.description}</p>
                            <div className="flex flex-col space-y-2 text-sm text-slate-500">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {ctf.lieu}
                                </div>
                                <div className="flex items-center">
                                    <Eye className="w-4 h-4 mr-2" />
                                    {ctf.nb_vues} vues
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-4 border-t bg-slate-50/50">
                            <Button className="w-full bg-slate-900 hover:bg-slate-800">
                                <Trophy className="w-4 h-4 mr-2" /> Participer
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Home;