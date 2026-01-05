import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import FormField from '../../components/common/FormField.jsx';

// imports des composants simple via shadcn-ui
import { Button } from "@/components/ui/button.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card.jsx";

// composant parent
const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // gestionnaire de soumission du formulaire (onSubmit)
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:8080/auth/login', {
                email,
                password
            });

            const token = response.data;

            // 1. On stocke le token BRUT (sans "Bearer ")
            localStorage.setItem('token', token);

            // 2. Plus besoin de stocker 'userEmail', il est dans le token !
            navigate('/');
        } catch (err) {
            console.error(err);

            // Récupérer le message du backend si disponible
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Email ou mot de passe incorrect.");
            }
        }
    };

    // rendu final qui utilise le composant enfant et qui display les erreurs si besoin
    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">Connexion</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">

                        {/* Réutilisation du composant pour l'email */}
                        <FormField
                            label="Email"
                            type="email"
                            placeholder="admin@rootyou.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            // Pas d'erreur spécifique au champ ici
                        />

                        {/* Réutilisation du composant pour le mot de passe */}
                        <FormField
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        {/* Affichage de l'erreur globale de connexion */}
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full">Se connecter</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-slate-500">
                        Pas de compte ? <Link to="/register" className="text-blue-600 font-semibold">S'inscrire</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;