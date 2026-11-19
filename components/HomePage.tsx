import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { MealProvider, User, FeedItem, Collection } from '../types';
import { MealType } from '../types';
import * as providerApi from '../api/providerApi';
import * as userApi from '../api/userApi';
import * as collectionApi from '../api/collectionApi';
import * as geminiService from '../services/geminiService';
import * as analyticsService from '../services/analyticsService';
import type { SearchCriteria } from '../services/geminiService';
import MealProviderCard from './MealProviderCard';
import Loader from './Loader';
import { SparklesIcon, CameraIcon, ShoppingBagIcon, FunnelIcon, MapIcon, ListBulletIcon, DIETARY_OPTIONS, UserIcon, BookmarkIcon, MegaphoneIcon, MicrophoneIcon, TrophyIcon, GiftIcon } from '../constants';
import ImageSearchModal from './ImageSearchModal'; 
import { useAuth } from '../hooks/useAuth';
import MapView from './MapView';
import FeedCard from './FeedCard';
import CollectionCard from './CollectionCard';
import { useTheme } from '../hooks/useTheme';
import ProviderCarousel from './ProviderCarousel';
import FeedbackButtons from './FeedbackButtons';

interface HomePageProps {
  navigate: (path: string, params?: Record<string, any>) => void;
  onCartClick: () => void;
}

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const HomePage: React.FC<HomePageProps> = ({ navigate, onCartClick }) => {
  const { user, token, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState<MealProvider[]>([]);
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
  const [error, setError] = useState('');
  const [isImageSearchModalOpen, setIsImageSearchModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'forYou' | 'explore'>('explore');
  
  const [recommendedProviders, setRecommendedProviders] = useState<MealProvider[]>([]);
  
  const [publicCollections, setPublicCollections] = useState<Collection[]>([]);

  const [activeFilters, setActiveFilters] = useState({
    cuisines: new Set<string>(),
    minRating: 0,
    vegOnly: false,
    dietary: new Set<string>(),
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const [voiceSearchError, setVoiceSearchError] = useState('');
  const recognitionRef = useRef<any>(null);


  useEffect(() => {
    Promise.all([
        providerApi.getProviders(),
        collectionApi.getPublicCollections()
    ]).then(([provs, collections]) => {
        setProviders(provs);
        setPublicCollections(collections.filter(c => c.mealIds.length > 0));
    }).catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);
  
  useEffect(() => {
    if (isAuthenticated) {
        setActiveTab('forYou');
    } else {
        setActiveTab('explore');
        setFullUser(null);
        setFeedItems([]);
        setRecommendedProviders([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user && token && providers.length > 0) {
      setIsFeedLoading(true);
      const fetchUserData = async () => {
          try {
              const [profile, feed] = await Promise.all([
                  userApi.getUserProfile(user.id, token),
                  userApi.getUserFeed(token),
              ]);
              setFullUser(profile);
              setFeedItems(feed);
              
              const recommendations = await geminiService.getRecommendedProviders(profile, providers, token);
              setRecommendedProviders(recommendations);
          } catch(err) {
              console.error(err);
          } finally {
              setIsFeedLoading(false);
          }
      };
      fetchUserData();
    }
  }, [isAuthenticated, user, token, providers]);
  
  const availableCuisines = useMemo(() => {
    const cuisines = new Set<string>();
    providers.forEach(p => cuisines.add(p.cuisine));
    return Array.from(cuisines).sort();
  }, [providers]);

  const handleCuisineChange = (cuisine: string) => {
      setActiveFilters(prev => {
          const newCuisines = new Set(prev.cuisines);
          newCuisines.has(cuisine) ? newCuisines.delete(cuisine) : newCuisines.add(cuisine);
          return { ...prev, cuisines: newCuisines };
      });
  };
  const handleRatingChange = (rating: number) => setActiveFilters(prev => ({ ...prev, minRating: rating === prev.minRating ? 0 : rating }));
  const handleVegOnlyChange = (isChecked: boolean) => setActiveFilters(prev => ({ ...prev, vegOnly: isChecked }));
  const handleDietaryChange = (tagId: string) => {
    setActiveFilters(prev => {
        const newDietary = new Set(prev.dietary);
        newDietary.has(tagId) ? newDietary.delete(tagId) : newDietary.add(tagId);
        return { ...prev, dietary: newDietary };
    });
  };
  const handleClearFilters = () => setActiveFilters({ cuisines: new Set<string>(), minRating: 0, vegOnly: false, dietary: new Set<string>() });

  const handleToggleFollow = useCallback(async (providerId: string) => {
    if (!fullUser || !token) return;
    const currentFollows = fullUser.followedProviderIds || [];
    const newFollows = currentFollows.includes(providerId)
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

  const performSearch = useCallback(async (term: string) => {
    analyticsService.trackEvent('search_performed', { search_term: term });
    if (!term.trim()) {
      setSearchCriteria(null);
      return;
    }
    setIsSearching(true);
    setError('');
    setActiveTab('explore');
    try {
      const criteria = await geminiService.getSearchCriteriaFromQuery(term);
      setSearchCriteria(criteria);
    } catch (err: any) {
      setError("AI search failed. Using basic search instead.");
      setSearchCriteria({ keywords: term.toLowerCase().split(' ') });
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    performSearch(searchTerm);
  };
  
  const handleImageSearchComplete = useCallback((dishName: string) => {
    setIsImageSearchModalOpen(false);
    navigate('/visual-search', { q: dishName });
  }, [navigate]);

  const handleVoiceSearch = () => {
    if (!SpeechRecognition) {
      setVoiceSearchError("Sorry, your browser doesn't support voice search.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.onstart = () => {
      setIsListening(true);
      setVoiceSearchError('');
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchTerm(transcript);
      performSearch(transcript); // Automatically trigger search
    };
    recognition.onerror = (event: any) => {
      setVoiceSearchError(`Error: ${event.error}. Please try again.`);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const filteredProviders = useMemo(() => {
    let results = providers;
    if (searchCriteria) {
        const { keywords, minRating, mealType } = searchCriteria;
        results = results.filter(provider => {
          let matches = true;
          if (minRating && provider.rating < minRating) matches = false;
          if(mealType && !provider.menu.some(meal => meal.type === mealType || (mealType === 'VEG' && meal.type === 'VEGAN'))) matches = false;
          if (keywords?.length > 0) {
            const searchString = [provider.name, provider.cuisine, provider.chefName, ...provider.menu.map(m => m.name)].join(' ').toLowerCase();
            if(!keywords.every(kw => searchString.includes(kw.toLowerCase()))) matches = false;
          }
          return matches;
        });
    }
    const { cuisines, minRating, vegOnly, dietary } = activeFilters;
    if (cuisines.size > 0 || minRating > 0 || vegOnly || dietary.size > 0) {
        results = results.filter(provider => {
            if (cuisines.size > 0 && !cuisines.has(provider.cuisine)) return false;
            if (minRating > 0 && provider.rating < minRating) return false;
            if (vegOnly && !provider.menu.some(m => m.type === MealType.VEG || m.type === MealType.VEGAN)) return false;
            if (dietary.size > 0 && !Array.from(dietary).every(tag => provider.menu.some(meal => meal.dietaryTags?.includes(tag)))) return false;
            return true;
        });
    }
    return results;
  }, [searchCriteria, providers, activeFilters]);
  
  const topRatedProviders = useMemo(() => [...providers].sort((a, b) => b.rating - a.rating).slice(0, 10), [providers]);
  const newestProviders = useMemo(() => [...providers].sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime()).slice(0, 10), [providers]);
  const bulkOrderProviders = useMemo(() => providers.filter(p => p.menu.some(m => m.isBulkOrderEligible)).slice(0, 10), [providers]);

  if (isLoading) {
      return <div className="min-h-screen flex items-center justify-center"><Loader text="Loading kitchens..." /></div>;
  }

  const isAnyFilterActive = activeFilters.cuisines.size > 0 || activeFilters.minRating > 0 || activeFilters.vegOnly || activeFilters.dietary.size > 0;
  const isDark = theme.name.includes('Dark');
  const panelClasses = `${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-xl shadow-lg rounded-xl border ${isDark ? 'border-white/10' : 'border-white/40'}`;

  return (
    <>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="text-center mb-12">
            <h2 className="text-4xl font-bold font-serif text-text tracking-tight sm:text-5xl lg:text-6xl">
                Authentic Homemade Meals. Delivered.
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-text/80">
                Explore a world of flavor from the best home chefs in your city.
            </p>
        </div>

        <form onSubmit={handleFormSubmit} className="mb-6 max-w-2xl mx-auto">
            <div className={`flex items-center rounded-full shadow-lg focus-within:ring-2 focus-within:ring-brand-primary/50 transition-shadow duration-300 ${isDark ? 'bg-slate-800/60' : 'bg-white/70'} backdrop-blur-lg`}>
              <input 
                  type="text"
                  placeholder={isListening ? "Listening..." : "Try a smart search: 'healthy vegetarian options...'"}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full p-4 text-base border-none rounded-l-full focus:outline-none bg-transparent text-text placeholder:text-text/60"
              />
              {SpeechRecognition && (
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-4 text-text/60 hover:text-brand-primary transition-colors focus:outline-none ${isListening ? 'text-brand-primary animate-pulse' : ''}`}
                  aria-label="Search by voice"
                >
                    <MicrophoneIcon className="w-6 h-6"/>
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsImageSearchModalOpen(true)}
                className="p-4 text-text/60 hover:text-brand-primary transition-colors focus:outline-none"
                aria-label="Search by image"
              >
                  <CameraIcon className="w-6 h-6"/>
              </button>
              <button 
                type="submit"
                disabled={isSearching}
                className="bg-brand-primary text-white font-bold px-6 py-4 rounded-r-full hover:opacity-90 transition-opacity flex items-center gap-2 disabled:bg-gray-400 animate-press"
              >
                  {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <SparklesIcon className="w-5 h-5"/>}
                  <span className="text-base">Search</span>
              </button>
            </div>
             {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
             {voiceSearchError && <p className="text-red-500 mt-2 text-sm text-center">{voiceSearchError}</p>}
        </form>

        {!searchTerm && !isAnyFilterActive && (
          <div className="mb-12 flex justify-center gap-2 flex-wrap">
            <button onClick={() => handleRatingChange(4.5)} className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${activeFilters.minRating === 4.5 ? 'bg-brand-primary text-white border-brand-primary' : `${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'} hover:border-brand-primary/50`}`}>Rating 4.5+</button>
            <button onClick={() => handleRatingChange(4.0)} className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${activeFilters.minRating === 4.0 ? 'bg-brand-primary text-white border-brand-primary' : `${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'} hover:border-brand-primary/50`}`}>Rating 4.0+</button>
            <button onClick={() => handleVegOnlyChange(!activeFilters.vegOnly)} className={`px-4 py-2 text-sm font-semibold rounded-full border transition-colors ${activeFilters.vegOnly ? 'bg-brand-primary text-white border-brand-primary' : `${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-gray-300'} hover:border-brand-primary/50`}`}>Veg Only</button>
          </div>
        )}

        {!searchTerm && !isAnyFilterActive && activeTab === 'explore' && (
          <section className="mb-12 sm:mb-16 animate-slide-in-stagger">
            <button 
              onClick={() => navigate('/partner-with-us')}
              className="w-full relative rounded-xl overflow-hidden shadow-lg group block text-left"
            >
              <img src="https://picsum.photos/seed/catering-card/1200/400" alt="A catered event" className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-center">
                <h2 className="text-3xl sm:text-4xl font-bold font-serif text-white">Partner with Us</h2>
                <p className="text-lg text-gray-200 mt-2 max-w-lg">Are you a home chef? Join our platform and grow your business.</p>
                <div className="mt-4 inline-block bg-brand-primary text-white font-semibold py-2 px-5 rounded-lg shadow-sm transition-all duration-300 transform group-hover:scale-105 group-hover:bg-opacity-90">
                  Register Your Kitchen
                </div>
              </div>
            </button>
          </section>
        )}
        
        {isSearching && <div className="flex justify-center my-8"><Loader text="Analyzing your query..." /></div>}

        {isAuthenticated && (
          <div className={`border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <div className="flex space-x-4">
              <button onClick={() => setActiveTab('forYou')} className={`py-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'forYou' ? 'border-b-2 border-brand-primary text-text' : 'text-text/70 hover:text-text'}`}>
                For You
              </button>
              <button onClick={() => setActiveTab('explore')} className={`py-3 px-4 font-semibold text-lg transition-colors ${activeTab === 'explore' ? 'border-b-2 border-brand-primary text-text' : 'text-text/70 hover:text-text'}`}>
                Explore
              </button>
            </div>
          </div>
        )}
        
        <div className="space-y-16 mt-12">
          {activeTab === 'forYou' ? (
            <section>{isFeedLoading ? <Loader text="Loading your feed..." /> : feedItems.length > 0 ? (
                <div className="max-w-2xl mx-auto space-y-8">{feedItems.map(item => <FeedCard key={item.id} item={item} onSelectProvider={(p) => navigate(`/provider/${p.id}`)} />)}</div>
              ) : (
                <div className="text-center py-16"><UserIcon className="w-16 h-16 mx-auto text-text/30 mb-4"/><p className="text-2xl font-semibold text-text">Your feed is empty</p><p className="text-text/70 mt-2">Follow some kitchens from the 'Explore' tab to see their updates here!</p></div>
              )}
            </section>
          ) : (
            <>
              {!searchTerm && !isSearching && !isAnyFilterActive && (
                 <>
                  <section>
                      <ProviderCarousel
                          title="Top Rated Kitchens"
                          providers={topRatedProviders}
                          onSelectProvider={(p) => navigate(`/provider/${p.id}`)}
                          icon={<TrophyIcon className="w-7 h-7 text-yellow-500" />}
                          isAuthenticated={isAuthenticated}
                          followedProviderIds={fullUser?.followedProviderIds}
                          onToggleFollow={handleToggleFollow}
                      />
                  </section>
                  {isAuthenticated && recommendedProviders.length > 0 && (
                     <section>
                        <ProviderCarousel
                            title="Recommended For You"
                            providers={recommendedProviders}
                            onSelectProvider={(p) => navigate(`/provider/${p.id}`)}
                            icon={<SparklesIcon className="w-7 h-7 text-purple-400" />}
                            isAuthenticated={isAuthenticated}
                            followedProviderIds={fullUser?.followedProviderIds}
                            onToggleFollow={handleToggleFollow}
                        />
                     </section>
                  )}
                  <section>
                       <ProviderCarousel
                          title="New This Week"
                          providers={newestProviders}
                          onSelectProvider={(p) => navigate(`/provider/${p.id}`)}
                          icon={<SparklesIcon className="w-7 h-7 text-blue-500" />}
                          isAuthenticated={isAuthenticated}
                          followedProviderIds={fullUser?.followedProviderIds}
                          onToggleFollow={handleToggleFollow}
                      />
                  </section>
                  {bulkOrderProviders.length > 0 && (
                    <section>
                        <ProviderCarousel
                            title="For Parties & Events"
                            providers={bulkOrderProviders}
                            onSelectProvider={(p) => navigate(`/provider/${p.id}`)}
                            icon={<GiftIcon className="w-7 h-7 text-teal-500" />}
                            isAuthenticated={isAuthenticated}
                            followedProviderIds={fullUser?.followedProviderIds}
                            onToggleFollow={handleToggleFollow}
                        />
                    </section>
                  )}
                </>
              )}
    
              <section><div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"><div className="flex items-center gap-3"><ShoppingBagIcon className="w-7 h-7 text-gray-500" /><h2 className="text-2xl sm:text-3xl font-bold font-serif text-text">{searchTerm || isAnyFilterActive ? 'Filtered Results' : 'All Kitchens'}</h2></div><div className="flex items-center gap-2"><button onClick={() => setIsFilterOpen(!isFilterOpen)} className={`flex items-center gap-2 font-semibold text-text ${isDark ? 'bg-slate-700' : 'bg-white'} rounded-lg px-4 py-2 transition-colors shadow-sm hover:bg-gray-200/50 dark:hover:bg-slate-600`}><FunnelIcon className="w-5 h-5" />Filters{isAnyFilterActive && <span className="w-2 h-2 bg-brand-primary rounded-full"></span>}</button><div className={`flex items-center ${isDark ? 'bg-slate-700' : 'bg-white'} rounded-lg p-1 shadow-sm`}><button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-brand-primary text-white' : 'text-text/80 hover:bg-black/10 dark:hover:bg-white/10'}`} aria-label="List View" title="List View"><ListBulletIcon className="w-5 h-5"/></button><button onClick={() => setViewMode('map')} className={`p-1.5 rounded-md transition-colors ${viewMode === 'map' ? 'bg-brand-primary text-white' : 'text-text/80 hover:bg-black/10 dark:hover:bg-white/10'}`} aria-label="Map View" title="Map View"><MapIcon className="w-5 h-5"/></button></div></div></div>
                {isFilterOpen && (<div className={`p-6 rounded-xl shadow-lg mb-8 animate-fade-in text-text ${panelClasses}`}><div className="grid grid-cols-1 md:grid-cols-4 gap-8"><div><h4 className="font-semibold mb-2">Cuisine</h4><div className="space-y-2 max-h-40 overflow-y-auto">{availableCuisines.map(cuisine => (<label key={cuisine} className="flex items-center gap-2"><input type="checkbox" checked={activeFilters.cuisines.has(cuisine)} onChange={() => handleCuisineChange(cuisine)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><span>{cuisine}</span></label>))}</div></div><div><h4 className="font-semibold mb-2">Rating</h4><div className="space-y-2">{[4.5, 4.0, 0].map(rating => (<label key={rating} className="flex items-center gap-2"><input type="radio" name="rating" checked={activeFilters.minRating === rating} onChange={() => handleRatingChange(rating)} className="h-4 w-4 border-gray-300 text-brand-primary focus:ring-brand-primary"/><span>{rating > 0 ? `${rating.toFixed(1)}+ Stars` : 'Any'}</span></label>))}</div></div><div><h4 className="font-semibold mb-2">General Dietary</h4><div className="space-y-2"><label className="flex items-center gap-2"><input type="checkbox" checked={activeFilters.vegOnly} onChange={(e) => handleVegOnlyChange(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><span>Veg Only</span></label></div></div><div><h4 className="font-semibold mb-2">Specific Dietary Options</h4><div className="space-y-2">{DIETARY_OPTIONS.map(opt => (<label key={opt.id} className="flex items-center gap-2"><input type="checkbox" checked={activeFilters.dietary.has(opt.id)} onChange={() => handleDietaryChange(opt.id)} className="h-4 w-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"/><span>{opt.label}</span></label>))}</div></div></div>{isAnyFilterActive && (<div className={`text-right mt-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'} pt-4`}><button onClick={handleClearFilters} className="text-sm font-semibold text-brand-primary hover:underline">Clear All Filters</button></div>)}</div>)}
                {searchCriteria && <div className="mb-4"><FeedbackButtons featureName="natural_language_search" details={{ query: searchTerm, criteria: searchCriteria }} /></div>}
                <div aria-live="polite">
                  {filteredProviders.length > 0 ? (viewMode === 'list' ? (
                      <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-hide items-stretch">
                          {filteredProviders.map((provider, i) => (
                              <div key={provider.id} className="w-80 md:w-[22rem] flex-shrink-0 animate-slide-in-stagger" style={{'--stagger-delay': `${i * 100}ms`}}>
                                  <MealProviderCard 
                                      provider={provider} 
                                      onSelect={(p) => navigate(`/provider/${p.id}`)} 
                                      isAuthenticated={isAuthenticated} 
                                      followedProviderIds={fullUser?.followedProviderIds} 
                                      onToggleFollow={handleToggleFollow}
                                  />
                              </div>
                          ))}
                      </div>
                    ) : (
                      <MapView providers={filteredProviders} onSelectProvider={(p) => navigate(`/provider/${p.id}`)} />
                    )) : (
                      <div className="text-center py-16"><p className="text-2xl font-semibold text-text">No kitchens found</p><p className="text-text/70 mt-2">Try adjusting your search or filters!</p></div>
                    )}
                </div>
              </section>

              {!searchTerm && !isSearching && !isAnyFilterActive && publicCollections.length > 0 && (
                  <section>
                      <div className="flex items-center gap-3 mb-6"><BookmarkIcon className="w-7 h-7 text-teal-400" isFilled={true} /><h2 className="text-2xl sm:text-3xl font-bold font-serif text-text">Community Collections</h2></div>
                      <div className="flex overflow-x-auto space-x-6 pb-4 -mx-4 px-4 scrollbar-hide">
                        {publicCollections.map((collection, i) => (
                            <div key={collection.id} className="w-80 md:w-[22rem] flex-shrink-0 animate-slide-in-stagger" style={{'--stagger-delay': `${i * 100}ms`}}>
                                <CollectionCard collection={collection} onSelect={() => navigate(`/collections/${collection.id}`)}/>
                            </div>
                        ))}
                      </div>
                  </section>
              )}
            </>
          )}
        </div>
      </div>

      {isImageSearchModalOpen && (<ImageSearchModal isOpen={isImageSearchModalOpen} onClose={() => setIsImageSearchModalOpen(false)} onComplete={handleImageSearchComplete}/>)}
    </>
  );
}

export default HomePage;