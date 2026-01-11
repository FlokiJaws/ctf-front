import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Hook pour gérer l'authentification et les autorisations
 * @param {string[]} allowedRoles - Rôles autorisés (null = tous les rôles connectés)
 * @returns {{ token, userInfo, userRole, userEmail, isLoading }}
 */
export const useAuth = (allowedRoles = null) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [authData, setAuthData] = useState({
        token: null,
        userInfo: null,
        userRole: null,
        userEmail: null
    });

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;

            if (decoded.exp && decoded.exp < currentTime) {
                localStorage.removeItem('token');
                navigate('/login');
                return;
            }

            const userRole = Array.isArray(decoded.groups) ? decoded.groups[0] : decoded.groups;

            if (allowedRoles && !allowedRoles.includes(userRole)) {
                navigate('/profile');
                return;
            }

            setAuthData({
                token,
                userInfo: decoded,
                userRole,
                userEmail: decoded.sub
            });
        } catch (e) {
            console.error('Erreur JWT:', e);
            localStorage.removeItem('token');
            navigate('/login');
        } finally {
            setIsLoading(false);
        }
    }, [navigate, allowedRoles]);

    return { ...authData, isLoading };
};

/**
 * Hook pour formater les dates
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