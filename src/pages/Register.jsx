import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, UserPlus } from "lucide-react";

const registerSchema = z.object({
    pseudo: z.string().min(2, "Le pseudo doit faire au moins 2 caractères."),
    email: z.string().email("Adresse email invalide."),
    password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

const Register = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');
    const [success, setSuccess] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data) => {
        setServerError(''); setSuccess('');
        try {
            await axios.post('http://127.0.0.1:4010/auth/register', data);
            setSuccess("Compte créé ! Redirection...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setServerError(err.response?.data?.message || "Erreur serveur.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-slate-50">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-blue-600">
                <CardHeader>
                    <div className="flex justify-center mb-4"><div className="p-3 bg-blue-100 rounded-full"><UserPlus className="w-8 h-8 text-blue-600" /></div></div>
                    <CardTitle className="text-center">Créer un compte</CardTitle>
                    <CardDescription className="text-center">Rejoignez le CTF RootYou</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Pseudo</Label>
                            <Input placeholder="HackerOne" {...register("pseudo")} />
                            {errors.pseudo && <p className="text-sm text-red-500">{errors.pseudo.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="email@exemple.com" {...register("email")} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Mot de passe</Label>
                            <Input type="password" placeholder="••••••••" {...register("password")} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        {serverError && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{serverError}</div>}
                        {success && <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">{success}</div>}
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "S'inscrire"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t p-4">
                    <p className="text-sm text-muted-foreground">Déjà inscrit ? <Link to="/login" className="text-blue-600 font-semibold">Se connecter</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
};
export default Register;