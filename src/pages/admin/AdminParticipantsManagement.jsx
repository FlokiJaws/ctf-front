import React from 'react';
import ParticipantsManagement from '../../components/ctf/ParticipantsManagement.jsx';

/**
 * Page admin : affiche tous les participants de tous les CTFs
 */
const AdminParticipantsManagement = () => {
    return <ParticipantsManagement mode="all" />;
};

export default AdminParticipantsManagement;