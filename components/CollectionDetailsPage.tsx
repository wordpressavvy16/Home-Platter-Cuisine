import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as collectionApi from '../api/collectionApi';
import * as providerApi from '../api/providerApi';
import * as userApi from '../api/userApi';
import type { Collection, Meal, MealProvider, User } from '../types';
import Loader from './Loader';
import MealCard from './MealCard';
import { BackArrowIcon, BookmarkIcon } from '../constants';

interface CollectionDetailsPageProps {
  collectionId: string;
  navigate: (path: string) => void;
}

const CollectionDetailsPage: React.FC<CollectionDetailsPageProps> = ({ collectionId, navigate }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [providers, setProviders] = useState<MealProvider[]>([]);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [collectionData, allProviders] = await Promise.all([
        collectionApi.getCollectionById(collectionId),
        providerApi.getProviders(),
      ]);
      setCollection(collectionData);
      setProviders(allProviders);

      if (isAuthenticated && user && token) {
        const profile = await userApi.getUserProfile(user.id, token);
        setFullUser(profile);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load collection details.');
    } finally {
      setIsLoading(false);
    }
  }, [collectionId, isAuthenticated, user, token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const mealsInCollection = useMemo(() => {
    if (!collection || providers.length === 0) return [];
    
    const allMealsMap = new Map<string, { meal: Meal; provider: MealProvider }>();
    providers.forEach(p => {
        p.menu.forEach(m => {
            allMealsMap.set(m.id, { meal: m, provider: p });
        });
    });

    return collection.mealIds
        .map(mealId => allMealsMap.get(mealId))
        .filter(Boolean) as { meal: Meal; provider: MealProvider }[];
  }, [collection, providers]);

  const handleToggleWishlist = useCallback(async (mealId: string) => {
    if (!fullUser || !token) return;
    const currentWishlist = fullUser.wishlistMealIds || [];
    const newWishlist = currentWishlist.includes(mealId)
        ? currentWishlist.filter(id => id !== mealId)
        : [...currentWishlist, mealId];
    setFullUser(prev => prev ? { ...prev, wishlistMealIds: newWishlist } : null);
    try {
        await userApi.updateUserWishlist(fullUser.id, newWishlist, token);
    } catch (error) {
        console.error("Failed to update wishlist:", error);
        setFullUser(prev => prev ? { ...prev, wishlistMealIds: currentWishlist } : null);
    }
  }, [fullUser, token]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader text="Loading collection..." /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!collection) {
    return <div className="min-h-screen flex items-center justify-center">Collection not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-8">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 text-brand-primary font-semibold hover:underline mb-4">
                <BackArrowIcon className="w-5 h-5" />
                Back to Explore
            </button>
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-start gap-2 text-teal-700 mb-2">
                    <BookmarkIcon className="w-5 h-5 mt-1" isFilled={true} />
                    <span className="font-semibold">Community Collection</span>
                </div>
                <h1 className="text-4xl font-bold text-brand-dark font-serif">{collection.name}</h1>
                <p className="text-gray-600 mt-2">by {collection.creatorName}</p>
                {collection.description && <p className="text-gray-700 mt-4 max-w-2xl">{collection.description}</p>}
            </div>
        </div>

        {mealsInCollection.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mealsInCollection.map(({ meal, provider }) => (
              <MealCard
                key={meal.id}
                meal={meal}
                providerId={provider.id}
                providerName={provider.name}
                isAuthenticated={isAuthenticated}
                wishlistMealIds={fullUser?.wishlistMealIds}
                collections={[]} // Pass empty to not show collection icon here
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <p className="text-xl font-semibold text-gray-700">This collection is empty.</p>
          </div>
        )}
    </div>
  );
};

export default CollectionDetailsPage;
