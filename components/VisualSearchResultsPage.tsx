import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as providerApi from '../api/providerApi';
import * as userApi from '../api/userApi';
import type { Meal, MealProvider, User, Collection } from '../types';
import Loader from './Loader';
import MealCard from './MealCard';
import { BackArrowIcon, SparklesIcon } from '../constants';

interface VisualSearchResultsPageProps {
  navigate: (path: string) => void;
  routeParams: Record<string, any> | null;
}

const VisualSearchResultsPage: React.FC<VisualSearchResultsPageProps> = ({ navigate, routeParams }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [allProviders, setAllProviders] = useState<MealProvider[]>([]);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [userCollections, setUserCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const searchQuery = routeParams?.q || '';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const providersData = await providerApi.getProviders();
        setAllProviders(providersData);
        if (isAuthenticated && user && token) {
          const profile = await userApi.getUserProfile(user.id, token);
          setFullUser(profile);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated, user, token]);

  const matchingMeals = useMemo(() => {
    if (!searchQuery || allProviders.length === 0) return [];

    const results: { meal: Meal; provider: MealProvider }[] = [];
    const lowerCaseQuery = searchQuery.toLowerCase();

    allProviders.forEach(provider => {
      provider.menu.forEach(meal => {
        if (meal.name.toLowerCase().includes(lowerCaseQuery) || meal.description.toLowerCase().includes(lowerCaseQuery)) {
          results.push({ meal, provider });
        }
      });
    });

    return results;
  }, [searchQuery, allProviders]);

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


  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="mb-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-brand-primary font-semibold hover:underline mb-4">
          <BackArrowIcon className="w-5 h-5" />
          Back to Home
        </button>
        <div className="flex items-center gap-3">
          <SparklesIcon className="w-8 h-8 text-brand-primary" />
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brand-dark font-serif">
              Visual Search Results
            </h1>
            <p className="text-gray-600">Showing meals that look like "{searchQuery}"</p>
          </div>
        </div>
      </div>

      {isLoading && <Loader text="Searching all kitchens..." />}
      {error && <p className="text-red-500 text-center">{error}</p>}
      
      {!isLoading && !error && (
        matchingMeals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matchingMeals.map(({ meal, provider }) => (
              <MealCard
                key={`${provider.id}-${meal.id}`}
                meal={meal}
                providerId={provider.id}
                providerName={provider.name}
                isAuthenticated={isAuthenticated}
                wishlistMealIds={fullUser?.wishlistMealIds}
                collections={userCollections}
                onToggleWishlist={handleToggleWishlist}
                onUpdateCollections={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold text-gray-700">No meals found</p>
            <p className="text-gray-500 mt-2">We couldn't find any dishes matching "{searchQuery}". Try a different image!</p>
          </div>
        )
      )}
    </div>
  );
};

export default VisualSearchResultsPage;
