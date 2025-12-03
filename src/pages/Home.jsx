import React, { useState, useEffect } from 'react';
import axios from 'axios';
//import du composant Card
import CtfCard from '@/components/CtfCard.jsx';


//composant parent
const Home = () => {
    const [ctfs, setCtfs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('http://127.0.0.1:4010/ctfs/list')
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
                <h1 className="text-4xl font-extrabold">Challenges & Compétitions</h1>
                <p className="text-xl text-muted-foreground">Prouvez votre valeur.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {ctfs.map((ctf) => (
                    <CtfCard key={ctf.id} ctf={ctf} />
                ))}
            </div>
        </div>
    );
};

export default Home;