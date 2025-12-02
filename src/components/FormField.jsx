import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// compososant enfant réutilisable pour le parent pour gerer l'affichage des erreurs multiples
const FormField = ({ label, type = "text", placeholder, value, onChange, error }) => {
    // Si l'erreur est une simple chaine, on la met dans un tableau
    const errorList = error ? (Array.isArray(error) ? error : [error]) : [];

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Input
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={onChange}
                // bordure rouge si une erreur existe
                className={errorList.length > 0 ? "border-red-500 focus-visible:ring-red-500" : ""}
                required
            />
            {/* affichage des erreurs */}
            {errorList.map((msg, index) => (
                <p key={index} className="text-xs text-red-500">
                    • {msg}
                </p>
            ))}
        </div>
    );
};

export default FormField;