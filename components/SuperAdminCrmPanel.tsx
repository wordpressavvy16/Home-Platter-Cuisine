import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as adminApi from '../api/adminApi';
import type { User } from '../types';
import Loader from './Loader';
import { CrmIcon } from '../constants';

interface SuperAdminCrmPanelProps {
    navigate: (path: string) => void;
}

const SuperAdminCrmPanel: React.FC<SuperAdminCrmPanelProps> = ({ navigate }) => {
    const { token } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (token) {
            adminApi.getAllUsers(token)
                .then(data => setUsers(data))
                .catch(err => setError(err.message || 'Failed to fetch users.'))
                .finally(() => setIsLoading(false));
        }
    }, [token]);

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return users;
        return users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [users, searchTerm]);

    const roleStyles: { [key in User['role']]: string } = {
        CUSTOMER: 'bg-blue-100 text-blue-800',
        PROVIDER: 'bg-green-100 text-green-800',
        SUPER_ADMIN: 'bg-purple-100 text-purple-800',
    };

    const tableHeaders = ["Name", "Email", "Role", "Join Date"];

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                 <div className="flex items-center gap-3">
                    <CrmIcon className="w-8 h-8 text-brand-secondary" />
                    <div>
                        <h2 className="text-2xl font-bold text-text">Master CRM</h2>
                        <p className="text-text/70">Search and view all users on the platform.</p>
                    </div>
                </div>
                <div className="w-full sm:w-auto">
                     <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-72 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-primary"
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {isLoading ? (
                    <Loader text="Loading all users..." />
                ) : error ? (
                    <p className="text-red-500 text-center py-8">{error}</p>
                ) : (
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                {tableHeaders.map(header => (
                                    <th key={header} className="p-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredUsers.map(user => (
                                <tr key={user.id} onClick={() => navigate(`/super-admin/user/${user.id}`)} className="hover:bg-gray-100 cursor-pointer">
                                    <td className="p-4 font-medium text-text">{user.name}</td>
                                    <td className="p-4 text-text/80">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`text-xs font-bold py-1 px-3 rounded-full ${roleStyles[user.role]}`}>{user.role}</span>
                                    </td>
                                    <td className="p-4 text-text/80">{user.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                 {filteredUsers.length === 0 && !isLoading && !error && (
                    <div className="text-center py-10">
                        <p className="text-gray-500">No users found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SuperAdminCrmPanel;