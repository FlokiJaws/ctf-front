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
import { Loader2, Lock } from "lucide-react";

const loginSchema = z.object({
    email: z.string().email("Email invalide."),
    password: z.string().min(1, "Mot de passe requis."),
});

const Login = () => {
    const navigate = useNavigate();
    const [serverError, setServerError] = useState('');

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setServerError('');
        try {
            const res = await axios.post('http://127.0.0.1:4010/auth/login', data);
            localStorage.setItem('token', `${res.data.tokenType} ${res.data.accessToken}`);
            localStorage.setItem('userEmail', data.email);
            navigate('/');
        } catch (err) {
            setServerError(err.response?.data?.message || "Erreur de connexion.");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] bg-slate-50">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-indigo-600">
                <CardHeader>
                    <div className="flex justify-center mb-4"><div className="p-3 bg-indigo-100 rounded-full"><Lock className="w-8 h-8 text-indigo-600" /></div></div>
                    <CardTitle className="text-center">Connexion</CardTitle>
                    <CardDescription className="text-center">Accédez au dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input placeholder="admin@rootyou.com" {...register("email")} />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Mot de passe</Label>
                            <Input type="password" {...register("password")} />
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>
                        {serverError && <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{serverError}</div>}
                        <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center border-t p-4">
                    <p className="text-sm text-muted-foreground">Pas de compte ? <Link to="/register" className="text-indigo-600 font-semibold">S'inscrire</Link></p>
                </CardFooter>
            </Card>
        </div>
    );
};
export default Login;