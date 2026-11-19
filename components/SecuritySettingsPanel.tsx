import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as authApi from '../api/authApi';
import type { User } from '../types';
import * as userApi from '../api/userApi';
import Loader from './Loader';
import { ShieldCheckIcon, ShieldExclamationIcon } from '../constants';
import MfaSetupModal from './MfaSetupModal';

const SecuritySettingsPanel: React.FC = () => {
    const { user, token, refreshProviderProfile } = useAuth();
    const [fullUser, setFullUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [error, setError] = useState('');
    const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);

    useEffect(() => {
        if (user && token) {
            userApi.getUserProfile(user.id, token)
                .then(setFullUser)
                .catch(() => setError('Could not load security settings.'))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [user, token]);

    const handleDisableMfa = async () => {
        if (!token) return;
        if (!window.confirm("Are you sure you want to disable Multi-Factor Authentication? Your account will be less secure.")) {
            return;
        }
        setIsUpdating(true);
        setError('');
        try {
            await authApi.disableMfa(token);
            setFullUser(prev => prev ? { ...prev, mfaEnabled: false } : null);
            if (user?.role === 'PROVIDER') await refreshProviderProfile();
        } catch (err: any) {
            setError(err.message || 'Failed to disable MFA.');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const onMfaSuccess = async () => {
        setIsMfaModalOpen(false);
        setFullUser(prev => prev ? { ...prev, mfaEnabled: true } : null);
        if (user?.role === 'PROVIDER') await refreshProviderProfile();
    }

    if (isLoading) {
        return <Loader text="Loading security settings..." />;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    return (
        <>
            <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold text-gray-800">Multi-Factor Authentication (MFA)</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                        Add an extra layer of security to your account by requiring a code from an authenticator app on login.
                    </p>
                    
                    {fullUser?.mfaEnabled ? (
                        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <ShieldCheckIcon className="w-12 h-12 text-green-500 mx-auto mb-2"/>
                            <p className="font-semibold text-green-800">MFA is currently enabled.</p>
                            <button 
                                onClick={handleDisableMfa} 
                                disabled={isUpdating}
                                className="mt-4 text-sm font-semibold bg-red-100 text-red-700 py-2 px-4 rounded-lg hover:bg-red-200 disabled:opacity-50"
                            >
                                {isUpdating ? 'Disabling...' : 'Disable MFA'}
                            </button>
                        </div>
                    ) : (
                         <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <ShieldExclamationIcon className="w-12 h-12 text-yellow-500 mx-auto mb-2"/>
                            <p className="font-semibold text-yellow-800">MFA is currently disabled.</p>
                             <button 
                                onClick={() => setIsMfaModalOpen(true)}
                                disabled={isUpdating}
                                className="mt-4 bg-brand-primary text-white font-bold py-2 px-5 rounded-lg hover:bg-brand-dark"
                            >
                                Enable MFA
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <MfaSetupModal 
                isOpen={isMfaModalOpen}
                onClose={() => setIsMfaModalOpen(false)}
                onSuccess={onMfaSuccess}
            />
        </>
    );
};

export default SecuritySettingsPanel;