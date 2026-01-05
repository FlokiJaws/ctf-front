import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Hook personnalisé pour vérifier l'authentification
 * @param {string[]} allowedRoles - Rôles autorisés (optionnel)
 * @returns {object} { token, userInfo, userRole }
 */
export const useAuth = (allowedRoles = null) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            // Vérifier l'expiration
            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            // Vérifier les rôles si spécifiés
            if (allowedRoles) {
                const userRole = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
                if (!allowedRoles.includes(userRole)) {
                    navigate('/profile');
                    return;
                }
            }
        } catch (e) {
            console.error('Erreur JWT:', e);
            localStorage.removeItem('token');
            navigate('/login');
        }
    }, [token, navigate, allowedRoles]);

    // Retourner les infos si le token est valide
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const userRole = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;
            return { token, userInfo: decoded, userRole };
        } catch (e) {
            return { token: null, userInfo: null, userRole: null };
        }
    }

    return { token: null, userInfo: null, userRole: null };
};

/**
 * Hook pour formater les dates de manière cohérente
 */
export const useFormatDate = () => {
    return (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
};