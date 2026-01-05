import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * Composant réutilisable pour les dialogs de confirmation
 * @param {boolean} show - Afficher ou non le dialog
 * @param {string} title - Titre du dialog
 * @param {string} message - Message du dialog
 * @param {function} onConfirm - Fonction à exécuter lors de la confirmation
 * @param {function} onCancel - Fonction à exécuter lors de l'annulation
 * @param {string} confirmLabel - Label du bouton de confirmation (défaut: "Confirmer")
 * @param {string} cancelLabel - Label du bouton d'annulation (défaut: "Annuler")
 * @param {string} confirmVariant - Variant du bouton de confirmation (défaut: "default")
 */
const ConfirmDialog = ({
                           show,
                           title,
                           message,
                           onConfirm,
                           onCancel,
                           confirmLabel = "Confirmer",
                           cancelLabel = "Annuler",
                           confirmVariant = "default"
                       }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">{message}</p>
                </CardContent>
                <CardFooter className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                    <Button variant={confirmVariant} onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ConfirmDialog;