import React, { useState, useEffect } from 'react';
import * as providerApi from '../api/providerApi';
import type { MealProvider } from '../types';
import Loader from './Loader';
import { MealProviderDetails } from './MealProviderDetails';

interface ProviderDetailsPageProps {
  providerId: string;
  navigate: (path: string, params?: Record<string, any>) => void;
}

const ProviderDetailsPage: React.FC<ProviderDetailsPageProps> = ({ providerId, navigate }) => {
  const [provider, setProvider] = useState<MealProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    // Ensure we fetch a provider even if they are suspended or incomplete for direct links
    providerApi.getProviderById(providerId)
      .then(data => {
        if (data) {
          setProvider(data);
        } else {
          setError('Kitchen not found.');
        }
      })
      .catch(err => setError(err.message || 'Failed to load kitchen details.'))
      .finally(() => setIsLoading(false));
  }, [providerId]);

  const handleBack = () => {
    navigate('/');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader text="Loading kitchen..." /></div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!provider) {
    return <div className="min-h-screen flex items-center justify-center">Could not find kitchen details.</div>;
  }

  // FIX: Pass the `navigate` function down to the MealProviderDetails component.
  return <MealProviderDetails provider={provider} onBack={handleBack} navigate={navigate} />;
};

export default ProviderDetailsPage;
