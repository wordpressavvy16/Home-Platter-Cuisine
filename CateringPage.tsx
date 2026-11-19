import React, { useState, useEffect, useMemo, useCallback } from 'react';
import * as providerApi from './api/providerApi';
import * as userApi from './api/userApi';
import type { MealProvider, User } from './types';
import { useAuth } from './hooks/useAuth';
import Loader from './components/Loader';
import MealProviderCard from './components/MealProviderCard';

interface CateringPageProps {
    navigate: (path: string, params?: Record<string, any>) => void;
}

const CateringPage: React.FC<CateringPageProps> = ({ navigate }) => {
    const { isAuthenticated, user, token } = useAuth();
    const [providers, setProviders] = useState<MealProvider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [fullUser, setFullUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const allProviders = await providerApi.getProviders();
                const caterers = allProviders.filter(p => p.cateringEnabled && p.isSetupComplete && !p.isSuspended);
                setProviders(caterers);

                if (isAuthenticated && user && token) {
                    const profile = await userApi.getUserProfile(user.id, token);
                    setFullUser(profile);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [isAuthenticated, user, token]);

    const handleToggleFollow = useCallback(async (providerId: string) => {
        if (!fullUser || !token) return;

        const currentFollows = fullUser.followedProviderIds || [];
        const isFollowing = currentFollows.includes(providerId);
        const newFollows = isFollowing
            ? currentFollows.filter(id => id !== providerId)
            : [...currentFollows, providerId];

        setFullUser(prev => prev ? { ...prev, followedProviderIds: newFollows } : null);

        try {
            await userApi.updateUserFollows(fullUser.id, newFollows, token);
        } catch (error) {
            console.error("Failed to update follows:", error);
            setFullUser(prev => prev ? { ...prev, followedProviderIds: currentFollows } : null);
        }
    }, [fullUser, token]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader text="Finding caterers..." />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold font-serif text-text tracking-tight sm:text-5xl lg:text-6xl">
                    Catering for Your Next Event
                </h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-text/80">
                    Discover talented home chefs ready to cater for your birthdays, corporate events, and parties.
                </p>
            </div>

            {providers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {providers.map(provider => (
                        <MealProviderCard
                            key={provider.id}
                            provider={provider}
                            onSelect={(p) => navigate(`/provider/${p.id}`)}
                            isAuthenticated={isAuthenticated}
                            followedProviderIds={fullUser?.followedProviderIds || []}
                            onToggleFollow={handleToggleFollow}
                        />
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16">
                    <p className="text-2xl font-semibold text-text">No Caterers Found</p>
                    <p className="text-text/80 mt-2">Check back soon as more kitchens add catering services!</p>
                </div>
            )}
        </div>
    );
}

export default CateringPage;