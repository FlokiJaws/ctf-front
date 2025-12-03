import React from 'react';
import { useNavigate } from 'react-router-dom';
//import des composants ui necessaire
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Eye, Trophy, Flag } from "lucide-react";

const CtfCard = ({ctf}) => {
    const navigate = useNavigate();

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div className="p-2 bg-secondary rounded-lg">
                        <Flag className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-medium bg-primary/20 text-primary px-2.5 py-0.5 rounded-full">
                        Ouvert
                    </span>
                </div>
                <CardTitle className="mt-4">{ctf.titre}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm mb-4">{ctf.description}</p>
                <div className="flex flex-col space-y-2 text-sm text-muted-foreground">
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
            <CardFooter className="pt-4 border-t border-border">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white"
                        onClick={() => navigate(`/ctf/${ctf.id}`)}
                >
                    <Trophy className="w-4 h-4 mr-2" /> Voir & Participer
                </Button>
            </CardFooter>
        </Card>
    );
};

export default CtfCard;